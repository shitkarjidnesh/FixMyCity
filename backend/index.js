// File: server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan"); // for request logging
const helmet = require("helmet"); // security headers
const bodyParser = require("body-parser");

// Routes
// const uploadRoute = require("./routes/uploadRoute");
const complaintsRoute = require("./routes/complaints");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const complaintTypesRoutes = require("./routes/complaintTypes");
const workerAuthRoutes = require("./routes/workerAuth");
const workerRoutes = require("./routes/worker");
const otpRoutes = require("./routes/otp");
const { debugLogger } = require("./middleware/debugLogger");

const app = express();
const PORT = process.env.PORT || 5000;

// -----------------------------
// Middleware
// -----------------------------
app.use(
  cors({
    origin: "*",
    // origin: [
    //   "http://localhost:3000",
    //   "http://localhost:3001",
    //   "http://localhost:3002",
    //   "*",

    // ],
    credentials: true,
  })
);
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(helmet());
app.use(debugLogger);

// -----------------------------
// MongoDB connection
// -----------------------------


mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true, // useful during dev, disable in prod if perf issues
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1); // kill server if DB fails
  });

// -----------------------------
// Routes
// -----------------------------
app.get("/", (req, res) => res.send("FixMyCity API Running 🚀"));

// app.use("/api/upload", uploadRoute);
app.use("/api/complaints", complaintsRoute);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/complaint-types", complaintTypesRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/worker/auth", workerAuthRoutes);
app.use("/api/worker", workerRoutes);

// -----------------------------
// Global Error Handler
// -----------------------------
app.use((err, req, res, next) => {
  console.error("🔥 Uncaught Error:", err);
  res.status(500).json({ success: false, error: "Server Error" });
});
const bcrypt = require("bcrypt");
bcrypt.hash("password123", 10).then(console.log);

// -----------------------------
// Start Server
// -----------------------------
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
