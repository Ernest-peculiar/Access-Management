import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./Home";
import InviteGuest from "./InviteGuest";
import Navbar from "../components/Navbar";
import Permission from "../components/Permission";

function Employee() {
  return (
    <div className="home-root" style={{ display: "flex", minHeight: "100vh" }}>
      <Navbar />
      <div className="home-main" style={{ flexGrow: 1, padding: "20px" }}>
        <Routes>
          {/* Default route is /employee */}
          <Route index element={<Home />} />

          {/* Relative path means /employee/inviteguest */}
          <Route
            path="inviteguest"
            element={
              <Permission>
                <InviteGuest />
              </Permission>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="" />} />
        </Routes>
      </div>
    </div>
  );
}

export default Employee;
