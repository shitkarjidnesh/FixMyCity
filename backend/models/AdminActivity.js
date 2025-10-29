const mongoose = require("mongoose");

const AdminActivitySchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    action: { type: String, required: true },
    targetType: { type: String, enum: ["Complaint", "User", "Worker", "Admin", "Department"], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    details: { type: Object, default: {} },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminActivity", AdminActivitySchema);


