import React, { useState } from "react";
import axios from "axios";

export default function AdminReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    adminId: localStorage.getItem("adminId") || "",
    startDate: "",
    endDate: "",
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const fetchReport = async () => {
    if (!filters.adminId) {
      alert("Admin ID required");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("admintoken");

      const { data } = await axios.get(
        "http://localhost:5000/api/admin/reports/admin",
        {
          params: filters, // send adminId, startDate, endDate
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("✅ Fetched report:", data);
      setReport(data);
    } catch (err) {
      console.error("❌ Error fetching admin report:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>Admin Activity Report</h2>

      {/* Filters */}
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          name="adminId"
          placeholder="Admin ID"
          value={filters.adminId}
          onChange={handleChange}
          style={{ marginRight: "8px" }}
        />
        <input
          type="date"
          name="startDate"
          value={filters.startDate}
          onChange={handleChange}
          style={{ marginRight: "8px" }}
        />
        <input
          type="date"
          name="endDate"
          value={filters.endDate}
          onChange={handleChange}
          style={{ marginRight: "8px" }}
        />
        <button onClick={fetchReport}>Generate</button>
      </div>

      {loading && <p>Loading report...</p>}

      {report && (
        <>
          {/* Summary */}
          <div style={{ marginBottom: "10px" }}>
            <strong>Total:</strong> {report.summary.totalComplaints} |{" "}
            <strong>Pending:</strong> {report.summary.pending} |{" "}
            <strong>In Progress:</strong> {report.summary.inProgress} |{" "}
            <strong>Resolved:</strong> {report.summary.resolved}
          </div>

          {/* Department Breakdown */}
          <div style={{ marginBottom: "10px" }}>
            <h4>By Department</h4>
            <ul>
              {Object.entries(report.breakdown.byDepartment).map(
                ([dept, count]) => {
                  // 🔹 Defensive rendering in case backend sends objects or strings
                  const displayDept =
                    typeof dept === "object"
                      ? dept.name || JSON.stringify(dept)
                      : dept;
                  return (
                    <li key={displayDept}>
                      {displayDept}: {count}
                    </li>
                  );
                }
              )}
            </ul>
          </div>

          {/* Complaint Table */}
          <table
            border="1"
            cellPadding="6"
            style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#f2f2f2" }}>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Status</th>
                <th>Worker</th>
                <th>Dept</th>
                <th>Address</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {report.complaints.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.type || "N/A"}</td>
                  <td>{c.status}</td>
                  <td>{c.assignedWorker || "Unassigned"}</td>
                  <td>
                    {typeof c.workerDept === "object"
                      ? c.workerDept.name
                      : c.workerDept || "N/A"}
                  </td>
                  <td>
                    {typeof c.address === "object"
                      ? c.address.city || JSON.stringify(c.address)
                      : c.address}
                  </td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
