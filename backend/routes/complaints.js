const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");
const UserComplaints = require("../models/UserComplaints");
const auth = require("../middleware/auth");

// Multer in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/complaints/upload
router.post("/upload", auth(), upload.single("image"), async (req, res) => {
  try {
    // Ensure req.user exists
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const complaintData = {
      userId: req.user.id, // <-- consistent with JWT middleware
      type: req.body.type,
      description: req.body.description,
      address: req.body.address,
      imageUrl: null,
    };

    if (req.file) {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "fixmycity" },
        async (error, result) => {
          if (error) {
            console.error("❌ Cloudinary error:", error);
            return res
              .status(500)
              .json({ success: false, error: error.message });
          }

          complaintData.imageUrl = result.secure_url;
          const complaint = new UserComplaints(complaintData);
          await complaint.save();
          return res.status(201).json({ success: true, data: complaint });
        }
      );

      Readable.from(req.file.buffer).pipe(stream);
    } else {
      const complaint = new UserComplaints(complaintData);
      await complaint.save();
      return res.status(201).json({ success: true, data: complaint });
    }
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ success: false, error: "Upload failed" });
  }
});

module.exports = router;
