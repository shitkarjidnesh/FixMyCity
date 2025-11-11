import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

// ====================================================================
// StatusBadge Component
// ====================================================================
const StatusBadge = ({ status }) => {
  const statusStyles = {
    Pending: "bg-blue-100 text-blue-800",
    "In Progress": "bg-yellow-100 text-yellow-800",
    Resolved: "bg-green-100 text-green-800",
  };
  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        statusStyles[status] || "bg-gray-100 text-gray-800"
      }`}>
      {status}
    </span>
  );
};

// ====================================================================
// ComplaintCard Component
// ====================================================================
const ComplaintCard = ({
  complaint,
  onStatusChange,
  isUpdating,
  onCardClick,
}) => {
  const [previewImage, setPreviewImage] = useState(null);
  const thumbnailUrl =
    complaint.imageUrls?.length > 0
      ? complaint.imageUrls[0]
      : "https://via.placeholder.com/150/e0e0e0/808080?text=No+Image";

  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row w-full cursor-pointer"
      onClick={onCardClick}>
      {/* Left: Thumbnail */}
      <div className="md:w-1/4">
        <img
          src={thumbnailUrl}
          alt="Complaint"
          className="h-48 w-full object-cover md:h-full"
          onClick={(e) => {
            e.stopPropagation();
            setPreviewImage(thumbnailUrl);
          }}
        />
      </div>

      {/* Right: Info & Actions */}
      <div className="p-6 flex flex-col justify-between flex-grow space-y-3">
        {/* Type, Subtype & Status */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              {complaint.type?.name || "N/A"}
            </p>
            <h3 className="text-lg font-bold text-gray-900">
              {complaint.subtypeName || "N/A"}
            </h3>
          </div>
          <StatusBadge status={complaint.status || "Pending"} />
        </div>

        {/* Complaint Details */}
        <div className="text-sm text-gray-700 space-y-1">
          <p>
            <strong>User:</strong> {complaint.userId?.name || "N/A"} (
            {complaint.userId?.email || "N/A"})
          </p>
          <p>
            <strong>Department:</strong> {complaint.department?.name || "N/A"}
          </p>
          <p>
            <strong>Description:</strong> {complaint.description}
          </p>
          <p>
            <strong>Address:</strong>{" "}
            {complaint.address
              ? [
                  complaint.address.street,
                  complaint.address.landmark,
                  complaint.address.area,
                  complaint.address.city,
                ]
                  .filter(Boolean)
                  .join(", ")
              : "N/A"}
          </p>
          {complaint.latitude && complaint.longitude && (
            <p>
              <strong>Coordinates:</strong> {complaint.latitude},{" "}
              {complaint.longitude}
            </p>
          )}
          <p>
            <strong>Created:</strong>{" "}
            {new Date(complaint.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Assigned Worker Info */}
        {complaint.assignedTo ? (
          <div className="mt-3 border-t pt-3 text-sm text-gray-700">
            <h4 className="font-semibold text-gray-800 mb-2">
              Assigned Worker
            </h4>

            <div className="flex items-center gap-3 mb-2">
              <img
                src={
                  complaint.assignedTo.profilePhoto ||
                  "https://via.placeholder.com/50x50?text=No+Img"
                }
                alt="Worker"
                className="w-12 h-12 rounded-full object-cover border"
              />
              <div>
                <p className="font-semibold text-gray-900">
                  {complaint.assignedTo.name} {complaint.assignedTo.surname}
                </p>
                <p className="text-xs text-gray-600">
                  🏢 {complaint.assignedTo.department?.name || "N/A"} | 💼{" "}
                  {complaint.assignedTo.experience || "0"} yrs
                </p>
                <p className="text-xs text-gray-500">
                  📍 {complaint.assignedTo.blockOrRegion || "N/A"} | ⚙️{" "}
                  {complaint.assignedTo.status === "active"
                    ? "Active"
                    : "Inactive"}
                </p>
              </div>
            </div>

            {/* Assigned By (Admin Info) */}
            {complaint.assignedBy && (
              <div className="mt-3 border-t pt-3">
                <h4 className="font-semibold text-gray-800 mb-1">
                  Assigned By (Admin)
                </h4>
                <div className="flex items-center gap-3">
                  <img
                    src={
                      complaint.assignedBy.profilePhoto ||
                      "https://via.placeholder.com/50x50?text=Admin"
                    }
                    alt="Admin"
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {complaint.assignedBy.name} {complaint.assignedBy.surname}
                    </p>
                    <p className="text-xs text-gray-600">
                      📧 {complaint.assignedBy.email || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">
                      🏢 {complaint.assignedBy.blockOrRegion || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-3 text-sm text-gray-500 italic">
            No worker assigned yet.
          </p>
        )}

        {/* Actions */}
        {/* <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 pt-4 border-t border-gray-200">
          <select
            onChange={(e) => onStatusChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            value={complaint.status || "Pending"}
            disabled={isUpdating}
            className="border border-gray-300 rounded-md p-2 text-sm w-full sm:w-auto">
            {isUpdating && <option>Updating...</option>}
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div> */}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={(e) => {
            e.stopPropagation();
            setPreviewImage(null);
          }}>
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-4xl max-h-[80vh] object-contain rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
};

// ====================================================================
// ComplaintsList Page
// ====================================================================
export default function ComplaintsList() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalComplaints, setTotalComplaints] = useState(0);

  // Filter state
  const [filters, setFilters] = useState({
    status: "Pending",
    department: "",
    startDate: "",
    endDate: "",
    search: "",
  });

  // Dropdown data
  const [departments, setDepartments] = useState([]);
  const [complaintTypes, setComplaintTypes] = useState([]);

  const handleCardClick = (complaintId) => {
    navigate(`/complaintdetails/${complaintId}`);
  };

  // Fetch complaints
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setError(null);
        setLoading(true);
        const token = localStorage.getItem("admintoken");
        if (!token) throw new Error("Admin token not found.");
        const headers = { Authorization: `Bearer ${token}` };

        const queryParams = new URLSearchParams({
          page: currentPage,
          limit: itemsPerPage,
          ...filters,
        }).toString();

        const res = await axios.get(
          `http://localhost:5000/api/admin/complaints?${queryParams}`,
          { headers }
        );
        console.log("📦 Complaints Data:", res.data);
        setComplaints(res.data.data);
        setTotalPages(res.data.meta.totalPages);
        setTotalComplaints(res.data.meta.totalRecords);
      } catch (err) {
        console.error("Error fetching complaints:", err);
        setError(err.message || "Failed to fetch complaints.");
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, [currentPage, itemsPerPage, filters]);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem("admintoken");
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(
          "http://localhost:5000/api/admin/departments/all",
          { headers }
        );
        setDepartments(res.data.data);
      } catch (err) {
        console.error("Error fetching departments:", err);
        toast.error("Failed to fetch departments.");
      }
    };
    fetchDepartments();
  }, []);

  // Fetch complaint types
  useEffect(() => {
    const fetchComplaintTypes = async () => {
      try {
        const token = localStorage.getItem("admintoken");
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(
          "http://localhost:5000/api/admin/complaint-type/all",
          { headers }
        );
        setComplaintTypes(res.data.data);
      } catch (err) {
        console.error("Error fetching complaint types:", err);
        toast.error("Failed to fetch complaint types.");
      }
    };
    fetchComplaintTypes();
  }, []);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
    setCurrentPage(1); // Reset to first page on search change
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page on items per page change
  };

  // Status change handler
  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      const token = localStorage.getItem("admintoken");
      if (!token) throw new Error("Admin token not found.");
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.put(
        `http://localhost:5000/api/admin/complaints/${id}`,
        { status },
        { headers }
      );
      setComplaints((prev) =>
        prev.map((c) =>
          c._id === id ? { ...c, status: res.data.data.status } : c
        )
      );
      toast.success("Status updated successfully!");
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <p className="text-center mt-8">Loading complaints...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">All Complaints</h1>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:flex-wrap gap-4 items-end">
          {/* Status */}
          <div className="w-full md:w-48">
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 sm:text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Need Verification">Need Verification</option>

              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Department */}
          <div className="w-full md:w-48">
            <label
              htmlFor="department"
              className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <select
              id="department"
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 sm:text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500">
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex-1 w-full md:w-auto">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700">
              Search
            </label>
            <input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Search by description or address..."
              className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 sm:text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Items per page */}
          <div className="w-full md:w-auto flex items-center gap-2">
            <label
              htmlFor="itemsPerPage"
              className="text-sm font-medium text-gray-700">
              Items per page:
            </label>
            <select
              id="itemsPerPage"
              name="itemsPerPage"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="mt-1 block w-24 pl-3 pr-10 py-2 border-gray-300 sm:text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500">
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {complaints.length > 0 ? (
          complaints.map((complaint) => (
            <ComplaintCard
              key={complaint._id}
              complaint={complaint}
              onStatusChange={(newStatus) =>
                handleStatusChange(complaint._id, newStatus)
              }
              // onAssignClick={() => handleAssign(complaint._id)}
              isUpdating={updatingId === complaint._id}
              onCardClick={() => handleCardClick(complaint._id)}
            />
          ))
        ) : (
          <div className="text-center py-10 bg-white rounded-lg shadow-md">
            <p className="text-gray-500">No complaints found.</p>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 rounded-md text-gray-800 hover:bg-gray-400 disabled:opacity-50">
            Previous
          </button>
          <span className="text-gray-700">
            Page {currentPage} of {totalPages} ({totalComplaints} complaints)
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-300 rounded-md text-gray-800 hover:bg-gray-400 disabled:opacity-50">
            Next
          </button>
        </div>
      )}

      {/* Worker assignment modal */}
      {/* <WorkerAssignmentModal
        isOpen={isModalOpen}
        workers={eligibleWorkers}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmAssignment}
        filterCriteria={filterCriteria}
      /> */}
    </div>
  );
}
