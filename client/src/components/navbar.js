// Navbar.js
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { auth, logout } = useContext(AuthContext);

  return (
    <nav className="flex justify-between items-center px-6 py-3 bg-gray-900 text-white">
      {/* Brand */}
      <Link to="/home" className="text-lg font-bold text-blue-400">
        FixMyCity
      </Link>

      {/* Links */}
      <div className="flex items-center gap-6">
        {/* Always visible */}
        <Link to="/home" className="hover:text-blue-400">
          Home
        </Link>

        {/* Role-based */}
        {auth.role === "user" && (
          <>
            <Link to="/report" className="hover:text-blue-400">
              Report Issue
            </Link>
            <Link to="/my-complaints" className="hover:text-blue-400">
              My Complaints
            </Link>
          </>
        )}

        {auth.role === "worker" && (
          <>
            <Link to="/tasks" className="hover:text-blue-400">
              My Tasks
            </Link>
            <Link to="/upload-proof" className="hover:text-blue-400">
              Upload Proof
            </Link>
          </>
        )}

        {/* Shared between user + worker */}
        {(auth.role === "user" || auth.role === "worker") && (
          <Link to="/help" className="hover:text-blue-400">
            Help
          </Link>
        )}

        {/* Auth controls */}
        {auth.token ? (
          <>
            <span className="text-gray-300">Hi, {auth.name}</span>
            <button
              onClick={logout}
              className="bg-red-500 px-3 py-1 rounded-md hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-blue-400">
              Login
            </Link>
            <Link to="/register" className="hover:text-blue-400">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
