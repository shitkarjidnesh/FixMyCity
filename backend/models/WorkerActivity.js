const mongoose = require("mongoose");

const WorkerActivitySchema = new mongoose.Schema(
  {
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: "Worker", required: true },
    action: { type: String, required: true },
    targetType: { type: String, enum: ["Complaint"], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    details: { type: Object, default: {} },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WorkerActivity", WorkerActivitySchema);


