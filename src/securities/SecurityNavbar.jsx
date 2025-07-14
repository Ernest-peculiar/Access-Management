import React from "react";
import { NavLink } from "react-router-dom";
import Logout from "../components/Logout";
import "../styles/Admin.css";

const menu = [
  { label: "Dashboard", path: "" },
  { label: "Register Devices", path: "devices" },
  { label: "Scan QR", path: "QRcode" },
  { label: "Access Logs", path: "access-logs" },
];

function SecurityNavbar() {
  return (
    <nav
      className="admin-navbar"
      style={{ position: "relative", minHeight: "100vh" }}
    >
      <div className="admin-navbar-title">Security Panel</div>
      <div className="admin-navbar-menu">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={`/security/${item.path}`}
            end={item.path === ""}
            className={({ isActive }) =>
              "admin-navbar-link" +
              (isActive ? " admin-navbar-link-active" : "")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 70,
          left: 0,
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Logout
          className="navbar-logout-btn"
          style={{
            color: "#fff",
            marginTop: 30,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontWeight: 600,
            fontSize: 17,
            background: "linear-gradient(90deg, #e53935 0%, #c62828 100%)",
            border: "none",
            borderRadius: "8px",
            padding: "10px 22px",
            cursor: "pointer",
            boxShadow: "0 2px 8px #c6282833",
            transition: "background 0.18s, box-shadow 0.18s",
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: 6 }}
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </Logout>
      </div>
    </nav>
  );
}

export default SecurityNavbar;
