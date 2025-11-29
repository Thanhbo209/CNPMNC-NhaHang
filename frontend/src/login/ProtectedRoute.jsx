import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <p>Loading...</p>;

  if (!user) return <Navigate to="/" replace />; // chưa login → login

  if (!allowedRoles.includes(user.role)) {
    // role không phù hợp → redirect theo role
    switch (user.role) {
      case "Admin":
        return <Navigate to="/admin/dashboard" replace />;
      case "Staff":
        return <Navigate to="/waiter/dashboard" replace />;
      case "Cashier":
        return <Navigate to="/cashier/dashboard" replace />;
      case "Chef":
        return <Navigate to="/chef/dashboard" replace />;
      case "Manager":
        return <Navigate to="/admin/dashboard" replace />; // Manager dùng admin layout
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
