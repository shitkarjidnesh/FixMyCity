const mongoose = require("mongoose");
const UserComplaintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ComplaintType",
      required: true,
    },
    subtype: {
      type: String,
    },
    description: { type: String, required: true },
    address: { type: String, required: true },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    imageUrls: { type: [String], default: [] }, // simple array for photos
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

UserComplaintSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("UserComplaints", UserComplaintSchema);
