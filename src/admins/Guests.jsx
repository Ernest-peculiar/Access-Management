import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../api";
import "../styles/Admin.css";
import "../styles/Login.css";
import "../styles/AdminUser.css";

function AdminGuests() {
  const [guests, setGuests] = useState([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState({
    full_name: "",
    phone: "",
    purpose: "",
    invited_by_name: "",
    visit_date: "",
    is_verified: ""
  });
  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(guests.length / pageSize);

  const fetchGuests = async () => {
    try {
      const token = Cookies.get("token");
      const res = await axios.get(`${API_BASE_URL}/api/admin/guests/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGuests(res.data);
      setError("");
    } catch (err) {
      setGuests([]);
      setError("Failed to fetch guests.");
      console.error("Fetch guests error:", err);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  // Filtered guests
  const filteredGuests = guests.filter(g =>
    (filter.full_name === "" || g.full_name.toLowerCase().includes(filter.full_name.toLowerCase())) &&
    (filter.phone === "" || g.phone.toLowerCase().includes(filter.phone.toLowerCase())) &&
    (filter.purpose === "" || g.purpose.toLowerCase().includes(filter.purpose.toLowerCase())) &&
    (filter.invited_by_name === "" || g.invited_by_name.toLowerCase().includes(filter.invited_by_name.toLowerCase())) &&
    (filter.visit_date === "" || g.visit_date.includes(filter.visit_date)) &&
    (filter.is_verified === "" ||
      (filter.is_verified === "verified" ? g.is_verified : !g.is_verified))
  );

  // Paginated guests
  const paginatedGuests = filteredGuests.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="admin-table-page">
      <h2>Guests</h2>
      <div style={{ marginBottom: 12, display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ fontWeight: 500, marginRight: 8, color: "#444" }}>
          Filter guests by:
        </span>
        <input
          className="login-input"
          style={{ width: 140 }}
          placeholder="Full Name (type to filter)"
          value={filter.full_name}
          onChange={e => setFilter({ ...filter, full_name: e.target.value })}
        />
        <input
          className="login-input"
          style={{ width: 120 }}
          placeholder="Phone (type to filter)"
          value={filter.phone}
          onChange={e => setFilter({ ...filter, phone: e.target.value })}
        />
        <input
          className="login-input"
          style={{ width: 120 }}
          placeholder="Purpose (type to filter)"
          value={filter.purpose}
          onChange={e => setFilter({ ...filter, purpose: e.target.value })}
        />
        <input
          className="login-input"
          style={{ width: 120 }}
          placeholder="Invited By (type to filter)"
          value={filter.invited_by_name}
          onChange={e => setFilter({ ...filter, invited_by_name: e.target.value })}
        />
        <input
          className="login-input"
          style={{ width: 120 }}
          placeholder="Visit Date (YYYY-MM-DD)"
          value={filter.visit_date}
          onChange={e => setFilter({ ...filter, visit_date: e.target.value })}
        />
        <select
          className="login-input"
          style={{ width: 120 }}
          value={filter.is_verified}
          onChange={e => setFilter({ ...filter, is_verified: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="verified">Verified</option>
          <option value="unverified">Unverified</option>
        </select>
        <button
          className="login-btn"
          style={{ background: "#aaa", fontSize: 14, padding: "6px 16px" }}
          onClick={() => setFilter({
            full_name: "",
            phone: "",
            purpose: "",
            invited_by_name: "",
            visit_date: "",
            is_verified: ""
          })}
          type="button"
        >
          Clear
        </button>
      </div>
      {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}
      <table className="admin-table">
        <thead>
          <tr>
            {/* <th>ID</th> */}
            <th style={{ display: "none" }}>ID</th>
            <th>Full Name</th>
            <th>Phone</th>
            <th>Purpose</th>
            <th>Invited By</th>
            <th>Visit Date</th>
            <th>Verified</th>
          </tr>
        </thead>
        <tbody>
          {paginatedGuests.map(g => (
            <tr key={g.id}>
              {/* <td>{g.id}</td> */}
              <td style={{ display: "none" }}>{g.id}</td>
              <td>{g.full_name}</td>
              <td>{g.phone}</td>
              <td>{g.purpose}</td>
              <td>{g.invited_by_name}</td>
              <td>{g.visit_date}</td>
              <td>{g.is_verified ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ marginTop: 18, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
        <button
          className="login-btn"
          style={{ padding: "4px 12px", fontSize: 15 }}
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </button>
        <span style={{ fontWeight: 500 }}>
          Page {page} of {Math.max(1, Math.ceil(filteredGuests.length / pageSize))}
        </span>
        <button
          className="login-btn"
          style={{ padding: "4px 12px", fontSize: 15 }}
          disabled={page === Math.ceil(filteredGuests.length / pageSize) || filteredGuests.length === 0}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default AdminGuests;
