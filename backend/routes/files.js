const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GridFSBucket, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const upload = multer({ storage: multer.memoryStorage() });
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

let gfs;
let downloadCollection;

mongoose.connection.once('open', () => {
  gfs = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
  downloadCollection = mongoose.connection.db.collection('fileDownloads');
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

// ⬇️ Upload files
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
        uploadStream.on('finish', async () => {
          // Init download count to 0
          await downloadCollection.insertOne({
            fileId: uploadStream.id,
            downloads: 0
          });
          resolve(uploadStream.id);
        });
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

// ⬇️ Get all files with download count
router.get('/', async (req, res) => {
  try {
    const files = await gfs.find().sort({ uploadDate: -1 }).toArray();
    const downloadData = await downloadCollection.find().toArray();

    const downloadMap = {};
    downloadData.forEach(entry => {
      downloadMap[entry.fileId.toString()] = entry.downloads;
    });

    const filesWithDownloads = files.map(file => ({
      ...file,
      downloads: downloadMap[file._id.toString()] || 0
    }));

    res.json(filesWithDownloads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ⬇️ Download a file and increment download count
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

    // Increment download count
    await downloadCollection.updateOne(
      { fileId: fileId },
      { $inc: { downloads: 1 } },
      { upsert: true }
    );

    const downloadStream = gfs.openDownloadStream(fileId);
    res.set('Content-Type', file.contentType || 'application/octet-stream');
    res.set('Content-Disposition', `attachment; filename="${file.metadata?.originalName || file.filename}"`);
    downloadStream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
