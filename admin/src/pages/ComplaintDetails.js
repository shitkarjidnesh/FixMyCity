import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { ArrowLeft, X } from "lucide-react";
import { handleErrorToast } from "../utils/toastUtils";
import { handleResponseToast } from "../utils/toastUtils";

// Make sure you import your CSS file that has the map marker styles

//=================================================================
// 1. MAIN COMPONENT
//=================================================================
export default function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eligibleWorkers, setEligibleWorkers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const token = localStorage.getItem("admintoken");
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(
          `http://localhost:5000/api/admin/complaints/${id}`,
          { headers }
        );
        console.log(res.data.data);
        setComplaint(res.data.data);
      } catch (error) {
        handleErrorToast(error);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaint();
  }, [id]);

  // const handleStatusChange = async (status) => {
  //   try {
  //     const token = localStorage.getItem("admintoken");
  //     const headers = { Authorization: `Bearer ${token}` };
  //     const res = await axios.put(
  //       `http://localhost:5000/api/admin/complaints/${id}`,
  //       { status },
  //       { headers }
  //     );
  //     setComplaint(res.data.data); // Update with the full data from response
  //     toast.success("Status updated successfully");
  //   } catch {
  //     toast.error("Failed to update status");
  //   }
  // };
  const handleStatusChange = async (status) => {
    try {
      const token = localStorage.getItem("admintoken");
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.put(
        `http://localhost:5000/api/admin/complaints/${id}`,
        { status },
        { headers }
      );

      handleResponseToast(res, "Status updated successfully.");

      // ✅ Refetch the full complaint after update
      const refreshed = await axios.get(
        `http://localhost:5000/api/admin/complaints/${id}`,
        { headers }
      );
      setComplaint(refreshed.data.data);
    } catch (error) {
      handleErrorToast(error, "Failed to update status.");
    }
  };
  const handleOpenAssignModal = async () => {
    try {
      const token = localStorage.getItem("admintoken");
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.get(
        `http://localhost:5000/api/admin/eligible/${id}`,
        { headers }
      );

      if (!res.data?.success) {
        toast.error("Failed to load workers");
        return;
      }

      const workers = res.data.eligibleWorkers || [];

      // no worker available
      if (workers.length === 0) {
        toast.error("No eligible workers found for this complaint.");
        return;
      }

      // workers exist
      toast.success("Eligible workers loaded.");
      setEligibleWorkers(workers);
      setSelectedWorker(complaint?.assignedTo?._id || null);
      setIsModalOpen(true);
    } catch (error) {
      handleErrorToast(error, "Failed to fetch eligible workers.");
    }
  };

  const confirmAssignment = async () => {
    try {
      const token = localStorage.getItem("admintoken");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post(
        `http://localhost:5000/api/admin/complaints/assign/${id}`,
        { workerId: selectedWorker },
        { headers }
      );

      toast.success("Worker assigned successfully");
      setIsModalOpen(false);

      // refetch fresh complaint state
      const refreshed = await axios.get(
        `http://localhost:5000/api/admin/complaints/${id}`,
        { headers }
      );
      setComplaint(refreshed.data.data);
    } catch (err) {
      handleErrorToast(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p> {/* You can replace this with a spinner */}
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Complaint not found</p>
      </div>
    );
  }

  const { reportedBy, address, resolutionDetails } = complaint;

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-100 min-h-screen">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Complaints
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 truncate">
            {complaint.type?.name || complaint.subtype || "Complaint Details"}
          </h1>
          <p className="text-lg text-gray-600 mt-1">
            description : {complaint.description}
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (Main Content) - UPDATED */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Photos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Original Photo Card */}
              <InfoCard title="Original Photo">
                {complaint.imageUrls && complaint.imageUrls.length > 0 ? (
                  <img
                    src={complaint.imageUrls[0]}
                    alt="Original complaint"
                    className="w-full h-64 object-cover rounded-lg border border-gray-200"
                  />
                ) : (
                  <p className="text-gray-500 h-64 flex items-center justify-center">
                    No original photo provided.
                  </p>
                )}
              </InfoCard>

              {/* Resolution Photos Card */}
              <InfoCard title="Resolution Photos">
                {resolutionDetails?.resolutionPhotos?.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {resolutionDetails.resolutionPhotos.map((photo, i) => (
                      <img
                        key={i}
                        src={photo}
                        alt="Resolution proof"
                        className="w-full h-64 object-cover rounded-lg border border-gray-200"
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 h-64 flex items-center justify-center">
                    No resolution photos yet.
                  </p>
                )}
              </InfoCard>
            </div>

            {/* Map Card */}
            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Location</h3>
                {address && (
                  <p className="text-gray-700 mb-4">
                    {[
                      address.street,
                      address.landmark,
                      address.area,
                      address.city,
                      address.pincode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </div>
              <ComplaintMap complaint={complaint} />
            </div>
          </div>

          {/* Right Column (Sidebar) - UPDATED */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Status Manager Card */}
            <InfoCard title="Manage Status">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 font-medium">
                  Current Status:
                </span>
                <StatusBadge status={complaint.status} />
              </div>
              <div className="mt-4 space-y-2">
                {/* PENDING */}
                {complaint.status === "Pending" && (
                  <>
                    <button
                      onClick={handleOpenAssignModal}
                      className="w-full bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700">
                      Assign Worker
                    </button>

                    <button
                      onClick={() => handleStatusChange("Rejected")}
                      className="w-full bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700">
                      Reject Complaint
                    </button>

                   
                  </>
                )}

                {/* IN PROGRESS (worker uploaded proof) */}
                {complaint.status === "Need Verification" && (
                  <>
                    <button
                      onClick={() => handleStatusChange("Resolved")}
                      className="w-full bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700">
                      Approve Resolution
                    </button>

                    <button
                      onClick={() => handleStatusChange("Assigned")}
                      className="w-full bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700">
                      Reassign Worker
                    </button>
                  </>
                )}

                {/* ALREADY ASSIGNED */}
                {complaint.status === "Assigned" && (
                  <p className="text-gray-600 text-sm italic">
                    Worker assigned and working…
                  </p>
                )}

                {/* USER POST-RESOLUTION APPEAL */}
               

                {/* FINAL STATES */}
                {(complaint.status === "Resolved" ||
                  complaint.status === "Rejected") && (
                  <p className="text-gray-600 text-sm italic">
                    Complaint closed.
                  </p>
                )}
              </div>
            </InfoCard>

            {/* Assignment Card */}
            <InfoCard title="Assignment">
              {complaint.assignedTo ? (
                <div>
                  <p className="text-gray-700">
                    <strong>Worker:</strong> {complaint.assignedTo.name}{" "}
                    {complaint.assignedTo.surname}
                  </p>
                  <p className="text-gray-700 mt-1">
                    <strong>Department:</strong>{" "}
                    {complaint.assignedTo.department || "N/A"}
                  </p>
                  <p className="text-gray-700 mt-1">
                    <strong>Assigned By:</strong>{" "}
                    {complaint.assignedBy?.name || "N/A"}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">Not assigned yet.</p>
              )}
                {complaint.status === "Need Verification" && <button
                onClick={handleOpenAssignModal}
                className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors">
                {complaint.assignedTo ? "Reassign Worker" : "Assign Worker"}
              </button>}
            </InfoCard>

            {/* Resolution Details (Text) Card - MOVED HERE */}
            {resolutionDetails && (
              <InfoCard title="Resolution Details">
                <p className="text-gray-700">
                  <strong>Notes:</strong>{" "}
                  {resolutionDetails.resolutionNotes || "N/A"}
                </p>
                {resolutionDetails.resolvedBy && (
                  <p className="text-gray-700 mt-2">
                    <strong>Resolved By:</strong>{" "}
                    {resolutionDetails.resolvedBy.name}{" "}
                    {resolutionDetails.resolvedBy.surname}
                  </p>
                )}
                {resolutionDetails.resolvedAt && (
                  <p className="text-gray-700 mt-2">
                    <strong>Resolved On:</strong>{" "}
                    {new Date(resolutionDetails.resolvedAt).toLocaleString()}
                  </p>
                )}
              </InfoCard>
            )}

            {/* User Details Card */}
            <InfoCard title="User Details">
              {reportedBy ? (
                <>
                  <p className="text-gray-700">
                    <strong>Name:</strong> {reportedBy.name}{" "}
                    {reportedBy.surname || ""}
                  </p>
                  <p className="text-gray-700 mt-1">
                    <strong>Email:</strong> {reportedBy.email}
                  </p>

                  <p className="text-gray-700 mt-1">
                    <strong>Role:</strong> {reportedBy.role}
                  </p>
                  {complaint.userNote && complaint.userNote.length > 0 && (
                    <div className="mt-3">
                      <strong>User Notes:</strong>
                      <ul className="mt-1 space-y-1">
                        {complaint.userNote.map((n, i) => (
                          <li key={i} className="text-sm text-gray-700">
                            • {n.text}
                            <span className="text-xs text-gray-500">
                              {" "}
                              ({new Date(n.addedAt).toLocaleString()})
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <p>N/A</p>
              )}
            </InfoCard>
          </div>
        </div>
      </div>

      {/* Worker Modal */}
      <AssignWorkerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workers={eligibleWorkers}
        selectedWorker={selectedWorker}
        onSelectWorker={setSelectedWorker}
        onConfirm={confirmAssignment}
      />
    </>
  );
}

//=================================================================
// 2. HELPER COMPONENTS (in the same file)
//=================================================================

/**
 * A reusable wrapper to make all our sidebar cards look the same.
 */
function InfoCard({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg h-full">
      <h3 className="text-xl font-semibold mb-4 text-gray-900">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

/**
 * A reusable component to show the status pill.
 */
function StatusBadge({ status }) {
  const getStatusColor = () => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
      {status}
    </span>
  );
}

/**
 * The modal component for assigning a worker.
 */
function AssignWorkerModal({
  isOpen,
  onClose,
  workers,
  selectedWorker,
  onSelectWorker,
  onConfirm,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[2000] p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative z-[2001]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Assign Worker</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
          {workers.length > 0 ? (
            workers.map((w) => (
              <div
                key={w._id}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedWorker === w._id
                    ? "bg-blue-100 border-blue-500 ring-2 ring-blue-300"
                    : "border-gray-200 hover:bg-gray-100"
                }`}
                onClick={() => onSelectWorker(w._id)}>
                <div className="flex items-center gap-3 mb-2">
                  {w.profilePhoto ? (
                    <img
                      src={w.profilePhoto}
                      alt={`${w.name} ${w.surname}`}
                      className="w-12 h-12 rounded-full object-cover border border-gray-300 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center border border-gray-300 shrink-0">
                      <span className="text-xs text-white font-bold">
                        {w.name?.[0]}
                      </span>
                    </div>
                  )}

                  <div>
                    <p className="font-medium leading-tight">
                      {w.name} {w.surname}
                    </p>
                    <p className="text-sm text-gray-600 leading-tight">
                      {w.department?.name}
                    </p>
                    <p className="text-sm text-gray-600 leading-tight">
                      {w.blockOrRegion}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              No eligible workers found.
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!selectedWorker}
            className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-gray-300">
            Assign
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * The map component with custom marker logic.
 */
function ComplaintMap({ complaint }) {
  const { location, status, type } = complaint;
  const lat = location?.latitude;
  const lng = location?.longitude;

  // This function creates our new, styled marker
  const getMarkerIcon = (status) => {
    const statusColors = {
      Pending: "#f59e0b", // yellow-500
      "In Progress": "#3b82f6", // blue-500
      Resolved: "#22c55e", // green-500
      Rejected: "#6b7280", // gray-500
    };
    const color = statusColors[status] || "#6b7280";

    // Check if we should pulse (for active issues)
    const isPulsing = status === "Pending" || status === "In Progress";

    return L.divIcon({
      className: "custom-marker-container", // This class is for the container
      html: `
        <div 
          class="custom-marker-pin" 
          style="background: ${color};"
        ></div>
        ${
          isPulsing
            ? `<div class="pulse" style="box-shadow: 0 0 1px 2px ${color};"></div>`
            : ""
        }
      `,
      iconSize: [30, 42],
      iconAnchor: [15, 42],
      popupAnchor: [0, -42],
    });
  };

  if (!lat || !lng) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">No location data available.</p>
      </div>
    );
  }

  return (
    <div className="h-64 md:h-80 w-full">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[lat, lng]} icon={getMarkerIcon(status)}>
          <Popup>
            <strong>Status:</strong> {status} <br />
            <strong>Type:</strong> {type}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
