const jwt = require("jsonwebtoken");

function auth(requiredRole = null) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ msg: "No token provided" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ msg: "Malformed token" });
    console.log(token);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ msg: "Forbidden: wrong role" });
      }
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ msg: "Invalid token" });
    }
  };
}

module.exports = auth;
