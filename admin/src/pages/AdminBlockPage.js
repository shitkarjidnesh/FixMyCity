import React, { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function AdminBlockPage() {
  const [blocks, setBlocks] = useState([]);
  const [form, setForm] = useState({ name: "" });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [adminRole, setAdminRole] = useState("");

  useEffect(() => {
    fetchAdminRole();
    fetchBlocks();
  }, []);

  // 🔹 Fetch admin role for permission
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

  // 🔹 Fetch existing blocks
  const fetchBlocks = async () => {
    try {
      const token = localStorage.getItem("admintoken");

      const res = await axios.get(
        "http://localhost:5000/api/admin/block/dropdown",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBlocks(res.data.data || []);
    } catch (error) {
      console.error("❌ Fetch Blocks Error:", error);
      toast.error("Failed to fetch blocks");
    }
  };

  // 🔹 Submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("admintoken");

    const api = editingId
      ? `http://localhost:5000/api/admin/block/update/${editingId}`
      : `http://localhost:5000/api/admin/block/add`;

    const method = editingId ? "put" : "post";

    try {
      await axios[method](
        api,
        { name: form.name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(editingId ? "Block Updated" : "Block Created");

      setForm({ name: "" });
      setEditingId(null);
      fetchBlocks();
    } catch (error) {
      console.error("❌ Block Save Error:", error.response?.data || error);
      toast.error(error.response?.data?.error || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Edit existing block
  const handleEdit = (item) => {
    setForm({ name: item.name });
    setEditingId(item._id);
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <h2 className="text-2xl font-semibold mb-4">Block Management</h2>

      {/* Superadmin can Add/Update */}
      {adminRole === "superadmin" && (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow p-4 rounded-lg mb-6 border">
          <div className="mb-3">
            <label className="block font-medium">Block Name</label>
            <input
              type="text"
              className="border rounded w-full p-2"
              value={form.name}
              onChange={(e) => setForm({ name: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
            disabled={loading}>
            {loading
              ? "Saving..."
              : editingId
              ? "Update Block"
              : "Create Block"}
          </button>
        </form>
      )}

      {/* Block List */}
      <h3 className="text-xl font-semibold mb-2">Existing Blocks</h3>

      <table className="min-w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Name</th>
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
          {blocks.map((item) => (
            <tr key={item._id} className="hover:bg-gray-50">
              {/* Name */}
              <td className="border px-4 py-2">{item.name}</td>

              {/* Created By */}
              <td className="border px-4 py-2">
                {item.createdBy?.name || "—"}
              </td>

              {/* Created At */}
              <td className="border px-4 py-2">
                {new Date(item.createdAt).toLocaleString()}
              </td>

              {/* Updated By */}
              <td className="border px-4 py-2">
                {item.updatedBy?.name || "—"}
              </td>

              {/* Updated At */}
              <td className="border px-4 py-2">
                {new Date(item.updatedAt).toLocaleString()}
              </td>

              {/* Edit Action */}
              {adminRole === "superadmin" && (
                <td className="border px-4 py-2">
                  <button
                    onClick={() => handleEdit(item)}
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
