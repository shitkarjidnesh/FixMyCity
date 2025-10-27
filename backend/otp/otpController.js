const crypto = require("crypto");

let otpStore = {};

function generateOTP(email) {
  const otp = crypto.randomInt(100000, 999999).toString();
  otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };
  return otp;
}

function verifyOTP(email, otp) {
  const record = otpStore[email];
  if (!record) return false;
  if (Date.now() > record.expires) return false;
  if (record.otp !== otp) return false;
  delete otpStore[email]; // Invalidate after use
  return true;
}

module.exports = { generateOTP, verifyOTP };
