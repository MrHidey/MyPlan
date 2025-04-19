import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileList from '../components/FileList';
import FileUpload from '../components/FileUpload';
import AdminLogin from '../components/AdminLogin';

const Home = () => {
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

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
    file.metadata?.originalName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="home-page">
      <header>
        <h1>MyPlan File Manager</h1>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {isAdmin ? (
            <button onClick={() => setShowUpload(true)}>Upload Files</button>
          ) : (
            <button onClick={() => setShowLogin(true)}>Admin Login</button>
          )}
        </div>
      </header>

      <FileList files={filteredFiles} />

      {showLogin && (
        <AdminLogin 
          setIsAdmin={setIsAdmin}
          onClose={() => setShowLogin(false)}
        />
      )}

      {showUpload && (
        <FileUpload
          onClose={() => setShowUpload(false)}
          onUploadSuccess={fetchFiles}
        />
      )}
    </div>
  );
};

export default Home;