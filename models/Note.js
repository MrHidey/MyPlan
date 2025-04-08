const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  subject: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadDate: { type: Date, default: Date.now },
  downloads: { type: Number, default: 0 } // Add a download counter
});

module.exports = mongoose.model('Note', noteSchema);