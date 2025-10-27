const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOTP(email, otp) {
  const mailOptions = {
    from: `"Complaint Verification" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Email Verification OTP",
    text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
  };
  return transporter.sendMail(mailOptions);
}

module.exports = { sendOTP };
