const mongoose = require("mongoose");

const UserComplaintSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  imageUrl: { type: String },
  dateTime: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UserComplaints", UserComplaintSchema);
