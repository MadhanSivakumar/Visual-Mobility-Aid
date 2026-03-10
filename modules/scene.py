import torch
import torchvision.transforms as transforms
from torchvision import models
from PIL import Image

# We'll map ImageNet classes to broader scene categories
SCENE_KEYWORDS = {
    'Indoor':   ['desk', 'chair', 'sofa', 'bed', 'lamp', 'bookcase', 'bookshelf',
                 'monitor', 'keyboard', 'mouse', 'cup', 'bottle', 'laptop', 'computer',
                 'table', 'cabinet', 'shelf', 'door', 'window', 'curtain', 'carpet',
                 'painting', 'clock', 'telephone', 'microwave', 'oven', 'refrigerator',
                 'sink', 'toaster', 'bowl', 'fork', 'knife', 'spoon', 'plate', 'dining table'],
    'Kitchen':  ['oven', 'refrigerator', 'sink', 'microwave', 'toaster', 'stove',
                 'dishwasher', 'bowl', 'fork', 'knife', 'spoon', 'plate', 'cup',
                 'bottle', 'can', 'pan', 'pot', 'blender', 'coffee maker'],
    'Outdoor':  ['car', 'truck', 'bus', 'bicycle', 'motorbike', 'tree', 'grass',
                 'road', 'street', 'building', 'house', 'sky', 'cloud', 'sun',
                 'traffic light', 'stop sign', 'person', 'dog', 'cat', 'bird',
                 'bench', 'fountain', 'statue', 'bridge', 'river', 'mountain'],
    'Nature':   ['tree', 'grass', 'flower', 'mountain', 'river', 'lake', 'beach',
                 'ocean', 'sky', 'cloud', 'sun', 'moon', 'star', 'forest', 'park',
                 'dog', 'cat', 'bird', 'horse', 'cow', 'sheep', 'deer'],
    'Office':   ['desk', 'chair', 'computer', 'laptop', 'monitor', 'keyboard',
                 'mouse', 'printer', 'bookshelf', 'filing cabinet', 'whiteboard',
                 'projector', 'telephone', 'coffee cup'],
    'Store':    ['shelf', 'counter', 'cash register', 'shopping cart', 'product',
                 'bottle', 'can', 'box', 'bag', 'person', 'clothing'],
}

class SceneRecognizer:
    def __init__(self):
        print("[VisionAssist] Loading EfficientNet-B0 model...")
        self.model = models.efficientnet_b0(pretrained=True)
        self.model.eval()

        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std= [0.229, 0.224, 0.225]
            )
        ])

        # Load ImageNet class labels
        import urllib.request, json
        url = "https://raw.githubusercontent.com/anishathalye/imagenet-simple-labels/master/imagenet-simple-labels.json"
        try:
            with urllib.request.urlopen(url) as r:
                self.labels = json.load(r)
        except:
            self.labels = [str(i) for i in range(1000)]  # fallback

        print("[VisionAssist] EfficientNet-B0 ready.")

    def recognize(self, pil_image, detected_objects=None):
        """
        Returns (scene_label, confidence_score)
        Uses detected objects from YOLO to improve scene guessing.
        """
        # --- Method 1: Use YOLO detections to infer scene ---
        if detected_objects:
            labels_found = [d['label'].lower() for d in detected_objects]
            scene_scores = {scene: 0 for scene in SCENE_KEYWORDS}

            for scene, keywords in SCENE_KEYWORDS.items():
                for kw in keywords:
                    if kw in labels_found:
                        scene_scores[scene] += 1

            # Normalize by number of detections to avoid bias towards crowded scenes
            total_detections = len(labels_found)
            if total_detections > 0:
                for scene in scene_scores:
                    scene_scores[scene] = scene_scores[scene] / total_detections

            best_scene = max(scene_scores, key=scene_scores.get)
            if scene_scores[best_scene] > 0:
                confidence = round(scene_scores[best_scene], 2)
                return best_scene, confidence

        # --- Method 2: EfficientNet image classification fallback ---
        try:
            tensor = self.transform(pil_image).unsqueeze(0)
            with torch.no_grad():
                output = self.model(tensor)
                probs = torch.nn.functional.softmax(output[0], dim=0)
                top_idx = probs.argmax().item()
                confidence = round(probs[top_idx].item(), 2)
                top_label = self.labels[top_idx] if top_idx < len(self.labels) else "Unknown"

            # Map to scene category with better matching
            for scene, keywords in SCENE_KEYWORDS.items():
                if any(kw.lower() in top_label.lower() for kw in keywords):
                    return scene, confidence

            # If no direct match, check for broader categories
            top_label_lower = top_label.lower()
            if any(word in top_label_lower for word in ['indoor', 'room', 'house', 'building']):
                return "Indoor", confidence * 0.8
            elif any(word in top_label_lower for word in ['outdoor', 'street', 'park', 'nature']):
                return "Outdoor", confidence * 0.8
            elif any(word in top_label_lower for word in ['kitchen', 'food', 'cooking']):
                return "Kitchen", confidence * 0.8

        except Exception as e:
            print(f"[SceneRecognizer] Error in classification: {e}")

        return "General Scene", 0.5