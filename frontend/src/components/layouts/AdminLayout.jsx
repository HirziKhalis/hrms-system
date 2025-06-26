import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
      <div className="p-6 max-w-7xl mx-auto mt-10 bg-white text-gray-800 rounded shadow">
        {children}
      </div>
  );
};

export default AdminLayout;
