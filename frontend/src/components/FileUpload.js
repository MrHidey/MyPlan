import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = ({ onClose, onUploadSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!selectedFiles) return;
    
    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('files', selectedFiles[i]);
    }

    try {
      setIsUploading(true);
      const token = localStorage.getItem('adminToken');
      await axios.post('http://localhost:8080/api/files/upload', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      onUploadSuccess();
      onClose();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-modal">
      <h3>Upload Files</h3>
      <input
        type="file"
        multiple
        onChange={(e) => setSelectedFiles(e.target.files)}
      />
      <div className="upload-actions">
        <button onClick={onClose}>Cancel</button>
        <button 
          onClick={handleUpload}
          disabled={!selectedFiles || isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  );
};

export default FileUpload;