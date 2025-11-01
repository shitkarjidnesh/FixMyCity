import { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Eye, Search, Filter } from "lucide-react";

export default function ActivityLogPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    success: "",
    targetType: "",
    performedByRole: "",
    action: "",
  });
  const [search, setSearch] = useState("");
  const [previewDetails, setPreviewDetails] = useState(null);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    limit: 50,
    totalPages: 0,
    totalRecords: 0,
  });

  useEffect(() => {
    fetchActivities(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pageInfo.limit]);

  const fetchActivities = async (page = pageInfo.page) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admintoken");
      if (!token) throw new Error("Admin token not found.");

      const params = {
        ...filters,
        search: search || undefined,
        page,
        limit: pageInfo.limit,
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === "") delete params[key];
      });

      const res = await axios.get("http://localhost:5000/api/admin/activity", {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        setActivities(res.data.data);
        setPageInfo({
          ...pageInfo,
          page: res.data.meta.currentPage,
          totalPages: res.data.meta.totalPages,
          totalRecords: res.data.meta.totalRecords,
        });
      } else {
        setActivities([]);
        toast.error(res.data.message || "No records found");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching activity logs");
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleFilterChange = (e) =>
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSearchChange = (e) => setSearch(e.target.value);
  const handleLimitChange = (e) => {
    setPageInfo({ ...pageInfo, limit: Number(e.target.value), page: 1 });
  };
  const onNext = () =>
    fetchActivities(Math.min(pageInfo.page + 1, pageInfo.totalPages));
  const onPrev = () => fetchActivities(Math.max(pageInfo.page - 1, 1));

  const viewDetails = (activity) => setPreviewDetails(activity);
  const closePreview = () => setPreviewDetails(null);

  const getSuccessColor = (success) => {
    return success
      ? "bg-green-100 text-green-700 border-green-200"
      : "bg-red-100 text-red-700 border-red-200";
  };

  const getRoleBadge = (role) => {
    return role === "superadmin"
      ? "bg-purple-100 text-purple-700"
      : "bg-blue-100 text-blue-700";
  };

  const inputStyle =
    "w-full sm:w-auto text-sm px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="p-4 sm:p-6 max-w-full mx-auto">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
        <p className="mt-2 text-gray-600">
          Track all admin actions and system events
        </p>
      </div>

      {/* Filters */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Filters</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by action..."
              value={search}
              onChange={handleSearchChange}
              className={`${inputStyle} pl-10 w-full`}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <select
            name="success"
            value={filters.success}
            onChange={handleFilterChange}
            className={inputStyle}>
            <option value="">All Status</option>
            <option value="true">Success</option>
            <option value="false">Failed</option>
          </select>
          <select
            name="targetType"
            value={filters.targetType}
            onChange={handleFilterChange}
            className={inputStyle}>
            <option value="">All Types</option>
            <option value="Admin">Admin</option>
            <option value="Worker">Worker</option>
            <option value="User">User</option>
            <option value="Complaint">Complaint</option>
            <option value="Department">Department</option>
          </select>
          <select
            name="performedByRole"
            value={filters.performedByRole}
            onChange={handleFilterChange}
            className={inputStyle}>
            <option value="">All Roles</option>
            <option value="superadmin">SuperAdmin</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading activity logs...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No activity logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performed By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remarks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activities.map((activity) => (
                  <tr key={activity._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className="text-sm font-semibold text-gray-900">
                          {activity.targetType}
                        </span>
                        {activity.targetId && (
                          <span className="text-xs text-gray-500 block">
                            ID: {activity.targetId._id?.slice(0, 8) || activity.targetId}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <span className="text-sm text-gray-900">
                          {activity.adminId?.name || "Unknown"}
                        </span>
                        <span
                          className={`inline-block ml-2 px-2 py-0.5 text-xs rounded-full ${getRoleBadge(
                            activity.performedByRole
                          )}`}>
                          {activity.performedByRole}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {activity.remarks || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getSuccessColor(
                          activity.success
                        )}`}>
                        {activity.success ? "✓ Success" : "✗ Failed"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(activity.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => viewDetails(activity)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span className="text-sm">View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && activities.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="text-sm text-gray-700">Rows per page:</label>
                <select
                  value={pageInfo.limit}
                  onChange={handleLimitChange}
                  className={inputStyle}>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <span className="text-sm text-gray-700">
                  {pageInfo.totalRecords} total records
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onPrev}
                  disabled={pageInfo.page <= 1 || loading}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {pageInfo.page} of {pageInfo.totalPages || 1}
                </span>
                <button
                  onClick={onNext}
                  disabled={
                    pageInfo.page >= pageInfo.totalPages || loading
                  }
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {previewDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  Activity Details
                </h2>
                <button
                  onClick={closePreview}
                  className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 gap-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Action</dt>
                  <dd className="mt-1 text-base text-gray-900">
                    {previewDetails.action}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Target Type
                  </dt>
                  <dd className="mt-1 text-base text-gray-900">
                    {previewDetails.targetType}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Performed By
                  </dt>
                  <dd className="mt-1 text-base text-gray-900">
                    {previewDetails.adminId?.name || "Unknown"} (
                    {previewDetails.adminId?.email})
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-block px-3 py-1 text-sm rounded-full ${getRoleBadge(
                        previewDetails.performedByRole
                      )}`}>
                      {previewDetails.performedByRole}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Remarks</dt>
                  <dd className="mt-1 text-base text-gray-900">
                    {previewDetails.remarks || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getSuccessColor(
                        previewDetails.success
                      )}`}>
                      {previewDetails.success ? "✓ Success" : "✗ Failed"}
                    </span>
                  </dd>
                </div>
                {previewDetails.details &&
                  Object.keys(previewDetails.details).length > 0 && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Additional Details
                      </dt>
                      <dd className="mt-1">
                        <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">
                          {JSON.stringify(previewDetails.details, null, 2)}
                        </pre>
                      </dd>
                    </div>
                  )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    User Agent
                  </dt>
                  <dd className="mt-1 text-base text-gray-900">
                    {previewDetails.userAgent || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Timestamp
                  </dt>
                  <dd className="mt-1 text-base text-gray-900">
                    {new Date(previewDetails.createdAt).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={closePreview}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

