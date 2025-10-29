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
      const hashedPassword = await bcrypt.hash(password, 10);

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

      res.status(201).json({
        success: true,
        message: "Admin registered successfully",
        adminId: admin._id,
      });
    } catch (error) {
      console.error("❌ Admin Register Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

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
      { expiresIn: "2d" } // Extended session time
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

    res.status(200).json({
      success: true,
      message: "Admin status updated successfully.",
      admin: updatedAdmin,
    });
  } catch (error) {
    console.error("Update Admin Status Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put(
  "/showadmins/editadmin/:id",
  adminAuth,
  upload.single("idProofImage"),
  async (req, res) => {
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
      } = req.body;

      // Handle Cloudinary upload if provided
      let idProofImageUrl;
      if (req.file && req.file.path) {
        idProofImageUrl = req.file.path;
      }

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

      if (idProofType || idProofNumber || idProofImageUrl) {
        updateFields.idProof = {
          type: idProofType,
          number: idProofNumber,
          image: idProofImageUrl,
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

      res.status(200).json({
        success: true,
        message: "Admin details updated successfully.",
        admin: updatedAdmin,
      });
    } catch (error) {
      console.error("Edit Admin Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

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

    res.status(200).json({
      success: true,
      message: "Admin deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Admin Error:", error);
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

// POST /api/admin/complaints/:id/assign - Assign a complaint to a worker
router.post("/complaints/:id/assign", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { workerId, priority } = req.body;

    if (!workerId) {
      return res.status(400).json({ success: false, error: "workerId is required" });
    }

    const worker = await Worker.findById(workerId);
    if (!worker) {
      return res.status(404).json({ success: false, error: "Worker not found" });
    }

    const complaint = await UserComplaints.findByIdAndUpdate(
      id,
      {
        assignedTo: workerId,
        assignedBy: req.admin._id,
        status: "Assigned",
        priority: priority || undefined,
        lastUpdatedBy: req.admin._id,
        lastUpdatedRole: "Admin",
      },
      { new: true }
    )
      .populate("userId", "name email")
      .populate("type", "name subComplaints")
      .populate("assignedTo", "name email department");

    if (!complaint) {
      return res.status(404).json({ success: false, error: "Complaint not found" });
    }

    await AdminActivity.create({
      adminId: req.admin._id,
      action: "ASSIGN_COMPLAINT",
      targetType: "Complaint",
      targetId: complaint._id,
      details: { workerId, priority: complaint.priority },
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.json({ success: true, message: "Complaint assigned to worker", data: complaint });
  } catch (err) {
    console.error("❌ Assign complaint error:", err);
    res.status(500).json({ success: false, error: "Failed to assign complaint" });
  }
});

// POST /api/admin/complaints/:id/verify - Approve or reject a resolved complaint
router.post("/complaints/:id/verify", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { approve, notes } = req.body;

    const complaint = await UserComplaints.findById(id).populate("type", "name subComplaints");
    if (!complaint) {
      return res.status(404).json({ success: false, error: "Complaint not found" });
    }

    if (approve === true || approve === "true") {
      complaint.status = "Resolved";
    } else {
      complaint.status = "Rejected";
    }
    complaint.lastUpdatedBy = req.admin._id;
    complaint.lastUpdatedRole = "Admin";
    await complaint.save();

    await AdminActivity.create({
      adminId: req.admin._id,
      action: approve ? "APPROVE_RESOLUTION" : "REJECT_RESOLUTION",
      targetType: "Complaint",
      targetId: complaint._id,
      details: { notes },
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.json({ success: true, message: approve ? "Resolution approved" : "Resolution rejected", data: complaint });
  } catch (err) {
    console.error("❌ Verify resolution error:", err);
    res.status(500).json({ success: false, error: "Failed to verify resolution" });
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
    try {
      await AdminActivity.create({
        adminId: req.admin?._id || null,
        action: "UPDATE_COMPLAINT_STATUS",
        targetType: "Complaint",
        targetId: complaint._id,
        details: { status },
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });
    } catch (logErr) {
      console.error("AdminActivity log error:", logErr.message);
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

    res.json({
      success: true,
      message: `User ${
        status === "suspended" ? "suspended" : "reactivated"
      } successfully`,
      data: user,
    });
  } catch (err) {
    console.error("❌ Server error:", err);
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

    res.json({ success: true, message: "User permanently deleted" });
  } catch (err) {
    console.error("❌ Server error:", err);
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

      res.status(201).json({
        success: true,
        message: "Worker created successfully",
        worker,
      });
    } catch (err) {
      console.error("❌ Add Worker Error:", err);
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
      const { id } = req.params;
      const existingWorker = await Worker.findById(id);

      if (!existingWorker) {
        return res.status(404).json({
          success: false,
          message: "Worker not found",
        });
      }

      const updateData = { ...req.body };

      // 🔹 Parse address if frontend sends JSON string
      if (updateData.address && typeof updateData.address === "string") {
        try {
          updateData.address = JSON.parse(updateData.address);
        } catch {
          console.warn("Invalid address JSON");
        }
      }

      // 🔹 Ensure department is an ObjectId string
      if (updateData.department && typeof updateData.department === "object") {
        updateData.department = updateData.department._id;
      }

      // 🔹 Retain uneditable fixed fields
      updateData.email = existingWorker.email;
      updateData.phone = existingWorker.phone;
      updateData.createdBy = existingWorker.createdBy;
      updateData.status = existingWorker.status;

      // 🔹 Handle Cloudinary uploads
      if (req.files?.profilePhoto?.length) {
        const uploadResult = await uploadToCloudinary(
          req.files.profilePhoto[0].path,
          "worker/profile_photos"
        );
        if (uploadResult?.url) updateData.profilePhoto = uploadResult.url;
      }

      if (req.files?.idProof?.length) {
        const uploadResult = await uploadToCloudinary(
          req.files.idProof[0].path,
          "worker/id_proofs"
        );
        if (uploadResult?.url) updateData.idProof = uploadResult.url;
      }

      // 🔹 Update metadata
      updateData.updatedBy = req.admin._id;

      const updatedWorker = await Worker.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).populate("department");

      return res.status(200).json({
        success: true,
        message: "Worker details updated successfully",
        data: updatedWorker,
      });
    } catch (err) {
      console.error("❌ Error updating worker:", err);
      return res.status(500).json({
        success: false,
        message: "Server error while updating worker",
        error: err.message,
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

    res.status(200).json({
      success: true,
      message: `Worker status updated to '${status}'`,
      data: updatedWorker,
    });
  } catch (err) {
    console.error("❌ Error updating worker status:", err);
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

    res.status(200).json({
      success: true,
      message: "Worker deleted successfully",
    });
  } catch (err) {
    console.error("❌ Error deleting worker:", err);
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

module.exports = router;
