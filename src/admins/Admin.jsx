import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import AdminDashboard from "./Dashboard";
import AdminUsers from "./Users";
import AdminEmployees from "./Employees";
import AdminDevices from "./Devices";
import AdminGuests from "./Guests";
import AdminMessages from "./Messages";
import AdminAccessLogs from "./AccessLogs";
import "../styles/Admin.css";

function Admin() {
  // Prevent any dashboard fetch or redirect for employee dashboard here.
  // This component only loads admin dashboard and admin routes.
  return (
    <div className="admin-root">
      <AdminNavbar />
      <div className="admin-main">
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="employees" element={<AdminEmployees />} />
          <Route path="devices" element={<AdminDevices />} />
          <Route path="guests" element={<AdminGuests />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="access-logs" element={<AdminAccessLogs />} />
          {/* Remove the catch-all route to prevent infinite redirects and 404s */}
        </Routes>
      </div>
    </div>
  );
}

export default Admin;
