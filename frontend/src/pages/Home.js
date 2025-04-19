import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLogin from '../components/AdminLogin';
import FileUpload from '../components/FileUpload';

const Home = () => {
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/files');
      setFiles(res.data);
    } catch (err) {
      console.error('Error fetching files:', err);
    }
  };

  const filteredFiles = files.filter(file =>
    file.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="file-manager">
      <header>
        <h1>MyPlan</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {!isAdmin && (
            <button
              className="login-btn"
              onClick={() => setShowLogin(true)}
            >
              Admin Login
            </button>
          )}

          {isAdmin && (
            <button
              className="upload-btn"
              onClick={() => setShowUploadModal(true)}
            >
              Upload Files
            </button>
          )}
        </div>
      </header>

      <div className="file-grid">
        {filteredFiles.map(file => (
          <div key={file._id} className="file-card">
            <div className="file-info">
              <h3>{file.filename}</h3>
              <p>{new Date(file.uploadDate).toLocaleDateString()}</p>
              <p>Downloads: {file.downloads || 0}</p>
            </div>
            <a
              href={`http://localhost:8080/api/files/${file._id}`}
              className="download-btn"
            >
              Download
            </a>
          </div>
        ))}
      </div>

      {/* Admin login modal */}
      {showLogin && (
        <div className="modal-overlay">
          <AdminLogin
            onLoginSuccess={() => {
              setIsAdmin(true);
              setShowLogin(false);
            }}
          />
        </div>
      )}

      {/* File upload modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <FileUpload
            token={localStorage.getItem('adminToken')}
            onUploadSuccess={() => {
              fetchFiles();
              setShowUploadModal(false);
            }}
            onCancel={() => setShowUploadModal(false)}
          />
        </div>
      )}
    </div>
  );
};

export default Home;