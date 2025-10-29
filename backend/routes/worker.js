const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/uploadMiddleware");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const UserComplaints = require("../models/UserComplaints");
const WorkerActivity = require("../models/WorkerActivity");

// All routes require worker auth
router.use(auth("worker"));

// GET /api/worker/complaints - list assigned complaints
router.get("/complaints", async (req, res) => {
  try {
    const workerId = req.user.id;
    const complaints = await UserComplaints.find({ assignedTo: workerId })
      .sort({ createdAt: -1 })
      .populate("type", "name subComplaints");
    res.json({ success: true, data: complaints });
  } catch (err) {
    console.error("❌ Fetch worker complaints error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch complaints" });
  }
});

// PATCH /api/worker/complaints/:id/start - mark as In Progress
router.patch("/complaints/:id/start", async (req, res) => {
  try {
    const { id } = req.params;
    const workerId = req.user.id;

    const complaint = await UserComplaints.findOneAndUpdate(
      { _id: id, assignedTo: workerId },
      { status: "In Progress", lastUpdatedBy: workerId, lastUpdatedRole: "Worker" },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ success: false, error: "Complaint not found or not assigned to you" });
    }

    await WorkerActivity.create({
      workerId,
      action: "START_WORK",
      targetType: "Complaint",
      targetId: complaint._id,
    });

    res.json({ success: true, message: "Complaint marked as In Progress", data: complaint });
  } catch (err) {
    console.error("❌ Start work error:", err);
    res.status(500).json({ success: false, error: "Failed to update complaint" });
  }
});

// POST /api/worker/complaints/:id/resolve - upload resolution photos and notes
router.post(
  "/complaints/:id/resolve",
  upload.array("resolutionPhotos", 5),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { resolutionNotes } = req.body;
      const workerId = req.user.id;

      const complaint = await UserComplaints.findOne({ _id: id, assignedTo: workerId });
      if (!complaint) {
        return res.status(404).json({ success: false, error: "Complaint not found or not assigned to you" });
      }

      let uploadedUrls = [];
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          const result = await uploadToCloudinary(file.path, "worker/resolutions");
          if (result?.url) uploadedUrls.push(result.url);
        }
      }

      complaint.resolutionDetails = {
        resolvedBy: workerId,
        resolvedAt: new Date(),
        resolutionNotes: resolutionNotes || "",
        resolutionPhotos: uploadedUrls,
      };
      complaint.status = "Resolved"; // Pending admin verification step will confirm
      complaint.lastUpdatedBy = workerId;
      complaint.lastUpdatedRole = "Worker";
      await complaint.save();

      await WorkerActivity.create({
        workerId,
        action: "SUBMIT_RESOLUTION",
        targetType: "Complaint",
        targetId: complaint._id,
        details: { photos: uploadedUrls?.length || 0 },
      });

      res.json({ success: true, message: "Resolution submitted", data: complaint });
    } catch (err) {
      console.error("❌ Submit resolution error:", err);
      res.status(500).json({ success: false, error: "Failed to submit resolution" });
    }
  }
);

module.exports = router;


