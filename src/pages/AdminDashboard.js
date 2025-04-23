import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './AdminDashboard.css';
import UploadModal from '../components/UploadModal';
import DashboardCharts from '../components/DashboardCharts';
import { useNavigate } from 'react-router-dom';


const AdminDashboard = () => {
  const [notes, setNotes] = useState([]);
  const [downloads, setDownloads] = useState(0);
  const [admins, setAdmins] = useState([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const openModal = () => setIsUploadOpen(true);
  const closeModal = () => setIsUploadOpen(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);


  const token = localStorage.getItem('token');
  if (!token) {
    alert('You must be logged in to access this.');
    navigate('/login');
  }

  useEffect(() => {
    if (!token) return;
  
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE}/api/notes/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        setNotes(res.data.notes);
        setDownloads(res.data.totalDownloads);
        setAdmins(res.data.activeAdmins);
      } catch (err) {
        toast.error('Failed to load Dashboard data..');
      } finally {
        setLoading(false);
      }
    };
  
    fetchDashboardData();
  }, [token]);
  
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
  
    // Add fade-out class
    const element = document.getElementById(`note-${id}`);
    if (element) {
      element.classList.add('fade-out');
    }
  
    setTimeout(async () => {
      try {
        await axios.delete(`${process.env.REACT_APP_API_BASE}/api/notes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotes(notes.filter(n => n._id !== id));
        toast.success('Note deleted successfully');
      } catch (err) {
        toast.error('Delete failed');
      }
    }, 400);
  };
  
  if (loading) {
    return <div className="spinner">Loading dashboard...</div>;
  }  

  return (
    <div className="dashboard-container">
      <h2>Admin Dashboard</h2>

      <div className="dashboard-stats">
        <div className="stat-box">
          <h3>{notes.length}</h3>
          <p>Notes Uploaded</p>
        </div>
        <div className="stat-box">
          <h3>{downloads}</h3>
          <p>Total Downloads</p>
        </div>
        <div className="stat-box">
          <h3>{admins.length}</h3>
          <p>Active Admins</p>
        </div>
      </div>

      <div className="admin-list">
        <h4>Admins Using This Site:</h4>
        <ul>
          {admins.map((admin) => (
            <li key={admin._id}>{admin.email}</li>
          ))}
        </ul>
      </div>

      <div className="note-listdash">
        <h4>Uploaded Notes</h4>
        <button onClick={openModal} style={{
        backgroundColor: '#3f51b5',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        marginBottom: '20px',
        cursor: 'pointer'
        }}>
        + Upload Note
        </button>

        <UploadModal
        isOpen={isUploadOpen}
        onClose={closeModal}
        onSuccess={() => window.location.reload()}
        />
        {notes.map((note) => (
          <div className="note-card" key={note._id}>
            <p><strong>{note.title}</strong> ({note.subject})</p>
            <p>Downloads: {note.downloadCount}</p>
            <button
            style={{ float: 'right', background: 'crimson', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px' }}
            onClick={() => handleDelete(note._id)}
            >
            Delete
            </button>
          </div>
        ))}
      </div>
      <DashboardCharts notes={notes} />
    </div>
  );
};

export default AdminDashboard;
