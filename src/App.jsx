import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Pages/Login";
import ForgotPassword from "./Pages/ForgotPassword";
import Messages from "./Employees/Messages";
import Admin from "./admins/Admin";
import Security from "./securities/Security";
import Employee from "./Employees/employee";
import Cookies from "js-cookie";
import "@fontsource/montserrat";
import "./styles/Home.css";

// Error boundary for catching runtime errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ color: "red", padding: 24 }}>Error: {String(this.state.error)}</div>;
    }
    return this.props.children;
  }
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      const userCookie = Cookies.get("user");
      return userCookie ? JSON.parse(userCookie) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        const newCookie = Cookies.get("user");
        const parsed = newCookie ? JSON.parse(newCookie) : null;
        const current = user ? JSON.stringify(user) : "";
        const latest = parsed ? JSON.stringify(parsed) : "";
        if (current !== latest) {
          setUser(parsed);
        }
      } catch {
        setUser(null);
      }
    }, 1000); // Less aggressive than 500ms
    return () => clearInterval(interval);
  }, [user]);

  const getRootRedirect = () => {
    if (!user) return <Navigate to="/login" replace />;
    if (user.role === "admin") return <Navigate to="/admin" replace />;
    if (user.role === "security") return <Navigate to="/security" replace />;
    if (user.role === "employee") return <Navigate to="/employee" replace />;
    return <Navigate to="/login" replace />;
  };

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {user ? (
            <>
              <Route path="/messages" element={<Messages />} />

              <Route
                path="/admin/*"
                element={
                  user.role === "admin" ? <Admin /> : <Navigate to="/" replace />
                }
              />
              <Route
                path="/security/*"
                element={
                  user.role === "security" ? <Security /> : <Navigate to="/" replace />
                }
              />
              <Route
                path="/employee/*"
                element={
                  user.role === "employee" ? <Employee /> : <Navigate to="/" replace />
                }
              />
              <Route path="/" element={getRootRedirect()} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            // Not authenticated — redirect everything to login
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
