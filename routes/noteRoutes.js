// routes/noteRoutes.js
const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const {
  uploadNote,
  getAllNotes,
  getNoteById,
  incrementDownload,
  getDashboardData,
  deleteNote
} = require('../controllers/notesController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
// Public routes
router.get('/', getAllNotes);
router.get('/dashboard', protect, getDashboardData);
router.get('/:id', getNoteById);
router.put('/:id/increment', incrementDownload);
router.delete('/:id', protect, deleteNote);


// Protected route (admin only)
router.post('/', protect, upload.single('file'), uploadNote);

module.exports = router;
