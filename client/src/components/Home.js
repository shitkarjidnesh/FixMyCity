// import { BiCurrentLocation } from "react-icons/bi"; 
import { useEffect } from "react";
import Navbar from "./navbar";
import { Link } from "react-router-dom";

export default function HomePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 font-sans">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Online Geotagged Civic Complaint Portal
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Report civic issues like potholes, broken streetlights, and garbage
            with GPS and photo evidence. Track complaint status in real-time.
          </p>
          <Link
            to="/Report"
            className="inline-block bg-white text-blue-700 px-6 py-3 font-semibold rounded-2xl shadow hover:bg-gray-100"
          >
            Submit a Complaint
          </Link>
        </section>

        {/* Features Section */}
        <section className="py-16 px-8 grid md:grid-cols-4 gap-8 text-center">
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="mx-auto h-12 w-12 text-blue-600 mb-4 text-3xl">
              📍
            </div>
            <h3 className="font-semibold text-lg mb-2">Geo-Tagged Reports</h3>
            <p className="text-sm text-gray-600">
              Pin exact locations of civic issues using maps for accurate
              tracking.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="mx-auto h-12 w-12 text-blue-600 mb-4 text-3xl">
              📷
            </div>
            <h3 className="font-semibold text-lg mb-2">Photo Evidence</h3>
            <p className="text-sm text-gray-600">
              Upload images of potholes, garbage, or broken infrastructure.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="mx-auto h-12 w-12 text-blue-600 mb-4 text-3xl">
              👥
            </div>
            <h3 className="font-semibold text-lg mb-2">Community Engagement</h3>
            <p className="text-sm text-gray-600">
              View, comment, or vote on existing complaints to prioritise
              issues.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="mx-auto h-12 w-12 text-blue-600 mb-4 text-3xl">
              🛡️
            </div>
            <h3 className="font-semibold text-lg mb-2">
              Transparency & Accountability
            </h3>
            <p className="text-sm text-gray-600">
              Track complaints through statuses like New, In Progress, and
              Resolved.
            </p>
          </div>
        </section>

        {/* Workflow Section */}
        <section className="bg-gray-100 py-16 px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Complaint Workflow
          </h2>
          <div className="grid md:grid-cols-5 gap-6 text-center">
            {["New", "Acknowledged", "In Progress", "Resolved", "Verified"].map(
              (step, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow p-6">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {idx + 1}
                  </div>
                  <p className="font-medium">{step}</p>
                </div>
              )
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-indigo-700 text-white py-6 text-center">
          <p className="text-sm">
            © 2025 Civic Complaint Portal | Academic Demonstration Project
          </p>
        </footer>
      </div>
    </>
  );
}
//<BiCurrentLocation />