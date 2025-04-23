import React from 'react';
import './NoteCard.css';
import { incrementDownload } from '../services/api';

const NoteCard = ({ note }) => {
  const getDownloadUrl = (url) => {
    const parts = url.split('/upload/');
    return parts[0] + '/upload/fl_attachment/' + parts[1];
  };

  const handleDownload = async() => {
    // Increment download count in the backend
    try{
      await incrementDownload(note._id);


    // Trigger download via Cloudinary
    const downloadUrl = getDownloadUrl(note.fileUrl);
    window.open(downloadUrl, '_blank');
  }
  catch(error){
    console.error('Download failed:', error);
  }};

  return (
    <div className="note-card">
      <h3>{note.title}</h3>
      <p>Subject: {note.subject}</p>
      <p>Downloads: {note.downloadCount}</p>

      <div className="note-buttons">
        <a href={note.fileUrl} target="_blank" rel="noopener noreferrer" className="preview-btn">
          Preview
        </a>
        <button onClick={handleDownload} className="download-btn">
          Download
        </button>
      </div>
    </div>
  );
};

export default NoteCard;
