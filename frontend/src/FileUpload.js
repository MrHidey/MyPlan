import React, { useState, useEffect } from "react";
import axios from "axios";

const FileUpload = () => {
  const [title, setTitle] = useState("");
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");

  // Fetch files
  const fetchFiles = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/materials");
      setFiles(res.data);
    } catch (error) {
      console.error("Fetching files failed:", error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Handle file upload
  const uploadFile = async () => {
    if (!selectedFile || !title) {
      alert("Please select a file and enter a title.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", title);

    try {
      const res = await axios.post("http://localhost:5000/api/materials/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setMessage(res.data.message);
      fetchFiles();
    } catch (error) {
      console.error("Upload Error:", error);
      setMessage("Upload failed. Please try again.");
    }
  };

  return (
    <div className="container">
      <h2>📂 Upload Materials</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      <input
        type="text"
        placeholder="Enter File Title"
        onChange={(e) => setTitle(e.target.value)}
      />
      <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} />
      <button onClick={uploadFile}>Upload</button>

      <h3>📁 Uploaded Files</h3>
      <ul>
        {files.map((file) => (
          <li key={file._id}>
            <a
              href={`http://localhost:5000/api/materials/file/${file.fileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {file.title}
            </a>{" "}
            <button onClick={() => window.open(`http://localhost:5000/api/materials/file/${file.fileUrl}`, "_blank")}>
              Download
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileUpload;
