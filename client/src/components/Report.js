import React, { useState } from "react";
import axios from "axios";

export default function Report() {
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [file, setFile] = useState(null);
  const [type, setType] = useState("");

  const token = localStorage.getItem("token");
  console.log("Token being sent:", token);
  //const userId = localStorage.getItem("userId");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

  const formData = new FormData();
  formData.append("type", type);
  formData.append("description", description);
  formData.append("address", address);
  if (file) formData.append("image", file);

  const token = localStorage.getItem("token");

  try {
    const res = await axios.post(
      "http://localhost:5000/api/complaints/upload",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`, // only header
        },
      }
    );

    console.log("Complaint submitted:", res.data);
  } catch (err) {
    console.error("Error:", err.message, err.response);
  }
  };

  return (
    <div className="max-w-lg mx-auto bg-white shadow p-6 rounded-2xl mt-10">
      <h2 className="text-2xl font-bold mb-4">Submit a Complaint</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 font-semibold">Complaint Type</label>
          <select
            className="w-full border p-2 rounded-lg"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="">-- Select Complaint Type --</option>
            <option value="pothole">Pothole</option>
            <option value="streetlight">Broken Streetlight</option>
            <option value="garbage">Garbage Issue</option>
            <option value="water">Water Leakage</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-semibold">Description</label>
          <textarea
            className="w-full border p-2 rounded-lg"
            placeholder="Describe the issue..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Address</label>
          <textarea
            className="w-full border p-2 rounded-lg"
            placeholder="Enter the address of the issue..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Upload Image</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700"
        >
          Report Issue
        </button>
      </form>
    </div>
  );
}
