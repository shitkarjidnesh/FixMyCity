const mongoose = require("mongoose");

const AdminActivitySchema = new mongoose.Schema(
  {
    // 🔗 The admin who performed this action
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    // 🏷️ What action was done (create, update, suspend, delete, etc.)
    action: {
      type: String,
      required: true,
      trim: true,
    },

    // 🎯 Type of entity affected by this action
    targetType: {
      type: String,
      enum: ["Complaint", "User", "Worker", "Admin", "Department"],
      required: true,
    },

    // 🆔 The actual ID of that entity (optional)
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },

    // 📦 Extra contextual data — e.g., old/new values, reason, etc.
    details: {
      type: Object,
      default: {},
    },

    // 🧭 Info about the device/browser that triggered the action
    userAgent: {
      type: String,
    },

    // 👥 Whether the performer was a SuperAdmin or regular Admin
    performedByRole: {
      type: String,
      enum: ["superadmin", "admin"],
      required: true,
    },

    // 🗒️ Optional remarks or human-readable explanation
    remarks: {
      type: String,
      trim: true,
    },

    // ✅ Whether the action was successful (helps identify failures)
    success: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true } // ⏰ Adds createdAt & updatedAt automatically
);

module.exports = mongoose.model("AdminActivity", AdminActivitySchema);
