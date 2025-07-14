import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../api";
import "../styles/Admin.css";
import "../styles/Login.css";
import "../styles/AdminUser.css";

function AdminEmployees() {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editEmployee, setEditEmployee] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    user: "",
    full_name: "",
    department: "",
    position: "",
    staff_id: ""
  });
  const [employeeUsers, setEmployeeUsers] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [filter, setFilter] = useState({
    full_name: "",
    department: "",
    position: "",
    staff_id: ""
  });

  // Fetch users with role 'employee' for dropdown
  const fetchEmployeeUsers = async () => {
    try {
      const token = Cookies.get("token");
      const res = await axios.get(`${API_BASE_URL}/api/admin/users/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Only users with role 'employee'
      setEmployeeUsers(res.data.filter(u => u.role === "employee"));
    } catch (err) {
      setEmployeeUsers([]);
      console.error("Fetch employee users error:", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = Cookies.get("token");
      const res = await axios.get(`${API_BASE_URL}/api/admin/employees/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(res.data);
      setError("");
    } catch (err) {
      setEmployees([]);
      setError("Failed to fetch employees.");
      console.error("Fetch employees error:", err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchEmployeeUsers();
  }, []);

  const handleEdit = (emp) => {
    setEditingId(emp.id);
    setEditEmployee({ ...emp });
    setShowEditModal(true);
  };

  const handleEditModalClose = () => {
    setEditingId(null);
    setEditEmployee({});
    setShowEditModal(false);
  };

  const handleEditChange = (e) => {
    setEditEmployee({ ...editEmployee, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (id) => {
    try {
      const token = Cookies.get("token");
      await axios.patch(
        `${API_BASE_URL}/api/employee-profiles/${id}/`,
        editEmployee,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
      setEditEmployee({});
      setShowEditModal(false);
      fetchEmployees();
    } catch (err) {
      setError("Failed to update employee.");
      console.error("Update employee error:", err);
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = Cookies.get("token");
      await axios.delete(`${API_BASE_URL}/api/employee-profiles/${deleteId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchEmployees();
    } catch (err) {
      setError("Failed to delete employee.");
      setShowDeleteModal(false);
      setDeleteId(null);
      console.error("Delete employee error:", err);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

 const handleCreate = async (e) => {
  e.preventDefault();
  try {
    const token = Cookies.get("token");

    // Ensure user is submitted as an integer, not string
    const payload = {
      ...newEmployee,
      user: parseInt(newEmployee.user) // ✅ Convert user ID to integer
    };

    console.log("Submitting new employee data:", newEmployee);
    console.log("📦 Payload being sent to backend:", payload);

    await axios.post(
      `${API_BASE_URL}/api/employee-profiles/`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    // Reset form
    setNewEmployee({
      user: "",
      full_name: "",
      department: "",
      position: "",
      staff_id: ""
    });
    setShowModal(false);
    fetchEmployees();
  } catch (err) {
    setError("Failed to create employee.");

    if (err.response) {
      console.error("🚫 Validation errors from backend:", err.response.data);
      console.error("📦 Status Code:", err.response.status);
    } else if (err.request) {
      console.error("❌ No response from server. Request:", err.request);
    } else {
      console.error("⚠️ Error setting up request:", err.message);
    }
  }
};




  // Filtered employees
  const filteredEmployees = employees.filter(e =>
    (filter.full_name === "" || e.full_name.toLowerCase().includes(filter.full_name.toLowerCase())) &&
    (filter.department === "" || e.department.toLowerCase().includes(filter.department.toLowerCase())) &&
    (filter.position === "" || e.position.toLowerCase().includes(filter.position.toLowerCase())) &&
    (filter.staff_id === "" || e.staff_id.toLowerCase().includes(filter.staff_id.toLowerCase()))
  );

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(filteredEmployees.length / pageSize);

  // Paginated employees
  const paginatedEmployees = filteredEmployees.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="admin-table-page">
      <h2>Employees</h2>
      <div style={{ marginBottom: 12, display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ fontWeight: 500, marginRight: 8, color: "#444" }}>
          Filter employees by:
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
          placeholder="Department (type to filter)"
          value={filter.department}
          onChange={e => setFilter({ ...filter, department: e.target.value })}
        />
        <input
          className="login-input"
          style={{ width: 120 }}
          placeholder="Position (type to filter)"
          value={filter.position}
          onChange={e => setFilter({ ...filter, position: e.target.value })}
        />
        <input
          className="login-input"
          style={{ width: 100 }}
          placeholder="Staff ID (type to filter)"
          value={filter.staff_id}
          onChange={e => setFilter({ ...filter, staff_id: e.target.value })}
        />
        <button
          className="login-btn"
          style={{ background: "#aaa", fontSize: 14, padding: "6px 16px" }}
          onClick={() => setFilter({ full_name: "", department: "", position: "", staff_id: "" })}
          type="button"
        >
          Clear
        </button>
      </div>
      <button
        onClick={() => setShowModal(true)}
        className="adminuser-add-btn"
      >
        Add Employee
      </button>
      {showModal && (
        <div className="qr-modal-overlay adminuser-modal-overlay">
          <div className="qr-modal-content adminuser-modal-content">
            <div className="adminuser-modal-title">Add Employee</div>
            <form
              onSubmit={handleCreate}
              className="adminuser-modal-form"
            >
              <div className="login-input-group">
                <select
                  className="login-input"
                  name="user"
                  value={newEmployee.user}
                  onChange={e => setNewEmployee({ ...newEmployee, user: e.target.value })}
                  required
                >
                  <option value="">Select User</option>
                  {employeeUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.username}
                    </option>
                  ))}
                </select>
                <span className="login-input-label">User</span>
              </div>
              <div className="login-input-group">
                <input
                  className="login-input"
                  name="full_name"
                  value={newEmployee.full_name}
                  onChange={e => setNewEmployee({ ...newEmployee, full_name: e.target.value })}
                  placeholder=" "
                  required
                />
                <span className="login-input-label">Full Name</span>
              </div>
              <div className="login-input-group">
                <input
                  className="login-input"
                  name="department"
                  value={newEmployee.department}
                  onChange={e => setNewEmployee({ ...newEmployee, department: e.target.value })}
                  placeholder=" "
                  required
                />
                <span className="login-input-label">Department</span>
              </div>
              <div className="login-input-group">
                <input
                  className="login-input"
                  name="position"
                  value={newEmployee.position}
                  onChange={e => setNewEmployee({ ...newEmployee, position: e.target.value })}
                  placeholder=" "
                  required
                />
                <span className="login-input-label">Position</span>
              </div>
              <div className="login-input-group">
                <input
                  className="login-input"
                  name="staff_id"
                  value={newEmployee.staff_id}
                  onChange={e => setNewEmployee({ ...newEmployee, staff_id: e.target.value })}
                  placeholder=" "
                  required
                />
                <span className="login-input-label">Staff ID</span>
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
            <div className="adminuser-modal-title">Edit Employee</div>
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
                  name="full_name"
                  value={editEmployee.full_name || ""}
                  onChange={handleEditChange}
                  placeholder=" "
                  required
                />
                <span className="login-input-label">Full Name</span>
              </div>
              <div className="login-input-group">
                <input
                  className="login-input"
                  name="department"
                  value={editEmployee.department || ""}
                  onChange={handleEditChange}
                  placeholder=" "
                  required
                />
                <span className="login-input-label">Department</span>
              </div>
              <div className="login-input-group">
                <input
                  className="login-input"
                  name="position"
                  value={editEmployee.position || ""}
                  onChange={handleEditChange}
                  placeholder=" "
                  required
                />
                <span className="login-input-label">Position</span>
              </div>
              <div className="login-input-group">
                <input
                  className="login-input"
                  name="staff_id"
                  value={editEmployee.staff_id || ""}
                  onChange={handleEditChange}
                  placeholder=" "
                  required
                />
                <span className="login-input-label">Staff ID</span>
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
            <div style={{ margin: "20px 0" }}>Are you sure you want to delete this employee?</div>
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
            <th>Full Name</th>
            <th>Department</th>
            <th>Position</th>
            <th>Staff ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedEmployees.map(e => (
            <tr key={e.id}>
              {/* <td>{e.id}</td> */}
              <td style={{ display: "none" }}>{e.id}</td>
              <td>{e.full_name}</td>
              <td>{e.department}</td>
              <td>{e.position}</td>
              <td>{e.staff_id}</td>
              <td>
                <button
                  onClick={() => handleEdit(e)}
                  title="Edit"
                  className="adminuser-action-btn adminuser-edit-btn"
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path d="M14.7 3.29a1 1 0 0 1 1.41 0l.6.6a1 1 0 0 1 0 1.41l-8.48 8.48-2.12.71.71-2.12 8.48-8.48zM3 17h14"
                      stroke="#1bb76e" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(e.id)}
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

export default AdminEmployees;
