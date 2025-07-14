import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../api";
import "../styles/Admin.css";
import "../styles/Login.css";
import "../styles/AdminUser.css";

function AdminDevices() {
  const [devices, setDevices] = useState([]);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editDevice, setEditDevice] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [newDevice, setNewDevice] = useState({
    device_name: "",
    serial_number: "",
    owner_employee_name: "",
    owner_guest_name: "",
    is_verified: false,
  });
  const [employeeList, setEmployeeList] = useState([]);
  const [guestList, setGuestList] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [filter, setFilter] = useState({
    device_name: "",
    serial_number: "",
    owner: "",
    is_verified: ""
  });
  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Fetch employees for dropdown
  const fetchEmployeeList = async () => {
    try {
      const token = Cookies.get("token");
      const res = await axios.get(`${API_BASE_URL}/api/admin/employees/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployeeList(res.data);
    } catch (err) {
      setEmployeeList([]);
      console.error("Fetch employee list error:", err);
    }
  };

  // Fetch guests for dropdown
  const fetchGuestList = async () => {
    try {
      const token = Cookies.get("token");
      const res = await axios.get(`${API_BASE_URL}/api/admin/guests/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGuestList(res.data);
    } catch (err) {
      setGuestList([]);
      console.error("Fetch guest list error:", err);
    }
  };

  const fetchDevices = async () => {
    try {
      const token = Cookies.get("token");
      const res = await axios.get(`${API_BASE_URL}/api/admin/devices/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDevices(res.data);
      setError("");
    } catch (err) {
      setDevices([]);
      setError("Failed to fetch devices.");
      console.error("Fetch devices error:", err);
    }
  };

  useEffect(() => {
    fetchDevices();
    fetchEmployeeList();
    fetchGuestList();
  }, []);

  const handleEdit = (device) => {
    setEditingId(device.id);
    setEditDevice({ ...device });
    setShowEditModal(true);
  };

  const handleEditModalClose = () => {
    setEditingId(null);
    setEditDevice({});
    setShowEditModal(false);
  };

  const handleEditChange = (e) => {
    setEditDevice({ ...editDevice, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (id) => {
    try {
      const token = Cookies.get("token");
      await axios.patch(
        `${API_BASE_URL}/api/devices/${id}/`,
        editDevice,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
      setEditDevice({});
      setShowEditModal(false);
      fetchDevices();
    } catch (err) {
      setError("Failed to update device.");
      console.error("Update device error:", err);
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = Cookies.get("token");
      await axios.delete(`${API_BASE_URL}/api/devices/${deleteId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchDevices();
    } catch (err) {
      setError("Failed to delete device.");
      setShowDeleteModal(false);
      setDeleteId(null);
      console.error("Delete device error:", err);
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
      await axios.post(
        `${API_BASE_URL}/api/devices/`,
        newDevice,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewDevice({
        device_name: "",
        serial_number: "",
        owner_employee_name: "",
        owner_guest_name: "",
        is_verified: false,
      });
      setShowModal(false);
      fetchDevices();
    } catch (err) {
      setError("Failed to create device.");
      console.error("Create device error:", err);
    }
  };

  // Filtered devices
  const filteredDevices = devices.filter(d =>
    (filter.device_name === "" || d.device_name.toLowerCase().includes(filter.device_name.toLowerCase())) &&
    (filter.serial_number === "" || d.serial_number.toLowerCase().includes(filter.serial_number.toLowerCase())) &&
    (filter.owner === "" ||
      (d.owner_employee_name && d.owner_employee_name.toLowerCase().includes(filter.owner.toLowerCase())) ||
      (d.owner_guest_name && d.owner_guest_name.toLowerCase().includes(filter.owner.toLowerCase()))
    ) &&
    (filter.is_verified === "" ||
      (filter.is_verified === "verified" ? d.is_verified : !d.is_verified))
  );

  // Paginated devices
  const paginatedDevices = filteredDevices.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="admin-table-page">
      <h2>Devices</h2>
      <div style={{ marginBottom: 12, display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ fontWeight: 500, marginRight: 8, color: "#444" }}>
          Filter devices by:
        </span>
        <input
          className="login-input"
          style={{ width: 140 }}
          placeholder="Device Name (type to filter)"
          value={filter.device_name}
          onChange={e => setFilter({ ...filter, device_name: e.target.value })}
        />
        <input
          className="login-input"
          style={{ width: 120 }}
          placeholder="Serial Number (type to filter)"
          value={filter.serial_number}
          onChange={e => setFilter({ ...filter, serial_number: e.target.value })}
        />
        <input
          className="login-input"
          style={{ width: 140 }}
          placeholder="Owner (type to filter)"
          value={filter.owner}
          onChange={e => setFilter({ ...filter, owner: e.target.value })}
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
          onClick={() => setFilter({ device_name: "", serial_number: "", owner: "", is_verified: "" })}
          type="button"
        >
          Clear
        </button>
      </div>
      <button
        onClick={() => setShowModal(true)}
        className="adminuser-add-btn"
      >
        Add Device
      </button>
      {showModal && (
        <div className="qr-modal-overlay adminuser-modal-overlay">
          <div className="qr-modal-content adminuser-modal-content">
            <div className="adminuser-modal-title">Add Device</div>
            <form
              onSubmit={handleCreate}
              className="adminuser-modal-form"
            >
              <div className="login-input-group">
                <input
                  className="login-input"
                  name="device_name"
                  value={newDevice.device_name}
                  onChange={e => setNewDevice({ ...newDevice, device_name: e.target.value })}
                  placeholder=" "
                  required
                />
                <span className="login-input-label">Device Name</span>
              </div>
              <div className="login-input-group">
                <input
                  className="login-input"
                  name="serial_number"
                  value={newDevice.serial_number}
                  onChange={e => setNewDevice({ ...newDevice, serial_number: e.target.value })}
                  placeholder=" "
                  required
                />
                <span className="login-input-label">Serial Number</span>
              </div>
              <div className="login-input-group">
                <select
                  className="login-input"
                  name="owner_employee_name"
                  value={newDevice.owner_employee_name}
                  onChange={e => setNewDevice({ ...newDevice, owner_employee_name: e.target.value })}
                >
                  <option value="">Select Employee</option>
                  {employeeList.map(emp => (
                    <option key={emp.id} value={emp.full_name}>
                      {emp.full_name}
                    </option>
                  ))}
                </select>
                <span className="login-input-label">Owner Employee Name</span>
              </div>
              <div className="login-input-group">
                <select
                  className="login-input"
                  name="owner_guest_name"
                  value={newDevice.owner_guest_name}
                  onChange={e => setNewDevice({ ...newDevice, owner_guest_name: e.target.value })}
                >
                  <option value="">Select Guest</option>
                  {guestList.map(guest => (
                    <option key={guest.id} value={guest.full_name}>
                      {guest.full_name}
                    </option>
                  ))}
                </select>
                <span className="login-input-label">Owner Guest Name</span>
              </div>
              <div className="adminuser-checkbox-row">
                <label>
                  Verified
                  <input
                    type="checkbox"
                    checked={newDevice.is_verified}
                    onChange={e => setNewDevice({ ...newDevice, is_verified: e.target.checked })}
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
            <div className="adminuser-modal-title">Edit Device</div>
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
                  name="device_name"
                  value={editDevice.device_name || ""}
                  onChange={handleEditChange}
                  placeholder=" "
                  required
                />
                <span className="login-input-label">Device Name</span>
              </div>
              <div className="login-input-group">
                <input
                  className="login-input"
                  name="serial_number"
                  value={editDevice.serial_number || ""}
                  onChange={handleEditChange}
                  placeholder=" "
                  required
                />
                <span className="login-input-label">Serial Number</span>
              </div>
              <div className="login-input-group">
                <select
                  className="login-input"
                  name="owner_employee_name"
                  value={editDevice.owner_employee_name || ""}
                  onChange={handleEditChange}
                >
                  <option value="">Select Employee</option>
                  {employeeList.map(emp => (
                    <option key={emp.id} value={emp.full_name}>
                      {emp.full_name}
                    </option>
                  ))}
                </select>
                <span className="login-input-label">Owner Employee Name</span>
              </div>
              <div className="login-input-group">
                <select
                  className="login-input"
                  name="owner_guest_name"
                  value={editDevice.owner_guest_name || ""}
                  onChange={handleEditChange}
                >
                  <option value="">Select Guest</option>
                  {guestList.map(guest => (
                    <option key={guest.id} value={guest.full_name}>
                      {guest.full_name}
                    </option>
                  ))}
                </select>
                <span className="login-input-label">Owner Guest Name</span>
              </div>
              <div className="adminuser-checkbox-row">
                <label>
                  Verified
                  <input
                    type="checkbox"
                    checked={!!editDevice.is_verified}
                    onChange={e => setEditDevice({ ...editDevice, is_verified: e.target.checked })}
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
            <div style={{ margin: "20px 0" }}>Are you sure you want to delete this device?</div>
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
            <th>Device Name</th>
            <th>Serial Number</th>
            <th>Owner</th>
            <th>Verified</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedDevices.map(d => (
            <tr key={d.id}>
              {/* <td>{d.id}</td> */}
              <td style={{ display: "none" }}>{d.id}</td>
              <td>
                {editingId === d.id ? (
                  <input
                    name="device_name"
                    value={editDevice.device_name}
                    onChange={handleEditChange}
                  />
                ) : (
                  d.device_name
                )}
              </td>
              <td>
                {editingId === d.id ? (
                  <input
                    name="serial_number"
                    value={editDevice.serial_number}
                    onChange={handleEditChange}
                  />
                ) : (
                  d.serial_number
                )}
              </td>
              <td>
                {editingId === d.id ? (
                  <>
                    <input
                      name="owner_employee_name"
                      value={editDevice.owner_employee_name || ""}
                      onChange={handleEditChange}
                      placeholder="Owner Employee"
                    />
                    <input
                      name="owner_guest_name"
                      value={editDevice.owner_guest_name || ""}
                      onChange={handleEditChange}
                      placeholder="Owner Guest"
                    />
                  </>
                ) : (
                  d.owner_employee_name || d.owner_guest_name
                )}
              </td>
              <td>
                {editingId === d.id ? (
                  <input
                    type="checkbox"
                    checked={!!editDevice.is_verified}
                    onChange={e => setEditDevice({ ...editDevice, is_verified: e.target.checked })}
                  />
                ) : (
                  d.is_verified ? "Yes" : "No"
                )}
              </td>
              <td>
                {editingId === d.id ? (
                  <>
                    <button onClick={() => handleUpdate(d.id)}>Save</button>
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEdit(d)}
                      title="Edit"
                      className="adminuser-action-btn adminuser-edit-btn"
                    >
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                        <path d="M14.7 3.29a1 1 0 0 1 1.41 0l.6.6a1 1 0 0 1 0 1.41l-8.48 8.48-2.12.71.71-2.12 8.48-8.48zM3 17h14"
                          stroke="#1bb76e" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(d.id)}
                      title="Delete"
                      className="adminuser-action-btn adminuser-delete-btn"
                    >
                      {/* Bin/trash icon */}
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                        <rect x="5" y="7" width="10" height="8" rx="2" stroke="#e53935" strokeWidth="1.5"/>
                        <path d="M8 9v4M12 9v4" stroke="#e53935" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M3 7h14" stroke="#e53935" strokeWidth="1.5" strokeLinecap="round"/>
                        <path d="M8 7V5a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v2" stroke="#e53935" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </>
                )}
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
          Page {page} of {Math.max(1, Math.ceil(filteredDevices.length / pageSize))}
        </span>
        <button
          className="login-btn"
          style={{ padding: "4px 12px", fontSize: 15 }}
          disabled={page === Math.ceil(filteredDevices.length / pageSize) || filteredDevices.length === 0}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default AdminDevices;
