const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");
const User = require("../models/UserComplaints"); // Import model
const UserComplaints = require("../models/UserComplaints");

// Multer in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No file uploaded" });
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder: "fixmycity" },
      async (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ success: false, error });
        }

        console.log("✅ Cloudinary Upload Success:", result.secure_url);

        try {
          // Save in MongoDB
         const UserComplaints = new UserComplaints({
        name: req.body.name || "Anonymous",
        email: req.body.email || "no-email@example.com",
        message: req.body.message || "",
        imageUrl: result.secure_url,
        latitude: req.body.latitude,
        longitude: req.body.longitude


          });

          await UserComplaints.save();
          console.log("✅ MongoDB Document Saved:", user._id);

          return res.status(200).json({
            success: true,
            imageUrl: result.secure_url,
            data: user,
          });
        } catch (dbErr) {
          console.error("MongoDB Save Error:", dbErr);
          return res.status(500).json({ success: false, error: dbErr.message });
        }
      }
    );

    Readable.from(req.file.buffer).pipe(stream);
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ success: false, error: "Upload failed" });
  }
});

module.exports = router;
