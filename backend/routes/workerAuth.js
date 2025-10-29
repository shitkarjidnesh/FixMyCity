const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Worker = require("../models/Worker");

const router = express.Router();

// POST /api/worker/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const worker = await Worker.findOne({ email });
    if (!worker) {
      return res.status(400).json({ success: false, error: "Worker not found" });
    }
    const match = await bcrypt.compare(password, worker.password);
    if (!match) {
      return res.status(400).json({ success: false, error: "Invalid credentials" });
    }
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not defined in .env");
    }
    const token = jwt.sign({ id: worker._id, role: "worker" }, process.env.JWT_SECRET, { expiresIn: "2d" });
    res.json({
      success: true,
      token,
      role: "worker",
      name: `${worker.name} ${worker.surname}`.trim(),
      email: worker.email,
      workerId: worker._id,
      department: worker.department,
    });
  } catch (err) {
    console.error("Worker login error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;


