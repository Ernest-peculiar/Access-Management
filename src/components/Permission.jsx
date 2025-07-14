import React from "react";
import Cookies from "js-cookie";
import { Navigate } from "react-router-dom";

// Usage: <Permission>{children}</Permission>
function Permission({ children }) {
  const isAuthenticated = !!Cookies.get("token");
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default Permission;
