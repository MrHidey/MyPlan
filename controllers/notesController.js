// controllers/notesController.js
const Note = require('../models/Note');
const Admin = require('../models/Admin');
const asyncHandler = require('express-async-handler');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');

// Upload new note (admin only)
const uploadNote = async (req, res) => {
  try {
    const { title, subject, course } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload file buffer manually to Cloudinary
    const streamUpload = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'notes-app',
            resource_type: 'auto',
          },
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );
        stream.end(fileBuffer);
      });
    };

    const result = await streamUpload(req.file.buffer);

    const newNote = await Note.create({
      title,
      subject,
      course,
      fileUrl: result.secure_url,
      publicId: result.public_id,
    });

    res.status(201).json(newNote);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error during upload' });
  }
};


const getDashboardData = asyncHandler(async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    const totalDownloads = notes.reduce((acc, note) => acc + (note.downloadCount||0),0);
    const activeAdmins = await Admin.find({ isActive: true }).select('_id email');
    const downloadsBySubject = {};

    notes.forEach(note => {
      const subject = note.subject?.toUpperCase(); // normalize casing
      if (downloadsBySubject[subject]) {
        downloadsBySubject[subject] += note.downloads;
      } else {
        downloadsBySubject[subject] = note.downloads;
      }
    });
    
    const downloadsData = Object.entries(downloadsBySubject).map(([subject, count]) => ({
      subject,
      downloads: count
    }));

    res.json({
      notes,
      totalDownloads,
      activeAdmins,
      downloadsPerSubject: downloadsData
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard data' });
  }
});

// Get all notes
const getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notes' });
  }
};

// Get single note
const getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch note' });
  }
};

// Increment download count
const incrementDownload = async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ success: true, downloadCount: note.downloadCount });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update download count' });
  }
};
// Delete a note
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Delete file from Cloudinary (optional)
    if (note.publicId) {
      await cloudinary.uploader.destroy(note.publicId, { resource_type: 'raw' });
    }

    await Note.findByIdAndDelete(req.params.id)

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Server error while deleting note' });
  }
};

module.exports = {
  uploadNote,
  getAllNotes,
  getNoteById,
  incrementDownload,
  getDashboardData,
  deleteNote,
};
