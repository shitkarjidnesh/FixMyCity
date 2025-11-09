import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function AdminReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
  });

 
useEffect(() => {
  fetchReport();
}, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("admintoken");
      const { data } = await axios.get(
        "http://localhost:5000/api/admin/reports/admin",
        {
          params: filters,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReport(data);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#ef4444", "#f97316", "#22c55e"]; // Pending, In Progress, Resolved

  const pieData = report
    ? [
        { name: "Pending", value: report.summary.pending },
        { name: "In Progress", value: report.summary.inProgress },
        { name: "Resolved", value: report.summary.resolved },
      ]
    : [];

  const barData = report
    ? report.workerRegistration.departmentWise.map((d) => ({
        department: d.department,
        workers: d.count,
      }))
    : [];

  return (
    <div className="p-6 font-sans h-full w-full">
      <h2 className="text-xl font-semibold mb-4">Admin Activity Dashboard</h2>

      {/* <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleChange}
          className="border border-gray-300 rounded px-3 py-2"
        />
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleChange}
          className="border border-gray-300 rounded px-3 py-2"
        />
        <button
          onClick={fetchReport}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          Generate
        </button>
      </div> */}

      {loading && <p className="text-blue-600 font-medium">Loading...</p>}

      {report && (
        <div className="space-y-6">
          <div className="bg-gray-50 border rounded p-4 shadow-sm">
            {" "}
            <h3 className="font-semibold text-lg mb-2">ADMIN Info</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <p>
                <strong>Name:</strong> {report.adminName}
              </p>
              <p>
                <strong>Email:</strong> {report.adminEmail}
              </p>
            </div>
          </div>
          {/* Complaint Summary */}
          <div className="bg-gray-50 border rounded p-4 shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Complaint Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <p>
                <strong>Total:</strong> {report.summary.totalComplaints}
              </p>
              <p>
                <strong>Pending:</strong> {report.summary.pending}
              </p>
              <p>
                <strong>In Progress:</strong> {report.summary.inProgress}
              </p>
              <p>
                <strong>Resolved:</strong> {report.summary.resolved}
              </p>
            </div>
          </div>
          <div className="bg-white border rounded p-5 shadow-lg">
            <h4 className="font-semibold text-lg mb-2 border-b pb-1">
              Complaints by Department
            </h4>
            <ul className="list-disc pl-6 text-sm space-y-1">
              {Object.entries(report.breakdown.byDepartment).map(
                ([dept, count]) => (
                  <li key={dept}>
                    <span className="font-medium">{dept}</span>: {count}
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Complaints Table */}
          <div className="bg-white border rounded p-5 shadow-lg">
            <h4 className="font-semibold text-lg mb-3 border-b pb-2">
              Complaint Details
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border text-sm print:text-xs">
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
                  {report.complaints.map((c, i) => (
                    <tr key={i} className="even:bg-gray-50 hover:bg-gray-100">
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

          {/* Worker Registration Summary */}

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border rounded p-6 shadow-sm">
            <div className="flex flex-col items-center">
              <h3 className="font-semibold mb-2">Complaint Status Chart</h3>
              <PieChart width={300} height={300}>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  label
                  dataKey="value">
                  {pieData.map((entry, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <ReTooltip />
                <Legend />
              </PieChart>
            </div>

            <div className="flex flex-col items-center">
              <h3 className="font-semibold mb-2">Workers by Department</h3>
              <BarChart width={350} height={300} data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis allowDecimals={false} />
                <ReTooltip />
                <Legend />
                <Bar dataKey="workers" fill="#3b82f6" />
              </BarChart>
            </div>
          </div>

          {/* Worker Summary */}
          <div className="bg-gray-50 border rounded p-4 shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Worker Registration</h3>
            <p>
              <strong>Total Workers Registered:</strong>{" "}
              {report.workerRegistration.totalWorkers}
            </p>

            <h4 className="font-semibold mt-3 mb-1">By Department</h4>
            <ul className="list-disc pl-6 text-sm">
              {report.workerRegistration.departmentWise.map((d) => (
                <li key={d.department}>
                  {d.department}: {d.count}
                </li>
              ))}
            </ul>
          </div>

          {/* Worker Table */}
          <div className="bg-white border rounded p-5 shadow-lg">
            <h4 className="font-semibold mb-3 text-lg border-b pb-2">
              Workers List
            </h4>

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-gray-100 text-gray-700 text-sm">
                  <tr className="border">
                    <th className="border px-3 py-2 text-left whitespace-nowrap">
                      Name
                    </th>
                    <th className="border px-3 py-2 text-left whitespace-nowrap">
                      Email
                    </th>
                    <th className="border px-3 py-2 text-center whitespace-nowrap">
                      Phone
                    </th>
                    <th className="border px-3 py-2 text-center whitespace-nowrap">
                      Department
                    </th>
                    <th className="border px-3 py-2 text-center whitespace-nowrap">
                      Created
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {report.workerRegistration.workers.map((w, i) => (
                    <tr
                      key={w.id}
                      className={`border ${
                        i % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-blue-50 transition`}>
                      <td className="border px-3 py-2 font-medium text-gray-800">
                        {w.name}
                      </td>
                      <td className="border px-3 py-2 text-gray-700">
                        {w.email}
                      </td>
                      <td className="border px-3 py-2 text-center text-gray-700">
                        {w.phone}
                      </td>
                      <td className="border px-3 py-2 text-center text-gray-700">
                        {w.department}
                      </td>
                      <td className="border px-3 py-2 text-center text-gray-700">
                        {w.createdAt}
                      </td>
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
