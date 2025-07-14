import React from "react";
import { Routes, Route } from "react-router-dom";
import SecurityDashboard from "./Dashboard";
import "../styles/Admin.css";
import SecurityNavbar from "./SecurityNavbar";
import SecurityDevices from "./Devices";
import SecurityAccessLogScan from "./AccessLogScan";
import SecurityScan from "./Scan";

function Security() {
  // Prevent any dashboard fetch or redirect for employee dashboard here.
  // This component only loads admin dashboard and admin routes.
  return (
    <div className="admin-root">
      <SecurityNavbar />
      <div className="admin-main">
        <Routes>
          <Route index element={<SecurityDashboard />} />
          <Route path="" element={<SecurityDashboard />} />
          <Route path="devices" element={<SecurityDevices />} />
          <Route path="QRcode" element={<SecurityScan />} />
          <Route path="access-logs" element={<SecurityAccessLogScan />} />
          
          {/* Remove the catch-all route to prevent infinite redirects and 404s */}
        </Routes>
      </div>
    </div>
  );
}

export default Security;
