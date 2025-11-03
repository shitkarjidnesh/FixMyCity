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

    const complaints = await UserComplaint.find({ assignedTo: workerId })
      .populate("userId", "name email phone")
      .populate("department", "name")
      .populate("assignedBy", "name email")
      .select(
        "type subtype description address location imageUrls status priority createdAt updatedAt resolutionDetails"
      )
      .lean();

    return res.status(200).json({
      success: true,
      message: "Assigned complaints fetched successfully",
      data: complaints,
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
      const { resolutionNotes } = req.body;

      const complaint = await UserComplaint.findOne({
        _id: complaintId,
        assignedTo: workerId,
      });

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: "Complaint not found or not assigned to this worker",
        });
      }

      // ───── Upload photos to Cloudinary
      let uploadedPhotos = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "fixmycity/complaint_resolutions",
          });
          uploadedPhotos.push(result.secure_url);
        }
      }

      // ───── Update resolution info
      complaint.resolutionDetails = {
        resolvedBy: workerId,
        resolvedAt: new Date(),
        resolutionNotes: resolutionNotes || "",
        resolutionPhotos: uploadedPhotos,
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

module.exports = router;
