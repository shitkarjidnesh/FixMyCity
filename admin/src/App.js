import React from "react";
import { Routes, Route } from "react-router-dom";
import AuthGuard from "./components/AuthGuard";

import AdminLoginPage from "./pages/AdminLoginPage";
import DashboardPage from "./pages/DashboardPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route
        path="/*"
        element={
          <AuthGuard>
            <DashboardPage />
          </AuthGuard>
        }
      />
    </Routes>
  );
}

export default App;