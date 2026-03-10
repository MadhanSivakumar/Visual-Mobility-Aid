"""
VisionAssist - FastAPI Backend
AI-Based Assistive Image Understanding System
By Madhan Sivakumar
"""

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
import io
import base64
import json
import torch
import warnings

warnings.filterwarnings('ignore')

from modules.detector import ObjectDetector
from modules.distance import DistanceEstimator
from modules.scene import SceneRecognizer
from modules.audio import AudioFeedback
from utils.helpers import draw_detections

# ─────────────────────────────────────────────
#  APP CONFIG
# ─────────────────────────────────────────────
app = FastAPI(
    title="VisionAssist API",
    description="AI-Based Assistive Image Understanding System",
    version="1.0.0"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model instances (loaded once)
detector = None
estimator = None
scene_recognizer = None
audio_feedback = None

# ─────────────────────────────────────────────
#  LIFESPAN EVENTS
# ─────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    """Load AI models on startup"""
    global detector, estimator, scene_recognizer, audio_feedback
    
    print("[VisionAssist] Loading AI models...")
    detector = ObjectDetector(confidence=0.4)
    estimator = DistanceEstimator()
    scene_recognizer = SceneRecognizer()
    audio_feedback = AudioFeedback(rate=150)
    print("[VisionAssist] All models loaded successfully!")

@app.on_event("shutdown")
async def shutdown_event():
    print("[VisionAssist] Shutting down...")

# ─────────────────────────────────────────────
#  API ROUTES
# ─────────────────────────────────────────────

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "message": "VisionAssist API is running",
        "version": "1.0.0"
    }

@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "models_loaded": detector is not None,
        "cuda_available": torch.cuda.is_available(),
        "device": "cuda" if torch.cuda.is_available() else "cpu"
    }

@app.post("/api/analyze")
async def analyze_image(
    file: UploadFile = File(...),
    confidence: float = Form(0.4),
    tts_rate: int = Form(150),
    enable_audio: bool = Form(True),
    max_objects: int = Form(8)
):
    """
    Analyze an uploaded image and return detection results
    
    Args:
        file: Image file (JPG, PNG)
        confidence: Detection confidence threshold (0.1-0.9)
        tts_rate: Text-to-speech rate (100-250 WPM)
        enable_audio: Enable audio feedback
        max_objects: Maximum objects to detect
    
    Returns:
        JSON with detections, distances, scene, annotated image
    """
    try:
        # Read and process image
        image_data = await file.read()
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        
        # Update detector confidence
        detector.model.conf = confidence
        
        # Run detection
        detections = detector.detect(image)
        detections = detections[:max_objects]  # Limit number of objects
        
        # Estimate distances
        distances = [
            estimator.estimate(d['label'], d['box'])
            for d in detections
        ]
        
        # Recognize scene
        scene_label, scene_conf = scene_recognizer.recognize(image, detections)
        
        # Draw annotations
        annotated_image = draw_detections(image, detections, distances)
        
        # Convert annotated image to base64
        buffered = io.BytesIO()
        annotated_image.save(buffered, format="JPEG", quality=90)
        annotated_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
        # Build audio summary
        audio_summary = None
        if enable_audio:
            audio_feedback.rate = tts_rate
            audio_summary = audio_feedback.build_summary(detections, distances, scene_label)
        
        # Format results for frontend
        results = {
            "success": True,
            "detections": [
                {
                    "label": d['label'],
                    "confidence": d['confidence'],
                    "box": d['box'],
                    "distance": distances[i] if distances[i] else None,
                    "direction": d.get('direction', 'unknown')
                }
                for i, d in enumerate(detections)
            ],
            "scene": {
                "label": scene_label,
                "confidence": scene_conf
            },
            "annotated_image": f"data:image/jpeg;base64,{annotated_base64}",
            "audio_summary": audio_summary,
            "stats": {
                "objects_found": len(detections),
                "max_objects": max_objects
            }
        }
        
        return JSONResponse(content=results)
    
    except Exception as e:
        return JSONResponse(
            content={
                "success": False,
                "error": str(e)
            },
            status_code=500
        )

@app.post("/api/analyze/camera")
async def analyze_camera_image(
    file: UploadFile = File(...),
    confidence: float = Form(0.4),
    tts_rate: int = Form(150),
    enable_audio: bool = Form(True),
    max_objects: int = Form(8)
):
    """Analyze image captured from camera"""
    return await analyze_image(
        file=file,
        confidence=confidence,
        tts_rate=tts_rate,
        enable_audio=enable_audio,
        max_objects=max_objects
    )

# ─────────────────────────────────────────────
#  MAIN ENTRY POINT
# ─────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    print("=" * 50)
    print("🚀 VisionAssist API Server")
    print("=" * 50)
    print("Starting server at http://localhost:8000")
    print("API documentation at http://localhost:8000/docs")
    print("=" * 50)
    uvicorn.run(app, host="0.0.0.0", port=8000)

