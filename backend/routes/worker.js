const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/uploadMiddleware");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const UserComplaints = require("../models/UserComplaints");
const WorkerActivity = require("../models/WorkerActivity");
const bcrypt = require("bcryptjs");
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

// ===================== UPDATE PROFILE =====================
// router.put("/profile", async (req, res) => {
//   try {
//     const workerId = req.user.id;
//     const {
//       name,
//       phone,
//       gender,
//       dob,
//       experience,
//       address, // structured object
//       blockOrRegion,
//     } = req.body;

//     const worker = await Worker.findById(workerId);
//     if (!worker) {
//       return res.status(404).json({ msg: "Worker not found" });
//     }

//     // ✅ Update fields
//     if (name) worker.name = name;
//     if (phone) worker.phone = phone;
//     if (gender) worker.gender = gender;
//     if (dob) worker.dob = dob;
//     if (experience) worker.experience = experience;
//     if (blockOrRegion) worker.blockOrRegion = blockOrRegion;
//     if (address && typeof address === "object") {
//       worker.address = {
//         houseNo: address.houseNo || worker.address.houseNo,
//         street: address.street || worker.address.street,
//         landmark: address.landmark || worker.address.landmark,
//         area: address.area || worker.address.area,
//         city: address.city || worker.address.city,
//         district: address.district || worker.address.district,
//         state: address.state || worker.address.state,
//         pincode: address.pincode || worker.address.pincode,
//       };
//     }

//     await worker.save();

//     res.json({
//       success: true,
//       message: "Profile updated successfully",
//       worker: worker,
//     });
//   } catch (err) {
//     console.error("Profile Update Error:", err);
//     res.status(500).json({ msg: "Server error" });
//   }
// });

router.get("/profile", workerAuth, async (req, res) => {
  try {
    console.log("📩 Worker profile requested by:", req.worker?.id);

    const worker = await Worker.findById(req.worker.id)
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



router.get("/fetchComplaints", workerAuth, async (req, res) => {
  try {
    const workerId = req.user.id;

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
  workerAuth,
  upload.array("resolutionPhotos", 5),
  async (req, res) => {
    try {
      const workerId = req.user.id;
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
// GET /api/worker/complaints - list assigned complaints
// router.get("/complaints", async (req, res) => {
//   try {
//     const workerId = req.user.id;
//     const complaints = await UserComplaints.find({ assignedTo: workerId })
//       .sort({ createdAt: -1 })
//       .populate("type", "name subComplaints");
//     res.json({ success: true, data: complaints });
//   } catch (err) {
//     console.error("❌ Fetch worker complaints error:", err);
//     res
//       .status(500)
//       .json({ success: false, error: "Failed to fetch complaints" });
//   }
// });

// // PATCH /api/worker/complaints/:id/start - mark as In Progress
// router.patch("/complaints/:id/start", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const workerId = req.user.id;

//     const complaint = await UserComplaints.findOneAndUpdate(
//       { _id: id, assignedTo: workerId },
//       {
//         status: "In Progress",
//         lastUpdatedBy: workerId,
//         lastUpdatedRole: "Worker",
//       },
//       { new: true }
//     );

//     if (!complaint) {
//       return res.status(404).json({
//         success: false,
//         error: "Complaint not found or not assigned to you",
//       });
//     }

//     await WorkerActivity.create({
//       workerId,
//       action: "START_WORK",
//       targetType: "Complaint",
//       targetId: complaint._id,
//     });

//     res.json({
//       success: true,
//       message: "Complaint marked as In Progress",
//       data: complaint,
//     });
//   } catch (err) {
//     console.error("❌ Start work error:", err);
//     res
//       .status(500)
//       .json({ success: false, error: "Failed to update complaint" });
//   }
// });

// // POST /api/worker/complaints/:id/resolve - upload resolution photos and notes
// router.post(
//   "/complaints/:id/resolve",
//   upload.array("resolutionPhotos", 5),
//   async (req, res) => {
//     try {
//       const { id } = req.params;
//       const { resolutionNotes } = req.body;
//       const workerId = req.user.id;

//       const complaint = await UserComplaints.findOne({
//         _id: id,
//         assignedTo: workerId,
//       });
//       if (!complaint) {
//         return res.status(404).json({
//           success: false,
//           error: "Complaint not found or not assigned to you",
//         });
//       }

//       let uploadedUrls = [];
//       if (req.files && req.files.length > 0) {
//         for (const file of req.files) {
//           const result = await uploadToCloudinary(
//             file.path,
//             "worker/resolutions"
//           );
//           if (result?.url) uploadedUrls.push(result.url);
//         }
//       }

//       complaint.resolutionDetails = {
//         resolvedBy: workerId,
//         resolvedAt: new Date(),
//         resolutionNotes: resolutionNotes || "",
//         resolutionPhotos: uploadedUrls,
//       };
//       complaint.status = "Resolved"; // Pending admin verification step will confirm
//       complaint.lastUpdatedBy = workerId;
//       complaint.lastUpdatedRole = "Worker";
//       await complaint.save();

//       await WorkerActivity.create({
//         workerId,
//         action: "SUBMIT_RESOLUTION",
//         targetType: "Complaint",
//         targetId: complaint._id,
//         details: { photos: uploadedUrls?.length || 0 },
//       });

//       res.json({
//         success: true,
//         message: "Resolution submitted",
//         data: complaint,
//       });
//     } catch (err) {
//       console.error("❌ Submit resolution error:", err);
//       res
//         .status(500)
//         .json({ success: false, error: "Failed to submit resolution" });
//     }
//   }
// );

module.exports = router;
