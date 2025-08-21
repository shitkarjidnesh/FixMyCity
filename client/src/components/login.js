import { useState } from "react";
import axios from "axios";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await axios.post("http://localhost:5000/api/auth/login", form);
    localStorage.setItem("token", res.data.token);
    alert("Logged in");
  };

  return (
    <>
    <form onSubmit={handleSubmit} className="flex flex-col space-y-3 w-72 mx-auto mt-10">
  <input
    name="email"
    type="email"
    placeholder="Email"
    onChange={handleChange}
    className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  <input
    name="password"
    type="password"
    placeholder="Password"
    onChange={handleChange}
    className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  <button
    type="submit"
    className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
  >
    Login
  </button>
</form>

    </>
  );
}
