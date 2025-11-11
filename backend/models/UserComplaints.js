const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // who added note
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserComplaintSchema = new mongoose.Schema(
  {
    // Reporter reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Complaint category
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ComplaintType",
      required: true,
    },
    subtype: { type: String },

    description: { type: String, required: true },

    // Flexible structured address
    address: {
      street: { type: String },
      landmark: { type: String },
      area: { type: String, required: true },
      city: { type: String, required: true },
      district: { type: String },
    },

    // Geo-location
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

    // Evidence media
    imageUrls: { type: [String], default: [] },

    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
    },

    // Assignment and handling
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },

    // Complaint status
    status: {
      type: String,
      enum: ["Pending", "Assigned", "In Progress", "Resolved", "Rejected","Need Verification"],
      default: "Pending",
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    // Resolution info
    resolutionDetails: {
      resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Worker" },
      resolvedAt: { type: Date },
      resolutionNotes: { type: String },
      resolutionPhotos: { type: [String], default: [] },
      resolutionLocation: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: false,
        },
      },
    },

    // 🆕 Notes submitted by users (feature added)
    notes: {
      type: [NoteSchema],
      default: [],
    },

    // Audit tracking
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

// Spatial index for geo queries
UserComplaintSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("UserComplaint", UserComplaintSchema);
