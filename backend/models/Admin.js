const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    middleName: { type: String, required: true },
    surname: { type: String, required: true },
    name: { type: String, required: true },
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

    blockOrRegion: { type: String, required: true },
    address: {
      houseNo: { type: String }, // Optional: Flat/Plot/House number
      street: { type: String }, // Road name or locality
      landmark: { type: String }, // Optional: near temple, mall, etc.
      area: { type: String, required: true }, // e.g. Andheri East, Dadar West
      city: { type: String, required: true }, // Mumbai, Pune, Nagpur
      district: { type: String }, // Especially useful in rural areas
      state: { type: String, required: true }, // Maharashtra, Gujarat, etc.
      pincode: { type: String, required: true }, // 6-digit postal code
    },
    profilePhoto: { type: String },
    idProofImage: { type: String },
    status: {
      type: String,
      enum: ["active", "suspended", "removed"],
      default: "active",
    },
    lastLogin: { type: Date },

    role: { type: String, enum: ["admin", "superadmin"], default: "admin" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

// 🔒 Secure password hashing before saving
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("Admin", adminSchema);
