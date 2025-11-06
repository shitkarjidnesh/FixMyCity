import { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔹 Toaster placed here so component works standalone.
  // If you already have <Toaster /> at app root, you may remove this one.
  // It is safe to keep duplicates but better to have one in root.
  const ToasterUI = <Toaster position="top-center" />;

  // 🔹 Fetch Users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admintoken");
      if (!token) throw new Error("Admin token not found.");

      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(res.data.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("❌ Failed to fetch users.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Format Address
  const formatAddress = (address) => {
    if (!address) return "N/A";
    const parts = [
      address.houseNo,
      address.street,
      address.landmark,
      address.area,
      address.city,
      address.state && `${address.state} - ${address.pincode}`,
    ].filter(Boolean);
    return parts.join(", ");
  };

  // 🔹 Change Status (Suspend / Reactivate) using toast.promise
  const handleStatusChange = async (id, newStatus) => {
    setProcessingId(id);
    try {
      const token = localStorage.getItem("admintoken");
      if (!token) throw new Error("Admin token not found.");

      // axios.patch returns a promise — pass it to toast.promise
      const patchPromise = axios.patch(
        `http://localhost:5000/api/admin/users/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const res = await toast.promise(
        patchPromise,
        {
          pending:
            newStatus === "suspended"
              ? "Suspending user..."
              : "Reactivating user...",
          success:
            newStatus === "suspended"
              ? "🚫 User suspended successfully!"
              : "✅ User reactivated successfully!",
          error: "❌ Failed to update user status.",
        },
        { success: { duration: 3000 } }
      );

      // Update local UI after success
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, status: newStatus } : u))
      );
    } catch (err) {
      console.error("Error updating status:", err);
      // toast.promise already showed error message; this is fallback
      if (!toast.isActive()) toast.error("❌ Failed to update user status.");
    } finally {
      setProcessingId(null);
    }
  };

  // 🔹 Delete User — show a toast with Confirm/Cancel buttons (react-hot-toast supports JSX)
  const handleDelete = (id) => {
    // show persistent toast with actions
    const toastId = toast(
      (t) => (
        <div className="max-w-xs">
          <div className="font-medium mb-2">⚠️ Delete user?</div>
          <div className="text-sm text-gray-700 mb-3">
            This will permanently remove the user and their complaints.
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={async () => {
                // close the confirmation toast
                toast.dismiss(t.id);
                setProcessingId(id);

                try {
                  const token = localStorage.getItem("admintoken");
                  if (!token) throw new Error("Admin token not found.");

                  const deletePromise = axios.delete(
                    `http://localhost:5000/api/admin/users/${id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );

                  await toast.promise(deletePromise, {
                    pending: "Deleting user...",
                    success: "🗑️ User deleted successfully!",
                    error: "❌ Failed to delete user.",
                  });

                  // remove from UI
                  setUsers((prev) => prev.filter((u) => u._id !== id));
                } catch (err) {
                  console.error("Error deleting user:", err);
                  // toast.promise already handled error toast
                } finally {
                  setProcessingId(null);
                }
              }}
              className="bg-red-600 text-white text-xs px-3 py-1 rounded">
              Confirm
            </button>

            <button
              onClick={() => {
                toast.dismiss(t.id);
                // optional small info toast
                toast("❎ Deletion cancelled.");
              }}
              className="bg-gray-300 text-xs px-3 py-1 rounded">
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity, // keep it until user acts
      }
    );

    return toastId;
  };

  // 🔹 Loading State
  if (loading)
    return (
      <>
        {ToasterUI}
        <p className="text-center mt-8 text-gray-600">Loading users...</p>
      </>
    );

  return (
    <>
      {ToasterUI}
      <div className="p-6 sm:p-8">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          All Registered Users
        </h1>

        {users.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No users found.</p>
        ) : (
          <div className="bg-white shadow-xl rounded-xl overflow-x-auto">
            <table className="min-w-full text-sm border-collapse">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs sticky top-0">
                <tr>
                  {[
                    "Profile",
                    "Name",
                    "Email",
                    "Phone",
                    "Address",
                    "Role",
                    "Last Login",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th key={h} className="px-5 py-3 font-semibold text-left">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 transition-all duration-200">
                    {/* Profile */}
                    <td className="px-5 py-3">
                      {user.profilePhoto ? (
                        <img
                          src={user.profilePhoto}
                          alt="profile"
                          className="w-10 h-10 rounded-full object-cover border cursor-pointer hover:scale-110 transition-transform"
                          onClick={() => setPreviewImage(user.profilePhoto)}
                        />
                      ) : (
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-300 text-gray-700 font-bold">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </td>

                    {/* Name */}
                    <td className="px-5 py-3 font-medium text-gray-900">
                      {user.name}
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3 text-gray-700">{user.email}</td>

                    {/* Phone */}
                    <td className="px-5 py-3 text-gray-700">
                      {user.phoneNo || "N/A"}
                    </td>

                    {/* Address */}
                    <td className="px-5 py-3 text-gray-600">
                      {formatAddress(user.address)}
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3 capitalize">{user.role}</td>

                    {/* Last Login */}
                    <td className="px-5 py-3 text-gray-500">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleString("en-IN")
                        : "Never logged in"}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.status === "suspended"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}>
                        {user.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3 flex gap-4">
                      <button
                        onClick={() =>
                          handleStatusChange(
                            user._id,
                            user.status === "suspended" ? "active" : "suspended"
                          )
                        }
                        disabled={processingId === user._id}
                        className={`font-semibold ${
                          user.status === "suspended"
                            ? "text-green-600 hover:text-green-800"
                            : "text-yellow-600 hover:text-yellow-800"
                        } disabled:opacity-50`}>
                        {processingId === user._id
                          ? "Processing..."
                          : user.status === "suspended"
                          ? "Reactivate"
                          : "Suspend"}
                      </button>

                      <button
                        onClick={() => handleDelete(user._id)}
                        disabled={processingId === user._id}
                        className="text-red-600 font-semibold hover:text-red-800 disabled:opacity-50">
                        {processingId === user._id ? "Processing..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 🖼️ Profile Image Preview Modal */}
        {previewImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            onClick={() => setPreviewImage(null)}>
            <img
              src={previewImage}
              alt="Profile Preview"
              className="max-w-[90vw] max-h-[80vh] rounded-lg shadow-2xl border-4 border-white"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </>
  );
}
