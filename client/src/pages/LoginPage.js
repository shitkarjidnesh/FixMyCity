import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";

export default function RegisterPage() {
  // 1. Updated state to include name, phone, and address
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 2. Changed API endpoint to the registration route
      await axios.post("http://localhost:5000/api/auth/register", form);

      // 3. On success, navigate to the login page
      navigate("/login");
      alert("Registration successful! Please log in.");
    } catch (err) {
      setError(
        err.response?.data?.error || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-8">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="text-gray-500">Join FixMyCity to report issues</p>
        </div>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 4. Added new input fields */}
          <Input
            name="name"
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <Input
            name="email"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
          />
          <Input
            name="phone"
            type="tel"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            required
          />
          <Input
            name="address"
            type="text"
            placeholder="Address / Landmark"
            value={form.address}
            onChange={handleChange}
            required
          />
          <Input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full p-2 border rounded bg-white"
            required>
            <option value="user">I am a User</option>
            <option value="worker">I am a Worker</option>
          </select>
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            disabled={loading}>
            {loading ? "Registering..." : "Sign Up"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:underline">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
