# VisionAssist - AI-Based Assistive Image Understanding System

A modern, offline AI system designed to help visually impaired individuals understand their surroundings through object detection, distance estimation, scene recognition, and audio feedback.

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool
- **Lucide React** - Icons
- **Axios** - HTTP client
- **Custom CSS** - Glassmorphism design with animations

### Backend
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **PyTorch** - Deep learning
- **YOLOv5** - Object detection (via ultralytics)
- **EfficientNet-B0** - Scene classification
- **OpenCV** - Image processing

---

## 📋 Features

- 📤 **Upload Image Mode** - Drag & drop or browse image files
- 📷 **Camera Mode** - Capture photos via webcam
- 🎯 **Object Detection** - YOLOv5 with bounding boxes
- 📏 **Distance Estimation** - Using bounding box height
- 🌍 **Scene Recognition** - Indoor, Outdoor, Kitchen, Nature
- 🔊 **Audio Feedback** - Natural language spoken summaries
- ⚙️ **Settings Panel** - Confidence, TTS speed, max objects
- 🎨 **Modern UI** - Glassmorphism design with animations

---

## 🛠️ Installation

### 1. Clone the repository
```bash
cd VisionAssist
```

### 2. Install Python dependencies
```bash
pip install -r requirements.txt
```

### 3. Install React dependencies
```bash
cd frontend
npm install
cd ..
```

---

## ▶️ Running the Application

### Option 1: Run both servers (Development)

**Terminal 1 - Start Backend:**
```bash
cd VisionAssist
python main.py
```
The API will be available at `http://localhost:8000`

**Terminal 2 - Start Frontend:**
```bash
cd VisionAssist/frontend
npm run dev
```
The React app will be available at `http://localhost:3000`

### Option 2: Production Build

**Build Frontend:**
```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`

---

## 📱 Usage

1. **Open the app** at `http://localhost:3000`
2. **Upload an image** using drag & drop or click to browse
3. **Or use Camera Mode** to capture a photo via webcam
4. **Click "Analyze"** to run AI analysis
5. **View results** - annotated image, detected objects, distances
6. **Listen to audio** summary (if enabled)
7. **Adjust settings** using the gear icon

---

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/api/health` | GET | Detailed health status |
| `/api/analyze` | POST | Analyze uploaded image |

---

## 📂 Project Structure

```
VisionAssist/
├── main.py                 # FastAPI backend
├── app.py                  # Original Streamlit app (backup)
├── requirements.txt        # Python dependencies
├── PRD.md                  # Product Requirements Document
├── TODO.md                 # Development checklist
├── README.md               # This file
├── modules/                # AI modules
│   ├── detector.py         # YOLOv5 object detection
│   ├── scene.py            # Scene recognition
│   ├── distance.py         # Distance estimation
│   └── audio.py            # Audio feedback
├── utils/                  # Utility functions
│   └── helpers.py          # Image processing helpers
├── frontend/               # React frontend
│   ├── package.json        # Node dependencies
│   ├── vite.config.js      # Vite config
│   ├── index.html          # Entry HTML
│   └── src/
│       ├── main.jsx        # React entry
│       ├── App.jsx         # Main component
│       ├── index.css       # Styles
│       └── components/     # React components
│           ├── ImageUpload.jsx
│           ├── CameraCapture.jsx
│           ├── ResultsDisplay.jsx
│           ├── SettingsPanel.jsx
│           └── HowItWorks.jsx
└── assets/
    └── sample_images/      # Sample images for testing
```

---

## 🎯 How It Works

1. **Input** - Upload image or capture via webcam
2. **YOLOv5** - Detects objects with bounding boxes
3. **Distance Estimator** - Calculates distance using bounding box height
4. **EfficientNet-B0** - Recognizes scene type (Indoor, Outdoor, etc.)
5. **Audio** - Speaks natural language summary
6. **Display** - Shows annotated image + results table

### Distance Formula
```
Distance (m) = (Known Height (cm) × Focal Length) / BBox Height (px)
```

---

## ⚠️ Requirements

- Python 3.8+
- Node.js 16+
- 4GB RAM minimum
- Webcam (for camera mode)
- Modern browser (Chrome, Firefox, Edge)

---

## 📄 License

This project is for educational purposes (Final Year Project).

---

## 👤 Author

**Madhan Sivakumar**  
Final Year Project - VisionAssist v1.0

---

## 🔮 Future Enhancements

- OCR integration for text reading
- Mobile app version
- Smart glasses integration
- Face recognition
- Real-time navigation
- Multi-language support

