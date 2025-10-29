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
          toast.error(res.data.message);
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

  if (loading) return <p className="text-center mt-10 text-lg">Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        pauseOnHover
        theme="colored"
      />

      <div className="bg-white shadow-lg rounded-2xl p-8 w-[90%] max-w-md mt-6 space-y-3">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-4">
          Admin Profile
        </h2>

        {admin ? (
          <>
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {admin.name}
              </p>
              <p>
                <strong>Email:</strong> {admin.email}
              </p>
              <p>
                <strong>Phone:</strong> {admin.phone}
              </p>
              <p>
                <strong>Gender:</strong> {admin.gender}
              </p>
              <p>
                <strong>DOB:</strong> {new Date(admin.dob).toLocaleDateString()}
              </p>
              <p>
                <strong>Employee ID:</strong> {admin.employeeId}
              </p>
              <p>
                <strong>Government ID:</strong> {admin.govtId || "N/A"}
              </p>
              <p>
                <strong>Block/Region:</strong> {admin.blockOrRegion}
              </p>
              <p>
                <strong>Address:</strong> {admin.address}
              </p>
            </div>
          </>
        ) : (
          <p className="text-center text-red-500">No details found.</p>
        )}
      </div>
    </div>
  );
}
