import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../api";
import "../styles/Admin.css"; // Reuse same style

function SecurityDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Only fetch stats if user is security
    try {
      const userCookie = Cookies.get("user");
      if (!userCookie) return;
      const user = JSON.parse(userCookie);
      if (user.role !== "security") return;
    } catch {
      return;
    }

    async function fetchStats() {
      try {
        const token = Cookies.get("token");
        const res = await axios.get(`${API_BASE_URL}/api/security/dashboard/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data); // Make sure res.data matches your stat keys
      } catch {
        setStats(null);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard">
      <h2>Security Dashboard</h2>
      {!stats ? (
        <div>Loading...</div>
      ) : (
        <div className="admin-dashboard-cards">
          <div className="admin-dashboard-card">
            <div className="admin-dashboard-card-title">Total Devices</div>
            <div className="admin-dashboard-card-value">{stats.device_count}</div>
          </div>
          <div className="admin-dashboard-card">
            <div className="admin-dashboard-card-title">Verified Devices</div>
            <div className="admin-dashboard-card-value">{stats.verified_device_count}</div>
          </div>
          <div className="admin-dashboard-card">
            <div className="admin-dashboard-card-title">Guests Today</div>
            <div className="admin-dashboard-card-value">{stats.guests_today}</div>
          </div>
          <div className="admin-dashboard-card">
            <div className="admin-dashboard-card-title">Expected Guests</div>
            <div className="admin-dashboard-card-value">{stats.expected_guests_today}</div>
          </div>
          <div className="admin-dashboard-card">
            <div className="admin-dashboard-card-title">Access Logs</div>
            <div className="admin-dashboard-card-value">{stats.access_logs_today}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SecurityDashboard;
