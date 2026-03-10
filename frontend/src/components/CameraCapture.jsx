import React, { useRef, useState, useCallback } from 'react';
import { Camera, CameraOff, RefreshCw, Play } from 'lucide-react';

function CameraCapture({ onCapture, isLoading }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please ensure camera permissions are granted.');
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const captureImage = useCallback(() => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], 'camera_capture.jpg', { type: 'image/jpeg' });
        setCapturedImage(URL.createObjectURL(blob));
        onCapture(file);
      }, 'image/jpeg', 0.9);
    }
  }, [onCapture]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
  }, []);

  const toggleCamera = useCallback(() => {
    stopCamera();
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  }, [stopCamera]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="camera-container">
      <div className="camera-card">
        <div className="camera-header">
          <Camera size={32} className="camera-icon" />
          <h2>Camera Mode</h2>
          <p>Take a photo using your webcam and analyze it instantly</p>
        </div>

        {error && (
          <div className="camera-error">
            <CameraOff size={24} />
            <p>{error}</p>
            <button onClick={startCamera}>Try Again</button>
          </div>
        )}

        {!stream && !capturedImage && !isLoading && (
          <div className="camera-start">
            <div className="camera-preview-placeholder">
              <CameraOff size={64} />
              <p>Camera is off</p>
              <button className="start-camera-btn" onClick={startCamera}>
                <Camera size={20} />
                Start Camera
              </button>
            </div>
          </div>
        )}

        {(stream || capturedImage) && (
          <div className="camera-view">
            {stream && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="camera-video"
              />
            )}
            
            {capturedImage && (
              <img src={capturedImage} alt="Captured" className="captured-image" />
            )}

            {isLoading && (
              <div className="camera-processing">
                <RefreshCw size={32} className="spinning" />
                <p>Processing image...</p>
              </div>
            )}
          </div>
        )}

        {stream && !isLoading && (
          <div className="camera-controls">
            <button className="camera-btn capture" onClick={captureImage}>
              <Camera size={24} />
              Capture
            </button>
            <button className="camera-btn toggle" onClick={toggleCamera}>
              <RefreshCw size={20} />
              Flip
            </button>
            <button className="camera-btn stop" onClick={stopCamera}>
              <CameraOff size={20} />
              Stop
            </button>
          </div>
        )}

        {capturedImage && !isLoading && (
          <div className="camera-controls">
            <button className="camera-btn retake" onClick={retakePhoto}>
              <RefreshCw size={20} />
              Retake
            </button>
          </div>
        )}

        <div className="camera-tips">
          <h4>Tips for best results:</h4>
          <ul>
            <li>Ensure good lighting</li>
            <li>Hold camera steady</li>
            <li>Frame the subject clearly</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CameraCapture;

