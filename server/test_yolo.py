from ultralytics import YOLO

# Load the official YOLOv8 model
model = YOLO("yolov8n.pt")

# Replace this with your test image path
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
image_path = os.path.join(BASE_DIR, "test_images", "apple.jpg")

# Run detection
results = model(image_path)

for result in results:
    for box in result.boxes:
        cls = int(box.cls[0])
        conf = float(box.conf[0])

        print(f"Detected: {model.names[cls]}")
        print(f"Confidence: {conf * 100:.2f}%")