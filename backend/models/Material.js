const mongoose = require("mongoose");

const MaterialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  fileUrl: { type: String, required: true }
});

module.exports = mongoose.model("Material", MaterialSchema);
