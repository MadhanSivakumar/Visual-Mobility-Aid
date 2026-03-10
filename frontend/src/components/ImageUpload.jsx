import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, Check } from 'lucide-react';

function ImageUpload({ onFileSelect, isLoading }) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      handleFile(selectedFile);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    if (selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = () => {
    if (file) {
      onFileSelect(file);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <div className="upload-header">
          <Upload size={32} className="upload-icon" />
          <h2>Upload Image</h2>
          <p>Drag and drop or click to select an image</p>
        </div>

        <div
          className={`dropzone ${dragActive ? 'active' : ''} ${preview ? 'has-file' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={!preview ? handleClick : undefined}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="file-input"
          />

          {!preview ? (
            <div className="dropzone-content">
              <ImageIcon size={64} className="dropzone-icon" />
              <p className="dropzone-text">
                <span className="highlight">Click to browse</span> or drag and drop
              </p>
              <p className="dropzone-hint">Supports JPG, JPEG, PNG</p>
            </div>
          ) : (
            <div className="preview-container">
              <img src={preview} alt="Preview" className="preview-image" />
              <div className="preview-overlay">
                <button className="clear-btn" onClick={handleClear}>
                  <X size={20} />
                </button>
              </div>
              <div className="file-info">
                <Check size={16} />
                <span>{file?.name}</span>
              </div>
            </div>
          )}
        </div>

        {file && !isLoading && (
          <button className="analyze-btn" onClick={handleSubmit}>
            <Upload size={20} />
            Analyze Image
          </button>
        )}
      </div>
    </div>
  );
}

export default ImageUpload;

