// routes/auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const userAuth = require("../middleware/userAuth");
const { verifyUserOTP } = require("../otp/otpController");
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

    // save user
    const user = new User({
      name,
      email,
      password: password,
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
    if (!user) {
      return res.status(400).json({
        success: false,
        error: "User not found. Please register first.",
      });
    }

    // Role check
    if (role && user.role !== role) {
      return res.status(400).json({
        success: false,
        error: "Role mismatch. Please ensure correct login type.",
      });
    }

    // Password check
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({
        success: false,
        error: "Invalid credentials. Please check your password.",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not defined in .env");
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      userId: user._id,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      error: err.message || "Internal Server Error",
    });
  }
});

router.post("/verify-reset-otp", async (req, res) => {
  const { email, otp, password, confirmPassword } = req.body;

  if (!email || !otp || !password || !confirmPassword)
    return res
      .status(400)
      .json({ success: false, message: "All fields required" });

  if (password !== confirmPassword)
    return res
      .status(400)
      .json({ success: false, message: "Passwords do not match" });

  const valid = verifyUserOTP(email, otp);
  if (!valid)
    return res
      .status(400)
      .json({ success: false, message: "Invalid/expired OTP" });

  const user = await User.findOne({ email });
  if (!user)
    return res.status(404).json({ success: false, message: "User not found" });

  const hashed = await bcrypt.hash(password, 10);
  user.password = hashed;
  await User.updateOne({ _id: user._id }, { $set: { password: hashed } });

  return res.json({ success: true, message: "Password reset" });
});

// ===================== UPDATE PROFILE =====================

router.put("/profile", userAuth, async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const userId = req.auth.id;

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
