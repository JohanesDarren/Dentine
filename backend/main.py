# SECTION 1 — IMPORTS:
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
from supabase import create_client, Client
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Optional
import io, os, uuid
import traceback
from datetime import datetime
import google.generativeai as genai
import base64
from pathlib import Path
import json

load_dotenv()

gemini_key = os.getenv("GEMINI_API_KEY")
if gemini_key:
  genai.configure(api_key=gemini_key)
  gemini_model = genai.GenerativeModel("gemini-flash-latest")
else:
  gemini_model = None

# SECTION 2 — APP SETUP:
app = FastAPI(title="Dentine API", version="1.0.0")

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# SECTION 3 — MODEL LOADING (once at startup):
xray_model = YOLO("models/best.pt")
photo_model = YOLO("nsitnov/8024-yolov8-model/8024.pt")

supabase_client: Client = create_client(
  os.getenv("SUPABASE_URL"),
  os.getenv("SUPABASE_SERVICE_KEY")
)

# SECTION 4 — PYDANTIC MODELS:
class ConditionItem(BaseModel):
  tooth: int
  condition: str
  severity: str
  confidence: float
  bbox: Optional[List[float]] = None

class SaveDiagnosisRequest(BaseModel):
  user_id: str
  patient_id: str
  mode: str
  overall_severity: str
  image_url: Optional[str] = None
  conditions: List[dict]
  total_detected: int

class CreatePatientRequest(BaseModel):
  user_id: Optional[str] = None
  name: str
  age: Optional[int] = None
  gender: Optional[str] = None
  notes: Optional[str] = None

# SECTION 5 — HELPER FUNCTIONS:

def get_severity(condition: str, mode: str) -> str:
  xray_map = {
    "Caries": "mild",
    "Deep Caries": "severe",
    "Impacted": "severe",
    "Periapical Lesion": "severe"
  }
  photo_map = {
    "Caries": "mild",
    "Crown": "healthy",
    "Filling": "healthy",
    "Implant": "healthy",
    "Missing-tooth-between": "severe",
    "Periapical-lesion": "severe",
    "Root-Canal-Treatment": "mild",
    "Root-Piece": "severe",
    "impacted-tooth": "severe"
  }
  if mode == "xray":
    return xray_map.get(condition, "mild")
  return photo_map.get(condition, "mild")

def get_overall_severity(conditions: list) -> str:
  severities = [str(c.get("severity", "")).lower() for c in conditions]
  if "severe" in severities:
    return "Severe"
  elif "mild" in severities:
    return "Mild"
  return "Healthy"

def map_bbox_to_tooth(
  x1, y1, x2, y2, 
  img_width, img_height
) -> int:
  x_center = (x1 + x2) / 2
  y_center = (y1 + y2) / 2
  x_ratio = x_center / img_width
  y_ratio = y_center / img_height
  tooth_index = int(x_ratio * 16)
  tooth_index = max(0, min(15, tooth_index))
  if y_ratio < 0.5:
    return tooth_index + 1
  else:
    return 32 - tooth_index

def run_inference(model, image_bytes, mode) -> dict:
  image = Image.open(io.BytesIO(image_bytes))
  img_width, img_height = image.size
  
  conf_threshold = 0.10 if mode == "photo" else 0.20
  
  results = model.predict(
    image, 
    conf=conf_threshold,
    iou=0.45
  )
  conditions = []
  for result in results:
    for box in result.boxes:
      x1, y1, x2, y2 = [
        round(x) for x in box.xyxy[0].tolist()
      ]
      class_id = int(box.cls[0].item())
      condition = result.names[class_id]
      confidence = round(float(box.conf[0].item()), 2)
      severity = get_severity(condition, mode).capitalize()
      tooth = map_bbox_to_tooth(
        x1, y1, x2, y2, img_width, img_height
      )
      import uuid
      conditions.append({
        "id": str(uuid.uuid4()),
        "tooth": tooth,
        "condition": condition,
        "severity": severity,
        "confidence": int(confidence * 100),
        "bbox": [x1, y1, x2, y2],
        "x": round((x1 / img_width) * 100, 2),
        "y": round((y1 / img_height) * 100, 2),
        "w": round(((x2 - x1) / img_width) * 100, 2),
        "h": round(((y2 - y1) / img_height) * 100, 2)
      })
  overall = get_overall_severity(conditions)
  return {
    "mode": mode,
    "overall_severity": overall,
    "total_detected": len(conditions),
    "conditions": conditions
  }

# SECTION 6 — ENDPOINTS:

@app.get("/health")
def health():
  return {
    "status": "ok",
    "models_loaded": True,
    "timestamp": datetime.now().isoformat()
  }

@app.post("/diagnose/xray")
async def diagnose_xray(
  image_file: UploadFile = File(...)
):
  try:
    image_bytes = await image_file.read()
    result = run_inference(xray_model, image_bytes, "xray")
    return result
  except Exception as e:
    import traceback
    print(traceback.format_exc())
    raise HTTPException(status_code=500, detail=str(e))

@app.post("/diagnose/photo")
async def diagnose_photo(
  image_file: UploadFile = File(...)
):
  try:
    image_bytes = await image_file.read()
    
    if not gemini_model:
      raise HTTPException(
        status_code=500,
        detail="Gemini API key not configured"
      )
    
    # Convert image to base64 for Gemini
    image_b64 = base64.b64encode(image_bytes).decode()
    image_part = {
      "mime_type": image_file.content_type or "image/jpeg",
      "data": image_b64
    }
    
    # Prompt Gemini to analyze dental conditions
    prompt = """
    You are an expert dental AI assistant helping dentists 
    analyze intraoral (mouth) photographs.
    
    Analyze this dental photo carefully and identify ALL 
    visible dental conditions.
    
    For each condition found, respond with ONLY a JSON array.
    No explanation, no markdown, just the raw JSON array.
    
    Use this exact format:
    [
      {
        "tooth": <tooth number 1-32 or best estimate, integer>,
        "condition": "<condition name>",
        "severity": "<healthy|mild|severe>",
        "confidence": <0.0 to 1.0, float>,
        "description": "<one sentence clinical description>"
      }
    ]
    
    Conditions to look for:
    - Calculus/Tartar buildup → severe if heavy, mild if light
    - Dental Caries/Cavity → severe if deep, mild if early
    - Gingivitis → inflammation, redness of gums
    - Periodontitis → severe gum disease, recession
    - Tooth Discoloration → staining, yellowing
    - Plaque → soft deposits on teeth
    - Fractured Tooth → cracks or chips
    - Missing Tooth → absent tooth in arch
    - Oral Lesion → sores, ulcers, white patches
    
    If the image shows MULTIPLE affected areas, 
    list each one separately.
    
    If truly no conditions are visible and teeth look 
    completely healthy, return:
    [{"tooth": 0, "condition": "Healthy", 
      "severity": "healthy", "confidence": 0.95,
      "description": "No visible dental issues detected"}]
    
    IMPORTANT: This photo shows an intraoral view.
    Be thorough — analyze gums, teeth surfaces, 
    and overall oral health. Do not return empty array.
    """
    
    response = gemini_model.generate_content([
      prompt,
      {"mime_type": image_part["mime_type"], 
       "data": image_b64}
    ])
    
    # Parse Gemini response
    response_text = response.text.strip()
    
    # Clean up response if it has markdown
    if "```json" in response_text:
      response_text = response_text.split("```json")[1]\
        .split("```")[0].strip()
    elif "```" in response_text:
      response_text = response_text.split("```")[1]\
        .split("```")[0].strip()
    
    conditions = json.loads(response_text)
    
    # Ensure severity is valid
    for c in conditions:
      sev = str(c.get("severity", "")).lower()
      if sev not in ["healthy", "mild", "severe"]:
        sev = "mild"
      c["severity"] = sev.capitalize()
      if "confidence" not in c:
        c["confidence"] = 85
      else:
        # if float, convert to percentage integer if it's <= 1.0
        if isinstance(c["confidence"], float) and c["confidence"] <= 1.0:
            c["confidence"] = int(c["confidence"] * 100)
            
      if "tooth" not in c:
        c["tooth"] = 0
        
      import uuid
      c["id"] = str(uuid.uuid4())
      
      # Add default coordinates for photo mode so SVG doesn't break
      c["bbox"] = []
      c["x"] = 50
      c["y"] = 50
      c["w"] = 10
      c["h"] = 10
    
    overall = get_overall_severity(conditions)
    
    return {
      "mode": "photo",
      "overall_severity": overall,
      "total_detected": len(conditions),
      "conditions": conditions
    }
    
  except json.JSONDecodeError as e:
    print(f"JSON parse error: {e}")
    print(f"Gemini response was: {response_text}")
    raise HTTPException(
      status_code=500,
      detail=f"Failed to parse AI response: {str(e)}"
    )
  except Exception as e:
    import traceback
    print(traceback.format_exc())
    raise HTTPException(
      status_code=500, 
      detail=str(e)
    )

@app.post("/save-diagnosis")
async def save_diagnosis(body: SaveDiagnosisRequest):
  try:
    diag_data = {
      "patient_id": body.patient_id,
      "mode": body.mode,
      "overall_severity": body.overall_severity,
      "image_url": body.image_url,
      "conditions": body.conditions,
      "total_detected": body.total_detected
    }
    if body.user_id:
      diag_data["user_id"] = body.user_id
    
    diag_response = supabase_client\
      .table("diagnoses")\
      .insert(diag_data).execute()
    
    if not diag_response.data:
      raise HTTPException(
        status_code=500,
        detail="Failed to insert diagnosis"
      )
    
    diagnosis_id = diag_response.data[0]["id"]
    
    if body.conditions:
      condition_rows = [
        {
          "diagnosis_id": diagnosis_id,
          "tooth": c.get("tooth"),
          "condition": c.get("condition"),
          "severity": c.get("severity"),
          "confidence": c.get("confidence"),
          "bbox": c.get("bbox")
        }
        for c in body.conditions
      ]
      supabase_client.table("conditions")\
        .insert(condition_rows).execute()
    
    return {
      "success": True,
      "diagnosis_id": diagnosis_id
    }
  except Exception as e:
    import traceback
    print(traceback.format_exc())
    raise HTTPException(status_code=500, detail=str(e))

@app.get("/patients")
async def get_patients(user_id: str = None):
  try:
    query = supabase_client.table("patients")\
      .select("*, diagnoses(count)")
    if user_id:
      query = query.eq("user_id", user_id)
    response = query.order(
      "created_at", desc=True
    ).execute()
    return {"patients": response.data}
  except Exception as e:
    import traceback
    print(traceback.format_exc())
    raise HTTPException(status_code=500, detail=str(e))

@app.post("/patients")
async def create_patient(
  patient: CreatePatientRequest
):
  try:
    insert_data = {"name": patient.name}
    if patient.age is not None:
      insert_data["age"] = patient.age
    if patient.gender is not None:
      insert_data["gender"] = patient.gender
    if patient.notes is not None:
      insert_data["notes"] = patient.notes
    if patient.user_id is not None:
      insert_data["user_id"] = patient.user_id
    
    response = supabase_client.table("patients")\
      .insert(insert_data).execute()
    
    if not response.data:
      raise HTTPException(
        status_code=500,
        detail="Insert returned no data"
      )
    return response.data[0]
  except Exception as e:
    import traceback
    print(traceback.format_exc())
    raise HTTPException(status_code=500, detail=str(e))

# SECTION 7 — RUN:
if __name__ == "__main__":
  import uvicorn
  uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
