const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");
const UserComplaints = require("../models/UserComplaints");
const auth = require("../middleware/auth");
const UserActivity = require("../models/UserActivity");

router.use(auth());

// Multer in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/complaints/upload
// Corrected POST route to handle multiple photos
router.post("/", upload.array("photos", 5), async (req, res) => {
  try {
    const {
      mainTypeId,
      subTypeId,
      description,
      street,
      area,
      city,
      landmark,
      pincode,
      latitude,
      longitude,
    } = req.body;

    // 🧾 Basic validation
    if (!mainTypeId || !subTypeId || !description || !area || !city)
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });

    // 🔍 Coordinate validation
    if (!latitude || !longitude)
      return res
        .status(400)
        .json({ success: false, message: "Missing location coordinates" });

    // 📷 Upload to Cloudinary
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "fixmycity/complaints" },
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

    // 🏙️ Create complaint with structured address
    const complaint = new UserComplaints({
      userId: req.user.id,
      type: mainTypeId,
      subtype: subTypeId,
      description,
      address: {
        street: street || "",
        area,
        city,
        landmark: landmark || "",
        pincode: pincode || "",
      },
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      imageUrls,
    });

    await complaint.save();

    // 🧾 Log user activity
    try {
      await UserActivity.create({
        userId: req.user.id,
        action: "CREATE_COMPLAINT",
        targetType: "Complaint",
        targetId: complaint._id,
        details: {
          mainTypeId,
          subTypeId,
          city,
          area,
          images: imageUrls.length,
        },
      });
    } catch (logErr) {
      console.error("UserActivity log error:", logErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      data: complaint,
    });
  } catch (err) {
    console.error("Complaint submission error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// GET /api/complaints - fetch only logged-in user's complaints
router.get("/", async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const complaints = await UserComplaints.find({ userId })
      .sort({ createdAt: -1 })
      .populate("type", "name subComplaints");

    const normalizedComplaints = complaints.map((c) => {
      let subtypeName = "N/A";
      if (c.subtype !== undefined && c.type?.subComplaints) {
        const index = parseInt(c.subtype, 10);
        subtypeName = c.type.subComplaints[index] || "N/A";
      }

      const imageUrls = c.imageUrls || (c.imageUrl ? [c.imageUrl] : []);

      let latitude = null;
      let longitude = null;
      if (c.location && Array.isArray(c.location.coordinates)) {
        longitude = c.location.coordinates[0];
        latitude = c.location.coordinates[1];
      }

      return {
        _id: c._id,
        type: c.type || { name: "N/A" },
        subtypeName,
        description: c.description || "",
        address: c.address || "",
        status: c.status || "Pending",
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        userId: c.userId,
        latitude,
        longitude,
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
