import { useState } from "react";
import axios from "axios";

export default function AddAdmin() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/admin/register", {
        ...form,
      });

      setMsg(res.data?.message || "✅ Admin registered successfully!");
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      setError(
        err.response?.data?.error || "❌ Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-md rounded-2xl p-8 w-full max-w-md transition-all duration-300 hover:shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Admin Registration
        </h1>

        {msg && (
          <p className="text-green-600 text-center bg-green-50 p-2 rounded-md mb-4">
            {msg}
          </p>
        )}
        {error && (
          <p className="text-red-600 text-center bg-red-50 p-2 rounded-md mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Full Name</label>
            <input
              name="name"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              placeholder="Enter email address"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white py-2 rounded-md transition duration-200 ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
