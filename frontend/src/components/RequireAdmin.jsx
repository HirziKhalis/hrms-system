import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const RequireAdmin = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null); // null = loading, false = denied
  const navigate = useNavigate();

  useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    navigate("/unauthorized");
    return;
  }

  try {
    const decoded = jwtDecode(token);
    const role = decoded.role_name;

    if (role === "admin") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
      navigate("/unauthorized");
    }
  } catch (err) {
    console.error("Token decode error:", err);
    setIsAdmin(false);
    navigate("/unauthorized");
  }
}, [navigate]);

  if (isAdmin === null) {
    // Optional: show spinner while checking
    return <div className="p-6 text-gray-700">Checking access...</div>;
  }

  return isAdmin ? children : null;
};

export default RequireAdmin;
