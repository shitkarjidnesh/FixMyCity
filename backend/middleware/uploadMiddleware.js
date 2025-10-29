const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure local temp upload directory exists
const tempDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir); // physical directory for temporary storage
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPG, JPEG, PNG files are allowed"), false);
};

module.exports = multer({ storage, fileFilter });
