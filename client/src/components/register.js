import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // const handleSubmit = async e => {
  //   e.preventDefault();
  //   await axios.post("http://localhost:5000/api/auth/register", form);
  //   alert("Registered successfully");
  // };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post("http://localhost:5000/api/register", form);
    alert(res.data.msg); // success message
  } catch (err) {
    if (err.response && err.response.data && err.response.data.msg) {
      alert(err.response.data.msg); // show backend friendly error
    } else {
      alert("Something went wrong. Please try again.");
    }
  }
};

  return (
    <>
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto bg-white shadow-md rounded-xl p-6 space-y-4">
  <input
    name="name"
    placeholder="Name"
    onChange={handleChange}
    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  <input
    name="email"
    type="email"
    placeholder="Email"
    onChange={handleChange}
    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  <input
    name="password"
    type="password"
    placeholder="Password"
    onChange={handleChange}
    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
  <button
    type="submit"
    className="w-full bg-blue-500 text-white font-medium py-2 rounded-lg hover:bg-blue-600 transition"
  >
    Register
  </button>
</form>

</>
  );
}
