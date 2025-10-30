import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminProfile() {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("admintoken");
        const res = await axios.get("http://localhost:5000/api/admin/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setAdmin(res.data.admin);
        } else {
          toast.error(res.data.message || "Failed to fetch admin data");
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-700 animate-pulse">Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100">
      <ToastContainer position="top-center" autoClose={2000} theme="colored" />

      <div className="bg-white shadow-2xl rounded-3xl p-8 w-[90%] max-w-lg transition-all duration-500 hover:shadow-blue-300 animate-fadeIn">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <img
              src={
                admin?.profilePhoto ||
                "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              }
              alt="Profile"
              className="w-28 h-28 rounded-full border-4 border-indigo-200 shadow-lg object-cover"
            />
          </div>

          <h2 className="text-3xl font-bold text-gray-800 tracking-wide">
            {admin?.name || "Admin"}
          </h2>
          <p className="text-gray-500 text-sm">{admin?.email}</p>
        </div>

        <div className="mt-6 border-t pt-5 space-y-3 text-gray-700 text-base">
          <div className="flex justify-between">
            <span className="font-semibold">Phone:</span>
            <span>{admin?.phone || "N/A"}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Gender:</span>
            <span>{admin?.gender || "N/A"}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Date of Birth:</span>
            <span>
              {admin?.dob ? new Date(admin.dob).toLocaleDateString() : "N/A"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Employee ID:</span>
            <span>{admin?.governmentEmployeeId || "N/A"}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">ID Proof Type:</span>
            <span>{admin?.idProof?.type || "N/A"}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">ID Proof Number:</span>
            <span>{admin?.idProof?.number || "N/A"}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Block/Region:</span>
            <span>{admin?.blockOrRegion || "N/A"}</span>
          </div>

          <div className="flex justify-between">
            <span className="font-semibold">Address:</span>
            <span className="text-right">
              {admin?.address
                ? `${admin.address.houseNo || ""}, ${
                    admin.address.street || ""
                  }, ${admin.address.landmark || ""}, ${
                    admin.address.area || ""
                  }, ${admin.address.city || ""}, ${
                    admin.address.district || ""
                  }, ${admin.address.state || ""} - ${
                    admin.address.pincode || ""
                  }`
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
