const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

module.exports = async function adminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Token missing.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid admin token." });
    }

    req.auth = { id: admin._id, email: admin.email, role: admin.role };
    next();
  } catch (err) {
    console.error("❌ Admin Auth Error:", err);
    res.status(401).json({ success: false, message: "Authentication failed." });
  }
};