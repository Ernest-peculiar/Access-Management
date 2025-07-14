import React, { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api";
import Modal from "../components/Modals";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react"; // Optional: Use any icon package or emoji

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  const handleCloseModal = () => {
    setShowModal(false);
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 300);
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setShowModal(false);
    setLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/api/employee-profiles/forgot_password/`,
        { email: email.trim().toLowerCase() },
        { withCredentials: false }
      );
      setSuccess("OTP sent to your email.");
      setShowModal(true);
      setStep(2);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("No account found with this email address.");
      } else {
        setError(err.response?.data?.detail || "Failed to send OTP.");
      }
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setShowModal(false);
    setLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/api/employee-profiles/verify_otp/`,
        { email, otp },
        { withCredentials: false }
      );
      setSuccess("OTP verified. Please enter your new password.");
      setShowModal(true);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid OTP.");
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setShowModal(false);
    setLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/api/employee-profiles/reset_password/`,
        {
          email,
          otp,
          new_password: newPassword,
          confirm_password: confirmPassword,
        },
        { withCredentials: false }
      );
      setSuccess("Password reset successful. You can now log in.");
      setShowModal(true);
      setStep(4);
    } catch (err) {
      setError(
        (err.response?.data?.detail && err.response.data.detail[0]) ||
          err.response?.data?.detail ||
          "Failed to reset password."
      );
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div style={{ marginBottom: 20 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              border: "none",
              color: "#1bb76e",
              fontWeight: "bold",
              fontSize: "16px",
              cursor: "pointer",
              alignItems: "left",
              zIndex: 1000,
              top: 100,
              left: 100,
              position: "absolute",
            }}
          >
            <ArrowLeft size={80} /> 
          </button>
        </div>
      <div className="login-right" style={{ margin: "auto" }}>
        {/* Back Arrow */}
        

        <div className="login-form-title">Forgot Password</div>

        {step === 1 && (
          <form className="login-form" onSubmit={handleRequestOtp}>
            <div className="login-input-group">
              <input
                className="login-input"
                type="email"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <span className="login-input-label">Email</span>
            </div>
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="login-form" onSubmit={handleVerifyOtp}>
            <div className="login-input-group">
              <input
                className="login-input"
                type="text"
                placeholder=" "
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <span className="login-input-label">Enter OTP</span>
            </div>
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        {step === 3 && (
          <form className="login-form" onSubmit={handleResetPassword}>
            <div className="login-input-group">
              <input
                className="login-input"
                type="password"
                placeholder=" "
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <span className="login-input-label">New Password</span>
            </div>
            <div className="login-input-group">
              <input
                className="login-input"
                type="password"
                placeholder=" "
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <span className="login-input-label">Confirm Password</span>
            </div>
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        {step === 4 && (
          <div>
            <div className="login-success">{success}</div>
            <a
              className="login-btn"
              href="/login"
              style={{ display: "inline-block", marginTop: 24 }}
            >
              Go to Login
            </a>
          </div>
        )}

        {showModal && (error || success) && (
          <Modal
            message={error || success}
            isSuccess={!!success}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
