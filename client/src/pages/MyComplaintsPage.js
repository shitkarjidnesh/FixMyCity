import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import Card from "../components/ui/Card";

export default function MyComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/complaints", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        setComplaints(response.data.data);
      } catch (error) {
        console.error("Error fetching complaints:", error);
      } finally {
        setLoading(false);
      }
    };

    if (auth.token) {
      fetchComplaints();
    }
  }, [auth.token]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Complaints</h1>
        {loading ? (
          <p>Loading...</p>
        ) : complaints.length === 0 ? (
          <p>You have not filed any complaints yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {complaints.map((complaint) => (
              <Card key={complaint._id}>
                <img
                  src={complaint.imageUrl}
                  alt={complaint.type}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2">{complaint.type}</h2>
                  <p className="text-gray-600 mb-4">{complaint.description}</p>
                  <p className="text-sm text-gray-500 mb-4">{complaint.address}</p>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800`}
                  >
                    {complaint.status || 'New'}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}