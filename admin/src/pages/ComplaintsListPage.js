import { useEffect, useState } from "react";
import axios from "axios";

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

const ComplaintCard = ({
  complaint,
  onStatusChange,
  onAssignClick,
  isUpdating,
}) => {
  const thumbnailUrl =
    complaint.imageUrls?.length > 0
      ? complaint.imageUrls[0]
      : "https://via.placeholder.com/150/e0e0e0/808080?text=No+Image";

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row w-full">
      {/* Left: Image */}
      <div className="md:w-1/4">
        <img
          src={thumbnailUrl}
          alt="Complaint"
          className="h-48 w-full object-cover md:h-full"
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

        {/* Full Complaint Details */}
        <div className="text-sm text-gray-700 space-y-1">
          <p>
            <strong>User:</strong> {complaint.userId?.name || "N/A"} (
            {complaint.userId?.email || "N/A"})
          </p>
          <p>
            <strong>Description:</strong> {complaint.description}
          </p>
          <p>
            <strong>Address:</strong> {complaint.address}
          </p>
          {complaint.latitude && complaint.longitude && (
            <p>
              <strong>Coordinates:</strong> {complaint.latitude},{" "}
              {complaint.longitude}
            </p>
          )}
          <p>
            <strong>Status:</strong> {complaint.status || "Pending"}
          </p>
          <p>
            <strong>Created At:</strong>{" "}
            {complaint.createdAt
              ? new Date(complaint.createdAt).toLocaleString()
              : "N/A"}
          </p>
          <p>
            <strong>Last Updated:</strong>{" "}
            {complaint.updatedAt
              ? new Date(complaint.updatedAt).toLocaleString()
              : "N/A"}
          </p>
        </div>

        {/* Images */}
        {complaint.imageUrls?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-3">
            {complaint.imageUrls.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`Complaint ${idx}`}
                className="h-32 w-32 object-cover rounded"
              />
            ))}
          </div>
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
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

// ====================================================================
// ComplaintsList Page (Updated to remove modal)
// ====================================================================
export default function ComplaintsList() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

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
      setComplaints(
        complaints.map((c) =>
          c._id === id ? { ...c, status: res.data.data.status } : c
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAssign = (complaintId) => {
    alert(`Assigning complaint ID: ${complaintId}`);
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
    </div>
  );
}
