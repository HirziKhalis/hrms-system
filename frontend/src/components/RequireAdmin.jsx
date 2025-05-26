import React from "react";
import { Navigate } from "react-router-dom";

const RequireAdmin = ({ children }) => {
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  if (!user || user.role_name !== "admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RequireAdmin;
