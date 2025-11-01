import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function WorkerDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const workerId = new URLSearchParams(location.search).get("id");

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [profileFile, setProfileFile] = useState(null);
  const [idProofFile, setIdProofFile] = useState(null);
  const [departments, setDepartments] = useState([]);

  // 🔹 Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem("admintoken");
        const res = await axios.get(
          "http://localhost:5000/api/admin/departments",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDepartments(res.data);
      } catch {
        toast.error("Failed to fetch departments");
      }
    };
    fetchDepartments();
  }, []);

  // 🔹 Fetch worker details
  useEffect(() => {
    const fetchWorker = async () => {
      try {
        const token = localStorage.getItem("admintoken");
        const res = await axios.get(
          `http://localhost:5000/api/admin/getWorkerById/${workerId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = res.data.data;
        const normalized = {
          ...data,
          address: {
            houseNo: data.address?.houseNo || "",
            street: data.address?.street || "",
            landmark: data.address?.landmark || "",
            area: data.address?.area || "",
            city: data.address?.city || "",
            district: data.address?.district || "",
            state: data.address?.state || "",
            pincode: data.address?.pincode || "",
          },
        };

        setWorker(normalized);
        setEditForm(normalized);
      } catch (error) {
        toast.error("Failed to fetch worker details");
      } finally {
        setLoading(false);
      }
    };
    if (workerId) fetchWorker();
  }, [workerId]);

  // 🔹 Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  // 🔹 Update worker details
  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("admintoken");

      // ✅ Clone and sanitize data
      const sanitized = { ...editForm };

      if (
        typeof sanitized.department === "object" &&
        sanitized.department?._id
      ) {
        sanitized.department = sanitized.department._id;
      }

      if (typeof sanitized.createdBy === "object" && sanitized.createdBy?._id) {
        sanitized.createdBy = sanitized.createdBy._id;
      }

      sanitized.address = {
        ...worker.address,
        ...sanitized.address,
      };

      const formData = new FormData();
      Object.entries(sanitized).forEach(([key, value]) => {
        if (key === "address") {
          formData.append("address", JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });

      if (profileFile) formData.append("profilePhoto", profileFile);
      if (idProofFile) formData.append("idProof", idProofFile);

      const res = await axios.put(
        `http://localhost:5000/api/admin/editWorker/${workerId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // ✅ Backend success response
      if (res.data.success) {
        toast.success("Worker updated successfully");

        let updatedWorker = res.data.data;

        if (typeof updatedWorker.department === "string") {
          const deptObj = departments.find(
            (d) => d._id === updatedWorker.department
          );
          if (deptObj) updatedWorker.department = deptObj;
        }

        setWorker(updatedWorker);
        setEditForm(updatedWorker);
        setEditing(false);
      } else {
        toast.error(res.data.message || "Update failed");
      }
    } catch (err) {
      console.error("❌ Worker update error:", err);
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  if (loading)
    return <div className="p-10 text-gray-600 text-center">Loading...</div>;
  if (!worker)
    return (
      <div className="p-10 text-gray-500 text-center">Worker not found</div>
    );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <Toaster position="top-center" reverseOrder={false} />

      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-xl p-6">
        {/* ===== Profile Header ===== */}
        <div className="flex items-center gap-6 mb-6">
          <img
            src={worker.profilePhoto || "/default-profile.png"}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border"
          />
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              {worker.name} {worker.middleName || ""} {worker.surname}
            </h2>
            <p className="text-gray-600">{worker.email}</p>
            <p className="text-gray-600">📞 {worker.phone}</p>
            <p className="text-gray-600">🧾 Employee ID: {worker.employeeId}</p>
          </div>
        </div>

        <hr className="my-4" />

        {/* ===== Form ===== */}
        <form
          onSubmit={handleUpdate}
          className="grid grid-cols-2 gap-6 text-gray-700">
          {/* Name fields */}
          {["name", "middleName", "surname"].map((field, i) => (
            <div key={i}>
              <h3 className="font-semibold text-lg mb-2">
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </h3>
              {editing ? (
                <input
                  type="text"
                  name={field}
                  value={editForm[field] || ""}
                  onChange={handleChange}
                  className="border rounded p-2 w-full"
                />
              ) : (
                <p>{worker[field] || "—"}</p>
              )}
            </div>
          ))}

          {/* Department */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Department</h3>
            {editing ? (
              <select
                name="department"
                value={
                  typeof editForm.department === "object"
                    ? editForm.department._id
                    : editForm.department || ""
                }
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    department: e.target.value,
                  }))
                }
                className="border rounded p-2 w-full">
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            ) : (
              <p>{worker.department?.name || "—"}</p>
            )}
          </div>

          {/* Experience */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Experience</h3>
            {editing ? (
              <input
                type="number"
                name="experience"
                value={editForm.experience || ""}
                onChange={handleChange}
                className="border rounded p-2 w-full"
              />
            ) : (
              <p>{worker.experience || 0} years</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Gender</h3>
            {editing ? (
              <select
                name="gender"
                value={editForm.gender || ""}
                onChange={handleChange}
                className="border rounded p-2 w-full">
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            ) : (
              <p>{worker.gender}</p>
            )}
          </div>

          {/* Block/Region */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Block/Region</h3>
            {editing ? (
              <input
                type="text"
                name="blockOrRegion"
                value={editForm.blockOrRegion || ""}
                onChange={handleChange}
                className="border rounded p-2 w-full"
              />
            ) : (
              <p>{worker.blockOrRegion}</p>
            )}
          </div>

          {/* Address */}
          <div className="col-span-2">
            <h3 className="font-semibold text-lg mb-2">Address</h3>
            {editing ? (
              <div className="grid grid-cols-3 gap-2">
                {[
                  "houseNo",
                  "street",
                  "area",
                  "city",
                  "district",
                  "state",
                  "pincode",
                ].map((field) => (
                  <input
                    key={field}
                    type="text"
                    placeholder={field}
                    value={editForm.address?.[field] || ""}
                    onChange={(e) => handleAddressChange(field, e.target.value)}
                    className="border rounded p-2"
                  />
                ))}
              </div>
            ) : (
              <p>
                {worker.address?.houseNo}, {worker.address?.street},{" "}
                {worker.address?.area}, {worker.address?.city},{" "}
                {worker.address?.district}, {worker.address?.state} -{" "}
                {worker.address?.pincode}
              </p>
            )}
          </div>

          {/* ID Proof */}
          <div className="col-span-2">
            <h3 className="font-semibold text-lg mb-2">ID Proof</h3>
            {editing ? (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setIdProofFile(e.target.files[0])}
                />
                {worker.idProof && (
                  <a
                    href={worker.idProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-600 hover:underline mt-1">
                    View Current ID Proof
                  </a>
                )}
              </>
            ) : worker.idProof ? (
              <a
                href={worker.idProof}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline">
                View ID Proof
              </a>
            ) : (
              <p className="text-gray-500">Not uploaded</p>
            )}
          </div>

          {/* Profile photo change */}
          {editing && (
            <div className="col-span-2 mt-4">
              <h3 className="font-semibold text-lg mb-2">
                Change Profile Photo
              </h3>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfileFile(e.target.files[0])}
              />
            </div>
          )}
        </form>

        {/* ===== Buttons ===== */}
        <div className="col-span-2 flex justify-between mt-8">
          <button
            type="button"
            onClick={() => (editing ? setEditing(false) : navigate(-1))}
            className="px-5 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300">
            {editing ? "Cancel" : "← Back"}
          </button>

          {editing ? (
            <button
              type="button"
              onClick={handleUpdate}
              className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
              Save Changes
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Edit Worker
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
