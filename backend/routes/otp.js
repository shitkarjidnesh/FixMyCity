const express = require("express");
const router = express.Router();
const { sendOTP } = require("../otpMailer");
const {
  generateUserOTP,
  generateWorkerOTP,
  generateAdminOTP,
  verifyUserOTP,
} = require("../otp/otpController");
const User = require("../models/User");

// 1. Request OTP
router.post("/requestuser-otp", async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ success: false, message: "Email required" });

  const otp = generateUserOTP(email);
  try {
    await sendOTP(email, otp);
    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

router.post("/requestworker-otp", async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ success: false, message: "Email required" });

  const otp = generateWorkerOTP(email);
  try {
    await sendOTP(email, otp);
    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

router.post("/requestadmin-otp", async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ success: false, message: "Email required" });

  const otp = generateAdminOTP(email);
  try {
    await sendOTP(email, otp);
    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

// 2. Verify OTP and register user
router.post("/verify-otp", async (req, res) => {
  const { email, otp, name, password, phone, address } = req.body; // include phoneNo & address

  if (!email || !otp || !name || !password || !phone || !address)
    return res
      .status(400)
      .json({ success: false, message: "All fields required" });

  const valid = verifyUserOTP(email, otp);
  if (!valid)
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired OTP" });

  try {
    const existing = await User.findOne({ email });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });

    const user = new User({
      name,
      email,
      password,
      phoneNo: phone,
      address,
      role: "user",
    }); // role default
    await user.save();

    res.json({ success: true, message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
});
module.exports = router;
