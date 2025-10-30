import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function AdminComplaintTypePage() {
  const [departments, setDepartments] = useState([]);
  const [complaintTypes, setComplaintTypes] = useState([]);
  const [form, setForm] = useState({
    name: "",
    subComplaints: [""],
    departmentId: "",
  });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchDepartments();
    fetchComplaintTypes();
  }, []);

  const fetchDepartments = async () => {
    const token = localStorage.getItem("admintoken");
    const res = await axios.get(`http://localhost:5000/api/admin/departments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setDepartments(res.data || []);
  };

  // Fetch complaint types
  const fetchComplaintTypes = async () => {
    const token = localStorage.getItem("admintoken");
    const res = await axios.get(
      `http://localhost:5000/api/admin/complaint-type/all`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admintoken")}`,
        },
      }
    );
    setComplaintTypes(res.data.data || []);
  };

  const handleSubComplaintChange = (index, value) => {
    const updated = [...form.subComplaints];
    updated[index] = value;
    setForm({ ...form, subComplaints: updated });
  };

  const addSubComplaint = () => {
    setForm({ ...form, subComplaints: [...form.subComplaints, ""] });
  };

  const removeSubComplaint = (index) => {
    const updated = form.subComplaints.filter((_, i) => i !== index);
    setForm({ ...form, subComplaints: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("admintoken");
    const api = editingId
      ? `http://localhost:5000/api/admin/complaint-type/update/${editingId}`
      : `http://localhost:5000/api/admin/complaint-type/create`;

    const method = editingId ? "put" : "post";

    try {
      await axios[method](api, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success(
        editingId ? "Complaint Type Updated" : "Complaint Type Created"
      );

      setForm({ name: "", subComplaints: [""], departmentId: "" });
      setEditingId(null);
      fetchComplaintTypes();
    } catch (error) {
      console.error(
        "❌ Complaint Type Save Error:",
        error.response?.data || error
      );
      toast.error("Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (type) => {
    setForm({
      name: type.name,
      subComplaints: type.subComplaints || [""],
      departmentId:
        typeof type.departmentId === "object"
          ? type.departmentId._id
          : type.departmentId, // handle ObjectId string
    });
    setEditingId(type._id);
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-semibold mb-4">Complaint Type Management</h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow p-4 rounded-lg mb-6">
        <div className="mb-3">
          <label className="block font-medium">Complaint Type Name</label>
          <input
            type="text"
            className="border rounded w-full p-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="mb-3">
          <label className="block font-medium">Department</label>
          <select
            className="border rounded w-full p-2"
            value={form.departmentId}
            onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
            required>
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="block font-medium mb-2">Sub-Complaints</label>
          {form.subComplaints.map((sc, idx) => (
            <div key={idx} className="flex mb-2 gap-2">
              <input
                type="text"
                className="border rounded flex-1 p-2"
                value={sc}
                onChange={(e) => handleSubComplaintChange(idx, e.target.value)}
                placeholder={`Sub-complaint ${idx + 1}`}
                required
              />
              <button
                type="button"
                onClick={() => removeSubComplaint(idx)}
                className="text-red-500 hover:text-red-700">
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSubComplaint}
            className="bg-blue-500 text-white px-3 py-1 rounded">
            + Add Sub-Complaint
          </button>
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
          disabled={loading}>
          {loading ? "Saving..." : editingId ? "Update" : "Create"}
        </button>
      </form>

      <h3 className="text-xl font-semibold mb-2">Existing Complaint Types</h3>
      <table className="min-w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Department</th>
            <th className="border px-4 py-2">Sub-Complaints</th>
            <th className="border px-4 py-2">Created By</th>
            <th className="border px-4 py-2">Created At</th>
            <th className="border px-4 py-2">Updated By</th>
            <th className="border px-4 py-2">Updated At</th>
            <th className="border px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {complaintTypes.map((t) => (
            <tr key={t._id}>
              <td className="border px-4 py-2">{t.name}</td>
              <td className="border px-4 py-2">
                {t.departmentId?.name || "-"}
              </td>
              <td className="border px-4 py-2">
                {t.subComplaints && t.subComplaints.length > 0
                  ? t.subComplaints.join(", ")
                  : "-"}
              </td>
              <td className="border px-4 py-2">{t.createdBy?.name || "-"}</td>
              <td className="border px-4 py-2">
                {t.createdAt ? new Date(t.createdAt).toLocaleString() : "-"}
              </td>
              <td className="border px-4 py-2">{t.updatedBy?.name || "-"}</td>
              <td className="border px-4 py-2">
                {t.updatedAt ? new Date(t.updatedAt).toLocaleString() : "-"}
              </td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleEdit(t)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded">
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
