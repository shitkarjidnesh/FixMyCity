import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

// Recharts
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function UserReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const userId = new URLSearchParams(location.search).get("userId");

  const token = localStorage.getItem("admintoken");

  useEffect(() => {
    if (userId) fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const r = await axios.get(
        "http://localhost:5000/api/admin/reports/user",
        {
          params: { userId },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData(r.data);
    } finally {
      setLoading(false);
    }
  };

  if (!userId) return <div>User ID not found</div>;

  const COLORS = ["#f97316", "#22c55e", "#ef4444"]; // InProgress, Resolved, Pending

  const pieData = data
    ? [
        { name: "Pending", value: data.summary.pending },
        { name: "In Progress", value: data.summary.inProgress },
        { name: "Resolved", value: data.summary.resolved },
      ]
    : [];

  return (
    <div className="p-6 w-full font-sans">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">
        ← Back
      </button>

      <h2 className="text-xl font-semibold mb-4">User Complaint Report</h2>

      {loading && <p className="text-blue-600 font-medium">Loading...</p>}

      {data && (
        <div className="space-y-6">
          {/* User Info */}
          <div className="bg-white border rounded p-4 shadow-sm">
            <h3 className="font-semibold text-lg mb-2">User Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <p>
                <strong>Name:</strong> {data.user.name}
              </p>
              <p>
                <strong>Email:</strong> {data.user.email}
              </p>
              <p>
                <strong>Phone:</strong> {data.user.phone}
              </p>
            </div>
          </div>

          {/* Summary Boxes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 border rounded shadow-sm text-center">
              <p className="text-lg font-bold">{data.summary.total}</p>
              <p className="text-gray-600 text-sm">Total Complaints</p>
            </div>

            <div className="p-4 bg-yellow-50 border rounded shadow-sm text-center">
              <p className="text-lg font-bold">{data.summary.pending}</p>
              <p className="text-gray-600 text-sm">Pending</p>
            </div>

            <div className="p-4 bg-orange-50 border rounded shadow-sm text-center">
              <p className="text-lg font-bold">{data.summary.inProgress}</p>
              <p className="text-gray-600 text-sm">In Progress</p>
            </div>

            <div className="p-4 bg-green-50 border rounded shadow-sm text-center">
              <p className="text-lg font-bold">{data.summary.resolved}</p>
              <p className="text-gray-600 text-sm">Resolved</p>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white border rounded p-5 shadow-lg">
            <h4 className="font-semibold text-lg mb-3 border-b pb-2 text-center">
              Complaint Status Breakdown
            </h4>

            <div className="h-[350px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label
                    dataKey="value">
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={40} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Complaints Table */}
          <div className="bg-white border rounded p-5 shadow-lg">
            <h4 className="font-semibold text-lg mb-3 border-b pb-2">
              Complaints Submitted
            </h4>

            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead className="bg-gray-200">
                  <tr>
                    {[
                      "Type",
                      "Status",
                      "Worker",
                      "Dept",
                      "Address",
                      "Created",
                    ].map((h) => (
                      <th key={h} className="border px-2 py-2">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.complaints.map((c, i) => (
                    <tr key={i} className="even:bg-gray-50">
                      <td className="border px-2 py-1">{c.type}</td>
                      <td className="border px-2 py-1">{c.status}</td>
                      <td className="border px-2 py-1">{c.assignedWorker}</td>
                      <td className="border px-2 py-1">
                        {typeof c.workerDept === "object"
                          ? c.workerDept?.name
                          : c.workerDept}
                      </td>
                      <td className="border px-2 py-1">{c.address}</td>
                      <td className="border px-2 py-1">{c.createdAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
