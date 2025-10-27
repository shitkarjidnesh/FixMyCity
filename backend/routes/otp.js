const express = require("express");
const router = express.Router();
const { sendOTP } = require("../otpMailer");
const { generateOTP, verifyOTP } = require("../otp/otpController");
const User = require("../models/User");

// 1. Request OTP
router.post("/request-otp", async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ success: false, message: "Email required" });

  const otp = generateOTP(email);
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
  const { email, otp, name, password, phoneNo, address } = req.body; // include phoneNo & address

  if (!email || !otp || !name || !password || !phoneNo || !address)
    return res
      .status(400)
      .json({ success: false, message: "All fields required" });

  const valid = verifyOTP(email, otp);
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
      phoneNo,
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
