const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const WorkerSchema = new mongoose.Schema(
  {
    // Basic Info
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    gender: { type: String },
    dob: { type: Date },

    // Employment Info
    employeeId: { type: String, required: true, unique: true },
    department: {
      type: String,
      required: true,
      enum: [
        "Electrician",
        "Plumber",
        "Road Maintenance",
        "Sanitation",
        "Street Light Repair",
        "Garbage Collection",
        "Drainage Maintenance",
        "Painter",
      ],
    },
    experience: { type: Number },
    availability: { type: String },

    // Login Info
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Files
    profilePhoto: { type: String },
    idProof: { type: String },

    // Admin Log
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    dateAdded: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Hash password before saving
WorkerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("Worker", WorkerSchema);
