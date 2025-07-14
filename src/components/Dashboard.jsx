import React from "react";
import "../styles/Home.css";

function Dashboard() {
  return (
    <div className="dashboard-main-wrapper">
      <div className="dashboard-header-bar">
        <div className="dashboard-header-left">
          <span className="dashboard-menu-icon">&#9776;</span>
          <span className="dashboard-welcome">WELCOME (USER)</span>
        </div>
        <div className="dashboard-header-avatar">
          <img
            src="https://randomuser.me/api/portraits/men/1.jpg"
            alt="avatar"
            className="dashboard-avatar"
          />
        </div>
      </div>
      <div className="dashboard-content-card">
        <div className="dashboard-user-card">
          <div className="dashboard-user-name">Ndukuba Daniel</div>
          <div className="dashboard-user-id">S0001725</div>
          <button className="dashboard-id-btn">ID QR</button>
        </div>
        <div className="dashboard-notification">
          <span role="img" aria-label="notification">
            🔔
          </span>
        </div>
        <div className="dashboard-stats-row">
          <div className="dashboard-stat-box">
            <div className="dashboard-stat-value">3</div>
            <div className="dashboard-stat-label">Registered Devices</div>
          </div>
          <div className="dashboard-stat-box">
            <div className="dashboard-stat-value">5</div>
            <div className="dashboard-stat-label">Invited Guests</div>
          </div>
        </div>
        <div className="dashboard-attendance-section">
          <div className="dashboard-attendance-header">
            <span role="img" aria-label="attendance">
              🗓️
            </span>{" "}
            Attendance Record
          </div>
          <table className="dashboard-attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>20/09/2005</td>
                <td>07:08am</td>
                <td className="dashboard-status-in">In</td>
              </tr>
              <tr>
                <td>20/09/2005</td>
                <td>16:38pm</td>
                <td className="dashboard-status-out">Out</td>
              </tr>
              <tr>
                <td colSpan="3" style={{ height: 32 }}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
