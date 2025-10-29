const mongoose = require("mongoose");

const UserComplaintSchema = new mongoose.Schema(
  {
    // Who submitted
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Complaint type (e.g., "Road Damage", "Garbage Issue")
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ComplaintType",
      required: true,
    },

    subtype: { type: String }, // optional: "Pothole", "Open Manhole"

    description: { type: String, required: true },

    // Structured Address (helps match nearby users or complaints)
    address: {
      street: { type: String }, // Road name or locality
      landmark: { type: String }, // Optional: near temple, mall, etc.
      area: { type: String, required: true }, // e.g. Andheri East, Dadar West
      city: { type: String, required: true }, // Mumbai, Pune, Nagpur
      district: { type: String }, // Especially useful in rural areas
      state: { type: String, required: true }, // Maharashtra, Gujarat, etc.
      pincode: { type: String, required: true }, // 6-digit postal code
    },

    // Geo-location for map features
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

    // Images for complaint evidence
    imageUrls: { type: [String], default: [] },

    // Complaint handling flow
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    // Status flow tracking
    status: {
      type: String,
      enum: ["Pending", "Assigned", "In Progress", "Resolved", "Rejected"],
      default: "Pending",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    resolutionDetails: {
      resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Worker" },
      resolvedAt: { type: Date },
      resolutionNotes: { type: String },
      resolutionPhotos: { type: [String], default: [] },
    },

    // Log who updated the complaint last
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "lastUpdatedRole",
    },
    lastUpdatedRole: {
      type: String,
      enum: ["Admin", "Worker", "User"],
    },
  },
  { timestamps: true }
);

// Geo index for location queries
UserComplaintSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("UserComplaint", UserComplaintSchema);
