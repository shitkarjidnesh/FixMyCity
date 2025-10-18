// models/Admin.js
const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
});

module.exports = mongoose.model("Admin", adminSchema);
