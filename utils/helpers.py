import cv2
import numpy as np
from PIL import Image

# Color palette for bounding boxes (BGR for OpenCV)
COLORS = [
    (255, 87,  34),   # deep orange
    (33,  150, 243),  # blue
    (76,  175, 80),   # green
    (156, 39,  176),  # purple
    (255, 193, 7),    # amber
    (0,   188, 212),  # cyan
    (244, 67,  54),   # red
]

def pil_to_cv2(pil_image):
    """Convert PIL Image to OpenCV BGR format."""
    return cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)

def cv2_to_pil(cv2_image):
    """Convert OpenCV BGR image to PIL RGB format."""
    return Image.fromarray(cv2.cvtColor(cv2_image, cv2.COLOR_BGR2RGB))

def draw_detections(pil_image, detections, distances):
    """
    Draws bounding boxes, labels, confidence, distance, and direction
    on the image. Returns annotated PIL Image.
    """
    img = pil_to_cv2(pil_image)
    h, w = img.shape[:2]

    for i, (det, dist) in enumerate(zip(detections, distances)):
        x1, y1, x2, y2 = det['box']
        label      = det['label']
        confidence = det['confidence']
        direction  = det.get('direction', '')
        color      = COLORS[i % len(COLORS)]

        # Draw bounding box
        cv2.rectangle(img, (x1, y1), (x2, y2), color, 2)

        # Build label text
        dist_text = f"{dist}m" if dist else "?"
        dir_text = f" | {direction}" if direction else ""
        text = f"{label} {confidence:.0%} | {dist_text}{dir_text}"

        # Background rectangle for text
        (tw, th), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 1)
        cv2.rectangle(img, (x1, y1 - th - 8), (x1 + tw + 4, y1), color, -1)

        # Draw text
        cv2.putText(
            img, text,
            (x1 + 2, y1 - 4),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.55, (255, 255, 255), 1, cv2.LINE_AA
        )

    return cv2_to_pil(img)

def resize_for_display(pil_image, max_width=800):
    """Resize image proportionally for clean UI display."""
    w, h = pil_image.size
    if w > max_width:
        ratio = max_width / w
        pil_image = pil_image.resize((max_width, int(h * ratio)), Image.LANCZOS)
    return pil_image

def format_results_table(detections, distances):
    """
    Returns a list of dicts for Streamlit st.dataframe display.
    """
    rows = []
    for det, dist in zip(detections, distances):
        rows.append({
            "Object"    : det['label'].capitalize(),
            "Confidence": f"{det['confidence']:.0%}",
            "Distance"  : f"{dist}m" if dist else "N/A",
            "Direction" : det.get('direction', 'Unknown').capitalize(),
            "Status"    : get_proximity_status(dist)
        })
    # Sort by closest first
    rows.sort(key=lambda x: float(x["Distance"].replace("m","")) 
              if x["Distance"] != "N/A" else 999)
    return rows

def get_proximity_status(dist):
    """Returns emoji status based on distance."""
    if dist is None:
        return "❓ Unknown"
    elif dist < 1.0:
        return "🔴 Very Close"
    elif dist < 3.0:
        return "🟡 Nearby"
    elif dist < 6.0:
        return "🟢 Moderate"
    else:
        return "🔵 Far"