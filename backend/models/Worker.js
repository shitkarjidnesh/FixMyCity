const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const WorkerSchema = new mongoose.Schema(
  {
    // ────────────── Basic Information ──────────────
    name: { type: String, required: true },
    middleName: { type: String },
    surname: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    dob: { type: Date },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },

    // ────────────── Address ──────────────
    address: {
      houseNo: { type: String },
      street: { type: String },
      landmark: { type: String },
      area: { type: String, required: true },
      city: { type: String, required: true },
      district: { type: String },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    blockOrRegion: { type: mongoose.Schema.Types.ObjectId, ref: "Block" },
    preferredArea: { type: String }, // optional field for future use

    // ────────────── Employment Details ──────────────
    employeeId: { type: String, required: true, unique: true },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    experience: { type: Number, default: 0 },
    dateOfJoining: { type: Date, default: Date.now },
    availability: {
      type: String,
      enum: ["Available", "Busy", "On Leave"],
      default: "Available",
    },
    status: {
      type: String,
      enum: ["active", "suspended", "removed"],
      default: "active",
    },

    // ────────────── Performance Tracking ──────────────
    solveCount: { type: Number, default: 0 }, // total resolved cases
    assignedComplaints: [
      { type: mongoose.Schema.Types.ObjectId, ref: "UserComplaint" },
    ],
    completedComplaints: [
      { type: mongoose.Schema.Types.ObjectId, ref: "UserComplaint" },
    ],
    lastAssignedAt: { type: Date },
    performanceRating: { type: Number, min: 0, max: 5, default: 0 },
    remarks: { type: String },

    // ────────────── Credentials ──────────────
    password: { type: String, required: true },
    profilePhoto: { type: String },
    idProof: { type: String },
    lastLogin: { type: Date },

    // ────────────── Audit Trail ──────────────
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

// ────────────── Password Hashing ──────────────
WorkerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("Worker", WorkerSchema);
