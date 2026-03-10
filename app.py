import streamlit as st
from PIL import Image
import time
import pandas as pd

from modules.detector  import ObjectDetector
from modules.distance  import DistanceEstimator
from modules.scene     import SceneRecognizer
from modules.audio     import AudioFeedback
from utils.helpers     import draw_detections, resize_for_display, format_results_table

# ─────────────────────────────────────────────
#  PAGE CONFIG
# ─────────────────────────────────────────────
st.set_page_config(
    page_title = "VisionAssist",
    page_icon  = "👁️",
    layout     = "wide"
)

# ─────────────────────────────────────────────
#  CUSTOM CSS
# ─────────────────────────────────────────────
st.markdown("""
<style>
    .main-title {
        font-size: 2.8rem;
        font-weight: 800;
        color: #1E88E5;
        text-align: center;
        margin-bottom: 0;
    }
    .subtitle {
        font-size: 1.1rem;
        color: #888;
        text-align: center;
        margin-bottom: 2rem;
    }
    .result-card {
        background: #f8f9fa;
        border-left: 5px solid #1E88E5;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        margin: 0.5rem 0;
    }
    .scene-badge {
        background: #1E88E5;
        color: white;
        padding: 0.3rem 1rem;
        border-radius: 20px;
        font-size: 1rem;
        font-weight: 600;
    }
    .stButton>button {
        background-color: #1E88E5;
        color: white;
        border-radius: 8px;
        padding: 0.5rem 2rem;
        font-size: 1rem;
        font-weight: 600;
        border: none;
        width: 100%;
    }
    .stButton>button:hover {
        background-color: #1565C0;
    }
</style>
""", unsafe_allow_html=True)

# ─────────────────────────────────────────────
#  LOAD MODELS (cached so they load only once)
# ─────────────────────────────────────────────
@st.cache_resource
def load_models():
    detector  = ObjectDetector(confidence=0.4)
    estimator = DistanceEstimator()
    scene     = SceneRecognizer()
    audio     = AudioFeedback(rate=150)
    return detector, estimator, scene, audio

# ─────────────────────────────────────────────
#  HEADER
# ─────────────────────────────────────────────
st.markdown('<p class="main-title">👁️ VisionAssist</p>', unsafe_allow_html=True)
st.markdown('<p class="subtitle">AI-Based Assistive Image Understanding System</p>', unsafe_allow_html=True)
st.divider()

# ─────────────────────────────────────────────
#  SIDEBAR
# ─────────────────────────────────────────────
with st.sidebar:
    st.image("https://img.icons8.com/fluency/96/000000/visible.png", width=80)
    st.title("⚙️ Settings")

    confidence_thresh = st.slider(
        "Detection Confidence", 0.1, 0.9, 0.4, 0.05,
        help="Lower = detects more. Higher = more accurate."
    )
    tts_rate = st.slider(
        "Audio Speed (WPM)", 100, 250, 150, 10,
        help="Words per minute for audio feedback."
    )
    enable_audio = st.toggle("🔊 Enable Audio Feedback", value=True)
    max_objects  = st.slider("Max Objects to Show", 3, 15, 8)

    st.divider()
    st.markdown("**About**")
    st.caption("VisionAssist v1.0 — Final Year Project\nBy Madhan Sivakumar")

# ─────────────────────────────────────────────
#  MAIN TABS
# ─────────────────────────────────────────────
tab1, tab2, tab3 = st.tabs(["📁 Upload Image", "📷 Camera Mode", "ℹ️ How It Works"])

# ══════════════════════════════════════════════
#  TAB 1 — UPLOAD IMAGE
# ══════════════════════════════════════════════
with tab1:
    uploaded_file = st.file_uploader(
        "Upload an image to analyze",
        type=["jpg", "jpeg", "png"],
        help="Supported: JPG, JPEG, PNG"
    )

    if uploaded_file:
        image = Image.open(uploaded_file).convert("RGB")

        col1, col2 = st.columns([1, 1], gap="large")

        with col1:
            st.subheader("📷 Original Image")
            st.image(resize_for_display(image), width='stretch')

        with col2:
            st.subheader("🔍 Analysis Results")

            if st.button("▶ Run VisionAssist Analysis", key="run_upload"):
                with st.spinner("Loading AI models..."):
                    detector, estimator, scene_recognizer, audio = load_models()
                    detector.model.conf = confidence_thresh

                with st.spinner("🔍 Detecting objects..."):
                    start = time.time()
                    detections = detector.detect(image)
                    detections = detections[:max_objects]
                    detect_time = round(time.time() - start, 2)

                with st.spinner("📐 Estimating distances..."):
                    distances = [
                        estimator.estimate(d['label'], d['box'])
                        for d in detections
                    ]

                with st.spinner("🌍 Recognizing scene..."):
                    scene_label, scene_conf = scene_recognizer.recognize(
                        image, detections
                    )

                # ── Annotated Image ──
                annotated = draw_detections(image, detections, distances)
                col1.subheader("✅ Annotated Image")
                col1.image(resize_for_display(annotated), width='stretch')

                # ── Scene Badge ──
                st.markdown(
                    f'<div class="result-card">'
                    f'🌍 <b>Scene Detected:</b> '
                    f'<span class="scene-badge">{scene_label}</span>'
                    f'&nbsp;&nbsp;Confidence: {scene_conf:.0%}'
                    f'</div>',
                    unsafe_allow_html=True
                )

                # ── Stats Row ──
                m1, m2, m3 = st.columns(3)
                m1.metric("Objects Found", len(detections))
                m2.metric("Processing Time", f"{detect_time}s")
                m3.metric("Scene", scene_label)

                # ── Results Table ──
                if detections:
                    st.subheader("📋 Detected Objects")
                    rows = format_results_table(detections, distances)
                    st.dataframe(
                        pd.DataFrame(rows),
                        width='stretch',
                        hide_index=True
                    )
                else:
                    st.warning("No objects detected. Try lowering the confidence threshold.")

                # ── Audio Feedback ──
                if enable_audio:
                    audio.rate = tts_rate
                    summary = audio.build_summary(detections, distances, scene_label)
                    st.info(f"🔊 **Audio Summary:** {summary}")
                    audio.speak(summary)

# ══════════════════════════════════════════════
#  TAB 2 — CAMERA MODE
# ══════════════════════════════════════════════
with tab2:
    st.subheader("📷 Camera Mode")
    st.info("Take a photo using your webcam and analyze it instantly.")

    camera_image = st.camera_input("Take a photo")

    if camera_image:
        image = Image.open(camera_image).convert("RGB")

        if st.button("▶ Analyze Camera Image", key="run_camera"):
            with st.spinner("Loading AI models..."):
                detector, estimator, scene_recognizer, audio = load_models()
                detector.model.conf = confidence_thresh

            with st.spinner("Running full analysis..."):
                detections  = detector.detect(image)[:max_objects]
                distances   = [estimator.estimate(d['label'], d['box']) for d in detections]
                scene_label, scene_conf = scene_recognizer.recognize(image, detections)
                annotated   = draw_detections(image, detections, distances)

            col1, col2 = st.columns(2)
            col1.subheader("Original")
            col1.image(image, width='stretch')
            col2.subheader("Annotated")
            col2.image(annotated, width='stretch')

            st.success(f"🌍 Scene: **{scene_label}** ({scene_conf:.0%} confidence)")

            if detections:
                rows = format_results_table(detections, distances)
                st.dataframe(pd.DataFrame(rows), width='stretch', hide_index=True)

            if enable_audio:
                summary = audio.build_summary(detections, distances, scene_label)
                st.info(f"🔊 {summary}")
                audio.speak(summary)

# ══════════════════════════════════════════════
#  TAB 3 — HOW IT WORKS
# ══════════════════════════════════════════════
with tab3:
    st.subheader("🧠 How VisionAssist Works")

    st.markdown("""
    | Step | Module | Description |
    |------|--------|-------------|
    | 1️⃣ | **Input** | Upload image or capture via webcam |
    | 2️⃣ | **YOLOv5** | Detects objects with bounding boxes |
    | 3️⃣ | **Distance Estimator** | Calculates distance using bounding box height |
    | 4️⃣ | **EfficientNet-B0** | Recognizes the overall scene type |
    | 5️⃣ | **Audio (pyttsx3)** | Speaks a natural language summary |
    | 6️⃣ | **Display** | Shows annotated image + results table |
    """)

    st.subheader("📐 Distance Formula")
    st.latex(r"Distance = \frac{Known\ Height_{cm} \times Focal\ Length}{BBox\ Height_{px}}")

    st.subheader("🛠️ Tech Stack")
    st.markdown("""
    - **YOLOv5** — Real-time object detection  
    - **EfficientNet-B0** — Scene classification  
    - **OpenCV** — Image processing & annotation  
    - **pyttsx3** — Offline text-to-speech  
    - **Streamlit** — Web UI  
    - **PyTorch** — Deep learning backbone  
    """)