// const jwt = require("jsonwebtoken");

// function auth(req, res, next) {
//   const token = req.header("x-auth-token");
//   if (!token) return res.status(401).json({ msg: "No token, authorization denied" });

//   try {
//     const decoded = jwt.verify(token, "secretkey");
//     req.user = decoded;
//     next();
//   } catch (err) {
//     res.status(400).json({ msg: "Token invalid" });
//   }
// }

// module.exports = auth;


const jwt = require("jsonwebtoken");
const JWT_SECRET = "yoursecretkey";

function auth(requiredRole = null) {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ msg: "No token provided" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ msg: "Forbidden: wrong role" });
      }
      req.user = decoded;
      next();
    } catch {
      res.status(401).json({ msg: "Invalid token" });
    }
  };
}

module.exports = auth;

