const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GridFSBucket, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const upload = multer({ storage: multer.memoryStorage() });
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

let gfs;
mongoose.connection.once('open', () => {
  gfs = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
});

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.admin = decoded;
    next();
  });
};

router.post('/upload', verifyToken, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const uploadedFiles = await Promise.all(req.files.map(file => {
      return new Promise((resolve, reject) => {
        const uploadStream = gfs.openUploadStream(file.originalname, {
          metadata: {
            originalName: file.originalname,
            uploadedBy: req.admin.username
          }
        });
        uploadStream.end(file.buffer);
        uploadStream.on('finish', () => resolve(uploadStream.id));
        uploadStream.on('error', reject);
      });
    }));

    res.status(201).json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const files = await gfs.find().sort({ uploadDate: -1 }).toArray();
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid file ID' });
    }

    const fileId = new ObjectId(req.params.id);
    const file = await gfs.find({ _id: fileId }).next();
    
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const downloadStream = gfs.openDownloadStream(fileId);
    res.set('Content-Type', file.contentType || 'application/octet-stream');
    res.set('Content-Disposition', `attachment; filename="${file.metadata?.originalName || file.filename}"`);
    downloadStream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;