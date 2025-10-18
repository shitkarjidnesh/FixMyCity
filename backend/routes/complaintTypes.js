const express = require("express");
const router = express.Router();
const ComplaintType = require("../models/ComplaintTypes");

// GET all complaint types
router.get("/", async (req, res) => {
  try {
    const types = await ComplaintType.find();
    const mapped = types.map((t) => ({
      id: t._id.toString(),
      name: t.name,
      subtypes: t.subComplaints.map((s, i) => ({ id: i.toString(), name: s })),
    }));
    res.json({ success: true, data: mapped });
  } catch (err) {
    console.error("Fetch complaint types error:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch complaint types" });
  }
});

// GET subtypes for a specific type
router.get("/:id/subtypes", async (req, res) => {
  try {
    const type = await ComplaintType.findById(req.params.id);
    if (!type)
      return res.status(404).json({ success: false, error: "Type not found" });

    const subtypes = type.subComplaints.map((s, i) => ({
      id: i.toString(),
      name: s,
    }));
    res.json({ success: true, data: subtypes });
  } catch (err) {
    console.error("Fetch subtypes error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch subtypes" });
  }
});

module.exports = router;
