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
const adminAuth = require("../middleware/adminAuth.js");
const upload = require("../middleware/uploadMiddleware");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const AdminActivity = require("../models/AdminActivity");
const logAdminActivity = require("../utils/logAdminActivity");
const ComplaintType = require("../models/ComplaintTypes");

// ===================== ADMIN AUTHENTICATION =====================
// These routes are public and do not need the auth middleware.

// POST /api/admin/register
router.post(
  "/register",
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "idProofImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        name,
        middleName,
        surname,
        email,
        phone,
        password,
        dob,
        gender,
        idProofType,
        idProofNumber,
        governmentEmployeeId,
        blockOrRegion,
        address,
        role,
        createdBy,
      } = req.body;

      // Validate fields
      if (
        !name ||
        !middleName ||
        !surname ||
        !email ||
        !phone ||
        !password ||
        !dob ||
        !gender ||
        !idProofType ||
        !idProofNumber ||
        !governmentEmployeeId ||
        !blockOrRegion
      ) {
        return res
          .status(400)
          .json({ success: false, error: "Missing required fields" });
      }

      // Check duplicate
      const existing = await Admin.findOne({ email });
      if (existing) {
        return res
          .status(400)
          .json({ success: false, error: "Admin already exists" });
      }

      // Upload images
      let profilePhotoUrl = null;
      let idProofImageUrl = null;

      if (req.files?.profilePhoto) {
        const uploadResult = await uploadToCloudinary(
          req.files.profilePhoto[0].path,
          "admin/profile_photos"
        );
        profilePhotoUrl = uploadResult.url;
      }

      if (req.files?.idProofImage) {
        const uploadResult = await uploadToCloudinary(
          req.files.idProofImage[0].path,
          "admin/id_proofs"
        );
        idProofImageUrl = uploadResult.url;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Save new admin
      const admin = new Admin({
        name,
        middleName,
        surname,
        email,
        phone,
        password: hashedPassword,
        dob,
        gender,
        idProof: {
          type: idProofType,
          number: idProofNumber,
        },
        governmentEmployeeId,
        blockOrRegion,
        address,
        profilePhoto: profilePhotoUrl,
        idProofImage: idProofImageUrl,
        role: role || "admin",
        createdBy: createdBy || null,
      });

      await admin.save();

      // Log activity if performed by superadmin
      if (req.admin && req.admin.role === "superadmin") {
        await logAdminActivity({
          req,
          action: "CREATE_ADMIN",
          targetType: "Admin",
          targetId: admin._id,
          remarks: `Registered new ${admin.role}`,
          success: true,
          details: { email: admin.email, role: admin.role },
        });
      }

      res.status(201).json({
        success: true,
        message: "Admin registered successfully",
        adminId: admin._id,
      });
    } catch (error) {
      console.error("❌ Admin Register Error:", error);

      // Log failed registration
      if (req.admin && req.admin.role === "superadmin") {
        await logAdminActivity({
          req,
          action: "CREATE_ADMIN",
          targetType: "Admin",
          remarks: "Admin registration failed",
          success: false,
          details: { error: error.message },
        });
      }

      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// POST /api/admin/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", email);

    // ✅ Basic input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        stage: "validation",
        error: "Email and password are required",
      });
    }

    // ✅ Check admin existence
    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log("❌ Admin not found");
      return res.status(400).json({
        success: false,
        stage: "findOne",
        error: "Admin not found",
        receivedEmail: email,
      });
    }

    // ✅ Password check with detailed diagnostics
    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      console.log("❌ Invalid password for:", email);
      return res.status(400).json({
        success: false,
        stage: "bcrypt_compare",
        error: "Invalid credentials",
        debug: {
          enteredPassword: password,
          storedHash: admin.password,
          bcryptResult: match,
        },
      });
    }

    // ✅ Successful login
    console.log("✅ Login successful:", email);
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    // ✅ Update last login safely
    await Admin.findByIdAndUpdate(admin._id, { lastLogin: new Date() });

    // ✅ Log activity
    await AdminActivity.create({
      adminId: admin._id,
      action: "Admin Login",
      targetType: "Admin",
      targetId: admin._id,
      details: { email },
      performedByRole: admin.role,
      success: true,
      remarks: "Admin logged in successfully",
    });

    res.status(200).json({
      success: true,
      token,
      role: admin.role,
      name: admin.name,
      email: admin.email,
      userId: admin._id,
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({
      success: false,
      stage: "exception",
      error: "Server error",
      message: err.message,
      stack: err.stack,
    });
  }
});

// ===================== ADMIN PROTECTED ROUTES =====================
// CRITICAL FIX: All routes below this line are now protected.
// They can only be accessed by a logged-in user with an "admin" role.
router.use(auth("admin"));

router.get("/showadmins", adminAuth, async (req, res) => {
  try {
    const {
      role,
      blockOrRegion,
      status,
      gender,
      search,
      page = 1,
      limit = 10,
      sort = "createdAt:desc",
    } = req.query;

    const loggedInAdmin = req.admin;
    const filter = {};

    // ✅ ROLE RESTRICTION (admin can see only same region)
    if (loggedInAdmin.role === "admin") {
      filter.blockOrRegion = loggedInAdmin.blockOrRegion;
    } else if (blockOrRegion) {
      filter.blockOrRegion = blockOrRegion;
    }

    // ✅ Apply filters
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (gender) filter.gender = gender;

    // ✅ Search by name/surname/email/phone/id/city/area
    if (search && search.trim() !== "") {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { name: regex },
        { middleName: regex },
        { surname: regex },
        { email: regex },
        { phone: regex },
        { governmentEmployeeId: regex },
        { "address.city": regex },
        { "address.area": regex },
      ];
    }

    // ✅ Pagination + Sorting
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [sortField, sortOrder] = sort.split(":");
    const sortQuery = {
      [sortField || "createdAt"]: sortOrder === "asc" ? 1 : -1,
    };

    // ✅ Fetch records
    const admins = await Admin.find(filter)
      .select(
        "-password -idProof.number" // Hide sensitive fields
      )
      .sort(sortQuery)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Admin.countDocuments(filter);

    // ✅ Response
    res.status(200).json({
      success: true,
      message: "Admins fetched successfully",
      meta: {
        totalRecords: total,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit) || 0,
        count: admins.length,
      },
      admins,
    });
  } catch (error) {
    console.error("❌ /showadmins Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/getadmin/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin ID",
      });
    }

    // Fetch full details
    const admin = await Admin.findById(id)
      .select("-password") // exclude hashed password
      // show department info
      .lean();

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Admin details fetched successfully",
      admin,
    });
  } catch (error) {
    console.error("❌ /getadmin/:id error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

router.patch("/showadmins/updatestatus/:id", adminAuth, async (req, res) => {
  try {
    const loggedInAdmin = req.admin;
    const { id } = req.params;
    const { status } = req.body;

    if (loggedInAdmin.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only SuperAdmin can update admin status.",
      });
    }

    const allowedStatuses = ["active", "inactive", "suspended"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value.",
      });
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(
      id,
      { status, updatedBy: loggedInAdmin._id },
      { new: true }
    ).select("-password");

    if (!updatedAdmin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    await logAdminActivity({
      req,
      action: "UPDATE_ADMIN_STATUS",
      targetType: "Admin",
      targetId: updatedAdmin._id,
      remarks: `Updated admin status to ${status}`,
      success: true,
      details: { status },
    });

    res.status(200).json({
      success: true,
      message: "Admin status updated successfully.",
      admin: updatedAdmin,
    });
  } catch (error) {
    console.error("Update Admin Status Error:", error);

    await logAdminActivity({
      req,
      action: "UPDATE_ADMIN_STATUS",
      targetType: "Admin",
      remarks: "Failed to update admin status",
      success: false,
      details: { error: error.message },
    });

    res.status(500).json({ success: false, error: error.message });
  }
});

router.put("/showadmins/editadmin/:id", adminAuth, async (req, res) => {
  try {
    const loggedInAdmin = req.admin;
    const { id } = req.params;

    if (loggedInAdmin.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only SuperAdmin can edit admin details.",
      });
    }

    const {
      name,
      middleName,
      surname,
      email,
      phone,
      blockOrRegion,
      gender,
      role,
      idProofType,
      idProofNumber,
      address,
    } = req.body;

    const updateFields = {
      name,
      middleName,
      surname,
      email,
      phone,
      blockOrRegion,
      gender,
      role,
      updatedBy: loggedInAdmin._id,
    };

    if (address) {
      updateFields.address = address;
    }

    if (idProofType || idProofNumber) {
      updateFields.idProof = {
        type: idProofType,
        number: idProofNumber,
      };
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedAdmin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    await logAdminActivity({
      req,
      action: "UPDATE_ADMIN_DETAILS",
      targetType: "Admin",
      targetId: updatedAdmin._id,
      remarks: `Updated admin details for ${updatedAdmin.email}`,
      success: true,
      details: { email: updatedAdmin.email },
    });

    res.status(200).json({
      success: true,
      message: "Admin details updated successfully.",
      admin: updatedAdmin,
    });
  } catch (error) {
    console.error("Edit Admin Error:", error);

    await logAdminActivity({
      req,
      action: "UPDATE_ADMIN_DETAILS",
      targetType: "Admin",
      remarks: "Failed to update admin details",
      success: false,
      details: { error: error.message },
    });

    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete("/showadmins/delete/:id", adminAuth, async (req, res) => {
  try {
    const loggedInAdmin = req.admin;
    const { id } = req.params;

    if (loggedInAdmin.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only SuperAdmin can delete admins.",
      });
    }

    const deletedAdmin = await Admin.findByIdAndDelete(id);
    if (!deletedAdmin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    await logAdminActivity({
      req,
      action: "DELETE_ADMIN",
      targetType: "Admin",
      remarks: `Deleted admin ${deletedAdmin.email}`,
      success: true,
      details: { email: deletedAdmin.email, role: deletedAdmin.role },
    });

    res.status(200).json({
      success: true,
      message: "Admin deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Admin Error:", error);

    await logAdminActivity({
      req,
      action: "DELETE_ADMIN",
      targetType: "Admin",
      remarks: "Failed to delete admin",
      success: false,
      details: { error: error.message },
    });

    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/profile", adminAuth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select("-password");
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }
    res.json({ success: true, admin });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ===================== ADMIN COMPLAINT MANAGEMENT =====================

// ✅ Fetch all complaints (Admin view)
router.get("/complaints", adminAuth, async (req, res) => {
  try {
    const complaints = await UserComplaints.find()
      .sort({ createdAt: -1 })
      .populate("userId", "name email phone")
      .populate({
        path: "assignedTo",
        select:
          "name surname email phone department blockOrRegion profilePhoto experience status",
        populate: { path: "department", select: "name" },
      })
      .populate("assignedBy", "name surname email phone blockOrRegion")
      .populate("department", "name")
      .populate("type", "name")
      .select("-__v");

    const formattedComplaints = complaints.map((c) => {
      const worker = c.assignedTo;
      const admin = c.assignedBy;
      const dept = c.department;

      return {
        ...c.toObject(),

        // Display-friendly values
        subtypeName: c.subtype || "N/A",
        departmentName: dept?.name || "N/A",

        assignedToName: worker
          ? `${worker.name} ${worker.surname}`
          : "Unassigned",
        assignedByName: admin
          ? `${admin.name} ${admin.surname}`
          : "Not Assigned",

        // Worker extra details for frontend
        assignedToDetails: worker
          ? {
              name: `${worker.name} ${worker.surname}`,
              email: worker.email,
              phone: worker.phone,
              experience: worker.experience,
              department: worker.department?.name || "N/A", // ✅ now shows readable name
              blockOrRegion: worker.blockOrRegion || "N/A",
              profilePhoto: worker.profilePhoto || null,
            }
          : null,

        // Admin extra details for frontend
        assignedByDetails: admin
          ? {
              name: `${admin.name} ${admin.surname}`,
              email: admin.email,
              phone: admin.phone,
              blockOrRegion: admin.blockOrRegion || "N/A",
            }
          : null,
      };
    });

    res.status(200).json({
      success: true,
      total: formattedComplaints.length,
      data: formattedComplaints,
    });
  } catch (error) {
    console.error("❌ Error fetching complaints:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch complaints",
    });
  }
});

// POST /api/admin/complaints/:id/assign - Assign a complaint to a worker

// POST /api/admin/complaints/:id/verify - Approve or reject a resolved complaint
router.post("/complaints/:id/verify", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { approve, notes } = req.body;

    const complaint = await UserComplaints.findById(id).populate(
      "type",
      "name subComplaints"
    );
    if (!complaint) {
      return res
        .status(404)
        .json({ success: false, error: "Complaint not found" });
    }

    if (approve === true || approve === "true") {
      complaint.status = "Resolved";
    } else {
      complaint.status = "Rejected";
    }
    complaint.lastUpdatedBy = req.admin._id;
    complaint.lastUpdatedRole = "Admin";
    await complaint.save();

    await logAdminActivity({
      req,
      action: approve ? "APPROVE_RESOLUTION" : "REJECT_RESOLUTION",
      targetType: "Complaint",
      targetId: complaint._id,
      remarks: approve ? "Approved resolution" : "Rejected resolution",
      success: true,
      details: { notes },
    });

    res.json({
      success: true,
      message: approve ? "Resolution approved" : "Resolution rejected",
      data: complaint,
    });
  } catch (err) {
    console.error("❌ Verify resolution error:", err);

    await logAdminActivity({
      req,
      action: "VERIFY_RESOLUTION",
      targetType: "Complaint",
      remarks: "Failed to verify resolution",
      success: false,
      details: { error: err.message },
    });

    res
      .status(500)
      .json({ success: false, error: "Failed to verify resolution" });
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

    // Log admin status update
    await logAdminActivity({
      req,
      action: "UPDATE_COMPLAINT_STATUS",
      targetType: "Complaint",
      targetId: complaint._id,
      remarks: `Updated complaint status to ${status}`,
      success: true,
      details: { status },
    });

    // Return complaint with resolved subtypeName
    res.json({
      success: true,
      data: { ...complaint.toObject(), subtypeName },
    });
  } catch (err) {
    console.error("❌ Server error:", err);

    await logAdminActivity({
      req,
      action: "UPDATE_COMPLAINT_STATUS",
      targetType: "Complaint",
      remarks: "Failed to update complaint status",
      success: false,
      details: { error: err.message },
    });

    res
      .status(500)
      .json({ success: false, error: "Failed to update complaint" });
  }
});

///complaint assignment route

router.get("/eligible/:complaintId", adminAuth, async (req, res) => {
  try {
    console.log(
      "🔍 Eligible worker lookup for complaint:",
      req.params.complaintId
    );

    // Step 1 — Fetch complaint with department and address
    const complaint = await UserComplaints.findById(req.params.complaintId)
      .populate("department", "name")
      .select("department address");

    if (!complaint) {
      console.log("❌ Complaint not found");
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });
    }

    if (!complaint.department) {
      console.log("❌ Department missing in complaint");
      return res.status(404).json({
        success: false,
        message: "Department not linked to complaint",
      });
    }

    const { city } = complaint.address || {};
    console.log("📍 Complaint context →", {
      deptId: complaint.department._id.toString(),
      deptName: complaint.department.name,
      city,
    });

    // Step 2 — Diagnostic counters
    const total = await Worker.countDocuments();
    const deptMatch = await Worker.countDocuments({
      department: complaint.department._id,
    });
    const regionMatch = await Worker.countDocuments({ blockOrRegion: city });
    const activeMatch = await Worker.countDocuments({ status: "active" });
    const deptRegionMatch = await Worker.countDocuments({
      department: complaint.department._id,
      blockOrRegion: city,
    });

    console.log("📊 Diagnostic counts →", {
      totalWorkers: total,
      departmentMatched: deptMatch,
      regionMatched: regionMatch,
      activeWorkers: activeMatch,
      deptRegionMatched: deptRegionMatch,
    });

    // Step 3 — Primary filter
    const query = {
      department: complaint.department._id,
      status: "active",
      blockOrRegion: { $regex: new RegExp(`^${city}$`, "i") },
    };

    console.log("🧩 Final query →", JSON.stringify(query, null, 2));

    const eligibleWorkers = await Worker.find(query).select(
      "name surname phone department blockOrRegion experience availability status"
    );

    console.log(`✅ Eligible workers found: ${eligibleWorkers.length}`);

    if (eligibleWorkers.length === 0) {
      console.log("⚠️ No eligible workers — cause →", {
        noDepartmentMatch: deptMatch === 0,
        noRegionMatch: regionMatch === 0,
        noActiveWorkers: activeMatch === 0,
      });
    }

    // Step 4 — Response
    return res.status(200).json({
      success: true,
      total: eligibleWorkers.length,
      eligibleWorkers,
      diagnostics: {
        total,
        deptMatch,
        regionMatch,
        activeMatch,
        deptRegionMatch,
      },
      filterCriteria: {
        department: complaint.department.name,
        matchedRegionOrBlock: city,
      },
    });
  } catch (err) {
    console.error("❌ Eligible worker lookup error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/complaints/assign/:complaintId", adminAuth, async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { workerId } = req.body;
    const adminId = req.admin.id;

    // 1️⃣ Validate worker existence
    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    // 2️⃣ Validate complaint existence
    const complaint = await UserComplaints.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // 3️⃣ Update complaint with assignment
    complaint.assignedTo = workerId;
    complaint.assignedBy = adminId;
    complaint.status = "In Progress";
    complaint.lastUpdatedBy = adminId;
    complaint.lastUpdatedRole = "Admin";
    await complaint.save();

    // 4️⃣ Optionally update worker availability
    await Worker.findByIdAndUpdate(workerId, { availability: "Busy" });

    await logAdminActivity({
      req,
      action: "ASSIGN_COMPLAINT_TO_WORKER",
      targetType: "Complaint",
      targetId: complaint._id,
      remarks: `Assigned complaint to worker`,
      success: true,
      details: { workerId, complaintId },
    });

    // 5️⃣ Success response
    res.status(200).json({
      message: "Worker assigned successfully",
      complaint,
    });
  } catch (error) {
    console.error("❌ Error assigning worker:", error);

    await logAdminActivity({
      req,
      action: "ASSIGN_COMPLAINT_TO_WORKER",
      targetType: "Complaint",
      remarks: "Failed to assign worker to complaint",
      success: false,
      details: { error: error.message },
    });

    res.status(500).json({
      message: "Server error while assigning worker",
      error: error.message,
    });
  }
});

/////////////////////////////////////////////////

router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ success: true, data: users });
  } catch (err) {
    console.error("❌ Server error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
});

// ✅ PATCH /api/admin/users/:id/status - Update user status (active/suspended)
router.patch("/users/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "suspended"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid status value" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    await logAdminActivity({
      req,
      action: "UPDATE_USER_STATUS",
      targetType: "User",
      targetId: user._id,
      remarks: `User ${status === "suspended" ? "suspended" : "reactivated"}`,
      success: true,
      details: { status },
    });

    res.json({
      success: true,
      message: `User ${
        status === "suspended" ? "suspended" : "reactivated"
      } successfully`,
      data: user,
    });
  } catch (err) {
    console.error("❌ Server error:", err);

    await logAdminActivity({
      req,
      action: "UPDATE_USER_STATUS",
      targetType: "User",
      remarks: "Failed to update user status",
      success: false,
      details: { error: err.message },
    });

    res
      .status(500)
      .json({ success: false, error: "Failed to update user status" });
  }
});

// ✅ DELETE /api/admin/users/:id - Hard delete (optional admin-only operation)
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Remove all complaints by this user
    await UserComplaints.deleteMany({ userId: req.params.id });
    await User.findByIdAndDelete(req.params.id);

    await logAdminActivity({
      req,
      action: "DELETE_USER",
      targetType: "User",
      targetId: user._id,
      remarks: "User permanently deleted",
      success: true,
      details: { email: user.email },
    });

    res.json({ success: true, message: "User permanently deleted" });
  } catch (err) {
    console.error("❌ Server error:", err);

    await logAdminActivity({
      req,
      action: "DELETE_USER",
      targetType: "User",
      remarks: "Failed to delete user",
      success: false,
      details: { error: err.message },
    });

    res.status(500).json({ success: false, error: "Failed to delete user" });
  }
});
/////////////////////////////////////////////////
// 🧩 WORKER MANAGEMENT (Protected: Admin only)
/////////////////////////////////////////////////

// ➕ Add a new worker
router.post(
  "/addWorker",
  adminAuth,
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "idProof", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // 🔹 Parse body safely for multipart form
      const body = req.body;

      let address = {};
      if (typeof body.address === "string") {
        try {
          address = JSON.parse(body.address);
        } catch {
          address = {};
        }
      } else {
        address = body.address || {};
      }

      const {
        name,
        middleName,
        surname,
        email,
        phone,
        gender,
        dob,
        employeeId,
        department,
        experience,
        blockOrRegion,
        password,
      } = body;

      // Required field validation
      if (
        !name ||
        !surname ||
        !email ||
        !phone ||
        !employeeId ||
        !department ||
        !blockOrRegion ||
        !password ||
        !address.area ||
        !address.city ||
        !address.state ||
        !address.pincode
      ) {
        return res.status(400).json({
          success: false,
          message: "Required fields missing",
        });
      }

      // Duplicate check
      const existing = await Worker.findOne({
        $or: [{ email }, { employeeId }],
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Duplicate worker email or employeeId",
        });
      }

      // Cloudinary Uploads
      let profilePhotoUrl = null;
      let idProofUrl = null;
      const profileUpload = await uploadToCloudinary(
        req.files.profilePhoto[0].path,
        "worker/profile_photos"
      );
      profilePhotoUrl = profileUpload?.url || null;

      const proofUpload = await uploadToCloudinary(
        req.files.idProof[0].path,
        "worker/id_proofs"
      );
      idProofUrl = proofUpload?.url || null;
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Persist to DB
      const worker = await Worker.create({
        name,
        middleName,
        surname,
        email,
        phone,
        gender,
        dob,
        address: {
          houseNo: address.houseNo || "",
          street: address.street || "",
          landmark: address.landmark || "",
          area: address.area,
          city: address.city,
          district: address.district || "",
          state: address.state,
          pincode: address.pincode,
        },
        employeeId,
        department,
        experience,
        blockOrRegion,
        password: hashedPassword,
        profilePhoto: profilePhotoUrl,
        idProof: idProofUrl,
        createdBy: req.admin._id,
      });

      await logAdminActivity({
        req,
        action: "CREATE_WORKER",
        targetType: "Worker",
        targetId: worker._id,
        remarks: "Worker created successfully",
        success: true,
        details: { email: worker.email, employeeId: worker.employeeId },
      });

      res.status(201).json({
        success: true,
        message: "Worker created successfully",
        worker,
      });
    } catch (err) {
      console.error("❌ Add Worker Error:", err);

      await logAdminActivity({
        req,
        action: "CREATE_WORKER",
        targetType: "Worker",
        remarks: "Failed to create worker",
        success: false,
        details: { error: err.message },
      });

      res.status(500).json({
        success: false,
        message: "Server error while adding worker",
        error: err.message,
      });
    }
  }
);

// 📋 Show all workers
router.get("/showWorkers", adminAuth, async (req, res) => {
  try {
    const workers = await Worker.find()
      .populate("department", "name")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdAt: -1 })
      .select(
        "name middleName surname email phone gender dob employeeId department experience availability blockOrRegion status profilePhoto idProof createdBy createdAt updatedAt"
      ); // ✅ Explicitly include URLs and key fields

    if (!workers.length) {
      return res.status(404).json({
        success: false,
        message: "No workers found",
      });
    }

    // ✅ Structure consistent response with Cloudinary URLs
    const workerList = workers.map((worker) => ({
      _id: worker._id,
      name: worker.name,
      middleName: worker.middleName,
      surname: worker.surname,
      email: worker.email,
      phone: worker.phone,
      gender: worker.gender,
      dob: worker.dob,
      employeeId: worker.employeeId,
      department: worker.department?.name || null,
      experience: worker.experience,
      availability: worker.availability,
      blockOrRegion: worker.blockOrRegion,
      status: worker.status,
      profilePhotoUrl: worker.profilePhoto, // ✅ renamed for clarity
      idProofUrl: worker.idProof, // ✅ renamed for clarity
      createdBy: worker.createdBy,
      createdAt: worker.createdAt,
      updatedAt: worker.updatedAt,
    }));

    res.status(200).json({
      success: true,
      count: workerList.length,
      data: workerList,
    });
  } catch (err) {
    console.error("❌ Error fetching workers:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching workers",
      error: err.message,
    });
  }
});

// 🟢 Get single worker by ID
router.get("/worker/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const worker = await Worker.findById(id)
      .populate("department", "name")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: "Worker not found",
      });
    }

    res.status(200).json({
      success: true,
      data: worker,
    });
  } catch (err) {
    console.error("❌ Error fetching worker:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching worker",
      error: err.message,
    });
  }
});

router.get("/getWorkerById/:id", adminAuth, async (req, res) => {
  try {
    const worker = await Worker.findById(req.params.id)
      .populate("department", "name")
      .populate("createdBy", "name email");

    if (!worker)
      return res
        .status(404)
        .json({ success: false, message: "Worker not found" });

    res.status(200).json({ success: true, data: worker });
  } catch (err) {
    console.error("❌ getWorkerById Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching worker",
      error: err.message,
    });
  }
});

// 🟡 Update worker details (profile or fields)
router.put(
  "/editWorker/:id",
  adminAuth,
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "idProof", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const workerId = req.params.id;
      const worker = await Worker.findById(workerId);
      if (!worker) {
        return res
          .status(404)
          .json({ success: false, message: "Worker not found" });
      }

      const {
        name,
        middleName,
        surname,
        email,
        phone,
        gender,
        dob,
        experience,
        blockOrRegion,
        department,
        employeeId,
        address,
      } = req.body;

      // Prepare update object only with provided fields
      const updateData = {};

      if (name) updateData.name = name.trim();
      if (middleName !== undefined) updateData.middleName = middleName.trim();
      if (surname) updateData.surname = surname.trim();
      if (email) updateData.email = email.trim().toLowerCase();
      if (phone) updateData.phone = phone.trim();
      if (gender) updateData.gender = gender;
      if (dob) updateData.dob = dob;
      if (experience) updateData.experience = experience;
      if (blockOrRegion) updateData.blockOrRegion = blockOrRegion.trim();
      if (employeeId) updateData.employeeId = employeeId.trim();
      if (department) updateData.department = department;
      if (address) updateData.address = JSON.parse(address);

      // Handle optional uploads
      if (req.files?.profilePhoto?.[0]) {
        updateData.profilePhoto = await uploadToCloudinary(
          req.files.profilePhoto[0].path,
          "worker/profile_photos"
        );
      }
      if (req.files?.idProof?.[0]) {
        updateData.idProof = await uploadToCloudinary(
          req.files.idProof[0].path,
          "worker/id_proofs"
        );
      }

      // Perform partial update
      const updatedWorker = await Worker.findByIdAndUpdate(
        workerId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate("department", "name");

      res.status(200).json({
        success: true,
        message: "Worker updated successfully",
        data: updatedWorker,
      });
    } catch (error) {
      console.error("❌ Worker update error:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  }
);

// 🟠 Update worker status (active/suspended/removed)
router.patch("/updateWorkerStatus/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "suspended", "removed"].includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status value" });
    }

    const updatedWorker = await Worker.findByIdAndUpdate(
      id,
      { status, updatedBy: req.admin._id },
      { new: true, runValidators: true }
    );

    if (!updatedWorker) {
      return res
        .status(404)
        .json({ success: false, message: "Worker not found" });
    }

    await logAdminActivity({
      req,
      action: "UPDATE_WORKER_STATUS",
      targetType: "Worker",
      targetId: updatedWorker._id,
      remarks: `Worker status updated to ${status}`,
      success: true,
      details: { status },
    });

    res.status(200).json({
      success: true,
      message: `Worker status updated to '${status}'`,
      data: updatedWorker,
    });
  } catch (err) {
    console.error("❌ Error updating worker status:", err);

    await logAdminActivity({
      req,
      action: "UPDATE_WORKER_STATUS",
      targetType: "Worker",
      remarks: "Failed to update worker status",
      success: false,
      details: { error: err.message },
    });

    res.status(500).json({
      success: false,
      message: "Server error while updating worker status",
      error: err.message,
    });
  }
});

// 🔴 Delete worker (hard delete)
router.delete("/deleteWorker/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedWorker = await Worker.findByIdAndDelete(id);

    if (!deletedWorker) {
      return res
        .status(404)
        .json({ success: false, message: "Worker not found" });
    }

    await logAdminActivity({
      req,
      action: "DELETE_WORKER",
      targetType: "Worker",
      targetId: deletedWorker._id,
      remarks: "Worker permanently deleted",
      success: true,
      details: {
        email: deletedWorker.email,
        employeeId: deletedWorker.employeeId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Worker deleted successfully",
    });
  } catch (err) {
    console.error("❌ Error deleting worker:", err);

    await logAdminActivity({
      req,
      action: "DELETE_WORKER",
      targetType: "Worker",
      remarks: "Failed to delete worker",
      success: false,
      details: { error: err.message },
    });

    res.status(500).json({
      success: false,
      message: "Server error while deleting worker",
      error: err.message,
    });
  }
});

router.get("/departments", async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    console.log(departments);
    res.status(200).json(departments);
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/complaint-type/create", adminAuth, async (req, res) => {
  try {
    const { name, subComplaints, departmentId } = req.body;

    if (!name || !departmentId)
      return res
        .status(400)
        .json({ success: false, message: "Name and Department are required" });

    const department = await Department.findById(departmentId);
    if (!department)
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });

    const newType = await ComplaintType.create({
      name,
      subComplaints: subComplaints || [],
      departmentId,
      createdBy: req.admin._id,
    });

    await logAdminActivity({
      req,
      action: "CREATE_COMPLAINT_TYPE",
      targetType: "Department",
      targetId: newType._id,
      remarks: "Complaint type created successfully",
      success: true,
      details: { name, departmentId },
    });

    res.status(201).json({ success: true, data: newType });
  } catch (error) {
    console.error("❌ Create Complaint Type Error:", error);

    await logAdminActivity({
      req,
      action: "CREATE_COMPLAINT_TYPE",
      targetType: "Department",
      remarks: "Failed to create complaint type",
      success: false,
      details: { error: error.message },
    });

    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🟡 GET /api/admin/complaint-type/all
router.get("/complaint-type/all", adminAuth, async (req, res) => {
  try {
    const complaintTypes = await ComplaintType.find()
      .populate("departmentId", "name")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: complaintTypes });
  } catch (error) {
    console.error("❌ Fetch Complaint Types Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🟡 PUT /api/admin/complaint-type/update/:id
router.put("/complaint-type/update/:id", adminAuth, async (req, res) => {
  try {
    const { name, subComplaints, departmentId } = req.body;

    const updated = await ComplaintType.findByIdAndUpdate(
      req.params.id,
      {
        name,
        subComplaints,
        departmentId,
        updatedBy: req.admin._id, // 🔹 keep admin who made the update
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Complaint type not found" });
    }

    await logAdminActivity({
      req,
      action: "UPDATE_COMPLAINT_TYPE",
      targetType: "Department",
      targetId: updated._id,
      remarks: "Complaint type updated successfully",
      success: true,
      details: { name: updated.name },
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("❌ Update Complaint Type Error:", error);

    await logAdminActivity({
      req,
      action: "UPDATE_COMPLAINT_TYPE",
      targetType: "Department",
      remarks: "Failed to update complaint type",
      success: false,
      details: { error: error.message },
    });

    res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/departments/all", adminAuth, async (req, res) => {
  try {
    const departments = await Department.find()
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Departments fetched successfully",
      data: departments,
    });
  } catch (error) {
    console.error("❌ Fetch Departments Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔴 POST /api/admin/departments/create — Only Super Admin can create departments
router.post("/departments/create", adminAuth, async (req, res) => {
  try {
    if (req.admin.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied: Only Super Admin can create departments",
      });
    }

    const { name, description, status } = req.body;

    if (!name)
      return res.status(400).json({
        success: false,
        message: "Department name is required",
      });

    const existing = await Department.findOne({ name });
    if (existing)
      return res.status(409).json({
        success: false,
        message: "Department name already exists",
      });

    const department = new Department({
      name,
      description,
      status: status || "active",
      createdBy: req.admin._id,
    });

    await department.save();

    await logAdminActivity({
      req,
      action: "CREATE_DEPARTMENT",
      targetType: "Department",
      targetId: department._id,
      remarks: "Department created successfully",
      success: true,
      details: { name },
    });

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: department,
    });
  } catch (error) {
    console.error("❌ Create Department Error:", error);

    await logAdminActivity({
      req,
      action: "CREATE_DEPARTMENT",
      targetType: "Department",
      remarks: "Failed to create department",
      success: false,
      details: { error: error.message },
    });

    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🟡 PUT /api/admin/departments/update/:id — Only Super Admin can update
// 🟡 PUT /api/admin/departments/update/:id
router.put("/departments/update/:id", adminAuth, async (req, res) => {
  try {
    const admin = req.admin; // injected by adminAuth middleware

    // ✅ Ensure only Super Admin can update
    if (admin.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Super admin only.",
      });
    }

    const { id } = req.params;
    const { name, description, status } = req.body;

    // ✅ Fetch existing document first to retain createdBy
    const department = await Department.findById(id);
    if (!department) {
      return res
        .status(404)
        .json({ success: false, message: "Department not found" });
    }

    // ✅ Update allowed fields
    department.name = name || department.name;
    department.description = description || department.description;
    department.status = status || department.status;
    department.updatedBy = admin._id;

    await department.save();

    await logAdminActivity({
      req,
      action: "UPDATE_DEPARTMENT",
      targetType: "Department",
      targetId: department._id,
      remarks: "Department updated successfully",
      success: true,
      details: { name, status },
    });

    res.status(200).json({
      success: true,
      message: "Department updated successfully",
      department,
    });
  } catch (error) {
    console.error("❌ Update Department Error:", error);

    await logAdminActivity({
      req,
      action: "UPDATE_DEPARTMENT",
      targetType: "Department",
      remarks: "Failed to update department",
      success: false,
      details: { error: error.message },
    });

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

// ===================== GET ACTIVITY LOGS =====================
router.get("/activity", adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      success,
      targetType,
      performedByRole,
      action,
    } = req.query;
    const filter = {};

    // Apply filters
    if (success !== undefined) filter.success = success === "true";
    if (targetType) filter.targetType = targetType;
    if (performedByRole) filter.performedByRole = performedByRole;
    if (action) filter.action = { $regex: action, $options: "i" };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const activities = await AdminActivity.find(filter)
      .populate("adminId", "name email role")
      .populate("targetId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await AdminActivity.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Activity logs fetched successfully",
      data: activities,
      meta: {
        totalRecords: total,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit) || 0,
        count: activities.length,
      },
    });
  } catch (error) {
    console.error("❌ Fetch Activity Logs Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;
