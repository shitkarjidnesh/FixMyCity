// Home.js
import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import Navbar from "./navbar";

export default function Home() {
  const { auth, logout } = useContext(AuthContext);

  return (
     <>
     <Navbar></Navbar>
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 text-center">
        <h1 className="text-2xl font-bold mb-4">
          Welcome, {auth?.name || "User"} 👋
        </h1>

        <p className="text-gray-600 mb-6">
          You are logged in as{" "}
          <span className="font-semibold">{auth?.role}</span>
        </p>

        <div className="flex flex-col gap-3">
          <Link
            to="/profile"
            className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Go to Profile
          </Link>

          <button
            onClick={logout}
            className="bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
