import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../api";
import "../styles/Admin.css";
import "../styles/Login.css"; // For login-style inputs
import "../styles/AdminUser.css"; // For add button style

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editUser, setEditUser] = useState({});
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", email: "", role: "employee", is_active: true, password: "" });
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [filter, setFilter] = useState({
    username: "",
    email: "",
    role: "",
    is_active: ""
  });
  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(users.length / pageSize);

  const fetchUsers = async () => {
    try {
      const token = Cookies.get("token");
      const res = await axios.get(`${API_BASE_URL}/api/admin/users/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
      setError("");
    } catch (err) {
      setUsers([]);
      setError("Failed to fetch users.");
      console.error("Fetch users error:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    setEditingId(user.id);
    setEditUser({ ...user });
    setShowEditModal(true);
  };

  const handleEditModalClose = () => {
    setEditingId(null);
    setEditUser({});
    setShowEditModal(false);
  };

  const handleEditChange = (e) => {
    setEditUser({ ...editUser, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (id) => {
    try {
      const token = Cookies.get("token");
      await axios.patch(
        `${API_BASE_URL}/api/employees/${id}/`,
        editUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
      setEditUser({});
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      setError("Failed to update user.");
      console.error("Update user error:", err);
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = Cookies.get("token");
      await axios.delete(`${API_BASE_URL}/api/employees/${deleteId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchUsers();
    } catch (err) {
      setError("Failed to delete user.");
      setShowDeleteModal(false);
      setDeleteId(null);
      console.error("Delete user error:", err);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(newUser.email)) {
    setError("Please enter a valid email address.");
    setShowModal(true);
    return;
  }
    try {
      const token = Cookies.get("token");
      await axios.post(
        `${API_BASE_URL}/api/users/`,
        newUser,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewUser({ username: "", email: "", role: "employee", is_active: true, password: "" });
    
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setError("Failed to create user.");
      console.error("Create user error:", err);
    }
  };

  // Filtered users
  const filteredUsers = users.filter(u =>
    (filter.username === "" || u.username.toLowerCase().includes(filter.username.toLowerCase())) &&
    (filter.email === "" || u.email.toLowerCase().includes(filter.email.toLowerCase())) &&
    (filter.role === "" || u.role === filter.role) &&
    (filter.is_active === "" || (filter.is_active === "active" ? u.is_active : !u.is_active))
  );

  // Paginated users
  const paginatedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="admin-table-page">
      <h2>Users</h2>
      <div style={{ marginBottom: 12, display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ fontWeight: 500, marginRight: 8, color: "#444" }}>
          Filter users by:
        </span>
        <input
          className="login-input"
          style={{ width: 120 }}
          placeholder="Username (type to filter)"
          value={filter.username}
          onChange={e => setFilter({ ...filter, username: e.target.value })}
        />
        <input
          className="login-input"
          style={{ width: 160 }}
          placeholder="Email (type to filter)"
          value={filter.email}
          onChange={e => setFilter({ ...filter, email: e.target.value })}
        />
        <select
          className="login-input"
          style={{ width: 120 }}
          value={filter.role}
          onChange={e => setFilter({ ...filter, role: e.target.value })}
        >
          <option value="">All Roles</option>
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
          <option value="security">Security</option>
        </select>
        <select
          className="login-input"
          style={{ width: 120 }}
          value={filter.is_active}
          onChange={e => setFilter({ ...filter, is_active: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button
          className="login-btn"
          style={{ background: "#aaa", fontSize: 14, padding: "6px 16px" }}
          onClick={() => setFilter({ username: "", email: "", role: "", is_active: "" })}
          type="button"
        >
          Clear
        </button>
      </div>
      <button
        onClick={() => setShowModal(true)}
        className="adminuser-add-btn"
      >
        Add User
      </button>
      {showModal && (
        <div className="qr-modal-overlay adminuser-modal-overlay">
          <div className="qr-modal-content adminuser-modal-content">
            <div className="adminuser-modal-title">Add User</div>
            <form
              onSubmit={handleCreate}
              className="adminuser-modal-form"
            >
              <div className="login-input-group">
                <input
                  className="login-input"
                  name="username"
                  value={newUser.username}
                  onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                  placeholder=" "
                  required
                />
                <span className="login-input-label">Username</span>
              </div>
              <div className="login-input-group">
                <input
                  className="login-input"
                  name="email"
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder=" "
                  required
                />
                <span className="login-input-label">Email</span>
              </div>
              <div className="login-input-group">
                <select
                  className="login-input"
                  name="role"
                  value={newUser.role}
                  onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                  <option value="security">Security</option>
                </select>
                <span className="login-input-label">Role</span>
              </div>
              {/* Password field removed */}
              <div className="adminuser-checkbox-row">
                <label>
                  Active
                  <input
                    type="checkbox"
                    checked={newUser.is_active}
                    onChange={e => setNewUser({ ...newUser, is_active: e.target.checked })}
                  />
                </label>
              </div>
              <div className="adminuser-modal-btn-row">
                <button type="submit" className="login-btn adminuser-create-btn">
                  Create
                </button>
                <button
                  type="button"
                  className="login-btn adminuser-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
              {error && <div className="login-error">{error}</div>}
            </form>
          </div>
        </div>
      )}
      {showEditModal && (
        <div className="qr-modal-overlay adminuser-modal-overlay">
          <div className="qr-modal-content adminuser-modal-content">
            <div className="adminuser-modal-title">Edit User</div>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleUpdate(editingId);
              }}
              className="adminuser-modal-form"
            >
              <div className="login-input-group">
                <input
                  className="login-input"
                  name="username"
                  value={editUser.username || ""}
                  onChange={handleEditChange}
                  placeholder=" "
                  required
                />
                <span className="login-input-label">Username</span>
              </div>
              <div className="login-input-group">
                <input
                  className="login-input"
                  name="email"
                  value={editUser.email || ""}
                  onChange={handleEditChange}
                  placeholder=" "
                  required
                />
                <span className="login-input-label">Email</span>
              </div>
              <div className="login-input-group">
                <select
                  className="login-input"
                  name="role"
                  value={editUser.role || ""}
                  onChange={handleEditChange}
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                  <option value="security">Security</option>
                </select>
                <span className="login-input-label">Role</span>
              </div>
              <div className="adminuser-checkbox-row">
                <label>
                  Active
                  <input
                    type="checkbox"
                    checked={!!editUser.is_active}
                    onChange={e => setEditUser({ ...editUser, is_active: e.target.checked })}
                  />
                </label>
              </div>
              <div className="adminuser-modal-btn-row">
                <button type="submit" className="login-btn adminuser-create-btn">
                  Save
                </button>
                <button
                  type="button"
                  className="login-btn adminuser-cancel-btn"
                  onClick={handleEditModalClose}
                >
                  Cancel
                </button>
              </div>
              {error && <div className="login-error">{error}</div>}
            </form>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="qr-modal-overlay adminuser-modal-overlay">
          <div className="qr-modal-content adminuser-modal-content" style={{ textAlign: "center" }}>
            <div className="adminuser-modal-title">Confirm Delete</div>
            <div style={{ margin: "20px 0" }}>Are you sure you want to delete this user?</div>
            <div className="adminuser-modal-btn-row">
              <button
                className="login-btn adminuser-create-btn"
                onClick={confirmDelete}
              >
                Yes, Delete
              </button>
              <button
                className="login-btn adminuser-cancel-btn"
                onClick={cancelDelete}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {error && <div style={{ color: "red", marginBottom: 10 }}>{error}</div>}
      <table className="admin-table">
        <thead>
          <tr>
            {/* <th>ID</th> */}
            <th style={{ display: "none" }}>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedUsers.map(u => (
            <tr key={u.id}>
              {/* <td>{u.id}</td> */}
              <td style={{ display: "none" }}>{u.id}</td>
              <td>{u.username}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.is_active ? "Yes" : "No"}</td>
              <td>
                <button
                  onClick={() => handleEdit(u)}
                  title="Edit"
                  className="adminuser-action-btn adminuser-edit-btn"
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path d="M14.7 3.29a1 1 0 0 1 1.41 0l.6.6a1 1 0 0 1 0 1.41l-8.48 8.48-2.12.71.71-2.12 8.48-8.48zM3 17h14"
                      stroke="#1bb76e" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(u.id)}
                  title="Delete"
                  className="adminuser-action-btn adminuser-delete-btn"
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <rect x="5" y="7" width="10" height="8" rx="2" stroke="#e53935" strokeWidth="1.5"/>
                    <path d="M8 9v4M12 9v4" stroke="#e53935" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M3 7h14" stroke="#e53935" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M8 7V5a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v2" stroke="#e53935" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </td>
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
          Page {page} of {totalPages || 1}
        </span>
        <button
          className="login-btn"
          style={{ padding: "4px 12px", fontSize: 15 }}
          disabled={page === totalPages || totalPages === 0}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default AdminUsers;
