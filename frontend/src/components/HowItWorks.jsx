import React from 'react';
import { 
  Brain, 
  Eye, 
  Ruler, 
  MapPin, 
  Volume2, 
  Monitor,
  Cpu,
  Database,
  Terminal,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Input',
      description: 'Upload an image or capture via webcam',
      icon: <Monitor size={24} />
    },
    {
      number: '2',
      title: 'YOLOv5 Detection',
      description: 'Detects objects with bounding boxes in real-time',
      icon: <Eye size={24} />
    },
    {
      number: '3',
      title: 'Distance Estimator',
      description: 'Calculates distance using bounding box height and focal length',
      icon: <Ruler size={24} />
    },
    {
      number: '4',
      title: 'EfficientNet-B0',
      description: 'Recognizes the overall scene type (Indoor, Outdoor, Nature, etc.)',
      icon: <Brain size={24} />
    },
    {
      number: '5',
      title: 'Audio Feedback',
      description: 'Speaks a natural language summary of detected objects',
      icon: <Volume2 size={24} />
    },
    {
      number: '6',
      title: 'Display',
      description: 'Shows annotated image with labels, distances, and results table',
      icon: <Monitor size={24} />
    }
  ];

  const techStack = [
    { name: 'YOLOv5', description: 'Real-time object detection', icon: <Eye size={20} /> },
    { name: 'EfficientNet-B0', description: 'Scene classification', icon: <Brain size={20} /> },
    { name: 'OpenCV', description: 'Image processing & annotation', icon: <Cpu size={20} /> },
    { name: 'PyTorch', description: 'Deep learning backbone', icon: <Database size={20} /> },
    { name: 'FastAPI', description: 'Backend API server', icon: <Terminal size={20} /> },
    { name: 'React', description: 'Modern frontend UI', icon: <Monitor size={20} /> }
  ];

  const formula = `Distance = \\frac{Known\\ Height_{cm} \\times Focal\\ Length}{BBox\\ Height_{px}}`;

  return (
    <div className="how-it-works">
      <div className="how-it-works-header">
        <Brain size={40} />
        <h2>How VisionAssist Works</h2>
        <p>Understanding the AI pipeline behind our assistive system</p>
      </div>

      {/* Pipeline Steps */}
      <div className="pipeline-section">
        <h3>Analysis Pipeline</h3>
        <div className="pipeline-steps">
          {steps.map((step, index) => (
            <div key={index} className="pipeline-step">
              <div className="step-number">{step.number}</div>
              <div className="step-icon">{step.icon}</div>
              <div className="step-content">
                <h4>{step.title}</h4>
                <p>{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="step-arrow">
                  <ArrowRight size={20} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Distance Formula */}
      <div className="formula-section">
        <h3>Distance Estimation Formula</h3>
        <div className="formula-card">
          <div className="formula">
            <span>Distance (m)</span>
            <span className="formula-divider">=</span>
            <span className="formula-numerator">
              Known Height (cm) × Focal Length
            </span>
            <span className="formula-divider">/</span>
            <span className="formula-denominator">
              Bounding Box Height (px)
            </span>
          </div>
          <p className="formula-description">
            Using the pinhole camera model, we estimate distance based on the known real-world 
            height of common objects and their apparent size in the image.
          </p>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="tech-section">
        <h3>Technology Stack</h3>
        <div className="tech-grid">
          {techStack.map((tech, index) => (
            <div key={index} className="tech-card">
              <div className="tech-icon">{tech.icon}</div>
              <div className="tech-info">
                <h4>{tech.name}</h4>
                <p>{tech.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="features-section">
        <h3>Key Features</h3>
        <div className="features-list">
          <div className="feature-item">
            <CheckCircle size={20} />
            <span>Object Detection with YOLOv5</span>
          </div>
          <div className="feature-item">
            <CheckCircle size={20} />
            <span>Distance Estimation</span>
          </div>
          <div className="feature-item">
            <CheckCircle size={20} />
            <span>Scene Recognition</span>
          </div>
          <div className="feature-item">
            <CheckCircle size={20} />
            <span>Audio Feedback (Text-to-Speech)</span>
          </div>
          <div className="feature-item">
            <CheckCircle size={20} />
            <span>Completely Offline Operation</span>
          </div>
          <div className="feature-item">
            <CheckCircle size={20} />
            <span>Professional React UI</span>
          </div>
        </div>
      </div>

      {/* Object Heights Reference */}
      <div className="reference-section">
        <h3>Known Object Heights (Reference)</h3>
        <div className="reference-grid">
          <div className="reference-item">
            <span className="ref-object">Person</span>
            <span className="ref-height">170 cm</span>
          </div>
          <div className="reference-item">
            <span className="ref-object">Car</span>
            <span className="ref-height">150 cm</span>
          </div>
          <div className="reference-item">
            <span className="ref-object">Chair</span>
            <span className="ref-height">90 cm</span>
          </div>
          <div className="reference-item">
            <span className="ref-object">Dog</span>
            <span className="ref-height">60 cm</span>
          </div>
          <div className="reference-item">
            <span className="ref-object">Bottle</span>
            <span className="ref-height">25 cm</span>
          </div>
          <div className="reference-item">
            <span className="ref-object">Laptop</span>
            <span className="ref-height">30 cm</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HowItWorks;

