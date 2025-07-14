import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../api";
import "../styles/Admin.css";

function AdminAccessLogs() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState({
    person_type: "",
    person_id: "",
    device_serial: "",
    scanned_by: "",
    time_in: "",
    time_out: "",
    status: ""
  });

  useEffect(() => {
  async function fetchLogs() {
    try {
      const token = Cookies.get("token");
      const res = await axios.get(`${API_BASE_URL}/api/access-logs/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const logsData = Array.isArray(res.data)
        ? res.data
        : res.data.logs || [];

      setLogs(logsData);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
      setLogs([]);
    }
  }

  fetchLogs();
}, []);

  // Filtered logs
  const filteredLogs = logs.filter(l =>
    (filter.person_type === "" || l.person_type.toLowerCase().includes(filter.person_type.toLowerCase())) &&
    (filter.person_id === "" || String(l.person_id).toLowerCase().includes(filter.person_id.toLowerCase())) &&
    (filter.device_serial === "" || (l.device_serial || "").toLowerCase().includes(filter.device_serial.toLowerCase())) &&
    (filter.scanned_by === "" || (l.scanned_by || "").toLowerCase().includes(filter.scanned_by.toLowerCase())) &&
    (filter.time_in === "" || (l.time_in || "").includes(filter.time_in)) &&
    (filter.time_out === "" || (l.time_out || "").includes(filter.time_out)) &&
    (filter.status === "" || (l.status || "").toLowerCase().includes(filter.status.toLowerCase()))
  );

  return (
    <div className="admin-table-page">
      <h2>Access Logs</h2>
      <div style={{ marginBottom: 12, display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ fontWeight: 500, marginRight: 8, color: "#444" }}>
          Filter logs by:
        </span>
        <input
          className="login-input"
          style={{ width: 110 }}
          placeholder="Person Type"
          value={filter.person_type}
          onChange={e => setFilter({ ...filter, person_type: e.target.value })}
        />
        <input
          className="login-input"
          style={{ width: 90 }}
          placeholder="Person ID"
          value={filter.person_id}
          onChange={e => setFilter({ ...filter, person_id: e.target.value })}
        />
        <input
          className="login-input"
          style={{ width: 120 }}
          placeholder="Device Serial"
          value={filter.device_serial}
          onChange={e => setFilter({ ...filter, device_serial: e.target.value })}
        />
        <input
          className="login-input"
          style={{ width: 110 }}
          placeholder="Scanned By"
          value={filter.scanned_by}
          onChange={e => setFilter({ ...filter, scanned_by: e.target.value })}
        />
        <input
          className="login-input"
          style={{ width: 120 }}
          placeholder="Time In (YYYY-MM-DD)"
          value={filter.time_in}
          onChange={e => setFilter({ ...filter, time_in: e.target.value })}
        />
        <input
          className="login-input"
          style={{ width: 120 }}
          placeholder="Time Out (YYYY-MM-DD)"
          value={filter.time_out}
          onChange={e => setFilter({ ...filter, time_out: e.target.value })}
        />
        <input
          className="login-input"
          style={{ width: 90 }}
          placeholder="Status"
          value={filter.status}
          onChange={e => setFilter({ ...filter, status: e.target.value })}
        />
        <button
          className="login-btn"
          style={{ background: "#aaa", fontSize: 14, padding: "6px 16px" }}
          onClick={() => setFilter({
            person_type: "",
            person_id: "",
            device_serial: "",
            scanned_by: "",
            time_in: "",
            time_out: "",
            status: ""
          })}
          type="button"
        >
          Clear
        </button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Person Type</th>
            <th>Person ID</th>
            <th>Device Serial</th>
            <th>Scanned By</th>
            <th>Time In</th>
            <th>Time Out</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map(l => (
            <tr key={l.id}>
              <td>{l.id}</td>
              <td>{l.person_type}</td>
              <td>{l.person_id}</td>
              <td>{l.device_serial}</td>
              <td>{l.scanned_by}</td>
              <td>{l.time_in}</td>
              <td>{l.time_out}</td>
              <td>{l.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminAccessLogs;
