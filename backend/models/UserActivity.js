const mongoose = require("mongoose");

const UserActivitySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    targetType: { type: String, enum: ["Complaint", "Profile"], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    details: { type: Object, default: {} },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserActivity", UserActivitySchema);


