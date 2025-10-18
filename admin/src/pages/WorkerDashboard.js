import React, { useEffect, useState } from "react";
import axios from "axios";

export default function WorkerDashboard() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const token = localStorage.getItem("admintoken");
        if (!token) throw new Error("Admin token not found.");

        const res = await axios.get(
          "http://localhost:5000/api/admin/showWorkers",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setWorkers(res.data);
      } catch (err) {
        console.error("Error fetching workers:", err);
        setError(err.message || "Failed to fetch worker data.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, []);

  const handleDelete = async (workerId) => {
    // Stub function for delete functionality
    if (window.confirm("Are you sure you want to delete this worker?")) {
      alert(`(Simulated) Deleting worker with ID: ${workerId}`);
      // In a real app, you would make an API call here:
      // await axios.delete(`/api/admin/workers/${workerId}`, { headers });
      // setWorkers(workers.filter(w => w._id !== workerId));
    }
  };

  // Improved loading state
  if (loading) {
    return <div className="text-center p-10">Loading workers...</div>;
  }

  // Improved error state
  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Worker Dashboard
      </h1>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">
                  Employee ID
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">
                  Added By
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">
                  Date Added
                </th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workers.length > 0 ? (
                workers.map((worker) => (
                  <tr
                    key={worker._id}
                    className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {worker.name}
                      </div>
                      <div className="text-gray-500">{worker.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {worker.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {worker.employeeId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {worker.createdBy?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {new Date(worker.dateAdded).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(worker._id)}
                        className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                // "Empty state" when no workers are found
                <tr>
                  <td colSpan="6" className="text-center py-10 text-gray-500">
                    No workers have been added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
