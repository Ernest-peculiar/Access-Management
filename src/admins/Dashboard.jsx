import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../api";
import "../styles/Admin.css";

function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Only fetch stats if user is admin
    try {
      const userCookie = Cookies.get("user");
      if (!userCookie) return;
      const user = JSON.parse(userCookie);
      if (user.role !== "admin") return;
    } catch {
      return;
    }

    async function fetchStats() {
      try {
        const token = Cookies.get("token");
        const res = await axios.get(`${API_BASE_URL}/api/admin/overview/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch {
        setStats(null);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="admin-dashboard">
      <h2>Dashboard Overview</h2>
      {!stats ? (
        <div>Loading...</div>
      ) : (
        <div className="admin-dashboard-cards">
          <div className="admin-dashboard-card">
            <div className="admin-dashboard-card-title">Users</div>
            <div className="admin-dashboard-card-value">{stats.users}</div>
          </div>
          <div className="admin-dashboard-card">
            <div className="admin-dashboard-card-title">Employees</div>
            <div className="admin-dashboard-card-value">{stats.employees}</div>
          </div>
          <div className="admin-dashboard-card">
            <div className="admin-dashboard-card-title">Devices</div>
            <div className="admin-dashboard-card-value">{stats.devices}</div>
          </div>
          <div className="admin-dashboard-card">
            <div className="admin-dashboard-card-title">Guests</div>
            <div className="admin-dashboard-card-value">{stats.guests}</div>
          </div>
          <div className="admin-dashboard-card">
            <div className="admin-dashboard-card-title">Messages</div>
            <div className="admin-dashboard-card-value">{stats.messages}</div>
          </div>
          <div className="admin-dashboard-card">
            <div className="admin-dashboard-card-title">Access Logs</div>
            <div className="admin-dashboard-card-value">{stats.access_logs}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
