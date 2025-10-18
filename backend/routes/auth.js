// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { verifyToken } = require("../middleware/verifyToken");
const router = express.Router();

// ===================== REGISTER =====================
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, error: "User already exists" });
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // save user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user", // default to "user"
    });

    await user.save();

    res
      .status(201)
      .json({ success: true, msg: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ===================== LOGIN =====================
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, error: "User not found" });

    // role check
    if (role && user.role !== role) {
      return res.status(400).json({ success: false, error: "Role mismatch" });
    }

    // password check
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res
        .status(400)
        .json({ success: false, error: "Invalid credentials" });

    // generate JWT
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not defined in .env");
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Inside /login route after generating JWT
    res.json({
      success: true,
      token,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,

      userId: user._id, // <-- add this
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const userId = req.user.id;

    if (!name || !email || !phone) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email, phone },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
