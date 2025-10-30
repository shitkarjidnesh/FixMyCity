import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function AdminDepartmentPage() {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [adminRole, setAdminRole] = useState("");

  useEffect(() => {
    fetchAdminRole();
    fetchDepartments();
  }, []);

  // 🔹 Fetch admin details (to verify superadmin access)
  const fetchAdminRole = async () => {
    try {
      const token = localStorage.getItem("admintoken");
      const res = await axios.get("http://localhost:5000/api/admin/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdminRole(res.data?.admin?.role || "");
    } catch (error) {
      console.error("❌ Fetch Admin Role Error:", error);
    }
  };

  // 🔹 Fetch all departments
  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem("admintoken");
      const res = await axios.get(
        "http://localhost:5000/api/admin/departments/all",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDepartments(res.data.data || []);
    } catch (error) {
      console.error("❌ Fetch Departments Error:", error);
      toast.error("Failed to fetch departments");
    }
  };

  // 🔹 Submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("admintoken");
    const api = editingId
      ? `http://localhost:5000/api/admin/departments/update/${editingId}`
      : `http://localhost:5000/api/admin/departments/create`;
    const method = editingId ? "put" : "post";

    try {
      await axios[method](api, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success(editingId ? "Department Updated" : "Department Created");
      setForm({ name: "", description: "", status: "active" });
      setEditingId(null);
      fetchDepartments();
    } catch (error) {
      console.error("❌ Department Save Error:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Edit existing record
  const handleEdit = (dept) => {
    setForm({
      name: dept.name,
      description: dept.description || "",
      status: dept.status || "active",
    });
    setEditingId(dept._id);
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-semibold mb-4">Department Management</h2>

      {/* Only Super Admin Can Create/Update */}
      {adminRole === "superadmin" && (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow p-4 rounded-lg mb-6 border">
          <div className="mb-3">
            <label className="block font-medium">Department Name</label>
            <input
              type="text"
              className="border rounded w-full p-2"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label className="block font-medium">Description</label>
            <textarea
              className="border rounded w-full p-2"
              rows="3"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className="mb-3">
            <label className="block font-medium">Status</label>
            <select
              className="border rounded w-full p-2"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
            disabled={loading}>
            {loading ? "Saving..." : editingId ? "Update" : "Create"}
          </button>
        </form>
      )}

      {/* Department List */}
      <h3 className="text-xl font-semibold mb-2">Existing Departments</h3>
      <table className="min-w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Description</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Created By</th>
            <th className="border px-4 py-2">Created At</th>
            <th className="border px-4 py-2">Updated By</th>
            <th className="border px-4 py-2">Updated At</th>
            {adminRole === "superadmin" && (
              <th className="border px-4 py-2">Action</th>
            )}
          </tr>
        </thead>
        <tbody>
          {departments.map((dept) => (
            <tr key={dept._id} className="hover:bg-gray-50">
              <td className="border px-4 py-2">{dept.name}</td>
              <td className="border px-4 py-2">{dept.description || "—"}</td>
              <td
                className={`border px-4 py-2 font-medium ${
                  dept.status === "active" ? "text-green-600" : "text-red-600"
                }`}>
                {dept.status}
              </td>
              <td className="border px-4 py-2">
                {dept.createdBy?.name || "—"}
              </td>
              <td className="border px-4 py-2">
                {new Date(dept.createdAt).toLocaleString()}
              </td>
              <td className="border px-4 py-2">
                {dept.updatedBy?.name || "—"}
              </td>
              <td className="border px-4 py-2">
                {new Date(dept.updatedAt).toLocaleString()}
              </td>
              {adminRole === "superadmin" && (
                <td className="border px-4 py-2">
                  <button
                    onClick={() => handleEdit(dept)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded">
                    Edit
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
