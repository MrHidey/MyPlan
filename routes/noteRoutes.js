const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Note = require('../models/Note');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

// Configure secure file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniquePrefix = uuidv4();
    const sanitizedOriginal = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, `${uniquePrefix}_${sanitizedOriginal}`);
  }
});

// File filter and validation (unchanged)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!allowedTypes.includes(ext)) {
    return cb(new Error(`Unsupported file type. Allowed types: ${allowedTypes.join(', ')}`), false);
  }

  const dangerousExtensions = ['.exe', '.bat', '.sh', '.js', '.jar'];
  if (dangerousExtensions.includes(ext)) {
    return cb(new Error('Potentially dangerous file type detected'), false);
  }

  cb(null, true);
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { 
    fileSize: 40 * 1024 * 1024,
    files: 1
  }
});

// Upload endpoint (unchanged)
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const { title, subject, description } = req.body;
    
    if (!title || !subject || !req.file) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        error: 'Validation failed',
        details: {
          title: !title ? 'Title is required' : undefined,
          subject: !subject ? 'Subject is required' : undefined,
          file: !req.file ? 'File is required' : undefined
        }
      });
    }

    const note = new Note({
      title: title.trim().substring(0, 100),
      description: description ? description.trim().substring(0, 500) : undefined,
      subject: subject.trim().substring(0, 50),
      fileUrl: req.file.path,
      fileType: path.extname(req.file.originalname).toLowerCase(),
      fileSize: req.file.size,
      uploadedBy: req.user.userId,
      downloads: 0
    });

    await note.save();
    
    const noteData = note.toObject();
    delete noteData.fileUrl;
    noteData.fileId = note._id;

    res.status(201).json({
      message: 'Note uploaded successfully',
      note: noteData
    });

  } catch (err) {
    console.error('Upload error:', err);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ 
      error: 'Upload failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get all notes (unchanged)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, subject } = req.query;
    const query = {};
    
    if (subject) query.subject = new RegExp(subject, 'i');

    const notes = await Note.find(query)
      .select('-fileUrl')
      .populate('uploadedBy', 'username email -_id')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const count = await Note.countDocuments(query);

    res.json({
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      notes
    });

  } catch (error) {
    console.error('Fetch notes error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch notes',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Fixed download endpoint
router.get('/:id/download', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid note ID format' });
    }

    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloads: 1 } },
      { new: true }
    );
    
    if (!note) return res.status(404).json({ error: 'Note not found' });
    if (!note.fileUrl) return res.status(404).json({ error: 'File not found' });

    const filePath = path.resolve(path.join(__dirname, '../', note.fileUrl));
    const uploadsDir = path.resolve(path.join(__dirname, '../uploads'));

    if (!filePath.startsWith(uploadsDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File missing' });
    }

    // Get the original file extension from stored fileType
    const fileExtension = note.fileType || path.extname(note.fileUrl);
    const safeFilename = `${note.title.replace(/[^\w]/g, '_')}${fileExtension}`;

    // Set proper MIME type based on extension
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.txt': 'text/plain'
    };

    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    res.setHeader('Content-Type', mimeTypes[fileExtension.toLowerCase()] || 'application/octet-stream');

    const fileStream = fs.createReadStream(filePath);
    fileStream.on('error', (err) => {
      console.error('Stream error:', err);
      if (!res.headersSent) res.status(500).json({ error: 'File stream error' });
    });

    fileStream.pipe(res);

  } catch (err) {
    console.error('Download error:', err);
    res.status(500).json({ 
      error: 'Download failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;