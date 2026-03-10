from ultralytics import YOLO
import numpy as np
import cv2

class ObjectDetector:
    def __init__(self, confidence=0.4):
        print("[VisionAssist] Loading YOLOv5 model...")
        # Downloads yolov5su.pt automatically on first run (~14MB)
        self.model = YOLO('yolov5su.pt')
        self.confidence = confidence
        print("[VisionAssist] YOLOv5 ready.")

    def _apply_nms(self, detections, iou_threshold=0.5):
        """
        Apply Non-Maximum Suppression to reduce overlapping boxes.
        """
        if not detections:
            return detections

        boxes = np.array([d['box'] for d in detections])
        scores = np.array([d['confidence'] for d in detections])

        # Convert to [x1, y1, x2, y2] format for NMS
        x1 = boxes[:, 0]
        y1 = boxes[:, 1]
        x2 = boxes[:, 2]
        y2 = boxes[:, 3]

        areas = (x2 - x1 + 1) * (y2 - y1 + 1)

        order = scores.argsort()[::-1]  # Sort by confidence descending

        keep = []
        while order.size > 0:
            i = order[0]
            keep.append(i)

            # Calculate IoU with remaining boxes
            xx1 = np.maximum(x1[i], x1[order[1:]])
            yy1 = np.maximum(y1[i], y1[order[1:]])
            xx2 = np.minimum(x2[i], x2[order[1:]])
            yy2 = np.minimum(y2[i], y2[order[1:]])

            w = np.maximum(0.0, xx2 - xx1 + 1)
            h = np.maximum(0.0, yy2 - yy1 + 1)
            inter = w * h
            ovr = inter / (areas[i] + areas[order[1:]] - inter)

            # Keep boxes with IoU less than threshold
            inds = np.where(ovr <= iou_threshold)[0]
            order = order[inds + 1]

        return [detections[i] for i in keep]

    def _calculate_direction(self, box, image_width, image_height):
        """
        Calculate the direction of an object relative to the camera viewpoint.
        Returns a human-readable direction string.
        """
        x1, y1, x2, y2 = box
        box_center_x = (x1 + x2) / 2
        box_center_y = (y1 + y2) / 2

        # Horizontal position
        if box_center_x < image_width * 0.33:
            horizontal = "left"
        elif box_center_x > image_width * 0.67:
            horizontal = "right"
        else:
            horizontal = "center"

        # Vertical position (for depth perception)
        if box_center_y < image_height * 0.33:
            vertical = "top"
        elif box_center_y > image_height * 0.67:
            vertical = "bottom"
        else:
            vertical = "middle"

        # Combine directions
        if horizontal == "center" and vertical == "middle":
            return "directly ahead"
        elif horizontal == "center":
            return f"ahead ({vertical})"
        elif vertical == "middle":
            return f"to the {horizontal}"
        else:
            return f"{vertical}-{horizontal}"

    def detect(self, pil_image, max_objects=20, nms_threshold=0.5):
        """
        Takes a PIL Image, returns list of detections.
        Each detection: {'label': str, 'confidence': float, 'box': [x1,y1,x2,y2], 'direction': str}
        """
        results = self.model(pil_image, conf=self.confidence, verbose=False, max_det=max_objects)
        detections = []
        image_width, image_height = pil_image.size

        for box in results[0].boxes:
            cls_id     = int(box.cls[0])
            label      = self.model.names[cls_id]
            confidence = round(float(box.conf[0]), 2)
            x1, y1, x2, y2 = [int(v) for v in box.xyxy[0]]

            # Skip very small boxes (likely noise)
            if (x2 - x1) < 10 or (y2 - y1) < 10:
                continue

            # Calculate direction
            direction = self._calculate_direction([x1, y1, x2, y2], image_width, image_height)

            detections.append({
                'label'     : label,
                'confidence': confidence,
                'box'       : [x1, y1, x2, y2],
                'direction' : direction
            })

        # Apply NMS to reduce overlapping detections
        detections = self._apply_nms(detections, nms_threshold)

        # Sort by confidence descending
        detections.sort(key=lambda x: x['confidence'], reverse=True)

        return detections