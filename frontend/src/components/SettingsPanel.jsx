import React from 'react';
import { X, Sliders, Volume2, Eye, Gauge } from 'lucide-react';

function SettingsPanel({
  confidence,
  setConfidence,
  ttsRate,
  setTtsRate,
  enableAudio,
  setEnableAudio,
  maxObjects,
  setMaxObjects,
  onClose
}) {
  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <div className="settings-title">
            <Sliders size={24} />
            <h2>Settings</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="settings-content">
          {/* Confidence Threshold */}
          <div className="setting-item">
            <div className="setting-header">
              <Eye size={20} />
              <label>Detection Confidence</label>
            </div>
            <div className="setting-control">
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={confidence}
                onChange={(e) => setConfidence(parseFloat(e.target.value))}
              />
              <span className="setting-value">{confidence.toFixed(2)}</span>
            </div>
            <p className="setting-hint">
              Lower = detects more objects. Higher = more accurate.
            </p>
          </div>

          {/* Max Objects */}
          <div className="setting-item">
            <div className="setting-header">
              <Gauge size={20} />
              <label>Max Objects to Show</label>
            </div>
            <div className="setting-control">
              <input
                type="range"
                min="3"
                max="15"
                step="1"
                value={maxObjects}
                onChange={(e) => setMaxObjects(parseInt(e.target.value))}
              />
              <span className="setting-value">{maxObjects}</span>
            </div>
            <p className="setting-hint">
              Maximum number of objects to display in results.
            </p>
          </div>

          {/* Audio Speed */}
          <div className="setting-item">
            <div className="setting-header">
              <Volume2 size={20} />
              <label>Audio Speed (WPM)</label>
            </div>
            <div className="setting-control">
              <input
                type="range"
                min="100"
                max="250"
                step="10"
                value={ttsRate}
                onChange={(e) => setTtsRate(parseInt(e.target.value))}
              />
              <span className="setting-value">{ttsRate}</span>
            </div>
            <p className="setting-hint">
              Words per minute for audio feedback.
            </p>
          </div>

          {/* Enable Audio Toggle */}
          <div className="setting-item toggle-item">
            <div className="setting-header">
              <Volume2 size={20} />
              <label>Enable Audio Feedback</label>
            </div>
            <div className="toggle-control">
              <button
                className={`toggle-btn ${enableAudio ? 'active' : ''}`}
                onClick={() => setEnableAudio(!enableAudio)}
              >
                <span className="toggle-slider"></span>
              </button>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <p>VisionAssist v1.0 — Final Year Project</p>
        </div>
      </div>
    </div>
  );
}

export default SettingsPanel;

