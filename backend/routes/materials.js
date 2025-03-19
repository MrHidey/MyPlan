const express = require("express");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const mongoose = require("mongoose");
const Grid = require("gridfs-stream");
const Material = require("../models/Material");

const router = express.Router();

const conn = mongoose.connection;
let gfs;
conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

// GridFS Storage
const storage = new GridFsStorage({
  url: process.env.MONGO_URI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const filename = `${Date.now()}-${file.originalname}`;
      resolve({ filename, bucketName: "uploads" });
    });
  }
});
const upload = multer({ storage });

// Upload File
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file || !req.body.title) {
      return res.status(400).json({ error: "File and title are required." });
    }

    const newMaterial = new Material({
      title: req.body.title,
      fileUrl: req.file.filename
    });

    await newMaterial.save();
    res.json({ message: "File uploaded successfully", file: newMaterial });
  } catch (error) {
    res.status(500).json({ error: "File upload failed." });
  }
});

// Get All Files
router.get("/", async (req, res) => {
  try {
    const materials = await Material.find();
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: "Fetching files failed" });
  }
});

// Retrieve File from GridFS
router.get("/file/:filename", async (req, res) => {
  try {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      if (!file || file.length === 0) {
        return res.status(404).json({ error: "File not found" });
      }

      const readStream = gfs.createReadStream(file.filename);
      res.set("Content-Type", file.contentType);
      readStream.pipe(res);
    });
  } catch (error) {
    res.status(500).json({ error: "File retrieval failed" });
  }
});

module.exports = router;
