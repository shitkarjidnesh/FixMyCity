const express = require('express');
const multer = require('multer');
const cloudinary = require('./cloudinary');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.single('image'), (req, res) => {
  cloudinary.uploader.upload_stream(
    { resource_type: "image" },
    (error, result) => {
      if (error) return res.status(500).json({ error });
      return res.status(200).json({ imageUrl: result.secure_url });
    }
  ).end(req.file.buffer);
});

module.exports = router;
