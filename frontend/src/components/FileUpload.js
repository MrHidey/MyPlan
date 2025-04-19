import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = ({ token, onUploadSuccess, onCancel }) => {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
    setError('');
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      return setError('Please select at least one file to upload.');
    }

    const formData = new FormData();
    Array.from(selectedFiles).forEach((file) => {
      formData.append('files', file);
    });

    try {
      setUploading(true);
      const res = await axios.post('http://localhost:8080/api/files/upload', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploading(false);
      onUploadSuccess(res.data.files);
      setSelectedFiles(null);
    } catch (err) {
      console.error(err);
      setUploading(false);
      setError(err.response?.data?.error || 'Upload failed. Try again.');
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Files</h2>

      <input
        type="file"
        multiple
        onChange={handleFileChange}
      />

      {error && <p className="error-msg">{error}</p>}

      <div className="btn-group">
        <button className="cancel-btn" onClick={onCancel}>Cancel</button>
        <button
          className="upload-btn"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
