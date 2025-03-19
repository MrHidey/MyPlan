require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

// File Schema
const FileSchema = new mongoose.Schema({
  filename: String,
  path: String,
});
const File = mongoose.model("File", FileSchema);

// Multer Configuration for File Uploads
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Upload File API
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const newFile = new File({
    filename: req.file.originalname,
    path: `/uploads/${req.file.filename}`,
  });

  await newFile.save();
  res.json({ message: "File uploaded successfully", file: newFile });
});

// Fetch Uploaded Files
app.get("/files", async (req, res) => {
  const files = await File.find();
  res.json(files);
});

// Server Listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
