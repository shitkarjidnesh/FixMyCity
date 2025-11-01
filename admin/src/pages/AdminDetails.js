import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Briefcase,
  Users,
  Home,
} from "lucide-react";

// ===== HELPER: View Field Component =====
function ProfileField({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start">
      <Icon className="w-5 h-5 text-gray-500 mt-0.5" strokeWidth={1.5} />
      <div className="ml-3">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="text-base text-gray-900">
          {value || <span className="text-gray-400 text-sm">N/A</span>}
        </dd>
      </div>
    </div>
  );
}

// ===== HELPER: Edit Field Component =====
function EditField({ label, name, value, onChange, type = "text", children }) {
  const inputStyle =
    "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm";
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {type === "select" ? (
        <select
          id={name}
          name={name}
          value={value || ""}
          onChange={onChange}
          className={inputStyle}>
          {children}
        </select>
      ) : (
        <input
          type={type}
          id={name}
          name={name}
          value={value || ""}
          onChange={onChange}
          className={inputStyle}
        />
      )}
    </div>
  );
}

// ===== MAIN COMPONENT =====
export default function AdminDetails() {
  const [admin, setAdmin] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState(null); // Initialize as null
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null); // <-- Added state for preview
  const navigate = useNavigate();
  const location = useLocation();
  const adminId = new URLSearchParams(location.search).get("id");
  const isEditParam = new URLSearchParams(location.search).get("edit");

  useEffect(() => {
    if (adminId) fetchAdminDetails();
    if (isEditParam === "true") setEditMode(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminId]);

  const fetchAdminDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admintoken");
      const res = await axios.get(
        `http://localhost:5000/api/admin/getadmin/${adminId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.success) {
        setAdmin(res.data.admin);
        setEditForm({
          ...res.data.admin,
          address: res.data.admin.address || {},
        });
      } else toast.error("Failed to fetch admin");
    } catch (err) {
      toast.error("Error loading details");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) =>
    setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleAddressChange = (e) =>
    setEditForm({
      ...editForm,
      address: {
        ...editForm.address,
        [e.target.name]: e.target.value,
      },
    });

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("admintoken");

      // Prepare data for backend
      const dataToSend = {
        ...editForm,
        idProofType: editForm.idProof?.type || editForm.idProofType,
        idProofNumber: editForm.idProof?.number || editForm.idProofNumber,
      };
      // Remove nested idProof object if it exists
      delete dataToSend.idProof;

      const res = await axios.put(
        `http://localhost:5000/api/admin/showadmins/editadmin/${adminId}`,
        dataToSend,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Admin updated successfully");
        setAdmin(res.data.admin);
        setEditMode(false);
      } else toast.error(res.data.message);
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const formatAddress = (address) => {
    if (!address) return "N/A";
    const parts = [
      address.houseNo,
      address.street,
      address.landmark,
      address.area,
      address.city,
      address.district,
      address.state,
      address.pincode,
    ].filter(Boolean);
    return parts.join(", ");
  };

  if (loading || !admin || !editForm)
    return (
      <div className="p-8 text-center text-gray-600">Loading details...</div>
    );

  const fullName = `${admin.name || ""} ${admin.middleName || ""} ${
    admin.surname || ""
  }`;
  const statusColor =
    admin.status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto">
      <Toaster position="top-right" />
      <button
        onClick={() => navigate("/showadmins")}
        className="mb-4 text-sm text-blue-600 hover:underline">
        &larr; Back to Admin Directory
      </button>

      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        {/* --- Profile Header --- */}
        <div className="p-6 md:flex md:items-center md:justify-between md:gap-6 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-6">
            {admin.profilePhoto ? (
              <img
                src={admin.profilePhoto}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setPreviewImage(admin.profilePhoto)} // <-- Added onClick
                onError={(e) => {
                  e.target.src = `https://placehold.co/100x100/EBF4FF/76A9FA?text=${admin.name?.[0]?.toUpperCase()}`;
                }}
              />
            ) : (
              <div className="w-24 h-24 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-4xl shadow-inner">
                {admin.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="mt-4 md:mt-0">
              <h1 className="text-3xl font-bold text-gray-900">{fullName}</h1>
              <p className="text-lg text-gray-600 capitalize">
                Role: {admin.role}
              </p>
              <span
                className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-semibold capitalize ${statusColor}`}>
                {admin.status}
              </span>
            </div>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`mt-4 md:mt-0 px-4 py-2 rounded-md font-semibold shadow-sm transition-colors ${
              editMode
                ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}>
            {editMode ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {/* --- Profile Details / Edit Form --- */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {/* --- Column 1: Personal Info --- */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Personal Information
              </h3>
              {editMode ? (
                <>
                  {/* === Name Group === */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <EditField
                      label="First Name"
                      name="name"
                      value={editForm.name}
                      onChange={handleInputChange}
                    />
                    <EditField
                      label="Middle Name"
                      name="middleName"
                      value={editForm.middleName}
                      onChange={handleInputChange}
                    />
                    <EditField
                      label="Surname"
                      name="surname"
                      value={editForm.surname}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* === Contact Group === */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EditField
                      label="Email Address"
                      name="email"
                      type="email"
                      value={editForm.email}
                      onChange={handleInputChange}
                    />
                    <EditField
                      label="Phone Number"
                      name="phone"
                      value={editForm.phone}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* === Demographics Group === */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EditField
                      label="Gender"
                      name="gender"
                      value={editForm.gender}
                      onChange={handleInputChange}
                      type="select">
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </EditField>
                    <EditField
                      label="Date of Birth"
                      name="dob"
                      type="date"
                      value={editForm.dob ? editForm.dob.split("T")[0] : ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              ) : (
                <>
                  <ProfileField
                    icon={User}
                    label="Full Name"
                    value={fullName}
                  />
                  <ProfileField icon={Mail} label="Email" value={admin.email} />
                  <ProfileField
                    icon={Phone}
                    label="Phone"
                    value={admin.phone}
                  />
                  <ProfileField
                    icon={Users}
                    label="Gender"
                    value={admin.gender}
                  />
                  <ProfileField
                    icon={Calendar}
                    label="Date of Birth"
                    value={
                      admin.dob
                        ? new Date(admin.dob).toLocaleDateString("en-IN")
                        : "N/A"
                    }
                  />
                </>
              )}
            </div>

            {/* --- Column 2: Work & Address --- */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Work & Address
              </h3>
              {editMode ? (
                <>
                  {/* === Work Group === */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EditField
                      label="Role"
                      name="role"
                      value={editForm.role}
                      onChange={handleInputChange}
                      type="select">
                      <option value="admin">Admin</option>
                      <option value="superadmin">Superadmin</option>
                    </EditField>
                    <EditField
                      label="Block / Region"
                      name="blockOrRegion"
                      value={editForm.blockOrRegion}
                      onChange={handleInputChange}
                    />
                  </div>
                  <EditField
                    label="Government Employee ID"
                    name="governmentEmployeeId"
                    value={editForm.governmentEmployeeId}
                    onChange={handleInputChange}
                  />

                  {/* === ID Proof Group === */}
                  <h4 className="text-md font-semibold text-gray-700 pt-2">
                    ID Proof
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EditField
                      label="ID Proof Type"
                      name="idProofType"
                      value={
                        editForm.idProof?.type || editForm.idProofType || ""
                      }
                      onChange={handleInputChange}
                      type="select">
                      <option value="">Select ID Proof Type</option>
                      <option value="Aadhaar Card">Aadhaar Card</option>
                      <option value="PAN Card">PAN Card</option>
                      <option value="Voter ID">Voter ID</option>
                      <option value="Passport">Passport</option>
                      <option value="Other">Other</option>
                    </EditField>
                    <EditField
                      label="ID Proof Number"
                      name="idProofNumber"
                      value={
                        editForm.idProof?.number || editForm.idProofNumber || ""
                      }
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* === Address Group === */}
                  <h4 className="text-md font-semibold text-gray-700 pt-2">
                    Address
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EditField
                      label="House/Plot No."
                      name="houseNo"
                      value={editForm.address.houseNo}
                      onChange={handleAddressChange}
                    />
                    <EditField
                      label="Street / Locality"
                      name="street"
                      value={editForm.address.street}
                      onChange={handleAddressChange}
                    />
                    <EditField
                      label="Area"
                      name="area"
                      value={editForm.address.area}
                      onChange={handleAddressChange}
                    />
                    <EditField
                      label="City"
                      name="city"
                      value={editForm.address.city}
                      onChange={handleAddressChange}
                    />
                    <EditField
                      label="State"
                      name="state"
                      value={editForm.address.state}
                      onChange={handleAddressChange}
                    />
                    <EditField
                      label="Pincode"
                      name="pincode"
                      value={editForm.address.pincode}
                      onChange={handleAddressChange}
                    />
                  </div>
                </>
              ) : (
                <>
                  <ProfileField
                    icon={Briefcase}
                    label="Role"
                    value={admin.role}
                  />
                  <ProfileField
                    icon={MapPin}
                    label="Block / Region"
                    value={admin.blockOrRegion}
                  />
                  <ProfileField
                    icon={Home}
                    label="Full Address"
                    value={formatAddress(admin.address)}
                  />
                  <h4 className="text-md font-semibold text-gray-700 pt-2">
                    System IDs
                  </h4>
                  <ProfileField
                    icon={Shield}
                    label="Government Employee ID"
                    value={admin.governmentEmployeeId}
                  />
                  <ProfileField
                    icon={Shield}
                    label="ID Proof Type"
                    value={admin.idProof?.type || "N/A"}
                  />
                  <ProfileField
                    icon={Shield}
                    label="ID Proof Number"
                    value={admin.idProof?.number || "N/A"}
                  />
                  {admin.idProofImage && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        ID Proof Image
                      </dt>
                      <dd className="mt-1">
                        <a
                          href={admin.idProofImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline">
                          View ID Proof Image
                        </a>
                      </dd>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* --- Save Button --- */}
          {editMode && (
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-6 py-2 rounded-md shadow-sm font-semibold hover:bg-green-700 transition-colors">
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* --- 🖼️ Profile Image Preview Modal --- */}
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
