const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    middleName: { type: String }, // optional
    surname: { type: String, required: true },

    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },

    dob: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },

    idProof: {
      type: {
        type: String,
        enum: ["Aadhaar Card", "PAN Card", "Voter ID", "Passport", "Other"],
        required: true,
      },
      number: { type: String, required: true },
    },

    governmentEmployeeId: { type: String, required: true },

    blockOrRegion: { type: mongoose.Schema.Types.ObjectId, ref: "Block" },
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

    profilePhoto: { type: String },
    idProofImage: { type: String },

    status: {
      type: String,
      enum: ["active", "suspended", "removed"],
      default: "active",
    },

    role: {
      type: String,
      enum: ["admin", "superadmin"],
      default: "admin",
    },

    isVerified: { type: Boolean, default: false },
    verificationDate: { type: Date },

    managedDepartments: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    ],

    activityLogs: [
      { type: mongoose.Schema.Types.ObjectId, ref: "AdminActivityLog" },
    ],

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },

    lastLogin: { type: Date },
    lastPasswordChange: { type: Date },

    loginHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        ip: { type: String },
        device: { type: String },
      },
    ],
  },
  { timestamps: true }
);

// 🔒 Secure password hashing
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  this.lastPasswordChange = new Date();
  next();
});

module.exports = mongoose.model("Admin", adminSchema);
