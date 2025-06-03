import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const RequireRole = ({ roles = [], children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="p-6">Checking access...</div>;
  if (!user || !roles.includes(user.role_name)) return null; // don’t redirect

  return children;
};


export default RequireRole;
