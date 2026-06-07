import os
from ultralytics import YOLO
from PIL import Image

def detect_objects_on_image(buf):
    """
    Function receives an image,
    passes it through YOLOv8 neural network
    and returns an array of detected objects
    and their bounding boxes.
    :param buf: Input image file stream
    :return: Array of bounding boxes in format [[x1,y1,x2,y2,object_type,probability],..]
    """
    # Load YOLO model from models/best.pt relative to this file
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(current_dir, "models", "best.pt")
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"YOLO model weights file not found at {model_path}")
        
    model = YOLO(model_path)
    results = model.predict(Image.open(buf))
    result = results[0]
    output = []
    for box in result.boxes:
        x1, y1, x2, y2 = [
            round(x) for x in box.xyxy[0].tolist()
        ]
        class_id = box.cls[0].item()
        prob = round(box.conf[0].item(), 2)
        prob_percentage = f"{prob * 100:.2f}%"
        output.append([
            x1, y1, x2, y2, result.names[class_id], prob_percentage
        ])

    return output

