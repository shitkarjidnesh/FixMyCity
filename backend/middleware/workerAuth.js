const jwt = require("jsonwebtoken");
const Worker = require("../models/Worker");

const workerAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const worker = await Worker.findById(decoded.id);

    if (!worker) {
      return res.status(401).json({ msg: "Worker not found" });
    }

    req.auth = { id: worker._id, email: worker.email, role: 'worker' };
    next();
  } catch (err) {
    console.error("❌ Worker Auth Error:", err.message);
    res.status(401).json({ msg: "Invalid or expired token" });
  }
};

module.exports = workerAuth;