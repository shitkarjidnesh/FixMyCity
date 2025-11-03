const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
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

    // Role distinction (user or worker)
    role: { type: String, default: "user" },

    // Optional for audit/logs and consistency
    status: {
      type: String,
      enum: ["active", "suspended", "removed"],
      default: "active",
    },
    lastLogin: { type: Date },

    // Media fields (optional for profile enhancement)
    profilePhoto: { type: String },

    // Automatic timestamps (createdAt, updatedAt)
  },
  { timestamps: true }
);

// 🔒 Secure password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password during login
// userSchema.methods.comparePassword = async function (plainPassword) {
//   return bcrypt.compare(plainPassword, this.password);
// };

module.exports = mongoose.model("User", userSchema);
