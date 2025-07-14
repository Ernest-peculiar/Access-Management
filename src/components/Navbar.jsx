import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "../styles/Home.css";
import { API_BASE_URL } from "../api";
import Logout from "./Logout";
import { useNavigate, useLocation } from "react-router-dom";

const menu = [
  { label: "Dashboard", path: "/employee", roles: ["employee"] },
  { label: "Invite Guest", path: "/employee/inviteguest", roles: ["employee"] },
];

function Navbar() {
  const [username, setUsername] = useState("");
  const [profileId, setProfileId] = useState(null);
  const [error, setError] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = Cookies.get("token");
        let user = null;
        try {
          const userCookie = Cookies.get("user");
          if (userCookie) user = JSON.parse(userCookie);
        } catch {
          user = null;
        }

        // If admin, don't show navbar
        if (user && user.role === "admin") return;

        const res = await axios.get(
          `${API_BASE_URL}/api/employee-profiles/me/`,
          {
            withCredentials: true,
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        setUsername(res.data.username || "");
        setProfileId(res.data.id || null);
        setProfilePicUrl(res.data.profile_picture_url || null);
        setError("");
      } catch (err) {
        setError("Unable to fetch profile.");
      }
    };
    fetchProfile();
  }, []);

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPic(true);
    try {
      const token = Cookies.get("token");
      const formData = new FormData();
      formData.append("profile_picture", file);

      const res = await axios.post(
        `${API_BASE_URL}/api/employee-profiles/me/`,
        formData,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      setProfilePicUrl(res.data.profile_picture_url);
      setError("");
    } catch (err) {
      setError("Failed to upload profile picture.");
    } finally {
      setUploadingPic(false);
    }
  };

  // Detect mobile view
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar on route change (mobile only)
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  // Do not render for admin
  let user = null;
  try {
    const userCookie = Cookies.get("user");
    if (userCookie) user = JSON.parse(userCookie);
  } catch {
    user = null;
  }
  if (user && user.role === "admin") return null;

  // Hamburger button for mobile
  const Hamburger = (
    isMobile && (
      <button
        className="hamburger-btn"
        aria-label="Open sidebar menu"
        onClick={() => setSidebarOpen((open) => !open)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          width: 40,
          height: 40,
          margin: 16,
          zIndex: 1001,
        }}
      >
        <span className="hamburger-bar" />
        <span className="hamburger-bar" />
        <span className="hamburger-bar" />
      </button>
    )
  );

  return (
    <>
      <div className="mobile-hamburger-wrapper">{Hamburger}</div>
      {/* Overlay for mobile sidebar */}
      {isMobile && sidebarOpen && (
        <div
          className="sidebar-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.35)",
            zIndex: 1000,
            transition: "opacity 0.2s",
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div
        className={`home-sidebar${isMobile && sidebarOpen ? " open" : ""}`}
        style={{
          // Only apply mobile styles if isMobile
          ...(isMobile
            ? {
                position: "fixed",
                top: 0,
                left: sidebarOpen ? 0 : "-260px",
                width: 240,
                height: "100vh",
                zIndex: 1001,
                background: "#247150",
                transition: "left 0.22s cubic-bezier(.4,0,.2,1)",
                boxShadow: sidebarOpen
                  ? "2px 0 12px rgba(0,0,0,0.18)"
                  : "none",
                minHeight: "100vh",
              }
            : {
                position: "relative",
                minHeight: "100vh",
              }),
        }}
      >
        <div className="home-sidebar-header">
          <label
            htmlFor="profile-pic-upload"
            style={{
              cursor: "pointer",
              marginBottom: 0,
              position: "relative",
              display: "inline-block",
            }}
          >
            <img
              src={
                profilePicUrl
                  ? profilePicUrl.startsWith("http")
                    ? profilePicUrl
                    : `${API_BASE_URL}${
                        profilePicUrl.startsWith("/") ? "" : "/"
                      }${profilePicUrl}`
                  : "https://randomuser.me/api/portraits/men/1.jpg"
              }
              alt="avatar"
              className="home-avatar"
              style={{
                width: 70,
                height: 70,
                borderRadius: "50%",
                border: uploadingPic ? "2px solid #1bb76e" : undefined,
                opacity: uploadingPic ? 0.6 : 1,
                objectFit: "cover",
                transition: "box-shadow 0.2s",
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://randomuser.me/api/portraits/men/1.jpg";
              }}
            />
            <span
              style={{
                position: "absolute",
                bottom: 4,
                right: 4,
                background: "#fff",
                borderRadius: "50%",
                padding: 3,
                boxShadow: "0 1px 4px #0002",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect width="20" height="20" fill="none" />
                <path
                  d="M14.7 3.29a1 1 0 0 1 1.41 0l.6.6a1 1 0 0 1 0 1.41l-8.48 8.48-2.12.71.71-2.12 8.48-8.48zM3 17h14"
                  stroke="#247150"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <input
              id="profile-pic-upload"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleProfilePicChange}
              disabled={uploadingPic}
            />
          </label>
          <div className="home-welcome">
            HI {username && <span>{username.toUpperCase()}</span>}
            {error && <p className="home-error">{error}</p>}
          </div>
        </div>

        {profileId && (
          <div style={{ margin: "20px auto", textAlign: "center" }}>
            <div style={{ fontSize: 12, color: "#fff" }}>
              {uploadingPic ? "Uploading..." : ""}
            </div>
          </div>
        )}

        <div className="home-menu">
          {error ? (
            <div style={{ color: "#ff4d4f", padding: "16px" }}>
              Error loading menu. {error}
            </div>
          ) : (
            <>
              {menu.map((item, idx) => (
                <div
                  key={item.label}
                  className={
                    "home-menu-item" +
                    (location.pathname === item.path
                      ? " home-menu-item-active"
                      : "")
                  }
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) setSidebarOpen(false); // Only close sidebar on mobile
                  }}
                >
                  {item.label}
                </div>
              ))}
            </>
          )}
        </div>

        <div
          className="navbar-logout-btn-wrapper"
          style={{
            position: "absolute",
            bottom: 80,
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
              marginTop: 36,
              display: "flex",
              alignItems: "center",
              gap: 10,
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
      </div>
    </>
  );
}

export default Navbar;
