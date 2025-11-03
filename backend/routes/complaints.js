const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");
const UserComplaints = require("../models/UserComplaints");
const userAuth = require("../middleware/userAuth");
const UserActivity = require("../models/UserActivity");
const ComplaintType = require("../models/ComplaintTypes");

router.use(userAuth);

// Multer in-memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/complaints/upload
// Corrected POST route to handle multiple photos
// POST /api/complaints
router.post("/", upload.array("photos", 5), async (req, res) => {
  console.log("🔹 [START] Complaint submission route triggered");
  try {
    console.log("📩 Raw Request Body:", req.body);
    console.log("📷 Files Received:", req.files ? req.files.length : 0);

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

    // 🔹 Validate mandatory fields
    console.log("🔍 Validating required fields...");
    if (!mainTypeId || !subTypeId || !description || !area || !city) {
      console.warn("⚠️ Missing required fields");
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields (mainTypeId, subTypeId, description, area, city)",
      });
    }

    if (!latitude || !longitude) {
      console.warn("⚠️ Missing latitude/longitude");
      return res
        .status(400)
        .json({ success: false, message: "Missing location coordinates" });
    }

    // 🔍 Find main complaint type and linked department
    console.log("🧩 Fetching ComplaintType by ID:", mainTypeId);
    const complaintType = await ComplaintType.findById(mainTypeId).populate(
      "departmentId"
    );
    console.log(
      "📦 ComplaintType Result:",
      complaintType ? "FOUND" : "NOT FOUND"
    );

    if (!complaintType) {
      console.error("❌ Complaint type not found for ID:", mainTypeId);
      return res
        .status(404)
        .json({ success: false, message: "Complaint type not found" });
    }

    // 🔹 Validate department existence
    console.log(
      "🏛️ Checking Department link:",
      complaintType.departmentId ? "FOUND" : "NOT FOUND"
    );
    if (!complaintType.departmentId) {
      console.error(
        "❌ Department missing for ComplaintType:",
        complaintType._id
      );
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    }

    // 🔹 Resolve subtype by index
    console.log("🧾 Resolving subtype using index:", subTypeId);
    let subtypeName = null;
    const index = parseInt(subTypeId);
    if (
      !isNaN(index) &&
      index >= 0 &&
      index < complaintType.subComplaints.length
    ) {
      subtypeName = complaintType.subComplaints[index];
      console.log("✅ Subtype resolved:", subtypeName);
    } else {
      console.error("❌ Invalid subTypeId index:", subTypeId);
      return res
        .status(400)
        .json({ success: false, message: "Invalid subTypeId index" });
    }

    // 📷 Upload photos to Cloudinary
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      console.log("☁️ Uploading", req.files.length, "images to Cloudinary...");
      try {
        const uploadPromises = req.files.map((file, idx) => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "fixmycity/complaints" },
              (error, result) => {
                if (error) {
                  console.error(
                    `❌ Cloudinary upload failed [${idx}]:`,
                    error.message
                  );
                  reject(error);
                } else {
                  console.log(`✅ Image [${idx}] uploaded:`, result.secure_url);
                  resolve(result.secure_url);
                }
              }
            );
            Readable.from(file.buffer).pipe(stream);
          });
        });
        imageUrls = await Promise.all(uploadPromises);
        console.log("📸 Uploaded Image URLs:", imageUrls);
      } catch (uploadErr) {
        console.error("❌ Cloudinary Upload Error:", uploadErr);
      }
    } else {
      console.log("ℹ️ No images uploaded with complaint");
    }

    // 🏙️ Create complaint document
    console.log("🧱 Creating new UserComplaint document...");
    const complaint = new UserComplaints({
      userId: req.auth?.id || "UNKNOWN_USER",
      type: mainTypeId,
      subtype: subtypeName,
      description,
      department: complaintType.departmentId._id,
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
    console.log("✅ Complaint saved successfully:", complaint._id);

    // 🧾 Optional activity log
    try {
      console.log("🧾 Logging user activity...");
      await UserActivity.create({
        userId: req.auth?.id || "UNKNOWN_USER",
        action: "CREATE_COMPLAINT",
        targetType: "Complaint",
        targetId: complaint._id,
        details: {
          mainTypeId,
          subTypeId: subtypeName,
          department: complaintType.departmentId._id,
          city,
          area,
          images: imageUrls.length,
        },
      });
      console.log("✅ UserActivity logged successfully");
    } catch (logErr) {
      console.error("❌ UserActivity log error:", logErr.message);
    }

    console.log("🎯 [END] Complaint submission flow completed");
    return res.status(201).json({
      success: true,
      message: "Complaint submitted successfully",
      data: complaint,
    });
  } catch (err) {
    console.error("💥 Complaint submission error (Unhandled):", err);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
});

// GET /api/complaints - fetch only logged-in user's complaints
router.get("/", async (req, res) => {
  try {
    const userId = req.auth?.id;
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
