const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: String,
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  downloads: {
    type: Number,
    default: 0,
  },
  filePath: String,
});

module.exports = mongoose.model('File', fileSchema);
