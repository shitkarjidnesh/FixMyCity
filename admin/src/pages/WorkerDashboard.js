import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function WorkerDashboard() {
  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [previewImage, setPreviewImage] = useState(null);

  const navigate = useNavigate();

  // 🔹 Fetch all workers
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const token = localStorage.getItem("admintoken");
        if (!token) throw new Error("Admin token not found.");

        const res = await axios.get(
          "http://localhost:5000/api/admin/showWorkers",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(res.data);
        const workersData = res.data.data || [];
        setWorkers(workersData);
        setFilteredWorkers(workersData);
      } catch (err) {
        console.error("Error fetching workers:", err);
        setError(err.response?.data?.message || "Failed to fetch workers.");
      } finally {
        setLoading(false);
      }
    };
    fetchWorkers();
  }, []);

  // 🔹 Search + Filters
  useEffect(() => {
    let filtered = workers;

    if (search) {
      filtered = filtered.filter((w) =>
        `${w.name} ${w.middleName || ""} ${w.surname}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }

    if (departmentFilter)
      filtered = filtered.filter(
        (w) => w.department?.name === departmentFilter
      );

    if (statusFilter)
      filtered = filtered.filter((w) => w.status === statusFilter);

    setFilteredWorkers(filtered);
  }, [search, departmentFilter, statusFilter, workers]);

  // 🔹 Handle status change
  const handleStatusChange = async (workerId, newStatus) => {
    try {
      const token = localStorage.getItem("admintoken");
      if (!token) throw new Error("Admin token not found.");

      const res = await axios.patch(
        `http://localhost:5000/api/admin/updateWorkerStatus/${workerId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data.message);
      setWorkers((prev) =>
        prev.map((w) => (w._id === workerId ? { ...w, status: newStatus } : w))
      );
    } catch (err) {
      console.error("Error updating worker status:", err);
      toast.error(err.response?.data?.message || "Failed to update status.");
    }
  };

  // 🔹 Handle delete worker
  const handleDelete = (workerId, workerName) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2 p-2">
          <p className="font-medium text-gray-800">
            Delete <span className="font-semibold">{workerName}</span>?
          </p>
          <p className="text-sm text-gray-500">This action cannot be undone.</p>
          <div className="flex gap-3 justify-end mt-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  const token = localStorage.getItem("admintoken");
                  if (!token) throw new Error("Admin token not found.");

                  await axios.delete(
                    `http://localhost:5000/api/admin/deleteWorker/${workerId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );

                  toast.success("Worker deleted successfully.");
                  setWorkers((prev) => prev.filter((w) => w._id !== workerId));
                } catch (err) {
                  console.error("Error deleting worker:", err);
                  toast.error(
                    err.response?.data?.message || "Failed to delete worker."
                  );
                }
              }}
              className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition">
              Yes, Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300 transition">
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: 10000,
        style: {
          borderRadius: "10px",
          background: "#fff",
          color: "#333",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        },
      }
    );
  };

  if (loading)
    return <div className="text-center p-10 text-gray-600">Loading...</div>;
  if (error)
    return <div className="text-center p-10 text-red-500">{error}</div>;

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <Toaster position="top-center" />
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Worker Dashboard
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-md w-64"
        />

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-md">
          <option value="">All Departments</option>
          {[...new Set(workers.map((w) => w.department?.name))].map(
            (dept, i) =>
              dept && (
                <option key={i} value={dept}>
                  {dept}
                </option>
              )
          )}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-md">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="removed">Removed</option>
        </select>

        <button
          onClick={() => {
            setSearch("");
            setDepartmentFilter("");
            setStatusFilter("");
          }}
          className="bg-gray-100 text-gray-600 px-4 py-2 rounded-md hover:bg-gray-200">
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  Profile
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  Name / Contact
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  Department
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  ID Proof
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  Status
                </th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredWorkers.length ? (
                filteredWorkers.map((worker) => (
                  <tr key={worker._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <img
                        src={worker.profilePhotoUrl || "/default-profile.png"}
                        alt="Profile"
                        className="w-14 h-14 rounded-full object-cover border"
                      />
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        {worker.name} {worker.middleName || ""} {worker.surname}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {worker.email} | {worker.phone}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {worker.department || "—"}
                    </td>

                    <td className="px-6 py-4">
                      {worker.idProofUrl ? (
                        <button
                          onClick={() => setPreviewImage(worker.idProofUrl)}
                          className="text-blue-600 hover:underline flex items-center gap-1">
                          <Eye size={14} /> View
                        </button>
                      ) : (
                        <span className="text-gray-400">No proof</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={worker.status}
                        onChange={(e) =>
                          handleStatusChange(worker._id, e.target.value)
                        }
                        className={`px-2 py-1 text-sm rounded-md border ${
                          worker.status === "active"
                            ? "border-green-400 bg-green-50 text-green-700"
                            : worker.status === "suspended"
                            ? "border-yellow-400 bg-yellow-50 text-yellow-700"
                            : "border-red-400 bg-red-50 text-red-700"
                        }`}>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="removed">Removed</option>
                      </select>
                    </td>

                    <td className="px-6 py-4 space-x-3">
                      <button
                        onClick={() =>
                          navigate(`/workerdetails?id=${worker._id}`)
                        }
                        className="text-indigo-600 hover:underline">
                        View
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(worker._id, worker.name || "Worker")
                        }
                        className="text-red-600 hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-8 text-gray-500 italic">
                    No workers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
          onClick={() => setPreviewImage(null)}>
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-3xl max-h-[90vh] rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
}
