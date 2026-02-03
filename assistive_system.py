
import cv2
import torch
import numpy as np
import argparse
import json
import sys
import os

# Suppress warnings
import warnings
warnings.filterwarnings("ignore")

# Attempt to import pyttsx3, handle if missing or no audio driver
try:
    import pyttsx3
    TTS_AVAILABLE = True
except (ImportError, OSError):
    TTS_AVAILABLE = False

class AssistiveVisionSystem:
    def __init__(self, use_audio=True):
        self.use_audio = use_audio and TTS_AVAILABLE
        self.tts_engine = None
        
        if self.use_audio:
            try:
                self.tts_engine = pyttsx3.init()
                self.tts_engine.setProperty('rate', 150)
            except Exception as e:
                print(f"Warning: TTS initialization failed: {e}", file=sys.stderr)
                self.use_audio = False

        print("Loading YOLOv5 model...", file=sys.stderr)
        # Load YOLOv5s from torch hub
        try:
            self.detector = torch.hub.load('ultralytics/yolov5', 'yolov5s', pretrained=True)
            self.detector.conf = 0.4  # Confidence threshold
        except Exception as e:
            print(f"Error loading YOLOv5: {e}", file=sys.stderr)
            sys.exit(1)

        # For Scene Recognition (EfficientNet)
        # In a real deployment, we would load a model trained on Places365.
        # Here we will use a standard EfficientNet-b0 pre-trained on ImageNet for demonstration,
        # mapping generic classes to "scenes" or just using the labels.
        # Getting actual Places365 weights usually requires downloading a specific checkpoint.
        print("Loading EfficientNet model...", file=sys.stderr)
        try:
            # Using torch hub for efficientnet
            self.scene_classifier = torch.hub.load('nvidia/DeepLearningExamples:torchhub', 'nvidia_efficientnet_b0', pretrained=True)
            self.scene_classifier.eval()
            
            # Simple transform
            from torchvision import transforms
            self.preprocess = transforms.Compose([
                transforms.Resize(256),
                transforms.CenterCrop(224),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ])
            
            # Load labels (ImageNet labels for demo)
            # In production: Load Places365 categories
            self.labels = self._load_imagenet_labels()
            
        except Exception as e:
            print(f"Error loading EfficientNet: {e}", file=sys.stderr)
            self.scene_classifier = None

    def _load_imagenet_labels(self):
        # Simplified list or fetch from URL
        # For this standalone script, we'll try to download or use a placeholder
        try:
            import requests
            url = "https://raw.githubusercontent.com/pytorch/hub/master/imagenet_classes.txt"
            r = requests.get(url)
            return [line.strip() for line in r.text.split('\n')]
        except:
            return ["Unknown Scene"] * 1000

    def estimate_distance(self, bbox_height, image_height):
        # Simple heuristic from the paper: D approx 1/H
        # This requires calibration (k). We'll use a dummy k=1000 for demo
        k = 1000.0
        if bbox_height == 0: return 0
        return round(k / bbox_height, 2)

    def process_image(self, image_path):
        frame = cv2.imread(image_path)
        if frame is None:
            return {"error": "Could not read image"}

        # 1. Object Detection
        results = self.detector(frame)
        detections = results.pandas().xyxy[0]  # xmin, ymin, xmax, ymax, confidence, class, name
        
        objects_detected = []
        distances = {}
        
        img_h, img_w, _ = frame.shape
        
        for _, row in detections.iterrows():
            label = row['name']
            bbox_h = row['ymax'] - row['ymin']
            dist = self.estimate_distance(bbox_h, img_h)
            
            objects_detected.append(label)
            # Keep the closest distance for each object type
            if label not in distances or dist < distances[label]:
                distances[label] = dist

        # 2. Scene Recognition
        scene_label = "Unknown"
        if self.scene_classifier:
            input_tensor = self.preprocess(torch.from_numpy(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)).permute(2, 0, 1)).unsqueeze(0)
            if torch.cuda.is_available():
                input_tensor = input_tensor.cuda()
                self.scene_classifier = self.scene_classifier.cuda()
                
            with torch.no_grad():
                output = self.scene_classifier(input_tensor)
                _, predicted_idx = torch.max(output, 1)
                if predicted_idx < len(self.labels):
                    scene_label = self.labels[predicted_idx]

        # 3. Generate Feedback
        unique_objs = list(set(objects_detected))
        obj_text = ", ".join([f"{obj} at {distances[obj]} meters" for obj in unique_objs[:3]]) # Limit to top 3
        
        if not obj_text:
            obj_text = "No obstacles detected."
            
        feedback_text = f"Scene appears to be {scene_label}. {obj_text}"
        
        if self.use_audio and self.tts_engine:
            try:
                self.tts_engine.say(feedback_text)
                self.tts_engine.runAndWait()
            except:
                pass

        return {
            "objects": unique_objs,
            "distances": distances,
            "scene": scene_label,
            "feedback_text": feedback_text
        }

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Assistive Vision System")
    parser.add_argument("--image", required=True, help="Path to input image")
    parser.add_argument("--no-audio", action="store_true", help="Disable TTS output")
    
    args = parser.parse_args()
    
    # Initialize system (disable audio if requested or running on server)
    system = AssistiveVisionSystem(use_audio=not args.no_audio)
    
    result = system.process_image(args.image)
    
    # Print JSON to stdout for the server to capture
    print(json.dumps(result))
