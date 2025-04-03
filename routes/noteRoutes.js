const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Note = require('../models/Note');
const auth = require('../middleware/auth');
const fs = require('fs');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, JPG, and PNG files are allowed'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 40 * 1024 * 1024 } // 40MB
});


// Upload Note
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    // Validate inputs
    if (!req.body.title || !req.body.subject || !req.file) {
      return res.status(400).json({ error: 'Title, subject and file are required' });
    }

    const note = new Note({
      title: req.body.title,
      description: req.body.description,
      subject: req.body.subject,
      fileUrl: req.file.path,
      uploadedBy: req.user.userId
    });

    await note.save();
    res.status(201).json(note);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Server error during upload' });
  }
});

// Get All Notes
router.get('/', async (req, res) => {
  try {
    const notes = await Note.find().populate('uploadedBy', 'email');
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});
// Unified download endpoint that both serves file and increments count
router.get('/:id/download', async (req, res) => {
  try {
    // 1. First find and update the note (increment download count)
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );
    
    if (!note || !note.fileUrl) {
      return res.status(404).json({ error: 'Note or file not found' });
    }

    // 2. Check if file exists
    const filePath = path.join(__dirname, '../', note.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    // 3. Send the file with updated download count
    res.download(filePath, () => {
      console.log(`Download counted for note ${note._id}`);
    });
    
  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
module.exports = router;