import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

// 📊 Recharts
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function WorkerStatsPage() {
  const [sp] = useSearchParams();
  let workerId = sp.get("workerId");

  // ✅ You kept override for testing
  workerId = "69077502abb9c0f095f8d72a";

  const [stats, setStats] = useState(null);
  const [worker, setWorker] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const token = localStorage.getItem("admintoken");

  useEffect(() => {
    if (workerId) fetchStats();
  }, [workerId]);

  const fetchStats = async () => {
    const r = await axios.get("http://localhost:5000/api/admin/worker-stats", {
      params: { workerId },
      headers: { Authorization: `Bearer ${token}` },
    });

    setStats(r.data.stats);
    setWorker(r.data.worker);
    setComplaints(r.data.complaints);
  };

  if (!workerId) return <div>Missing workerId</div>;

  // ✅ Pie Chart Data
  const pieData = stats
    ? [
        { name: "In Progress", value: stats["In Progress"] || 0 },
        { name: "Resolved", value: stats.Resolved || 0 },
      ]
    : [];

  // ✅ Colors for slices
  const COLORS = ["#f59e0b", "#10b981"]; // amber, green

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Worker Complaint Stats</h2>

      {/* Worker Info */}
      {worker && (
        <div className="mb-6 border p-4 rounded bg-white shadow">
          <h3 className="text-lg font-semibold mb-2">Worker Details</h3>
          <div>Name: {worker.name}</div>
          <div>Email: {worker.email}</div>
          <div>Phone: {worker.phone}</div>
          <div>Department: {worker.department}</div>
        </div>
      )}

      {/* Summary */}
      {stats ? (
        <div className="mb-6 border p-4 rounded bg-white shadow">
          <h3 className="text-lg font-semibold mb-2">Summary</h3>
          <div>Total: {stats.total}</div>
          <div>In Progress: {stats["In Progress"]}</div>
          <div>Resolved: {stats.Resolved}</div>
        </div>
      ) : (
        <div>Loading stats...</div>
      )}

      {/* 📊 Pie Chart */}
      {stats && (
        <>
          <h3 className="text-lg font-semibold mb-2">Status Chart</h3>
          <div className="mb-6 border p-4 rounded bg-white shadow h-[500px] flex items-center justify-center">
            <div className="w-full h-full flex items-center justify-center">
              <ResponsiveContainer width="80%" height="80%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={100}
                    outerRadius={150}
                    dataKey="value"
                    label={({
                      name,
                      value,
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                    }) => {
                      const RADIAN = Math.PI / 180;
                      const radius =
                        innerRadius + (outerRadius - innerRadius) / 2;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text
                          x={x}
                          y={y}
                          fill="#fff"
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontWeight="600">
                          {value}
                        </text>
                      );
                    }}
                    labelLine={false}>
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={40} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Complaint list */}
      <h3 className="text-lg font-semibold mb-2">Complaints Assigned</h3>
      <div className="border rounded bg-white shadow p-4">
        {complaints.length === 0 ? (
          <div>No complaints found</div>
        ) : (
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Type</th>
                <th className="border p-2">Subtype</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Description</th>
                <th className="border p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c, i) => (
                <tr key={i}>
                  <td className="border p-2">{c.complaintType?.name}</td>
                  <td className="border p-2">{c.subtype}</td>
                  <td className="border p-2">{c.status}</td>
                  <td className="border p-2">{c.description}</td>
                  <td className="border p-2">
                    {new Date(c.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
