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
from datetime import datetime

load_dotenv()

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
  os.getenv("SUPABASE_ANON_KEY")
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
  severities = [c["severity"] for c in conditions]
  if "severe" in severities:
    return "severe"
  elif "mild" in severities:
    return "mild"
  return "healthy"

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
  results = model.predict(image, conf=0.25)
  conditions = []
  for result in results:
    for box in result.boxes:
      x1, y1, x2, y2 = [
        round(x) for x in box.xyxy[0].tolist()
      ]
      class_id = int(box.cls[0].item())
      condition = result.names[class_id]
      confidence = round(float(box.conf[0].item()), 2)
      severity = get_severity(condition, mode)
      tooth = map_bbox_to_tooth(
        x1, y1, x2, y2, img_width, img_height
      )
      conditions.append({
        "tooth": tooth,
        "condition": condition,
        "severity": severity,
        "confidence": confidence,
        "bbox": [x1, y1, x2, y2]
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
async def diagnose_xray(file: UploadFile = File(...)):
  try:
    image_bytes = await file.read()
    result = run_inference(xray_model, image_bytes, "xray")
    return result
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))

@app.post("/diagnose/photo")
async def diagnose_photo(file: UploadFile = File(...)):
  try:
    image_bytes = await file.read()
    result = run_inference(photo_model, image_bytes, "photo")
    return result
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))

@app.post("/save-diagnosis")
def save_diagnosis(body: SaveDiagnosisRequest):
  try:
    response = supabase_client.table("diagnoses").insert({
      "user_id": body.user_id,
      "patient_id": body.patient_id,
      "mode": body.mode,
      "overall_severity": body.overall_severity,
      "image_url": body.image_url,
      "conditions": body.conditions,
      "total_detected": body.total_detected
    }).execute()
    
    if not response.data or len(response.data) == 0:
      raise HTTPException(status_code=500, detail="Failed to save diagnosis")
      
    diagnosis_id = response.data[0]["id"]
    
    rows = [
      {
        "diagnosis_id": diagnosis_id,
        "tooth": c["tooth"],
        "condition": c["condition"],
        "severity": c["severity"],
        "confidence": c["confidence"],
        "bbox": c.get("bbox")
      }
      for c in body.conditions
    ]
    
    supabase_client.table("conditions").insert(rows).execute()
    return {"success": True, "diagnosis_id": diagnosis_id}
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))

@app.get("/patients")
def get_patients(user_id: str = None):
  try:
    query = supabase_client.table("patients").select("*, diagnoses(count)")
    if user_id:
      query = query.eq("user_id", user_id)
    response = query.order("created_at", desc=True).execute()
    return {"patients": response.data}
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))

@app.post("/patients")
def create_patient(body: CreatePatientRequest):
  try:
    response = supabase_client.table("patients").insert({
      "user_id": body.user_id,
      "name": body.name,
      "age": body.age,
      "gender": body.gender,
      "notes": body.notes
    }).execute()
    
    if not response.data or len(response.data) == 0:
      raise HTTPException(status_code=500, detail="Failed to create patient")
      
    return response.data[0]
  except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))

# SECTION 7 — RUN:
if __name__ == "__main__":
  import uvicorn
  uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
