import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./Navbar";
import Home from "../Employees/Home";
import InviteGuest from "../Employees/InviteGuest";
import Cookies from "js-cookie";
import Permission from "./Permission";
import NotFound from "../Employees/NotFound";

function AppLayout({ activeMenu, setActiveMenu, children }) {
  const location = useLocation();
  const isLogin = location.pathname === "/" || location.pathname === "/login";
  return (
    <div className="home-root">
      {!isLogin && <Navbar activeIndex={activeMenu} onMenuClick={setActiveMenu} />}
      <div className="home-main">{children}</div>
    </div>
  );
}

function AppRouter() {
  const [activeMenu, setActiveMenu] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(!!Cookies.get("token"));

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAuthenticated(!!Cookies.get("token"));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const renderPage = () => {
    switch (activeMenu) {
      case 0:
        return <Home />;
      case 1:
        return <InviteGuest />;
      default:
        return <Home />;
    }
  };

  const location = useLocation();

  // Protect all routes except login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route
        path="/home"
        element={
          <Permission>
            <AppLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>
              <Home />
            </AppLayout>
          </Permission>
        }
      />
      <Route
        path="/invite-guest"
        element={
          <Permission>
            <AppLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>
              <InviteGuest />
            </AppLayout>
          </Permission>
        }
      />
      <Route
        path="*"
        element={
          <Permission>
            <AppLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>
              <NotFound />
            </AppLayout>
          </Permission>
        }
      />
    </Routes>
  );
}

export default AppRouter;
