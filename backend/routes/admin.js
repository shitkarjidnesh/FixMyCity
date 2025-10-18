const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const UserComplaints = require("../models/UserComplaints");
const auth = require("../middleware/auth");
const Admin = require("../models/Admin");
const Department = require("../models/Department.js");
const Worker = require("../models/Worker.js");

// ===================== ADMIN AUTHENTICATION =====================
// These routes are public and do not need the auth middleware.

// POST /api/admin/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await Admin.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, error: "Admin already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const admin = new Admin({ name, email, password: hashedPassword });
    await admin.save();
    res
      .status(201)
      .json({ success: true, msg: "Admin registered successfully" });
  } catch (err) {
    console.error("Admin register error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// POST /api/admin/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ success: false, error: "Admin not found" });
    }
    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "8h" } // Extended session time
    );
    res.json({
      success: true,
      token,
      role: "admin",
      name: admin.name,
      email: admin.email,
      userId: admin._id,
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ===================== ADMIN PROTECTED ROUTES =====================
// CRITICAL FIX: All routes below this line are now protected.
// They can only be accessed by a logged-in user with an "admin" role.
router.use(auth("admin"));

// GET /api/admin/complaints
router.get("/complaints", async (req, res) => {
  try {
    const complaints = await UserComplaints.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email")
      .populate("type", "name subComplaints");

    // Map the subtype index to actual sub-complaint name
    const complaintsWithSubNames = complaints.map((c) => {
      let subtypeName = "N/A";
      if (c.subtype !== undefined && c.type?.subComplaints) {
        const index = parseInt(c.subtype, 10);
        subtypeName = c.type.subComplaints[index] || "N/A";
      }
      return {
        ...c.toObject(),
        subtypeName,
      };
    });

    res.json({ success: true, data: complaintsWithSubNames });
  } catch (err) {
    console.error("❌ Server error:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch complaints" });
  }
});

// PUT /api/admin/complaints/:id - Update a complaint status
router.put("/complaints/:id", async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res
        .status(400)
        .json({ success: false, error: "Status is required" });
    }

    let complaint = await UserComplaints.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate("userId", "name email")
      .populate("type", "name subComplaints");

    if (!complaint) {
      return res
        .status(404)
        .json({ success: false, error: "Complaint not found" });
    }

    // Resolve subtype name
    let subtypeName = "N/A";
    if (complaint.subtype !== undefined && complaint.type?.subComplaints) {
      const index = parseInt(complaint.subtype, 10);
      subtypeName = complaint.type.subComplaints[index] || "N/A";
    }

    // Return complaint with resolved subtypeName
    res.json({
      success: true,
      data: { ...complaint.toObject(), subtypeName },
    });
  } catch (err) {
    console.error("❌ Server error:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to update complaint" });
  }
});

// GET /api/admin/users - Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ success: true, data: users });
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
});

// DELETE /api/admin/users/:id - Delete a user
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    await UserComplaints.deleteMany({ userId: req.params.id });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: {} });
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ success: false, error: "Failed to delete user" });
  }
});

router.post("/addWorker", async (req, res) => {
  try {
    const adminId = req.user.id; // extracted from verified JWT in authMiddleware

    const {
      name,
      email,
      phone,
      address,
      department,
      employeeId,
      username,
      password,
    } = req.body;

    // Basic validation
    if (
      !name ||
      !email ||
      !phone ||
      !address ||
      !department ||
      !employeeId ||
      !username ||
      !password
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled" });
    }

    // Check if username or email already exists
    const existing = await Worker.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Email or Username already exists" });
    }

    // Create worker with admin tracking
    const worker = new Worker({
      name,
      email,
      phone,
      address,
      department,
      employeeId,
      username,
      password,
      createdBy: adminId, // store who added the worker
    });

    await worker.save();

    res.status(201).json({ message: "Worker added successfully", worker });
  } catch (err) {
    console.error("Error adding worker:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/showWorkers", async (req, res) => {
  try {
    const workers = await Worker.find()
      .populate("createdBy", "name email") // populate admin info
      .sort({ dateAdded: -1 });

    res.status(200).json(workers);
  } catch (err) {
    console.error("Error fetching workers:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/departments", async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.status(200).json(departments);
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
