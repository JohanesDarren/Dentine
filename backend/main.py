import os
import json
import io
from flask import Flask, request, jsonify
from flask_cors import CORS
from waitress import serve
from dotenv import load_dotenv
from PIL import Image
import google.generativeai as genai

# Import YOLO detector function from object_detector.py
from object_detector import detect_objects_on_image

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Enable CORS for frontend requests (typically from http://localhost:3000)
CORS(app, resources={r"/*": {"origins": "*"}})

# Configure Gemini API Key
gemini_key = os.environ.get("GEMINI_API_KEY")
if gemini_key and gemini_key != "MY_GEMINI_API_KEY":
    genai.configure(api_key=gemini_key)
    print("Gemini API configured successfully.")
else:
    print("WARNING: GEMINI_API_KEY is not set. Gemini integration will fall back to mock/YOLO results.")

@app.route("/")
def index():
    return jsonify({
        "status": "online",
        "service": "Dentine AI Diagnosis Backend",
        "capabilities": [
            "YOLOv8 Object Detection (/detect)",
            "Gemini Multimodal Dental Diagnosis (/api/diagnose)"
        ]
    })

@app.route("/detect", methods=["POST"])
def detect():
    """
    Backward-compatible endpoint matching the original object_detector.py behavior.
    Accepts an uploaded image file with the name "image_file" and returns a JSON array
    of raw bounding boxes in the format: [[x1, y1, x2, y2, object_type, probability], ..]
    """
    if "image_file" not in request.files:
        return jsonify({"error": "No image_file provided"}), 400
        
    file = request.files["image_file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
        
    try:
        boxes = detect_objects_on_image(file.stream)
        return jsonify(boxes)
    except Exception as e:
        print(f"Error during raw YOLO detection: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/api/diagnose", methods=["POST"])
def diagnose():
    """
    Consolidated diagnostic endpoint.
    Accepts:
      - file / image_file: The uploaded dental image
      - mode: Query parameter or form field ("photo" or "xray", defaults to "photo")
    Returns a unified JSON list of detailed diagnoses matching the frontend ScanResult schema.
    """
    # 1. Retrieve the file
    upload_key = "image_file" if "image_file" in request.files else "file"
    if upload_key not in request.files:
        return jsonify({"error": "No image file provided. Use 'file' or 'image_file' field."}), 400
        
    file = request.files[upload_key]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
        
    # Get diagnose mode
    mode = request.form.get("mode", request.args.get("mode", "photo")).lower()
    if mode not in ["photo", "xray"]:
        mode = "photo"

    try:
        # Read the file stream into bytes so we can pass it to multiple places
        image_bytes = file.read()
        
        # Load image with PIL to verify it's valid and get dimensions
        img = Image.open(io.BytesIO(image_bytes))
        img_width, img_height = img.size
        
        # 2. Run YOLO Object Detection for spatial bounds
        yolo_findings = []
        try:
            yolo_findings = detect_objects_on_image(io.BytesIO(image_bytes))
        except Exception as ye:
            print(f"YOLO detection skipped or failed: {ye}")

        # 3. Call Gemini if configured, passing the image and YOLO context
        gemini_results = None
        if gemini_key and gemini_key != "MY_GEMINI_API_KEY":
            gemini_results = diagnose_with_gemini(image_bytes, mode, yolo_findings)
            
        # 4. If Gemini succeeded, return its results. Otherwise, fall back to YOLO-based findings.
        if gemini_results:
            return jsonify(gemini_results)
        else:
            print("Using fallback/YOLO-based diagnosis findings.")
            fallback_results = get_fallback_diagnoses(yolo_findings, img_width, img_height, mode)
            return jsonify(fallback_results)

    except Exception as e:
        print(f"Error during diagnosis endpoint: {e}")
        return jsonify({"error": str(e)}), 500

def diagnose_with_gemini(image_bytes, mode, yolo_findings):
    """
    Invokes the Gemini API with the image and YOLO bounding boxes to generate a detailed medical diagnosis.
    """
    try:
        # Prepare the YOLO findings description for the prompt context
        yolo_context = ""
        if yolo_findings:
            yolo_context = "The object detection model identified the following initial bounding boxes:\n"
            for box in yolo_findings:
                yolo_context += f"- Class: {box[4]}, Probability: {box[5]}, Bounding Box coordinates: {box[0:4]}\n"
        else:
            yolo_context = "No pre-detected boxes are available. Rely fully on your visual analysis.\n"

        prompt = f"""
You are an expert AI dental diagnostic tool. Analyze this dental scan (mode: {mode}).
{yolo_context}

Provide a detailed clinical analysis.
- If mode is 'photo', evaluate issues like: Plaque Buildup, Gingivitis, Calculus, Healthy Tissue.
- If mode is 'xray', evaluate issues like: Cavity (Class I/II/III/IV), Bone Loss, Healthy Crown, Impacted Tooth, Abscess.

Format the response strictly as a JSON array of objects representing each finding.
Do NOT use markdown code blocks or wrap the output in ```json. Just return a clean JSON string matching this schema:
[
  {{
    "id": "1",
    "condition": "Condition Name",
    "severity": "Healthy" or "Mild" or "Severe",
    "confidence": 85,
    "teeth": "U7" or "L2-L4" or "U1" or "All",
    "description": "Clinical explanation of findings and suggested actions.",
    "x": 45,
    "y": 75,
    "w": 10,
    "h": 10
  }}
]

Important rules:
1. 'x', 'y' coordinates are the center coordinates of the diagnosed issue, represented as floating-point percentages of the image width and height (from 0 to 100).
2. 'w', 'h' are width and height percentages of the bounding box (from 0 to 100).
3. If YOLO detections are provided above, try to align your boxes/ids with those detections while augmenting them with your clinical explanation.
4. Ensure the output is valid JSON and only JSON.
"""
        model = genai.GenerativeModel("gemini-1.5-flash")
        img = Image.open(io.BytesIO(image_bytes))
        
        response = model.generate_content(
            contents=[prompt, img],
            generation_config={"response_mime_type": "application/json"}
        )
        
        # Parse output
        diagnoses = json.loads(response.text.strip())
        return diagnoses
    except Exception as e:
        print(f"Failed to generate or parse Gemini response: {e}")
        return None

def get_fallback_diagnoses(yolo_findings, img_width, img_height, mode):
    """
    Transforms raw YOLO detections into the structured ScanResult format expected by the frontend.
    Used if Gemini API key is not configured or fails.
    """
    results = []
    for i, box in enumerate(yolo_findings):
        x1, y1, x2, y2, label, prob_str = box
        
        # Parse probability float
        try:
            prob = int(float(prob_str.replace("%", "")))
        except ValueError:
            prob = 85
            
        # Convert absolute pixels to percentages
        w_pct = ((x2 - x1) / img_width) * 100
        h_pct = ((y2 - y1) / img_height) * 100
        x_pct = (x1 / img_width) * 100
        y_pct = (y1 / img_height) * 100
        
        # Estimate severity based on prediction probability
        severity = "Mild"
        if prob > 85:
            severity = "Severe"
        elif prob < 60:
            severity = "Healthy" if "healthy" in label.lower() else "Mild"
            
        description = f"Detected {label} with confidence {prob_str} using YOLOv8."
        if "cavity" in label.lower() or "decay" in label.lower():
            description += " Deep decay detected. Professional restoration is recommended."
        elif "plaque" in label.lower() or "calculus" in label.lower():
            description += " Noticeable buildup observed. Dental cleaning is advised."
            
        results.append({
            "id": str(i + 1),
            "condition": label.title(),
            "severity": severity,
            "confidence": prob,
            "teeth": f"T{i + 1}",
            "description": description,
            "x": round(x_pct, 1),
            "y": round(y_pct, 1),
            "w": round(w_pct, 1),
            "h": round(h_pct, 1)
        })
        
    # Default healthy fallback if YOLO model yields no detections
    if not results:
        if mode == "photo":
            results = [
                {
                    "id": "1",
                    "condition": "Healthy Tissue",
                    "severity": "Healthy",
                    "confidence": 95,
                    "teeth": "All",
                    "description": "Gums and surrounding tissue appear healthy with no plaque buildup or inflammation detected.",
                    "x": 50,
                    "y": 50,
                    "w": 10,
                    "h": 10
                }
            ]
        else:
            results = [
                {
                    "id": "1",
                    "condition": "Healthy Crown",
                    "severity": "Healthy",
                    "confidence": 98,
                    "teeth": "All",
                    "description": "No cavities or signs of periodontal bone loss detected in this X-Ray.",
                    "x": 50,
                    "y": 50,
                    "w": 10,
                    "h": 10
                }
            ]
            
    return results

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting server on port {port}...")
    serve(app, host="0.0.0.0", port=port)
