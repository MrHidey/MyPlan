import React, { useState } from 'react';
import axios from 'axios';
import './UploadModal.css';
import { toast } from 'react-toastify';

const UploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [course, setCourse] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = async () => {
    if (!title || !subject || !file) {
      toast.error('All fields are required!');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('subject', subject);
    formData.append('course', course);
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE}/notes`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded*100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      });

      onSuccess();
      toast.success('Note uploaded successfully!');
      onClose();
      setUploadProgress(0);
    } catch (err) {
      toast.error('Something went wrong!');
      setUploadProgress(0);
    }
    setUploading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="upload-modal-overlay">
      <div className="upload-modal">
        <h3>Upload New Note</h3>
        <input
          type="text"
          placeholder="Note Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <input
          type="text"
          placeholder="Course"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
        />
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />

        {uploading && (
          <div className="progress-bar">
            <div className="progress" style={{ width: `${uploadProgress}%` }}></div>
            <span>{uploadProgress}%</span>
          </div>
        )}

        <div className="modal-actions">
          <button onClick={handleUpload} disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
          <button className="cancel-btn" onClick={() => {
            onClose();
            setUploadProgress(0);
          }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
