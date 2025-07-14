import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../api";
import "../styles/Admin.css";
import "../styles/Login.css";
import "../styles/AdminUser.css";
import Modal from "../components/Modals";
import ReactDOM from "react-dom";

// Special QR modal using React Portal
function QRCodeModal({ url, onClose }) {
  if (!url) return null;
  return ReactDOM.createPortal(
    <div
      className="qr-modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.6)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="qr-modal-content"
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: "32px 24px",
          boxShadow: "0 4px 32px rgba(0,0,0,0.2)",
          textAlign: "center",
          minWidth: 320,
        }}
      >
        <h3 style={{ marginBottom: 18 }}>Device QR Code</h3>
        <img
          src={url}
          alt="QR Code"
          style={{
            width: "220px",
            height: "220px",
            marginBottom: 16,
            borderRadius: 8,
            boxShadow: "0 2px 8px #eee",
          }}
        />
        <div style={{ marginBottom: 18 }}>
          <button
            style={{
              background: "#1bb76e",
              color: "#fff",
              border: "none",
              padding: "8px 24px",
              borderRadius: 6,
              fontWeight: 500,
              fontSize: 16,
              cursor: "pointer",
            }}
            onClick={() => window.print()}
          >
            Print
          </button>
        </div>
        <button
          style={{
            background: "#e53935",
            color: "#fff",
            border: "none",
            padding: "8px 24px",
            borderRadius: 6,
            fontWeight: 500,
            fontSize: 16,
            cursor: "pointer",
          }}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>,
    document.body
  );
}

function SecurityDevices() {
  const [devices, setDevices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newDevice, setNewDevice] = useState({
    device_name: "",
    serial_number: "",
    owner_employee: "",
    owner_guest: "",
    qr_code: "",
    is_verified: false,
  });
  const [employeeList, setEmployeeList] = useState([]);
  const [guestList, setGuestList] = useState([]);
  const [error, setError] = useState("");
  const [qrModal, setQrModal] = useState({ open: false, url: "" });
  const [editingId, setEditingId] = useState(null);
  const [editDevice, setEditDevice] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [filter, setFilter] = useState({
    device_name: "",
    serial_number: "",
    owner: "",
    is_verified: "",
  });
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchDevices();
    fetchEmployeeList();
    fetchGuestList();
  }, []);

  const fetchDevices = async () => {
    try {
      const token = Cookies.get("token");
      const res = await axios.get(`${API_BASE_URL}/api/security/devices/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDevices(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch (err) {
      console.error("Device fetch error:", err);
      setDevices([]);
    }
  };

  const fetchEmployeeList = async () => {
    try {
      const token = Cookies.get("token");
      const res = await axios.get(`${API_BASE_URL}/api/security/employees/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployeeList(
        Array.isArray(res.data) ? res.data : res.data.results || []
      );
    } catch (err) {
      console.warn("Cannot fetch employee list: forbidden for this role.");
      setEmployeeList([]); // fallback to empty list
    }
  };

  const fetchGuestList = async () => {
    try {
      const token = Cookies.get("token");
      const res = await axios.get(`${API_BASE_URL}/api/security/guests/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGuestList(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch {
      setGuestList([]);
    }
  };

  // Change: showModal should control the create modal, not be set in handleCreate
  const handleCreate = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous error
    try {
      const token = Cookies.get("token");
      const payload = {
        device_name: newDevice.device_name,
        serial_number: newDevice.serial_number,
        owner_employee: newDevice.owner_employee,
        owner_guest: newDevice.owner_guest,
        is_verified: newDevice.is_verified,
      };
      await axios.post(`${API_BASE_URL}/api/security/devices/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowModal(false);
      setNewDevice({
        device_name: "",
        serial_number: "",
        owner_employee: "",
        owner_guest: "",
        is_verified: false,
      });
      fetchDevices();
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          "Failed to create device."
      );
    }
  };

  // Edit modal handlers
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
        `${API_BASE_URL}/api/security/devices/${id}/`,
        editDevice,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
      setEditDevice({});
      setShowEditModal(false);
      fetchDevices();
    } catch (err) {
      setError("Failed to update device.");
    }
  };

  // Delete modal handlers
  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };
  const confirmDelete = async () => {
    try {
      const token = Cookies.get("token");
      await axios.delete(`${API_BASE_URL}/api/security/devices/${deleteId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchDevices();
    } catch (err) {
      setError("Failed to delete device.");
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  // Filtering and pagination
  const filteredDevices = devices.filter(
    (d) =>
      (filter.device_name === "" ||
        d.device_name
          ?.toLowerCase()
          .includes(filter.device_name.toLowerCase())) &&
      (filter.serial_number === "" ||
        d.serial_number
          ?.toLowerCase()
          .includes(filter.serial_number.toLowerCase())) &&
      (filter.owner === "" ||
        (d.owner_employee &&
          d.owner_employee
            .toLowerCase()
            .includes(filter.owner.toLowerCase())) ||
        (d.owner_guest &&
          d.owner_guest.toLowerCase().includes(filter.owner.toLowerCase()))) &&
      (filter.is_verified === "" ||
        (filter.is_verified === "verified" ? d.is_verified : !d.is_verified))
  );
  const paginatedDevices = filteredDevices.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <div className="admin-table-page">
      <h2>Devices</h2>
      {/* ...existing code... */}
      <button onClick={() => setShowModal(true)} className="adminuser-add-btn">
        Add Device
      </button>
      {/* Create Device Modal */}
      {showModal && (
        <div className="qr-modal-overlay adminuser-modal-overlay">
          <div className="qr-modal-content adminuser-modal-content">
            <div className="adminuser-modal-title">Add Device</div>
            <form onSubmit={handleCreate} className="adminuser-modal-form">
              <div className="login-input-group">
                <input
                  className="login-input"
                  name="device_name"
                  value={newDevice.device_name}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, device_name: e.target.value })
                  }
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
                  onChange={(e) =>
                    setNewDevice({
                      ...newDevice,
                      serial_number: e.target.value,
                    })
                  }
                  placeholder=" "
                  required
                />
                <span className="login-input-label">Serial Number</span>
              </div>
              <div className="login-input-group">
                <select
                  className="login-input"
                  name="owner_employee"
                  value={newDevice.owner_employee}
                  onChange={(e) =>
                    setNewDevice({
                      ...newDevice,
                      owner_employee: e.target.value,
                    })
                  }
                >
                  <option value="">Select Employee</option>
                  {employeeList.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name}
                    </option>
                  ))}
                </select>
                <span className="login-input-label">Owner Employee</span>
              </div>
              <div className="login-input-group">
                <select
                  className="login-input"
                  name="owner_guest"
                  value={newDevice.owner_guest}
                  onChange={(e) =>
                    setNewDevice({ ...newDevice, owner_guest: e.target.value })
                  }
                >
                  <option value="">Select Guest</option>
                  {guestList.map((guest) => (
                    <option key={guest.id} value={guest.id}>
                      {guest.full_name}
                    </option>
                  ))}
                </select>
                <span className="login-input-label">Owner Guest</span>
              </div>
              <div className="adminuser-checkbox-row">
                <label>
                  Verified
                  <input
                    type="checkbox"
                    checked={newDevice.is_verified}
                    onChange={(e) =>
                      setNewDevice({
                        ...newDevice,
                        is_verified: e.target.checked,
                      })
                    }
                  />
                </label>
              </div>
              <div className="adminuser-modal-btn-row">
                <button
                  type="submit"
                  className="login-btn adminuser-create-btn"
                >
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
              onSubmit={(e) => {
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
              <div className="adminuser-modal-btn-row">
                <button
                  type="submit"
                  className="login-btn adminuser-create-btn"
                >
                  Update
                </button>
                <button
                  type="button"
                  className="login-btn adminuser-cancel-btn"
                  onClick={handleEditModalClose}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="qr-modal-overlay adminuser-modal-overlay">
          <div
            className="qr-modal-content adminuser-modal-content"
            style={{ textAlign: "center" }}
          >
            <div className="adminuser-modal-title">Confirm Delete</div>
            <div style={{ margin: "20px 0" }}>
              Are you sure you want to delete this device?
            </div>
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
      {/* ...error display... */}
      <table className="admin-table">
        <thead>
          <tr>
            <th style={{ display: "none" }}>ID</th>
            <th>Device Name</th>
            <th>Serial Number</th>
            <th>Owner</th>
            <th>Verified</th>
            <th>QR Code</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedDevices.map((d) => (
            <tr key={d.id}>
              <td style={{ display: "none" }}>{d.id}</td>
              <td>{d.device_name}</td>
              <td>{d.serial_number}</td>
              {/* Show owner name, not ID */}
              <td>
                {d.owner_employee_name
                  ? d.owner_employee_name
                  : d.owner_guest_name
                  ? d.owner_guest_name
                  : d.owner_employee // fallback if backend only returns id
                  ? employeeList.find((emp) => emp.id === d.owner_employee)
                      ?.full_name || d.owner_employee
                  : d.owner_guest // fallback if backend only returns id
                  ? guestList.find((guest) => guest.id === d.owner_guest)
                      ?.full_name || d.owner_guest
                  : "N/A"}
              </td>
              <td>{d.is_verified ? "Yes" : "No"}</td>
              <td>
                {d.qr_code_url ? (
                  <img
                    src={d.qr_code_url}
                    alt="QR Code"
                    style={{ width: "48px", height: "48px", cursor: "pointer" }}
                    onClick={() =>
                      setQrModal({ open: true, url: d.qr_code_url })
                    }
                  />
                ) : d.qr_code ? (
                  <img
                    src={d.qr_code}
                    alt="QR Code"
                    style={{ width: "48px", height: "48px", cursor: "pointer" }}
                    onClick={() => setQrModal({ open: true, url: d.qr_code })}
                  />
                ) : (
                  "N/A"
                )}
              </td>
              <td>
                <button
                  onClick={() => handleEdit(d)}
                  title="Edit"
                  className="adminuser-action-btn adminuser-edit-btn"
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M14.7 3.29a1 1 0 0 1 1.41 0l.6.6a1 1 0 0 1 0 1.41l-8.48 8.48-2.12.71.71-2.12 8.48-8.48zM3 17h14"
                      stroke="#1bb76e"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(d.id)}
                  title="Delete"
                  className="adminuser-action-btn adminuser-delete-btn"
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <rect
                      x="5"
                      y="7"
                      width="10"
                      height="8"
                      rx="2"
                      stroke="#e53935"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M8 9v4M12 9v4"
                      stroke="#e53935"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M3 7h14"
                      stroke="#e53935"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M8 7V5a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v2"
                      stroke="#e53935"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div
        style={{
          marginTop: 18,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
        }}
      >
        <button
          className="login-btn"
          style={{ padding: "4px 12px", fontSize: 15 }}
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </button>
        <span style={{ fontWeight: 500 }}>
          Page {page} of{" "}
          {Math.max(1, Math.ceil(filteredDevices.length / pageSize))}
        </span>
        <button
          className="login-btn"
          style={{ padding: "4px 12px", fontSize: 15 }}
          disabled={
            page === Math.ceil(filteredDevices.length / pageSize) ||
            filteredDevices.length === 0
          }
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
      {/* QR Code Modal */}
      {qrModal.open && (
        <QRCodeModal
          url={qrModal.url}
          onClose={() => setQrModal({ open: false, url: "" })}
        />
      )}
    </div>
  );
}

export default SecurityDevices;
