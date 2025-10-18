import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

import Navbar from "./components/navbar";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ReportPage from "./pages/ReportPage";
import MyComplaintsPage from "./pages/MyComplaintsPage";
import ProfilePage from "./pages/ProfilePage";
import ContactPage from "./pages/ContactPage";
import PrivacyPage from "./pages/PrivacyPage";
import AboutPage from "./pages/about";
import Footer from "./components/Footer";

// A wrapper for routes that require authentication.
function PrivateRoute({ children }) {
  const { auth, loading } = useContext(AuthContext);

  if (loading) return null; // or a loader/spinner

  return auth.token ? children : <Navigate to="/login" />;
}


function App() {
  const { auth } = useContext(AuthContext);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
            <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Private Routes */}
          <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/report" element={<PrivateRoute><ReportPage /></PrivateRoute>} />
          <Route path="/my-complaints" element={<PrivateRoute><MyComplaintsPage /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to={auth.token ? "/" : "/login"} />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;