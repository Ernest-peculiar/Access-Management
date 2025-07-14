import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../api";
import "../styles/Admin.css";
import "../styles/Login.css";
import "../styles/AdminUser.css";

function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchMessages = async () => {
    try {
      const token = Cookies.get("token");
      const res = await axios.get(`${API_BASE_URL}/api/admin/messages/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch {
      setMessages([]);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const token = Cookies.get("token");
      await axios.post(
        `${API_BASE_URL}/api/messages/`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setContent("");
      setShowModal(false);
      fetchMessages();
    } catch (err) {
      setError("Failed to create message.");
      console.error("Create message error:", err);
    }
  };

  const handleEdit = (id, currentContent) => {
    setEditingId(id);
    setEditContent(currentContent);
    setShowEditModal(true);
  };

  const handleEditModalClose = () => {
    setEditingId(null);
    setEditContent("");
    setShowEditModal(false);
  };

  const handleUpdate = async (id) => {
    try {
      const token = Cookies.get("token");
      await axios.patch(
        `${API_BASE_URL}/api/messages/${id}/`,
        { content: editContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
      setEditContent("");
      setShowEditModal(false);
      fetchMessages();
    } catch (err) {
      setError("Failed to update message.");
      console.error("Update message error:", err);
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = Cookies.get("token");
      await axios.delete(`${API_BASE_URL}/api/messages/${deleteId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchMessages();
    } catch (err) {
      setError("Failed to delete message.");
      setShowDeleteModal(false);
      setDeleteId(null);
      console.error("Delete message error:", err);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  return (
    <div className="admin-table-page">
      <h2>Messages</h2>
      <button
        onClick={() => setShowModal(true)}
        className="adminuser-add-btn"
      >
        Add Message
      </button>
      {showModal && (
        <div className="qr-modal-overlay adminuser-modal-overlay">
          <div className="qr-modal-content adminuser-modal-content">
            <div className="adminuser-modal-title">Add Message</div>
            <form
              onSubmit={handleCreate}
              className="adminuser-modal-form"
            >
              <div className="login-input-group">
                <textarea
                  className="login-input"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder=" "
                  required
                  rows={5}
                  style={{ resize: "vertical", minHeight: 100 }}
                />
                <span className="login-input-label">New message</span>
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
            <div className="adminuser-modal-title">Edit Message</div>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleUpdate(editingId);
              }}
              className="adminuser-modal-form"
            >
              <div className="login-input-group">
                <textarea
                  className="login-input"
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  placeholder=" "
                  required
                  rows={5}
                  style={{ resize: "vertical", minHeight: 100 }}
                />
                <span className="login-input-label">Edit message</span>
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
            <div style={{ margin: "20px 0" }}>Are you sure you want to delete this message?</div>
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
      <table className="admin-table">
        <thead>
          <tr>
            {/* <th>ID</th> */}
            <th style={{ display: "none" }}>ID</th>
            <th>Sender</th>
            <th>Content</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {messages.map(m => (
            <tr key={m.id}>
              {/* <td>{m.id}</td> */}
              <td style={{ display: "none" }}>{m.id}</td>
              <td>{m.sender_username}</td>
              <td>
                {editingId === m.id && showEditModal ? (
                  <input
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    style={{ width: 200 }}
                  />
                ) : (
                  m.content
                )}
              </td>
              <td>{new Date(m.created_at).toLocaleString()}</td>
              <td>
                <button
                  onClick={() => handleEdit(m.id, m.content)}
                  title="Edit"
                  className="adminuser-action-btn adminuser-edit-btn"
                >
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <path d="M14.7 3.29a1 1 0 0 1 1.41 0l.6.6a1 1 0 0 1 0 1.41l-8.48 8.48-2.12.71.71-2.12 8.48-8.48zM3 17h14"
                      stroke="#1bb76e" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(m.id)}
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminMessages;
