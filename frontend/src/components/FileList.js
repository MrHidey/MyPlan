import React from 'react';

const FileList = ({ files }) => {
  return (
    <div className="file-list">
      {files.map(file => (
        <div key={file._id} className="file-item">
          <div className="file-info">
            <h3>{file.metadata?.originalName || file.filename}</h3>
            <p>{new Date(file.uploadDate).toLocaleDateString()}</p>
          </div>
          <a 
            href={`http://localhost:8080/api/files/${file._id}`}
            download
            className="download-btn"
          >
            Download
          </a>
        </div>
      ))}
    </div>
  );
};

export default FileList;