const mongoose = require("mongoose");

const ComplaintTypeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subComplaints: { type: [String], default: [] }, // matches your MongoDB
});

module.exports = mongoose.model("ComplaintType", ComplaintTypeSchema);
