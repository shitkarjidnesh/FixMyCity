import { useEffect, useState } from "react";
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
  onAssignClick,
  isUpdating,
}) => {
  const [previewImage, setPreviewImage] = useState(null);
  const thumbnailUrl =
    complaint.imageUrls?.length > 0
      ? complaint.imageUrls[0]
      : "https://via.placeholder.com/150/e0e0e0/808080?text=No+Image";

  const worker = complaint.assignedWorker;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row w-full">
      {/* Left: Thumbnail */}
      <div className="md:w-1/4">
        <img
          src={thumbnailUrl}
          alt="Complaint"
          className="h-48 w-full object-cover md:h-full cursor-pointer"
          onClick={() => setPreviewImage(thumbnailUrl)}
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
                      complaint.assignedBy.profilePhoto||
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
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 pt-4 border-t border-gray-200">
          <select
            onChange={(e) => onStatusChange(e.target.value)}
            value={complaint.status || "Pending"}
            disabled={isUpdating}
            className="border border-gray-300 rounded-md p-2 text-sm w-full sm:w-auto">
            {isUpdating && <option>Updating...</option>}
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <button
            onClick={onAssignClick}
            className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-md text-sm w-full sm:w-auto hover:bg-blue-600">
            {worker ? "Reassign Worker" : "Assign Worker"}
          </button>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}>
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
// WorkerAssignmentModal Component
// ====================================================================
const WorkerAssignmentModal = ({
  workers,
  isOpen,
  onClose,
  onConfirm,
  filterCriteria,
}) => {
  const [selectedWorker, setSelectedWorker] = useState(null);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-6 relative">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Assign Worker</h2>
        <p className="text-sm text-gray-600 mb-3">
          <strong>Filter:</strong> {filterCriteria?.region} (
          {filterCriteria?.department})
        </p>

        {workers.length === 0 ? (
          <p className="text-gray-500">No eligible workers found.</p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {workers.map((w) => (
              <div
                key={w._id}
                className={`flex justify-between items-center border p-3 rounded-md cursor-pointer hover:bg-gray-100 ${
                  selectedWorker === w._id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200"
                }`}
                onClick={() => setSelectedWorker(w._id)}>
                <div className="flex items-center gap-3">
                  <img
                    src={
                      w.profilePhoto?.url ||
                      "https://via.placeholder.com/50x50?text=No+Img"
                    }
                    alt="Worker"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {w.name} {w.surname}
                    </p>
                    <p className="text-sm text-gray-600">
                      🏢 {w.department?.name || "N/A"} | 💼 {w.experience} yrs
                    </p>
                    <p className="text-xs text-gray-500">
                      📍 {w.blockOrRegion} | ⚙️{" "}
                      {w.status === "active" ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="worker"
                  checked={selectedWorker === w._id}
                  onChange={() => setSelectedWorker(w._id)}
                  className="h-4 w-4 text-blue-600"
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-md text-gray-800 hover:bg-gray-400">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedWorker)}
            disabled={!selectedWorker}
            className={`px-4 py-2 rounded-md text-white ${
              selectedWorker ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300"
            }`}>
            Confirm Assignment
          </button>
        </div>
      </div>
    </div>
  );
};

// ====================================================================
// ComplaintsList Page
// ====================================================================
export default function ComplaintsList() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eligibleWorkers, setEligibleWorkers] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState(null);
  const [activeComplaintId, setActiveComplaintId] = useState(null);

  // Fetch complaints
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setError(null);
        setLoading(true);
        const token = localStorage.getItem("admintoken");
        if (!token) throw new Error("Admin token not found.");
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(
          "http://localhost:5000/api/admin/complaints",
          { headers }
        );
        console.log("📦 Complaints Data:", res.data);
        setComplaints(res.data.data);
      } catch (err) {
        console.error("Error fetching complaints:", err);
        setError(err.message || "Failed to fetch complaints.");
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, []);

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

  // Open worker selection modal
  const handleAssign = async (complaintId) => {
    try {
      const token = localStorage.getItem("admintoken");
      if (!token) throw new Error("Admin token not found.");
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.get(
        `http://localhost:5000/api/admin/eligible/${complaintId}`,
        { headers }
      );

      const { eligibleWorkers, filterCriteria } = res.data;

      if (!eligibleWorkers.length) {
        toast.error(
          `No available workers found in ${
            filterCriteria?.region || "this region"
          }.`
        );
        return;
      }

      setEligibleWorkers(eligibleWorkers);
      setFilterCriteria(filterCriteria);
      setActiveComplaintId(complaintId);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Assign error:", err);
      toast.error("Failed to fetch eligible workers.");
    }
  };

  // Confirm worker assignment
  const handleConfirmAssignment = async (workerId) => {
    try {
      if (!workerId) {
        toast.error("Please select a worker to assign.");
        return;
      }

      const token = localStorage.getItem("admintoken");
      const headers = { Authorization: `Bearer ${token}` };
      const assignRes = await axios.post(
        `http://localhost:5000/api/admin/complaints/assign/${activeComplaintId}`,
        { workerId },
        { headers }
      );

      toast.success(
        `Complaint assigned to ${
          assignRes.data.worker?.name || "selected worker"
        }.`
      );
      setIsModalOpen(false);
    } catch (err) {
      console.error("Assignment error:", err);
      toast.error("Failed to assign worker.");
    }
  };

  if (loading) return <p className="text-center mt-8">Loading complaints...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">All Complaints</h1>

      <div className="flex flex-col gap-6">
        {complaints.length > 0 ? (
          complaints.map((complaint) => (
            <ComplaintCard
              key={complaint._id}
              complaint={complaint}
              onStatusChange={(newStatus) =>
                handleStatusChange(complaint._id, newStatus)
              }
              onAssignClick={() => handleAssign(complaint._id)}
              isUpdating={updatingId === complaint._id}
            />
          ))
        ) : (
          <div className="text-center py-10 bg-white rounded-lg shadow-md">
            <p className="text-gray-500">No complaints found.</p>
          </div>
        )}
      </div>

      {/* Worker assignment modal */}
      <WorkerAssignmentModal
        isOpen={isModalOpen}
        workers={eligibleWorkers}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmAssignment}
        filterCriteria={filterCriteria}
      />
    </div>
  );
}
