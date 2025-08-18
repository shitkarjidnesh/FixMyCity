const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String },
  imageUrl: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
});

module.exports = mongoose.model("UserComplaints", UserSchema);
