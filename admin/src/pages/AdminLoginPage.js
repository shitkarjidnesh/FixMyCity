import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react"; // 👁 Lucide icons

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "", role: "admin" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/admin/login",
        form
      );

      console.log("📦 Data:", JSON.stringify(res.data, null, 2));

      if (res.data.success) {
        if (res.data.role !== "admin" && res.data.role !== "superadmin") {
          toast.error("You are not authorized to access the admin panel.");
          return;
        }

        toast.success("Login successful!");
        login(res.data);
        navigate("/");
      } else {
        toast.error(res.data.error || "Login failed.");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Server error during login.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: { fontSize: "15px" },
        }}
      />

      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Admin Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />

          {/* Password Field with Eye Toggle */}
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              tabIndex={-1}>
              {showPassword ? (
                <EyeOff size={20} strokeWidth={2} />
              ) : (
                <Eye size={20} strokeWidth={2} />
              )}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 text-white font-semibold rounded-lg transition-all ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
