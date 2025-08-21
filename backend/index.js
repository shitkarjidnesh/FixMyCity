// /*
// File: server.js
// Express + Mongoose setup to accept JSON and store user input
// */

// require("dotenv").config();
// const express = require("express");
// const mongoose = require("mongoose");
// const bodyParser = require("body-parser");
// const cors = require("cors");

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", () => console.log("Connected to MongoDB"));

// // Model
// const User = mongoose.model(
//   "User",
//   new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     message: { type: String },
//   })
// );

// // Routes
// app.post("/api/users", async (req, res) => {
//   try {
//     const { name, email, message } = req.body;
//     const user = new User({ name, email, message });
//     await user.save();
//     res.status(201).json({ success: true, data: user });
//   } catch (err) {
//     console.error(err);
//     res.status(400).json({ success: false, error: err.message });
//   }
// });

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
// const cors = require("cors");
// app.use(cors({ origin: "http://localhost:3000" }));

const uploadRoute = require("./routes/uploadRoute");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("error", console.error.bind(console, "MongoDB error:"));
mongoose.connection.once("open", () => console.log("✅ Connected to MongoDB"));

app.use("/api", uploadRoute);
app.use("/api/auth", authRoutes);

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
