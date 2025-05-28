import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// RequireAdmin.jsx
const RequireAdmin = ({ children }) => {
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  return user && user.role_name === "admin"
    ? children
    : <Navigate to="/unauthorized" replace />;
};


export default RequireAdmin;
