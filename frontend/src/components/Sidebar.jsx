import { Link } from "react-router-dom";
import {
  FaHome,
  FaCalendarCheck,
  FaPlaneDeparture,
  FaUserShield,
  FaMoneyBill,
  FaGift,
  FaUsers
} from "react-icons/fa";
import { hasRole } from "../utils/auth";

const Sidebar = () => {
  return (
    <aside className="group h-screen bg-gray-900 text-white flex flex-col transition-all duration-300 w-20 hover:w-64 overflow-hidden">
      <div className="p-4">
        <h1 className="text-xl font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          HRMS
        </h1>
      </div>

      <nav className="flex flex-col space-y-2">

        {/* Public for logged-in users */}
        <SidebarLink to="/dashboard" icon={<FaHome />} text="Dashboard" />
        <SidebarLink to="/attendance" icon={<FaCalendarCheck />} text="Attendance" />
        <SidebarLink to="/leave-request" icon={<FaPlaneDeparture />} text="Leave Requests" />

        {/* Admin / Manager */}
        {hasRole(["admin", "manager"]) && (
          <SidebarLink
            to="/admin/leave-requests"
            icon={<FaUserShield />}
            text="Leave Requests (Admin)"
          />
        )}

        {/* Admin only */}
        {hasRole(["admin"]) && (
          <>
            <SidebarLink to="/admin/payroll" icon={<FaMoneyBill />} text="Payroll" />

            {/* Group incentives under one icon */}
            <SidebarLink to="/incentives" icon={<FaGift />} text="Incentives Overview" />
            <SidebarLink to="/admin/incentives/create" icon={<FaGift />} text="Create Incentive" />

            <SidebarLink to="/admin/referrals" icon={<FaUsers />} text="Referral Admin" />
          </>
        )}

        {/* Available to all employees */}
        {hasRole(["employee", "manager", "admin"]) && (
          <SidebarLink to="/referrals" icon={<FaUsers />} text="Referral Form" />
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
