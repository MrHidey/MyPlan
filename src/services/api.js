// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'https://myplan-1.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Attach JWT token to protected requests
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Auth APIs
export const registerAdmin = (data) => api.post('/auth/register', data);
export const loginAdmin = (data) => api.post('/auth/login', data);
export const verifyAdmin = () => api.get('/auth/verify');

// Note APIs
export const getAllNotes = async () => {
  try {
    const res = await api.get('/notes');
    return res.data; 
  } catch (err) {
    console.error("Failed to fetch notes:", err);
    return [];
  }
};

  
export const getNoteById = (id) => api.get(`/notes/${id}`);
export const incrementDownload = (id) => api.put(`/notes/${id}/increment`);
export const uploadNote = (data) => api.post('/notes', data);

// Analytics APIs
export const getAdminStats = () => api.get('/auth/active-admins');

export default api;
