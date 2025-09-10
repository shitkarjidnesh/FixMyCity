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

const app = express();
const PORT = process.env.PORT || 5000;

// -----------------------------
// Middleware
// -----------------------------
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(helmet());

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

// -----------------------------
// Global Error Handler
// -----------------------------
app.use((err, req, res, next) => {
  console.error("🔥 Uncaught Error:", err);
  res.status(500).json({ success: false, error: "Server Error" });
});

// -----------------------------
// Start Server
// -----------------------------
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
