// DashboardPage.jsx
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
import AdminReport from "./AdminReport";
import WorkerStatsPage from "./WorkerStatePage";
import AdminBlockPage from "./AdminBlockPage";
import UserReport from "./UserReport";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { auth, logout } = useContext(AuthContext);

  const commonLinks = [
    { to: "/", text: "Complaints" },
    { to: "/users", text: "Users" },
    { to: "/addWorker", text: "Add Worker" },
    { to: "/showWorker", text: "Workers" },
    { to: "/profile", text: "Profile" },
    { to: "/activity", text: "Activity Logs" },
    { to: "/adminreport", text: "Admin Report" },
    // { to: "/workerstats", text: "Worker stats" },
  ];

  const superAdminLinks = [
    { to: "/addAdmin", text: "Add Admin" },
    { to: "/showadmins", text: "Admins" },
    { to: "/addcomplaintstypes", text: "Complaint Types" },
    { to: "/departments", text: "Departments" },
    { to: "/blocks", text: "Blocks" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const NavItem = ({ link }) => (
    <Link
      key={link.to}
      to={link.to}
      className={`block py-2 px-4 rounded-md transition ${
        location.pathname === link.to ? "bg-gray-700" : "hover:bg-gray-700"
      }`}>
      {link.text}
    </Link>
  );

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col h-screen fixed left-0 top-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex-shrink-0">
        <h2 className="text-2xl font-bold">Admin Panel</h2>
        <p className="text-xs text-gray-400 mt-1">{auth.role}</p>
      </div>

      {/* Scrollable Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {commonLinks.map((link) => (
          <NavItem key={link.to} link={link} />
        ))}
        {auth.role === "superadmin" &&
          superAdminLinks.map((link) => <NavItem key={link.to} link={link} />)}
      </nav>

      {/* Logout fixed bottom */}
      <div className="border-t border-gray-700 p-4 flex-shrink-0">
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
  const { auth } = useContext(AuthContext);

  return (
    <div className="flex bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto ml-64 h-screen">
        <Routes>
          <Route path="/" element={<ComplaintsList />} />
          <Route path="/users" element={<UsersList />} />
          <Route path="/addWorker" element={<AddWorker />} />
          <Route path="/showWorker" element={<WorkerDashboard />} />
          <Route path="/profile" element={<AdminProfile />} />
          <Route path="/workerdetails" element={<WorkerDetails />} />
          <Route path="/activity" element={<ActivityLogPage />} />
          <Route path="/complaintdetails/:id" element={<ComplaintDetails />} />
          <Route path="/adminreport" element={<AdminReport />} />
          <Route path="/workerstats" element={<WorkerStatsPage />} />
          <Route path="/userreport" element={<UserReport />} />

          {auth.role === "superadmin" && (
            <>
              <Route path="/addAdmin" element={<AddAdmin />} />
              <Route path="/showadmins" element={<AdminList />} />
              <Route path="/showadmin" element={<AdminDetails />} />
              <Route
                path="/addcomplaintstypes"
                element={<AdminComplaintTypePage />}
              />
              <Route path="/departments" element={<AdminDepartmentPage />} />
              <Route path="/blocks" element={<AdminBlockPage />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  );
};

export default DashboardPage;
