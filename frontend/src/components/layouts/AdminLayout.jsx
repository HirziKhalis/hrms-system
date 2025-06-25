import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        <Button
          onClick={() => navigate("/admin/leave-requests")}
          className={`mb-3 ${currentPath === "/admin/leave-requests"
              ? "bg-gray-300 text-gray-800"
              : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
        >
          Leave Requests
        </Button>
        <Button
          onClick={() => navigate("/admin/leave-quotas")}
          className={`mb-3 ${currentPath === "/admin/leave-quotas"
              ? "bg-gray-300 text-gray-800"
              : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
        >
          Manage Quotas
        </Button>
      </div>

      <div className="p-6 max-w-7xl mx-auto mt-10 bg-white text-gray-800 rounded shadow">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;
