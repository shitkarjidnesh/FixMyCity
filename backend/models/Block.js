const mongoose = require("mongoose");

const BlockSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      set: (v) => v.trim().toLowerCase(), // canonical normalisation
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

BlockSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model("Block", BlockSchema);
