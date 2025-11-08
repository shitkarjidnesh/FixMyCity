import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function AdminAudit() {
  const [filters, setFilters] = useState({
    adminId: "",
    targetType: "",
    action: "",
    success: "",
    start: "",
    end: "",
    page: 1,
    limit: 20,
  });

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("admintoken");

      const { data } = await axios.get(
        "http://localhost:5000/api/admin/audit/admin",

        {
          params: filters, // ✅ query params
          headers: { Authorization: `Bearer ${token}` }, // ✅ token included
        }
      );

      setRows(data.data);
      setTotal(data.total);
    } catch (err) {
      toast.error("Fetch failed");
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.page]);

  const onChange = (k, v) => {
    setFilters((x) => ({ ...x, [k]: v, page: 1 }));
  };

  const next = () => {
    if (filters.page * filters.limit < total)
      setFilters((x) => ({ ...x, page: x.page + 1 }));
  };
  const prev = () => {
    if (filters.page > 1) setFilters((x) => ({ ...x, page: x.page - 1 }));
  };

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        <input
          placeholder="Admin ID"
          className="border p-2"
          value={filters.adminId}
          onChange={(e) => onChange("adminId", e.target.value)}
        />
        <select
          className="border p-2"
          value={filters.targetType}
          onChange={(e) => onChange("targetType", e.target.value)}>
          <option value="">Target</option>
          <option>Complaint</option>
          <option>User</option>
          <option>Worker</option>
          <option>Admin</option>
          <option>Department</option>
        </select>
        <input
          placeholder="Action"
          className="border p-2"
          value={filters.action}
          onChange={(e) => onChange("action", e.target.value)}
        />
        <select
          className="border p-2"
          value={filters.success}
          onChange={(e) => onChange("success", e.target.value)}>
          <option value="">Result</option>
          <option value="true">Success</option>
          <option value="false">Fail</option>
        </select>
        <input
          type="date"
          className="border p-2"
          value={filters.start}
          onChange={(e) => onChange("start", e.target.value)}
        />
        <input
          type="date"
          className="border p-2"
          value={filters.end}
          onChange={(e) => onChange("end", e.target.value)}
        />
      </div>

      <button
        onClick={fetchData}
        className="bg-black text-white px-3 py-2 text-sm">
        Search
      </button>

      <div className="overflow-x-auto border">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Timestamp</th>
              <th className="p-2 text-left">Admin</th>
              <th className="p-2 text-left">Action</th>
              <th className="p-2 text-left">Target</th>
              <th className="p-2 text-left">Success</th>
              <th className="p-2 text-left">Details</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id} className="border-b">
                <td className="p-2">
                  {new Date(r.createdAt).toLocaleString()}
                </td>
                <td className="p-2">{r.adminId?.email}</td>
                <td className="p-2">{r.action}</td>
                <td className="p-2">
                  {r.targetType} / {r.targetId}
                </td>
                <td className="p-2">{r.success ? "✔" : "✖"}</td>
                <td className="p-2">
                  <pre className="max-w-[250px] overflow-auto whitespace-pre-wrap">
                    {JSON.stringify(r.details, null, 0)}
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2">
        <button
          onClick={prev}
          disabled={filters.page === 1}
          className="border px-3 py-1">
          Prev
        </button>
        <button
          onClick={next}
          disabled={filters.page * filters.limit >= total}
          className="border px-3 py-1">
          Next
        </button>
      </div>
    </div>
  );
}
