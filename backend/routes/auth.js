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

// router.post("/register", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({ msg: "Please fill in all the fields." });
//     }

//     if (name.length < 3) {
//       return res
//         .status(400)
//         .json({ msg: "Your name should have at least 3 characters." });
//     }

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!emailRegex.test(email)) {
//       return res
//         .status(400)
//         .json({ msg: "Please enter a valid email address." });
//     }

//     if (password.length < 6) {
//       return res
//         .status(400)
//         .json({ msg: "Password should be at least 6 characters long." });
//     }

//     const existing = await User.findOne({ email });
//     if (existing) {
//       return res
//         .status(400)
//         .json({
//           msg: "This email is already registered. Try logging in instead.",
//         });
//     }

//     const hashed = await bcrypt.hash(password, 10);

//     const user = new User({ name, email, password: hashed });
//     await user.save();

//     return res.json({ msg: "Registration successful! You can now log in." });
//   } catch (err) {
//     console.error("Register error:", err);
//     return res
//       .status(500)
//       .json({ msg: "Server error. Please try again later." });
//   }
// });


router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check existing
    const existing = await User.findOne({ email, role: "user" });
    if (existing) {
      return res.status(400).json({ msg: "User already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashed,
      role: "user", // enforce role
    });

    await user.save();

    res.status(201).json({ msg: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});


// // Login
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ msg: "User not found" });

//     const valid = await bcrypt.compare(password, user.password);
//     if (!valid) return res.status(400).json({ msg: "Invalid credentials" });

//     const token = jwt.sign({ id: user._id }, "secretkey", { expiresIn: "1h" });

//     res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
//   } catch (err) {
//     res.status(500).json({ msg: "Server error" });
//   }
// });

router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "User not found" });

    // Role check
    if (role && user.role !== role) {
      return res.status(400).json({ msg: "Role mismatch" });
    }

    // Password check
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Invalid credentials" });

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "defaultsecret",
      { expiresIn: "1h" }
    );

    res.json({
      token,
      role: user.role,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});




module.exports = router;
