import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "", role: "admin" });

  const [phase, setPhase] = useState("login"); // login | sendOtp | resetPassword
  const [otp, setOtp] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ---------------- LOGIN ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/admin/login",
        form
      );

      if (res.data.success) {
        if (res.data.role !== "admin" && res.data.role !== "superadmin") {
          toast.error("Not authorised");
          return;
        }
        toast.success("Login success");
        login(res.data);
        navigate("/");
      } else {
        toast.error(res.data.error || "Login failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- SEND OTP ----------------
  const sendOtp = async () => {
    if (!form.email) {
      toast.error("Enter email");
      return;
    }

    setLoading(true);
    try {
      const r = await axios.post(
        "http://localhost:5000/api/otp/requestadmin-otp",
        {
          email: form.email,
        }
      );

      if (r.data.success) {
        toast.success("OTP sent");
        setPhase("resetPassword");
      } else {
        toast.error(r.data.message || "Failed");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- RESET PASSWORD ----------------
  const resetPassword = async () => {
    if (!otp || !newPwd || !confirmPwd) {
      toast.error("All fields required");
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error("Passwords mismatch");
      return;
    }

    setLoading(true);
    try {
      const r = await axios.post(
        "http://localhost:5000/api/admin/verify-reset-otp",
        {
          email: form.email,
          otp,
          password: newPwd,
          confirmPassword: confirmPwd,
        }
      );

      if (r.data.success) {
        toast.success("Password reset, login again");
        setPhase("login");
        setForm({ email: "", password: "", role: "admin" });
        setOtp("");
        setNewPwd("");
        setConfirmPwd("");
      } else {
        toast.error(r.data.message || "Failed");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Toaster position="top-center" />

      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border">
        {/* ---------------- LOGIN SCREEN ---------------- */}
        {phase === "login" && (
          <>
            <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
              Admin Login
            </h1>

            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                name="email"
                type="email"
                autoComplete="off"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg"
              />

              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 text-white rounded-lg ${
                  loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                }`}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <button
              onClick={() => setPhase("sendOtp")}
              className="mt-4 text-blue-600 text-sm underline">
              Forgot Password?
            </button>
          </>
        )}

        {/* ---------------- SEND OTP SCREEN ---------------- */}
        {phase === "sendOtp" && (
          <>
            <h2 className="text-xl font-bold text-center mb-4">
              Reset Password
            </h2>

            <input
              type="email"
              autoComplete="off"
              placeholder="Admin Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg mb-3"
            />
            <button
              onClick={sendOtp}
              disabled={loading}
              className={`w-full py-2 text-white rounded-lg ${
                loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              }`}>
              {loading ? "Sending..." : "Send OTP"}
            </button>

            <button
              onClick={() => setPhase("login")}
              className="mt-3 text-sm text-gray-700 underline w-full">
              ← Back to Login
            </button>
          </>
        )}

        {/* ---------------- RESET PASSWORD SCREEN ---------------- */}
        {phase === "resetPassword" && (
          <>
            <h2 className="text-xl font-bold text-center mb-4">
              Enter OTP & New Password
            </h2>

            <input
              placeholder="OTP"
              value={otp}
              autoComplete="off"
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-3"
            />

            <input
              placeholder="New Password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg pr-10 mb-3"
            />

            <input
              placeholder="Confirm Password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg pr-10 mb-3"
            />

            <button
              onClick={resetPassword}
              disabled={loading}
              className={`w-full py-2 text-white rounded-lg ${
                loading ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
              }`}>
              {loading ? "Updating..." : "Reset Password"}
            </button>

            <button
              onClick={() => setPhase("sendOtp")}
              className="mt-3 text-sm text-gray-700 underline w-full">
              ← Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
