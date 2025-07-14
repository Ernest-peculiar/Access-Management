import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Form.css";
import { API_BASE_URL } from "../api";
import Cookies from "js-cookie";
import Modal from "../components/Modals";

function InviteGuest() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    purpose: "",
    visitDate: "",
    id: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          setError("You are not authenticated. Please log in.");
          setShowModal(true);
          return;
        }

        const res = await axios.get(
          `${API_BASE_URL}/api/employee-profiles/me/`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        if (res?.data?.id) {
          setForm((f) => ({ ...f, invited_by: String(res.data.id) }));
        } else {
          setError(
            "Could not determine your employee profile ID. Please contact admin."
          );
          setShowModal(true);
        }
      } catch {
        setError(
          "Could not determine your employee profile ID. Please contact admin."
        );
        setShowModal(true);
      }
    };
    fetchUserId();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    setShowModal(false);

    if (
      !form.fullName ||
      !form.email ||
      !form.phone ||
      !form.purpose ||
      !form.visitDate
    ) {
      setError("All fields are required.");
      setShowModal(true);
      setLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError("Please enter a valid email address.");
      setShowModal(true);
      setLoading(false);
      return;
    }

    if (!/^[0-9+\-\s]{7,}$/.test(form.phone)) {
      setError("Please enter a valid phone number.");
      setShowModal(true);
      setLoading(false);
      return;
    }

    try {
      const token = Cookies.get("token");
      const payload = {
        full_name: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        purpose: form.purpose.trim(),
        visit_date: form.visitDate,
        invited_by: form.invited_by ? Number(form.invited_by) : undefined,
      };

      Object.keys(payload).forEach(
        (key) =>
          (payload[key] === undefined || payload[key] === "") &&
          delete payload[key]
      );

      await axios.post(`${API_BASE_URL}/api/guests/`, payload, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "application/json",
        },
      });

      setSuccess("Guest invitation submitted successfully!");
      setShowModal(true);
      setForm({
        fullName: "",
        email: "",
        phone: "",
        purpose: "",
        visitDate: "",
        invited_by: form.invited_by,
      });
    } catch (err) {
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === "object" && !Array.isArray(data)) {
          const messages = Object.entries(data)
            .map(
              ([field, msgs]) =>
                `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`
            )
            .join(" | ");
          setError(messages);
        } else if (data.detail) {
          setError(data.detail);
        } else {
          setError("Failed to submit invitation. Please try again.");
        }
      } else {
        setError("Failed to submit invitation. Please try again.");
      }
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="form-root"
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        margin: "auto",
        padding: 0,
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .form-container {
            width: 100% !important;
            max-width: 100% !important;
            min-width: unset !important;
            height: auto !important;
            padding: 20px 16px !important;
            box-shadow: none;
            border-radius: 0;
          }

          .login-form-title {
            text-align: center !important;
            font-size: 22px !important;
          }

          .login-btn {
            width: 100%;
            font-size: 16px;
          }

          .login-input {
            font-size: 16px;
          }

          .login-form {
            gap: 1.1rem;
            margin-top: -4px;
          }
        }
      `}</style>

      <div
        className="form-container"
        style={{ minWidth: 700, maxWidth: 1100, height: "100vh" }}
      >
        <div
          className="login-form-title"
          style={{ marginBottom: 30, textAlign: "left", fontSize: 30 }}
        >
          Invite Guest
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-input-group">
            <input
              className="login-input"
              type="text"
              id="fullName"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              autoComplete="off"
              placeholder=" "
              required
            />
            <span className="login-input-label">Full Name</span>
          </div>
          <div className="login-input-group">
            <input
              className="login-input"
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="off"
              placeholder=" "
              required
            />
            <span className="login-input-label">Email</span>
          </div>
          <div className="login-input-group">
            <input
              className="login-input"
              type="tel"
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              autoComplete="off"
              placeholder=" "
              required
            />
            <span className="login-input-label">Phone</span>
          </div>
          <div className="login-input-group">
            <input
              className="login-input"
              type="text"
              id="purpose"
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              autoComplete="off"
              placeholder=" "
              required
            />
            <span className="login-input-label">Purpose</span>
          </div>
          <div className="login-input-group">
            <input
              className="login-input"
              type="date"
              id="visitDate"
              name="visitDate"
              value={form.visitDate}
              onChange={handleChange}
              autoComplete="off"
              placeholder=" "
              required
            />
            <span className="login-input-label">Visit Date</span>
          </div>

          <input
            type="hidden"
            name="invited_by"
            value={form.invited_by || ""}
          />

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>

        {showModal && (error || success) && (
          <Modal
            message={error || success}
            isSuccess={!!success}
            onClose={() => {
              setShowModal(false);
              setError("");
              setSuccess("");
            }}
          />
        )}
      </div>
    </div>
  );
}

export default InviteGuest;
