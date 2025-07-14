// src/security/AttendanceLog.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../api";
import "./security.css";

function SecurityAccessLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = Cookies.get("token");
        const res = await axios.get(`${API_BASE_URL}/api/access-logs/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Ensure logs is always an array
        setLogs(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      } catch (err) {
        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          setError("Authentication failed. Please log in again.");
        } else {
          setError("Failed to fetch logs");
        }
        setLogs([]);
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="attendance-log-page">
      <h2>Recent Access Logs</h2>
      {loading && <p>Loading logs...</p>}
      {error && <p className="security-scan-error">{error}</p>}
      {!loading && !error && logs.length === 0 && <p>No logs found.</p>}
      {/* Debug: Show raw logs data */}
      {!loading && !error && logs.length > 0 && (
        <pre
          style={{
            background: "#f8f8f8",
            padding: "10px",
            borderRadius: "5px",
            fontSize: "0.95em",
          }}
        >
          {JSON.stringify(logs, null, 2)}
        </pre>
      )}
      <table className="log-table">
        <thead>
          <tr>
            <th>Person</th>
            <th>Type</th>
            <th>Device</th>
            <th>Action</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, idx) => (
            <tr key={idx}>
              <td>{log.person_name || "N/A"}</td>
              <td>{log.person_type}</td>
              <td>{log.device_serial}</td>
              <td>{log.status}</td>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SecurityAccessLog;
