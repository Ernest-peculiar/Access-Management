import React from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

function Logout({ className = "", style = {}, children = "Logout" }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 🧹 Clear all auth-related cookies
    Cookies.remove("token", { path: "/" });
    Cookies.remove("user", { path: "/" });
    Cookies.remove("viewed_admin_msgs", { path: "/" }); // just in case you're tracking this

    // 🔄 Reset client-side state if needed (optional)
    // e.g., localStorage.clear(); if you're using it

    // ⏩ Navigate cleanly
    navigate("/login", { replace: true });
  };

  return (
    <div
      className={className}
      style={style}
      onClick={handleLogout}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === "Enter") handleLogout();
      }}
    >
      {children}
    </div>
  );
}

export default Logout;
