import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { 
  Eye, 
  Upload, 
  Camera, 
  Settings, 
  Info, 
  Play, 
  Volume2,
  Loader2,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import ImageUpload from './components/ImageUpload';
import CameraCapture from './components/CameraCapture';
import ResultsDisplay from './components/ResultsDisplay';
import SettingsPanel from './components/SettingsPanel';
import HowItWorks from './components/HowItWorks';

const API_BASE = 'http://localhost:8000';

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  
  // Settings
  const [confidence, setConfidence] = useState(0.4);
  const [ttsRate, setTtsRate] = useState(150);
  const [enableAudio, setEnableAudio] = useState(true);
  const [maxObjects, setMaxObjects] = useState(8);

  const analyzeImage = useCallback(async (imageFile) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('confidence', confidence);
      formData.append('tts_rate', ttsRate);
      formData.append('enable_audio', enableAudio);
      formData.append('max_objects', maxObjects);

      const response = await axios.post(`${API_BASE}/api/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setResults(response.data);
        // Play audio if enabled
        if (enableAudio && response.data.audio_summary) {
          speakText(response.data.audio_summary);
        }
      } else {
        setError(response.data.error || 'Analysis failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to server. Make sure the backend is running.');
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [confidence, ttsRate, enableAudio, maxObjects]);

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = ttsRate / 150;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleFileSelect = (file) => {
    analyzeImage(file);
  };

  const handleCameraCapture = (file) => {
    analyzeImage(file);
  };

  const clearResults = () => {
    setResults(null);
    setError(null);
  };

  return (
    <div className="app">
      {/* Animated Background */}
      <div className="bg-animation">
        <div className="bg-gradient"></div>
        <div className="bg-pattern"></div>
      </div>

      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">
              <Eye size={32} />
            </div>
            <div className="logo-text">
              <h1>VisionAssist</h1>
              <span>AI-Based Assistive Image Understanding</span>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="settings-btn"
              onClick={() => setShowSettings(!showSettings)}
              title="Settings"
            >
              <Settings size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && (
        <SettingsPanel
          confidence={confidence}
          setConfidence={setConfidence}
          ttsRate={ttsRate}
          setTtsRate={setTtsRate}
          enableAudio={enableAudio}
          setEnableAudio={setEnableAudio}
          maxObjects={maxObjects}
          setMaxObjects={setMaxObjects}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Main Content */}
      <main className="main-content">
        <div className="main-grid">
          {/* Navigation Tabs */}
          <nav className="tabs">
            <button
              className={`tab ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => { setActiveTab('upload'); clearResults(); }}
            >
              <Upload size={20} />
              <span>Upload Image</span>
            </button>
            <button
              className={`tab ${activeTab === 'camera' ? 'active' : ''}`}
              onClick={() => { setActiveTab('camera'); clearResults(); }}
            >
              <Camera size={20} />
              <span>Camera Mode</span>
            </button>
            <button
              className={`tab ${activeTab === 'howitworks' ? 'active' : ''}`}
              onClick={() => setActiveTab('howitworks')}
            >
              <Info size={20} />
              <span>How It Works</span>
            </button>
          </nav>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'upload' && (
              <ImageUpload 
                onFileSelect={handleFileSelect}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'camera' && (
              <CameraCapture
                onCapture={handleCameraCapture}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'howitworks' && (
              <HowItWorks />
            )}
          </div>
        </div>

        {/* Results Display */}
        {results && (
          <ResultsDisplay 
            results={results}
            onClose={clearResults}
            onSpeak={enableAudio ? () => speakText(results.audio_summary) : null}
          />
        )}

        {/* Error Display */}
        {error && (
          <div className="error-toast">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button onClick={() => setError(null)}>
              <X size={18} />
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-card">
              <Loader2 size={48} className="spinner" />
              <h3>Analyzing Image...</h3>
              <p>Running AI models for object detection, distance estimation, and scene recognition</p>
              <div className="loading-steps">
                <div className="step">
                  <div className="step-dot"></div>
                  <span>Detecting objects</span>
                </div>
                <div className="step">
                  <div className="step-dot"></div>
                  <span>Estimating distances</span>
                </div>
                <div className="step">
                  <div className="step-dot"></div>
                  <span>Determining directions</span>
                </div>
                <div className="step">
                  <div className="step-dot"></div>
                  <span>Recognizing scene</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>VisionAssist v1.0</p>
        <p>Running completely offline • AI-Powered</p>
      </footer>
    </div>
  );
}

export default App;

