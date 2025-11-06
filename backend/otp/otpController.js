const crypto = require("crypto");

// in-memory OTP buckets
let userOtpStore = {};
let workerOtpStore = {};
let adminOtpStore = {};

// generic util
const makeOTP = () => crypto.randomInt(100000, 999999).toString();
const TTL = 5 * 60 * 1000; // 5m

function generateUserOTP(email) {
  const otp = makeOTP();
  userOtpStore[email] = { otp, expires: Date.now() + TTL };
  return otp;
}

function verifyUserOTP(email, otp) {
  const r = userOtpStore[email];
  if (!r || Date.now() > r.expires || r.otp !== otp) return false;
  delete userOtpStore[email];
  return true;
}

function generateWorkerOTP(email) {
  const otp = makeOTP();
  workerOtpStore[email] = { otp, expires: Date.now() + TTL };
  return otp;
}

function verifyWorkerOTP(email, otp) {
  const r = workerOtpStore[email];
  if (!r || Date.now() > r.expires || r.otp !== otp) return false;
  delete workerOtpStore[email];
  return true;
}

// admin-specific namespace
function generateAdminOTP(email) {
  const otp = makeOTP();
  adminOtpStore[email] = { otp, expires: Date.now() + TTL };
  return otp;
}

function verifyAdminOTP(email, otp) {
  const r = adminOtpStore[email];
  if (!r || Date.now() > r.expires || r.otp !== otp) return false;
  delete adminOtpStore[email];
  return true;
}

module.exports = {
  generateUserOTP,
  verifyUserOTP,
  generateWorkerOTP,
  verifyWorkerOTP,
  generateAdminOTP,
  verifyAdminOTP,
};
