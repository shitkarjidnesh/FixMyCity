const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const WorkerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // First name
    middleName: { type: String }, // Optional middle name
    surname: { type: String, required: true }, // Last name / family name

    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    dob: { type: Date },

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

    employeeId: { type: String, required: true, unique: true },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },

    experience: { type: Number, default: 0 },
    availability: {
      type: String,
      enum: ["Available", "Busy", "On Leave"],
      default: "Available",
    },

    blockOrRegion: { type: String, required: true },
    password: { type: String, required: true },

    profilePhoto: { type: String },
    idProof: { type: String },

    status: {
      type: String,
      enum: ["active", "suspended", "removed"],
      default: "active",
    },

    lastLogin: { type: Date },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

// Password hashing middleware
WorkerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("Worker", WorkerSchema);
