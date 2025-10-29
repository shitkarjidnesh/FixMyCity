import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Search, Eye, Pencil } from "lucide-react";

export default function AdminList() {
  const [admins, setAdmins] = useState([]);
  const [filters, setFilters] = useState({
    gender: "",
    blockOrRegion: "",
    role: "", // Added role to filters
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    limit: 10,
    totalPages: 0,
    totalRecords: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdmins(1); // Fetch page 1 when filters/search/limit change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, search, pageInfo.limit]);

  const fetchAdmins = async (page = pageInfo.page) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admintoken");
      if (!token) throw new Error("Admin token not found.");

      const res = await axios.get(
        "http://localhost:5000/api/admin/showadmins",
        {
          params: {
            ...filters,
            search,
            page,
            limit: pageInfo.limit,
            sort: "createdAt:desc",
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        setAdmins(res.data.admins);
        setPageInfo({
          ...pageInfo,
          page: res.data.meta.currentPage,
          totalPages: res.data.meta.totalPages,
          totalRecords: res.data.meta.totalRecords,
        });
      } else {
        setAdmins([]);
        toast.error(res.data.message || "No records found");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching admin data");
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---
  const handleFilterChange = (e) =>
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSearchChange = (e) => setSearch(e.target.value);
  const handleLimitChange = (e) => {
    setPageInfo({ ...pageInfo, limit: Number(e.target.value), page: 1 });
  };
  const onNext = () =>
    fetchAdmins(Math.min(pageInfo.page + 1, pageInfo.totalPages));
  const onPrev = () => fetchAdmins(Math.max(pageInfo.page - 1, 1));

  const handleStatusUpdate = async (adminId, newStatus) => {
    // Show a promise toast

    const token = localStorage.getItem("admintoken");
    if (!token) throw new Error("Admin token not found.");
    const promise = axios.patch(
      `http://localhost:5000/api/admin/showadmins/updatestatus/${adminId}`,
      { status: newStatus },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    toast.promise(promise, {
      loading: "Updating status...",
      success: (res) => {
        // Update UI locally without a full refetch for speed
        setAdmins((prevAdmins) =>
          prevAdmins.map((admin) =>
            admin._id === adminId ? { ...admin, status: newStatus } : admin
          )
        );
        return "Status updated successfully!";
      },
      error: (err) =>
        err.response?.data?.message || "Update failed. Please try again.",
    });
  };

  // --- Helpers ---
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 focus:ring-green-500";
      case "suspended":
        return "bg-yellow-100 text-yellow-700 focus:ring-yellow-500";
      default:
        return "bg-gray-100 text-gray-700 focus:ring-gray-500";
    }
  };

  const inputStyle =
    "w-full sm:w-auto text-sm px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="p-4 sm:p-6 max-w-full mx-auto">
      <Toaster position="top-right" />

      {/* --- Filters --- */}
      <div className="mb-4 p-4 bg-white rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by name, email, or phone"
              value={search}
              onChange={handleSearchChange}
              className={`${inputStyle} pl-10`}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-4">
            <select
              name="gender"
              value={filters.gender}
              onChange={handleFilterChange}
              className={inputStyle}>
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <select
              name="blockOrRegion"
              value={filters.blockOrRegion}
              onChange={handleFilterChange}
              className={inputStyle}>
              <option value="">All Regions</option>
              <option value="diva">Diva</option>
              <option value="thane">Thane</option>
              <option value="mumbai">Mumbai</option>
            </select>
            {/* --- Added Role Filter --- */}
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className={inputStyle}>
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- Table --- */}
      <div className="bg-white shadow-xl rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              {[
                "Profile",
                "Full Name",
                "Email",
                "Phone",
                "Gender",
                "DOB",
                "Block/Region",
                "Role", // Added Role Header
                "Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 font-semibold text-left tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                {/* Updated colSpan to 10 */}
                <td colSpan="10" className="text-center text-gray-500 p-6">
                  Loading admins...
                </td>
              </tr>
            ) : admins.length > 0 ? (
              admins.map((a) => (
                <tr
                  key={a._id}
                  className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-4 py-2">
                    {a.profilePhoto ? (
                      <img
                        src={a.profilePhoto}
                        alt="profile"
                        className="w-10 h-10 rounded-full object-cover border cursor-pointer hover:scale-110 transition-transform"
                        onClick={() => setPreviewImage(a.profilePhoto)}
                        onError={(e) => {
                          e.target.src = `https://placehold.co/100x100/EBF4FF/76A9FA?text=${a.name?.[0]?.toUpperCase()}`;
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-lg">
                        {a.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">{`${
                    a.name || ""
                  } ${a.middleName || ""} ${a.surname || ""}`}</td>
                  <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                    {a.email}
                  </td>
                  <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                    {a.phone}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">{a.gender}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {a.dob ? new Date(a.dob).toLocaleDateString("en-IN") : "-"}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {a.blockOrRegion || "-"}
                  </td>
                  {/* --- Added Role Column Data --- */}
                  <td className="px-4 py-2 whitespace-nowrap capitalize">
                    {a.role || "-"}
                  </td>
                  <td className="px-4 py-2">
                    {/* Styled select box for status change */}
                    <select
                      value={a.status}
                      onChange={(e) =>
                        handleStatusUpdate(a._id, e.target.value)
                      }
                      className={`text-xs px-2 py-1 rounded-md font-semibold border-none focus:outline-none focus:ring-2 ${getStatusColor(
                        a.status
                      )}`}>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={() => navigate(`/showadmin?id=${a._id}`)}
                      className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition shadow-sm"
                      title="View Details">
                      <Eye className="w-4 h-4" /> View
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/showadmin?id=${a._id}&edit=true`)
                      }
                      className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 transition shadow-sm"
                      title="Edit Admin">
                      <Pencil className="w-4 h-4" /> Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                {/* Updated colSpan to 10 */}
                <td colSpan="10" className="text-center text-gray-500 p-6">
                  No admins found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- Pagination --- */}
      {pageInfo.totalPages > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Rows per page:</span>
            <select
              value={pageInfo.limit}
              onChange={handleLimitChange}
              className="px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <span className="text-sm text-gray-700">
            Page {pageInfo.page} of {pageInfo.totalPages} (
            {pageInfo.totalRecords} records)
          </span>
          <div className="flex gap-2">
            <button
              onClick={onPrev}
              disabled={pageInfo.page <= 1 || loading}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              Previous
            </button>
            <button
              onClick={onNext}
              disabled={pageInfo.page >= pageInfo.totalPages || loading}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      )}

      {/* 🖼️ Profile Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}>
          <img
            src={previewImage}
            alt="Profile Preview"
            className="max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl border-4 border-white"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => {
              setPreviewImage(null);
              toast.error("Could not load preview image.");
            }}
          />
        </div>
      )}
    </div>
  );
}
