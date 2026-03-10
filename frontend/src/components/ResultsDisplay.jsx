import React from 'react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Eye, 
  MapPin, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Info,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Target
} from 'lucide-react';

function ResultsDisplay({ results, onClose, onSpeak }) {
  const getProximityColor = (distance) => {
    if (distance === null || distance === undefined) return '#888';
    if (distance < 1) return '#ef4444';  // Red - Very Close
    if (distance < 3) return '#f59e0b';  // Amber - Nearby
    if (distance < 6) return '#22c55e';  // Green - Moderate
    return '#3b82f6'; // Blue - Far
  };

  const getProximityLabel = (distance) => {
    if (distance === null || distance === undefined) return 'Unknown';
    if (distance < 1) return 'Very Close';
    if (distance < 3) return 'Nearby';
    if (distance < 6) return 'Moderate';
    return 'Far';
  };

  const getProximityIcon = (distance) => {
    if (distance === null || distance === undefined) return <Info size={14} />;
    if (distance < 1) return <AlertTriangle size={14} />;
    return <CheckCircle size={14} />;
  };

  const getDirectionIcon = (direction) => {
    if (!direction) return <Info size={14} />;
    
    const dir = direction.toLowerCase();
    if (dir.includes('directly ahead')) return <Target size={14} />;
    if (dir.includes('left')) return <ArrowLeft size={14} />;
    if (dir.includes('right')) return <ArrowRight size={14} />;
    if (dir.includes('top')) return <ArrowUp size={14} />;
    if (dir.includes('bottom')) return <ArrowDown size={14} />;
    return <Target size={14} />;
  };

  return (
    <div className="results-overlay">
      <div className="results-container">
        {/* Header */}
        <div className="results-header">
          <div className="results-title">
            <Eye size={24} />
            <h2>Analysis Results</h2>
          </div>
          <div className="results-actions">
            {onSpeak && (
              <button className="action-btn speak" onClick={onSpeak} title="Read aloud">
                <Volume2 size={20} />
              </button>
            )}
            <button className="action-btn close" onClick={onClose} title="Close">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="results-content">
          {/* Images Section */}
          <div className="results-images">
            <div className="image-panel">
              <h3>Original Image</h3>
              <div className="image-container">
                {results.detected_image && (
                  <img 
                    src={results.detected_image} 
                    alt="Original" 
                  />
                )}
              </div>
            </div>
            <div className="image-panel">
              <h3>Annotated Image</h3>
              <div className="image-container">
                <img 
                  src={results.annotated_image} 
                  alt="Annotated with detections" 
                />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="results-stats">
            <div className="stat-card">
              <div className="stat-icon objects">
                <Eye size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{results.stats?.objects_found || 0}</span>
                <span className="stat-label">Objects Found</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon scene">
                <MapPin size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{results.scene?.label || 'N/A'}</span>
                <span className="stat-label">Scene: {((results.scene?.confidence || 0) * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Scene Badge */}
          <div className="scene-badge-large">
            <span className="scene-label">{results.scene?.label}</span>
            <span className="scene-confidence">
              Confidence: {((results.scene?.confidence || 0) * 100).toFixed(0)}%
            </span>
          </div>

          {/* Detections Table */}
          <div className="detections-section">
            <h3>Detected Objects</h3>
            {results.detections && results.detections.length > 0 ? (
              <div className="detections-table">
                <div className="table-header">
                  <span>Object</span>
                  <span>Confidence</span>
                  <span>Distance</span>
                  <span>Direction</span>
                  <span>Status</span>
                </div>
                <div className="table-body">
                  {results.detections.map((detection, index) => (
                    <div key={index} className="table-row">
                      <span className="object-name">
                        <span 
                          className="object-dot" 
                          style={{ backgroundColor: getProximityColor(detection.distance) }}
                        />
                        {detection.label}
                      </span>
                      <span className="confidence">
                        {(detection.confidence * 100).toFixed(0)}%
                      </span>
                      <span className="distance">
                        {detection.distance ? `${detection.distance}m` : 'N/A'}
                      </span>
                      <span className="direction">
                        <span className="direction-icon">
                          {getDirectionIcon(detection.direction)}
                        </span>
                        {detection.direction || 'Unknown'}
                      </span>
                      <span 
                        className="status"
                        style={{ color: getProximityColor(detection.distance) }}
                      >
                        {getProximityIcon(detection.distance)}
                        {getProximityLabel(detection.distance)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="no-detections">
                <AlertTriangle size={32} />
                <p>No objects detected. Try lowering the confidence threshold in settings.</p>
              </div>
            )}
          </div>

          {/* Audio Summary */}
          {results.audio_summary && (
            <div className="audio-summary">
              <Volume2 size={20} />
              <div className="summary-content">
                <h4>Audio Summary</h4>
                <p>{results.audio_summary}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResultsDisplay;

