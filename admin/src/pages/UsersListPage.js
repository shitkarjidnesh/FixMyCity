import { useEffect, useState } from "react";
import axios from "axios";

export default function UsersList()  {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setError(null);
        setLoading(true);

        const token = localStorage.getItem("admintoken");
        if (!token) throw new Error("Admin token not found.");
      
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const res = await axios.get("http://localhost:5000/api/admin/users", {
          headers,
        });
        setUsers(res.data.data);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err.message || "Failed to fetch users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure? This will also delete all their complaints."
      )
    ) {
      setDeletingId(id);
      try {
        const authDataString = localStorage.getItem("auth");
        if (!authDataString) {
          throw new Error("No admin token found. Please log in.");
        }
        const token = JSON.parse(authDataString).token;
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
          headers,
        });
        setUsers(users.filter((u) => u._id !== id));
      } catch (err) {
        console.error("Error deleting user:", err);
        alert("Failed to delete user.");
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (loading) return <p className="text-center mt-8">Loading users...</p>;
  if (error) return <p className="text-center mt-8 text-red-500">{error}</p>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">All Users</h1>
      {users.length === 0 ? (
        <p className="text-center mt-8 text-gray-500">No users found.</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                {/* 1. Added new table headers */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  {/* 2. Added new table data cells */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.phone || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.address || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">
                    {user.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(user._id)}
                      disabled={deletingId === user._id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed">
                      {deletingId === user._id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

