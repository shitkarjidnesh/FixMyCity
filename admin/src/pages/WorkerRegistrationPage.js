import React, { useState, useEffect } from "react";
import axios from "axios"; // Using axios directly

// ====================================================================
// Reusable Component: Toast Notification
// A small, self-dismissing notification for success or error messages.
// ====================================================================
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    // Automatically close the toast after 4 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer); // Cleanup timer
  }, [onClose]);

  const baseStyle =
    "fixed top-5 right-5 p-4 rounded-lg shadow-xl text-white font-semibold transition-transform transform";
  const typeStyle = type === "success" ? "bg-green-500" : "bg-red-500";

  return <div className={`${baseStyle} ${typeStyle}`}>{message}</div>;
};

// ====================================================================
// Main AddWorker Component
// ====================================================================
export default function AddWorker() {
  const initialFormState = {
    name: "",
    email: "",
    phone: "",
    address: "",
    department: "",
    employeeId: "",
    username: "",
    password: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [departments, setDepartments] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem("admintoken");
        if (!token) throw new Error("Admin token not found.");

        const res = await axios.get(
          "http://localhost:5000/api/admin/departments",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDepartments(res.data);
      } catch (err) {
        console.error("Error loading departments:", err);
        setMessage("Could not load departments.");
        setMessageType("error");
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("admintoken");
      if (!token) throw new Error("Admin token not found.");

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const res = await axios.post(
        "http://localhost:5000/api/admin/addWorker",
        formData,
        { headers }
      );

      setMessage(res.data.message || "Worker added successfully!");
      setMessageType("success");
      setFormData(initialFormState); // Reset form
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Error adding worker.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {message && (
        <Toast
          message={message}
          type={messageType}
          onClose={() => setMessage("")}
        />
      )}

      <div className="max-w-4xl w-full bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
          Add New Worker
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="col-span-2 md:col-span-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="col-span-2 md:col-span-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            required
            className="col-span-2 md:col-span-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            required
            className="col-span-2 md:col-span-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
            className="col-span-2 md:col-span-1 p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept.name}>
                {" "}
                {/* Send ID as value */}
                {dept.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="employeeId"
            placeholder="Employee ID"
            value={formData.employeeId}
            onChange={handleChange}
            required
            className="col-span-2 md:col-span-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            className="col-span-2 md:col-span-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="col-span-2 md:col-span-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Adding Worker..." : "Add Worker"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
