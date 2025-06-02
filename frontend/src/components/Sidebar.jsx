import { Link } from "react-router-dom";
import { FaHome, FaCalendarCheck, FaPlaneDeparture, FaUserShield } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

const Sidebar = () => {
  let isAdmin = false;

  try {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      isAdmin = decoded?.role_name === "admin";
    }
  } catch (err) {
    console.error("Invalid token", err);
  }

  return (
    <aside className="group h-screen bg-gray-900 text-white flex flex-col transition-all duration-300 w-20 hover:w-64 overflow-hidden">
      <div className="p-4">
        <h1 className="text-xl font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          HRMS
        </h1>
      </div>

      <nav className="flex flex-col space-y-2">
        <SidebarLink to="/dashboard" icon={<FaHome />} text="Dashboard" />
        <SidebarLink to="/attendance" icon={<FaCalendarCheck />} text="Attendance" />
        <SidebarLink to="/leave-request" icon={<FaPlaneDeparture />} text="Leave Requests" />

        {isAdmin && (
          <SidebarLink
            to="/admin/leave-requests"
            icon={<FaUserShield />}
            text="Admin Leave Requests"
          />
        )}
      </nav>
    </aside>
  );
};

const SidebarLink = ({ to, icon, text }) => (
  <Link
    to={to}
    className="flex items-center space-x-4 px-4 py-2 hover:bg-gray-800 transition-colors"
  >
    <span className="text-xl">{icon}</span>
    <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      {text}
    </span>
  </Link>
);

export default Sidebar;
