import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import { API_BASE_URL } from "../api";

function Home() {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [staffId, setStaffId] = useState("");
  const [deviceCount, setDeviceCount] = useState(0);
  const [guestCount, setGuestCount] = useState(0);
  const [attendanceIn, setAttendanceIn] = useState(0);
  const [attendanceOut, setAttendanceOut] = useState(0);
  const [devices, setDevices] = useState([]);
  const [profileId, setProfileId] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [loading, setLoading] = useState(false); // Only spin on login, not on Home nav
  const [error, setError] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [modalQrUrl, setModalQrUrl] = useState(""); // For modal QR
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [activeMenu, setActiveMenu] = useState(0);
  const [role, setRole] = useState("");
  const [notificationCount, setNotificationCount] = useState(0); // notificationCount now tracks unread messages
  const navigate = useNavigate();
  const [initialLoad, setInitialLoad] = useState(true);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [guestList, setGuestList] = useState([]);
  const [deviceList, setDeviceList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Get unique key for viewed messages per user
  const viewedMsgsKey = `viewed_admin_msgs_${profileId || "nouser"}`;

  useEffect(() => {
    let ignore = false;
    setLoading(true); // Always trigger loading on mount

    const fetchDashboard = async () => {
      const token = Cookies.get("token");
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const profileRes = await axios.get(
          `${API_BASE_URL}/api/employee-profiles/me/`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        setUsername(profileRes.data.username);
        setProfileId(profileRes.data.id);
        setRole(profileRes.data.role);
        setQrCodeUrl(profileRes.data.id_qr_code_url);

        const dashboardRes = await axios.get(
          `${API_BASE_URL}/api/employee-profiles/dashboard/`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        setFullName(dashboardRes.data.full_name);
        setStaffId(dashboardRes.data.staff_id);
        setDeviceCount(dashboardRes.data.device_count);
        setGuestCount(dashboardRes.data.guest_count);
        setAttendanceIn(dashboardRes.data.attendance_in);
        setAttendanceOut(dashboardRes.data.attendance_out);
        setDevices(dashboardRes.data.devices);

        const attendanceRes = await axios.get(
          `${API_BASE_URL}/api/employee-profiles/attendance/`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        setAttendanceLogs(attendanceRes.data);

        const msgRes = await axios.get(`${API_BASE_URL}/api/messages/`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        setMessages(msgRes.data || []);
        const viewed = JSON.parse(
          localStorage.getItem(`viewed_admin_msgs_${profileRes.data.id}`) ||
            "[]"
        );
        const unread = (msgRes.data || []).filter(
          (msg) => !viewed.includes(msg.id)
        );
        setUnreadCount(unread.length);
        setNotificationCount(unread.length);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate("/login", { replace: true });
        } else {
          setError("Unable to fetch dashboard. Please log in again.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchDashboard();
    return () => {
      ignore = true;
    };
  }, [navigate]);

  // Handler to open modal and fetch QR code using staffId dynamically in the path
  const handleShowQrModal = async () => {
    if (qrCodeUrl) {
      setModalQrUrl(qrCodeUrl);
    } else {
      setModalQrUrl("");
    }
    setShowQrModal(true);
  };

  // Print QR code function
  const handlePrintQr = () => {
    if (!modalQrUrl) return;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code</title>
          <style>
            body { display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            img { width: 300px; height: 300px; object-fit: contain; }
          </style>
        </head>
        <body>
          <img src="${modalQrUrl}" alt="QR Code" />
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  // Fetch guest and device records when modals are opened
  const handleShowGuestModal = async () => {
    setShowGuestModal(true);
    try {
      const token = Cookies.get("token");
      const res = await axios.get(`${API_BASE_URL}/api/guests/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
      });

      setGuestList(res.data?.results || []); // 👈 correct this line
    } catch (e) {
      console.error("Failed to fetch guests:", e);
      setGuestList([]);
    }
  };

  const handleShowDeviceModal = async () => {
    setShowDeviceModal(true);
    try {
      const token = Cookies.get("token");
      const res = await axios.get(`${API_BASE_URL}/api/devices/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
      });

      setDeviceList(res.data?.results || []); // ✅ use paginated `results` array
    } catch (e) {
      console.error("Failed to fetch devices:", e);
      setDeviceList([]);
    }
  };

  // Handler for notification bell click
  const handleNotificationClick = () => {
    // Mark all messages as viewed for this user
    if (messages.length > 0 && profileId) {
      localStorage.setItem(
        viewedMsgsKey,
        JSON.stringify(messages.map((msg) => msg.id))
      );
      setUnreadCount(0);
      setNotificationCount(0); // reset notification count after viewing
    }
    navigate("/messages");
  };

  // Determine if user is employee
  const isEmployee = role === "employee";
  const isEmployeeRoute =
    window.location.pathname === "/home" ||
    window.location.pathname === "/invite-guest";

  return (
    <div className="home-root">
      {/* Navbar removed: now handled globally in AppLayout/AppRouter for employee pages */}
      {/* Overlay for loading */}
      {/* Spinner removed as requested */}
      {/* Main Content */}
      <div className={`home-main${loading ? " blurred" : ""}`}>
        {/* Notification Bell Icon at top right */}
        <div className="notification-bell-container">
          <div
            className="notification-bell-wrapper"
            style={{ cursor: "pointer" }}
            onClick={handleNotificationClick}
          >
            {/* Modern Bell SVG icon with gradient and shadow */}
            <svg
              className="notification-bell-icon"
              width="54"
              height="59"
              viewBox="0 0 44 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <radialGradient id="bellGlow" cx="50%" cy="50%" r="70%">
                  <stop offset="0%" stopColor="#1abc9c" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#247150" stopOpacity="0.1" />
                </radialGradient>
                <linearGradient id="bellBody" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2ecc71" />
                  <stop offset="100%" stopColor="#247150" />
                </linearGradient>
              </defs>
              <ellipse cx="22" cy="22" rx="20" ry="20" fill="url(#bellGlow)" />
              <g filter="url(#bellShadow)">
                <path
                  d="M32 30v-7a10 10 0 1 0-20 0v7c0 1.2-.9 2.1-1.5 3h23c-.6-.9-1.5-1.8-1.5-3"
                  fill="url(#bellBody)"
                  stroke="#247150"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M25.5 36a3.5 3.5 0 0 1-7 0"
                  stroke="#247150"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
              <filter id="bellShadow" x="0" y="0" width="44" height="44">
                <feDropShadow
                  dx="0"
                  dy="2"
                  stdDeviation="2"
                  floodColor="#247150"
                  floodOpacity="0.18"
                />
              </filter>
            </svg>
            {/* Notification count circle (red) */}
            {notificationCount > 0 && (
              <span className="notification-bell-count">
                {notificationCount}
              </span>
            )}
            {/* Animated ping effect */}
            {notificationCount > 0 && (
              <span className="notification-bell-ping"></span>
            )}
          </div>
        </div>
        <div className="home-main-title"></div>
        {loading ? (
          <div className="dashboard-loader">
            <div className="dashboard-spinner"></div>
          </div>
        ) : (
          <div className="dashboard-container">
            <div
              className="dashboard-profile"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <p id="username">
                  <strong>{fullName}</strong>
                </p>
                <p>
                  <strong>{staffId}</strong>
                </p>
              </div>
              <button
                className="dashboard-qr-btn"
                onClick={handleShowQrModal}
                disabled={!qrCodeUrl}
                title={
                  qrCodeUrl ? "Click to view QR Code" : "QR Code not available"
                }
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
                  style={{ marginRight: 8, verticalAlign: "middle" }}
                >
                  <rect x="3" y="3" width="7" height="7" rx="2" />
                  <rect x="14" y="3" width="7" height="7" rx="2" />
                  <rect x="14" y="14" width="7" height="7" rx="2" />
                  <path d="M7 17v.01M7 14v.01M3 14v.01M3 17v.01M10 17v.01M10 14v.01" />
                </svg>
                Staff QR Code
              </button>
            </div>
            <div className="dashboard-metrics">
              <div
                className="dashboard-card"
                style={{ cursor: "pointer" }}
                onClick={handleShowDeviceModal}
                title="Click to view your registered devices"
              >
                <span id="num">{deviceCount}</span>
                <span id="descrip">Registered Devices</span>
              </div>
              <div
                className="dashboard-card"
                style={{ cursor: "pointer" }}
                onClick={handleShowGuestModal}
                title="Click to view your registered guests"
              >
                <span id="num">{guestCount}</span>
                <span id="descrip">Registered Guests</span>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="dashboard-attendance">
              <h3>Attendance Logs</h3>
              {attendanceLogs.length > 0 ? (
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time In</th>
                      <th>Time Out</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceLogs.map((log, idx) => (
                      <tr key={idx}>
                        <td>{log.date}</td>
                        <td>{log.time_in || "-"}</td>
                        <td>{log.time_out || "-"}</td>
                        <td>{log.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No attendance records found.</p>
              )}
            </div>

            {/* Remove messages section from homepage */}
          </div>
        )}
      </div>

      {/* Guest Modal */}
      {showGuestModal && (
        <div
          className="qr-modal-overlay"
          onClick={() => setShowGuestModal(false)}
        >
          <div
            className="qr-modal-content"
            style={{ maxWidth: 500 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Guests Registered</h3>
            {guestList.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                      Name
                    </th>
                    <th style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                      Token
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {guestList.map((guest, idx) => (
                    <tr key={guest.id || idx}>
                      <td style={{ padding: 8 }}>{guest.full_name}</td>
                      <td style={{ padding: 8 }}>{guest.token}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No guests found.</p>
            )}
            <button
              className="qr-modal-close-btn"
              onClick={() => setShowGuestModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Device Modal */}
      {showDeviceModal && (
        <div
          className="qr-modal-overlay"
          onClick={() => setShowDeviceModal(false)}
        >
          <div
            className="qr-modal-content"
            style={{ maxWidth: 500 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Devices Registered</h3>
            {deviceList.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                      Device Name
                    </th>
                    <th style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                      Serial Number
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deviceList.map((device, idx) => (
                    <tr key={device.id || idx}>
                      <td style={{ padding: 8 }}>
                        {device.name || device.device_name}
                      </td>
                      <td style={{ padding: 8 }}>{device.serial_number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No devices found.</p>
            )}
            <button
              className="qr-modal-close-btn"
              onClick={() => setShowDeviceModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="qr-modal-overlay" onClick={() => setShowQrModal(false)}>
          <div
            className="qr-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Your Staff ID QR Code</h3>
            {modalQrUrl ? (
              <>
                <img
                  src={modalQrUrl}
                  alt="Full QR Code"
                  className="qr-modal-img"
                  onError={(e) => {
                    e.target.style.display = "none";
                    // Show a fallback message if the image fails to load
                    const fallback = document.createElement("p");
                    fallback.textContent =
                      "QR Code not available (no id_qr_code found for your profile).";
                    fallback.style.color = "#c00";
                    e.target.parentNode.appendChild(fallback);
                  }}
                />
                <button
                  className="qr-modal-print-btn"
                  style={{ marginRight: 10 }}
                  onClick={handlePrintQr}
                >
                  Print QR Code
                </button>
              </>
            ) : (
              <p>
                QR Code not available (no id_qr_code found for your profile).
              </p>
            )}
            <button
              className="qr-modal-close-btn"
              onClick={() => setShowQrModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
