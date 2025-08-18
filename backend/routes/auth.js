const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Register
// router.post("/register", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     const existing = await User.findOne({ email });
//     if (existing) return res.status(400).json({ msg: "Email already used" });

//     const hashed = await bcrypt.hash(password, 10);

//     const user = new User({ name, email, password: hashed });
//     await user.save();

//     res.json({ msg: "User registered successfully" });
//   } catch (err) {
//     res.status(500).json({ msg: "Server error" });
//   }
// });


router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // --- Basic Validation ---
    if (!name || !email || !password) {
      return res.status(400).json({ msg: "Please fill in all the fields." });
    }

    if (name.length < 3) {
      return res.status(400).json({ msg: "Your name should have at least 3 characters." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ msg: "Please enter a valid email address." });
    }

    if (password.length < 6) {
      return res.status(400).json({ msg: "Password should be at least 6 characters long." });
    }

    // --- Check if user already exists ---
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "This email is already registered. Try logging in instead." });
    }

    // --- Hash password ---
    const hashed = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashed });
    await user.save();

    res.json({ msg: "Registration successful! You can now log in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Something went wrong on our side. Please try again later." });
  }
});


// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, "secretkey", { expiresIn: "1h" });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
