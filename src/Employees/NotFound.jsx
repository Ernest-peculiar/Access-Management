import React from "react";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  React.useEffect(() => {
    // If unauthorized, redirect to login after a short delay
    const timer = setTimeout(() => {
      // You can add logic here to check for 401/403 if you want
      navigate("/login", { replace: true });
    }, 1800);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{
      textAlign: "center",
      margin: "auto",
      padding: "60px 0",
      color: "#247150"
    }}>
      <h1 style={{ fontSize: "6rem", marginBottom: 0 }}>404</h1>
      <h2 style={{ fontWeight: 400, marginTop: 0 }}>Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>
      <p style={{ color: "#c00", marginTop: 24 }}>Redirecting to login...</p>
    </div>
  );
}

export default NotFound;
