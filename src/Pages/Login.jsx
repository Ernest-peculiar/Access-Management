import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { API_BASE_URL } from "../api";
import MustChangePasswordModal from "../components/MustChangePasswordModal";
import "../styles/Login.css";
import Logo from "../assets/3D_App_Icon_Mockup_[Qorecraft]w[1](1).png";
import "@fontsource/montserrat";
import { useNavigate, Link } from "react-router-dom";

const OutlookAuth = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!form.username || !form.password) {
    setError("Please enter both username and password.");
    return;
  }

  setLoading(true);

  try {
    // 🔁 Clear any previous session
    Cookies.remove("token", { path: "/" });
    Cookies.remove("user", { path: "/" });

    // 🔐 Authenticate
    const response = await axios.post(`${API_BASE_URL}/api/token/`, {
      username: form.username,
      password: form.password,
    });

    const { access, user } = response.data;
    if (!access || !user) throw new Error("Invalid login response.");

    const { role } = user;

    // ✅ Save session cookies
    Cookies.set("token", access, { path: "/", secure: false, sameSite: "Lax" });
    Cookies.set("user", JSON.stringify(user), {
      path: "/",
      secure: false,
      sameSite: "Lax",
    });

    // 👤 Handle employee change password prompt
    if (role === "employee") {
      const mustChangeRes = await axios.get(`${API_BASE_URL}/api/employee-profiles/prompt_change/`, {
        headers: { Authorization: `Bearer ${access}` },
      });

      const mustChange = ["true", true, 1, "1"].includes(mustChangeRes.data.must_change_password);
      if (mustChange) {
        setMustChangePassword(true);
        setShowModal(true);
        return;
      }
    }

    // 🚀 Force reload to target dashboard (avoid stale state)
    window.location.href = `/${role}`;

  } catch (err) {
    setError(err.response?.data?.detail || "Login failed.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="login-root">
      <div className="login-left">
        <div
          className="login-title"
          style={{ marginTop: "2.5rem", marginBottom: "auto" }}
        >
          VISITORS MANAGEMENT
          <br />
          SYSTEM (NETCO)
        </div>
      </div>

      <img className="login-3d-icon" src={Logo} alt="3D App Icon" />

      <div className="login-right">
        <img
          className="login-nnpc-logo"
          src="/src/assets/nnpc-logo.png"
          alt="NNPC Logo"
        />

        <div className="login-form-title">Log-In To Your Account</div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          <div className="login-input-group">
            <input
              className="login-input"
              type="text"
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              autoComplete="username"
              placeholder=" "
            />
            <span className="login-input-label">Username</span>
          </div>

          <div className="login-input-group">
            <input
              className="login-input"
              type="password"
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              placeholder=" "
            />
            <span className="login-input-label">Password</span>
          </div>

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Log In"}
          </button>

          <div className="login-form-row">
            <label className="login-remember">
              <input type="checkbox" /> Remember me
            </label>
            <Link className="login-forgot" to="/forgot-password">
              Forget Password
            </Link>
          </div>
        </form>
      </div>

      <MustChangePasswordModal
        open={mustChangePassword && showModal}
        onSuccess={() => {
          setMustChangePassword(false);
          setShowModal(false);
          navigate("/employee");
        }}
      />
    </div>
  );
};

export default OutlookAuth;
