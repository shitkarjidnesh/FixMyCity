const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const UserComplaints = require("../models/UserComplaints");
const WorkerActivity = require("../models/WorkerActivity");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Worker = require("../models/Worker");
const workerAuth = require("../middleware/workerAuth");
const uploadMiddleware = require("../middleware/uploadMiddleware");
const { generateWorkerOTP, verifyWorkerOTP } = require("../otp/otpController");
// ===================== LOGIN =====================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const worker = await Worker.findOne({ email });
    if (!worker) {
      return res.status(400).json({
        success: false,
        error: "Worker not found. Please contact admin for access.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 🔒 Compare password
    const match = await bcrypt.compare(password, worker.password);
    if (!match) {
      return res.status(400).json({
        success: false,
        stage: "bcrypt_compare",
        error: "Invalid credentials",
        debug: {
          enteredPassword: password,
          hashAttempt: hashedPassword,
          storedHash: worker.password,
          bcryptResult: match,
        },
      });
    }

    // 🔑 Generate JWT
    const token = jwt.sign(
      { id: worker._id, role: "worker" },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
    });
  } catch (err) {
    console.error("Worker Login Error:", err);
    res
      .status(500)
      .json({ success: false, error: err.message || "Server Error" });
  }
});

router.post("/verify-reset-otp", async (req, res) => {
  const { email, otp, password, confirmPassword } = req.body;

  if (!email || !otp || !password || !confirmPassword)
    return res
      .status(400)
      .json({ success: false, message: "All fields required" });

  if (password !== confirmPassword)
    return res
      .status(400)
      .json({ success: false, message: "Passwords do not match" });

  const valid = verifyWorkerOTP(email, otp);
  if (!valid)
    return res
      .status(400)
      .json({ success: false, message: "Invalid/expired OTP" });

  const worker = await Worker.findOne({ email });
  if (!worker)
    return res
      .status(404)
      .json({ success: false, message: "Worker not found" });

  const hashed = await bcrypt.hash(password, 10);
  worker.password = hashed;
  await worker.save();

  return res.json({ success: true, message: "Password reset" });
});
// All routes require worker auth
router.use(workerAuth);

// ===================== UPDATE PROFILE =====================

router.get("/profile", async (req, res) => {
  try {
    console.log("📩 Worker profile requested by:", req.auth?.id);

    const worker = await Worker.findById(req.auth.id)
      .populate("department", "name")
      .select("-password -__v");

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    res.json({
      success: true,
      message: "Worker profile fetched successfully",
      data: worker,
    });
  } catch (err) {
    console.error("❌ Worker Profile Fetch Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
      error: err.message,
    });
  }
});

router.get("/fetchComplaints", async (req, res) => {
  try {
    const workerId = req.auth.id;
    const { page = 1, limit = 10, status, search } = req.query;

    const filter = { assignedTo: workerId };

    if (status) {
      filter.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [
        { description: searchRegex },
        { "address.street": searchRegex },
        { "address.landmark": searchRegex },
        { "address.area": searchRegex },
        { "address.city": searchRegex },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const complaints = await UserComplaints.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("userId", "name email phone")
      .populate("department", "name")
      .populate("assignedBy", "name email")
      .select(
        "type subtype description address location imageUrls status priority createdAt updatedAt resolutionDetails"
      )
      .lean();

    const total = await UserComplaints.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: "Assigned complaints fetched successfully",
      data: complaints,
      meta: {
        totalRecords: total,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        count: complaints.length,
      },
    });
  } catch (error) {
    console.error("❌ Worker fetch complaints error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch assigned complaints",
      error: error.message,
    });
  }
});

router.get("/complaint/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await UserComplaints.findById(id)
      .populate("userId", "name email phone")
      .populate("department", "name")
      .populate("assignedBy", "name email")
      .populate("assignedTo", "name email")
      .select(
        "type subtype description address location imageUrls status priority createdAt updatedAt resolutionDetails"
      )
      .lean();

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Complaint details fetched successfully",
      data: complaint,
    });
  } catch (error) {
    console.error("❌ Worker fetch complaint details error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch complaint details",
      error: error.message,
    });
  }
});

// ───────────────────────────────────────────────
// 2️⃣ Upload Resolution Details
// ───────────────────────────────────────────────

router.post(
  "/uploadResolution/:complaintId",
  upload.array("resolutionPhotos", 5),
  async (req, res) => {
    try {
      const workerId = req.auth.id;
      const { complaintId } = req.params;
      const { resolutionNotes, latitude, longitude, timestamp } = req.body;

      const complaint = await UserComplaints.findOne({
        _id: complaintId,
        assignedTo: workerId,
      });

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: "Complaint not found or not assigned to this worker",
        });
      }

      // ───── Cloudinary Uploads (standardized)
      let uploadedPhotos = [];
      if (req.files?.length > 0) {
        for (const file of req.files) {
          const uploaded = await uploadToCloudinary(
            file.path,
            "fixmycity/complaint_resolutions"
          );
          if (uploaded?.url) uploadedPhotos.push(uploaded.url);
        }
      }

      // ───── Update resolution info with location + timestamp
      complaint.resolutionDetails = {
        resolvedBy: workerId,
        resolvedAt: timestamp ? new Date(timestamp) : new Date(),
        resolutionNotes: resolutionNotes?.trim() || "",
        resolutionPhotos: uploadedPhotos,
        location: {
          latitude: latitude ? parseFloat(latitude) : null,
          longitude: longitude ? parseFloat(longitude) : null,
        },
      };

      complaint.status = "Resolved";
      complaint.lastUpdatedBy = workerId;
      complaint.lastUpdatedRole = "Worker";

      await complaint.save();

      return res.status(200).json({
        success: true,
        message: "Resolution uploaded successfully",
        data: complaint,
      });
    } catch (error) {
      console.error("❌ Worker upload resolution error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to upload resolution",
        error: error.message,
      });
    }
  }
);

// ===================== FETCH COMPLAINTS FOR MAP VIEW =====================
// ===================== FETCH COMPLAINTS FOR MAP VIEW =====================
router.get("/complaints/map", async (req, res) => {
  try {
    const workerId = req.auth.id;
    const { status } = req.query; // 👈 optional query param

    // ✅ Build base filter
    const filter = { assignedTo: workerId };

    // ✅ Add status filter if provided (case-insensitive)
    if (status && typeof status === "string") {
      filter.status = new RegExp(`^${status}$`, "i");
    }

    // 🔍 Find assigned complaints with valid projection
    const complaints = await UserComplaints.find(filter, {
      type: 1,
      status: 1,
      location: 1,
    })
      .populate("type", "name")
      .lean();

    if (!complaints || complaints.length === 0) {
      return res.status(200).json({
        success: true,
        message:
          status && status.length
            ? `No '${status}' complaints found for this worker.`
            : "No assigned complaints found for this worker.",
        data: [],
      });
    }

    // ✅ Convert coordinates array → lat/lng
    const formatted = complaints
      .filter(
        (c) =>
          Array.isArray(c.location?.coordinates) &&
          c.location.coordinates.length === 2
      )
      .map((c) => ({
        _id: c._id,
        type: c.type,
        status: c.status,
        latitude: c.location.coordinates[1],
        longitude: c.location.coordinates[0],
      }));

    return res.status(200).json({
      success: true,
      message: "Complaints for map view fetched successfully",
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    console.error("❌ Worker map complaints fetch error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch complaints for map view",
      error: error.message,
    });
  }
});

module.exports = router;
