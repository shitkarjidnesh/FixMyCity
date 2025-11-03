const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function userAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ msg: "Malformed token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    req.auth = { id: user._id, email: user.email, role: user.role };

    next();
  } catch (err) {
    console.error("❌ User Auth Error:", err.message);
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
}

module.exports = userAuth;