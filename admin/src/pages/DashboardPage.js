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
    //{ to: "/showadmin", text: "Admin" },
  ];

  const handleLogout = () => {
    logout(); // clear auth state & localStorage
    navigate("/login"); // redirect to login page
  };

  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4 flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
        <nav>
          <ul>
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`block py-2 px-4 rounded-md ${
                    location.pathname === link.to
                      ? "bg-gray-700"
                      : "hover:bg-gray-700"
                  }`}>
                  {link.text}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Logout Section at bottom */}
      <div className="border-t border-gray-700 pt-4">
        {auth.token ? (
          <button
            onClick={handleLogout}
            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">
            Logout
          </button>
        ) : (
          <Link
            to="/login"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">
            Login
          </Link>
        )}
      </div>
    </div>
  );
};

const DashboardPage = () => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-100">
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
        </Routes>
      </main>
    </div>
  );
};

export default DashboardPage;
