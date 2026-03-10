# PRODUCT REQUIREMENTS DOCUMENT (PRD)
## VisionAssist – AI-Based Assistive Image Understanding System

---

**Version:** 1.0  
**Type:** Final Year Project – College Level  
**Prepared By:** Madhan Sivakumar  
**Date:** 2024  
**Tech Stack:** React (Frontend) + FastAPI (Backend) + PyTorch/YOLOv5/EfficientNet (AI Models)

---

## 1. Introduction

### Project Overview
VisionAssist is an AI-based assistive system designed to help visually impaired individuals understand their surroundings. The system processes uploaded or captured images and provides:
- Object detection
- Distance estimation
- Scene recognition
- Audio feedback

The system runs **completely offline** after models are loaded, ensuring privacy and accessibility without internet dependency.

---

## 2. Problem Statement

Visually impaired individuals struggle with real-time awareness of their surroundings. Existing tools:
- Require internet connectivity
- Lack combined object+distance+scene analysis
- Have complex or inaccessible interfaces

VisionAssist solves these problems by providing an all-in-one offline AI solution with an intuitive, professional UI.

---

## 3. Project Objectives

### Primary Objectives
1. **Object Detection** – Identify and locate objects in images using YOLOv5
2. **Distance Estimation** – Calculate proximity using bounding box height and focal length
3. **Scene Recognition** – Classify the overall environment using EfficientNet-B0
4. **Audio Feedback** – Provide spoken summaries using Text-to-Speech (Web Speech API)
5. **Professional UI** – Modern React-based interface with glassmorphism design

### Secondary Objectives
- High accuracy detection and classification
- Visual annotation of detected objects
- Smooth, animated user experience
- Offline capability for privacy

---

## 4. Target Users

- **Primary:** Visually impaired individuals who need assistance understanding their environment
- **Secondary:** Caregivers and family members who want to assist visually impaired users
- **Tertiary:** Research groups working on assistive AI technologies

---

## 5. Scope

### Functional Scope
```
User Input (Image Upload / Camera Capture)
        ↓
    AI Processing Pipeline
        ↓
    ┌───┴───┐
    ↓       ↓
Detection  Scene
    ↓       ↓
Distance   Classification
    ↓       ↓
    └───┬───┘
        ↓
    Audio Summary + Visual Display
```

### Features Implemented
1. **Upload Image Mode** – Drag & drop or browse image files
2. **Camera Mode** – Capture real-time photos via webcam
3. **YOLOv5 Object Detection** – Real-time detection with confidence scores
4. **Distance Estimation** – Using pinhole camera model formula
5. **Scene Recognition** – Indoor, Outdoor, Kitchen, Nature classification
6. **Audio Feedback** – Natural language spoken summaries
7. **Settings Panel** – Adjust confidence, TTS speed, max objects

---

## 6. System Architecture

### Frontend (React + Vite)
- **Framework:** React 18 with Vite
- **Styling:** Custom CSS with glassmorphism design
- **Icons:** Lucide React
- **HTTP Client:** Axios

### Backend (FastAPI)
- **Framework:** FastAPI (Python)
- **Server:** Uvicorn
- **Models:** YOLOv5, EfficientNet-B0

### AI Models
- **YOLOv5** – Object detection (ultralytics library)
- **EfficientNet-B0** – Scene classification (PyTorch)
- **Distance Calculator** – Custom implementation using pinhole model

---

## 7. API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/api/health` | GET | Detailed health status |
| `/api/analyze` | POST | Analyze uploaded image |
| `/api/analyze/camera` | POST | Analyze camera-captured image |

### Request Format (Multipart/Form-Data)
```
file: Image file
confidence: float (0.1-0.9)
tts_rate: int (100-250)
enable_audio: boolean
max_objects: int (3-15)
```

### Response Format (JSON)
```json
{
  "success": true,
  "detections": [
    {
      "label": "person",
      "confidence": 0.89,
      "box": [x1, y1, x2, y2],
      "distance": 2.5
    }
  ],
  "scene": {
    "label": "Outdoor",
    "confidence": 0.92
  },
  "annotated_image": "data:image/jpeg;base64,...",
  "audio_summary": "You are in an outdoor environment. A person is 2.5 meters away.",
  "stats": {
    "objects_found": 5,
    "max_objects": 8
  }
}
```

---

## 8. Features & UI Components

### Main Components
1. **Header** – Logo, title, settings button
2. **Navigation Tabs** – Upload Image, Camera Mode, How It Works
3. **ImageUpload** – Drag/drop zone with preview
4. **CameraCapture** – Webcam controls and capture
5. **ResultsDisplay** – Annotated images, stats, table, audio summary
6. **SettingsPanel** – Sliders for confidence, TTS speed, toggles
7. **HowItWorks** – Documentation with pipeline visualization

### Visual Features
- Glassmorphism design with gradient backgrounds
- Animated loading states with progress indicators
- Color-coded distance indicators (Red → Amber → Green → Blue)
- Responsive layout for all screen sizes

---

## 9. Non-Functional Requirements

### Performance
- **Response Time:** <1 second per image (after models load)
- **Model Loading:** ~5-10 seconds on first run
- **Memory:** ~2-3GB RAM usage

### Usability
- Clean, intuitive interface
- Accessibility considerations (screen reader compatible labels)
- Error handling with user-friendly messages

### Reliability
- Offline operation after initial model load
- Graceful degradation on camera permission denial

---

## 10. Acceptance Criteria

### Functional Criteria
- [x] User can upload JPG/PNG images
- [x] User can capture photos via webcam
- [x] YOLOv5 detects objects with bounding boxes
- [x] Distance is estimated for each detection
- [x] Scene is classified (Indoor/Outdoor/Nature/Kitchen)
- [x] Audio summary plays via browser TTS
- [x] Results display shows annotated image and table
- [x] Settings panel adjusts parameters in real-time

### Visual Criteria
- [x] Modern glassmorphism design
- [x] Smooth animations and transitions
- [x] Color-coded proximity indicators
- [x] Responsive layout
- [x] Loading states for async operations

### Technical Criteria
- [x] FastAPI backend handles requests
- [x] React frontend communicates with API
- [x] Models load only once (cached)
- [x] Proper error handling

---

## 11. Future Enhancements

### Phase 2 Ideas
1. **OCR Integration** – Read text from images
2. **Mobile App** – React Native or Flutter wrapper
3. **Smart Glasses** – AR overlay support
4. **Face Recognition** – Identify known individuals
5. **Real-time Navigation** – GPS integration for outdoor wayfinding
6. **Multi-language TTS** – Support for multiple languages

---

## 12. Conclusion

VisionAssist is a complete offline AI-based assistive system designed for final-year demonstration. It combines cutting-edge computer vision models (YOLOv5, EfficientNet) with a modern React frontend to provide an accessible, professional solution for visually impaired users.

---

## Appendix: Distance Formula

```
Distance (m) = (Known Height (cm) × Focal Length) / Bounding Box Height (px)

Where:
- Known Height: Pre-defined average heights for common objects
- Focal Length: Calibrated value (615 px for standard webcam)
- BBox Height: Measured from YOLOv5 detection
```

### Reference Object Heights (cm)
| Object | Height |
|--------|--------|
| Person | 170 |
| Car | 150 |
| Chair | 90 |
| Dog | 60 |
| Laptop | 30 |
| Bottle | 25 |

---

*Document generated for VisionAssist v1.0*

