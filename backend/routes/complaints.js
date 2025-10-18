const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");
const UserComplaints = require("../models/UserComplaints");
const auth = require("../middleware/auth");

router.use(auth());

// Multer in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/complaints/upload
// Corrected POST route to handle multiple photos
router.post("/", upload.array("photos", 5), async (req, res) => {
  try {
    const { mainTypeId, subTypeId, description, address, latitude, longitude } =
      req.body;

    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "fixmycity" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );
          Readable.from(file.buffer).pipe(stream);
        });
      });

      imageUrls = await Promise.all(uploadPromises);
    }

    const complaint = new UserComplaints({
      userId: req.user.id,
      type: mainTypeId,
      subtype: subTypeId,
      description,
      address,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      imageUrls, // store URLs directly
    });

    await complaint.save();

    res.status(201).json({
      success: true,
      data: complaint,
      message: "Complaint submitted successfully",
    });
  } catch (err) {
    console.error("Complaint submission error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});
// GET /api/complaints - fetch only logged-in user's complaints
// GET /api/admin/complaints
router.get("/", async (req, res) => {
  try {
    const complaints = await UserComplaints.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email")
      .populate("type", "name subComplaints");

    const normalizedComplaints = complaints.map((c) => {
      // Map subtype index to actual sub-complaint name
      let subtypeName = "N/A";
      if (c.subtype !== undefined && c.type?.subComplaints) {
        const index = parseInt(c.subtype, 10);
        subtypeName = c.type.subComplaints[index] || "N/A";
      }

      // Normalize images to array
      const imageUrls = c.imageUrls || (c.imageUrl ? [c.imageUrl] : []);

      return {
        _id: c._id,
        type: c.type || { name: "N/A" },
        subtypeName,
        description: c.description || "",
        address: c.address || "",
        status: c.status || "Pending",
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        userId: c.userId || { name: "N/A", email: "N/A" },
        latitude: c.latitude || null,
        longitude: c.longitude || null,
        imageUrls,
      };
    });

    res.json({ success: true, data: normalizedComplaints });
  } catch (err) {
    console.error("❌ Server error:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch complaints" });
  }
});

module.exports = router;
