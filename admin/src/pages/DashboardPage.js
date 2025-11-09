import React, { useContext } from "react";
import {
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import ComplaintsList from "./ComplaintsListPage";
import UsersList from "./UsersListPage";
import AddAdmin from "./AdminRegisterPage";
import AddWorker from "./WorkerRegistrationPage";
import { AuthContext } from "../context/AuthContext";
import WorkerDashboard from "./WorkerDashboard";
import AdminProfile from "./AdminProfile";
import AdminList from "./AdminList";
import AdminDetails from "./AdminDetails";
import WorkerDetails from "./WorkerDetails";
import AdminComplaintTypePage from "./AdminComplaintTypePage";
import AdminDepartmentPage from "./AdminDepartmentPage";
import ActivityLogPage from "./ActivityLogPage";
import ComplaintDetails from "./ComplaintDetails";
import AdminAudit from "./Testpage";
import AdminReport from "./AdminReport";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { auth, logout } = useContext(AuthContext);

  const navLinks = [
    { to: "/", text: "Complaints" },
    { to: "/users", text: "Users" },
    { to: "/addAdmin", text: "Add Admin" },
    { to: "/addWorker", text: "Add Worker" },
    { to: "/showWorker", text: "Worker" },
    { to: "/profile", text: "Profile" },
    { to: "/showadmins", text: "Admins" },
    { to: "/addcomplaintstypes", text: "Complaint Types" },
    { to: "/departments", text: "Departments" },
    { to: "/activity", text: "Activity Logs" },
    // { to: "/adminAudit", text: "Admin Audit" },
    { to: "/adminreport", text: "Admin Report" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col min-h-screen overflow-y-auto">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-2xl font-bold">Admin Panel</h2>
      </div>

      {/* Navigation Links (scrollable if overflow) */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`block py-2 px-4 rounded-md transition ${
              location.pathname === link.to
                ? "bg-gray-700"
                : "hover:bg-gray-700"
            }`}>
            {link.text}
          </Link>
        ))}
      </nav>

      {/* Logout Section */}
      <div className="border-t border-gray-700 p-4">
        {auth.token ? (
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition">
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="block px-3 py-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition">
            Login
          </Link>
        )}
      </div>
    </div>
  );
};

const DashboardPage = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <Routes>
          <Route path="/" element={<ComplaintsList />} />
          <Route path="/users" element={<UsersList />} />
          <Route path="/addAdmin" element={<AddAdmin />} />
          <Route path="/addWorker" element={<AddWorker />} />
          <Route path="/showWorker" element={<WorkerDashboard />} />
          <Route path="/profile" element={<AdminProfile />} />
          <Route path="/showadmins" element={<AdminList />} />
          <Route path="/showadmin" element={<AdminDetails />} />
          <Route path="/workerdetails" element={<WorkerDetails />} />
          <Route
            path="/addcomplaintstypes"
            element={<AdminComplaintTypePage />}
          />
          <Route path="/departments" element={<AdminDepartmentPage />} />
          <Route path="/activity" element={<ActivityLogPage />} />
          <Route path="/complaintdetails/:id" element={<ComplaintDetails />} />
          {/* <Route path="/adminAudit" element={<AdminAudit />} /> */}
          <Route path="/adminreport" element={<AdminReport />} />
        </Routes>
      </main>
    </div>
  );
};

export default DashboardPage;
