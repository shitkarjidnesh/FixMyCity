import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

import AdminLoginPage from "./pages/AdminLoginPage";
import DashboardPage from "./pages/DashboardPage";

function PrivateRoute({ children }) {
  const { auth, loading } = useContext(AuthContext);

  // Wait until localStorage finishes loading
  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  // Redirect if not logged in
  if (!auth?.token) {
    return <Navigate to="/login" />;
  }

  return children;
}

function App() {
  const { auth } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/login" element={<AdminLoginPage />} />
      <Route path="/*" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
    </Routes>
  );
}

export default App;