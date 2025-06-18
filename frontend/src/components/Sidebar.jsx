import { Link } from "react-router-dom";
import {
  FaHome,
  FaClock,
  FaCalendarCheck,
  FaPlaneDeparture,
  FaUserShield,
  FaMoneyBill,
  FaGift,
  FaUsers
} from "react-icons/fa";
import { hasRole } from "../utils/auth";

const Sidebar = ({ closeSidebar }) => {
  return (
    <aside className="h-full w-64 bg-gray-900 text-white flex flex-col shadow-lg">
      <div className="p-4">
        <h1 className="text-xl font-bold">HRMS</h1>
      </div>

      <nav className="flex flex-col space-y-2">
        <SidebarLink to="/dashboard" icon={<FaHome />} text="Dashboard" closeSidebar={closeSidebar} />
        <SidebarLink to="/attendance" icon={<FaCalendarCheck />} text="Attendance" closeSidebar={closeSidebar} />
        <SidebarLink to="/overtime" icon={<FaClock />} text="Overtime" closeSidebar={closeSidebar} />
        <SidebarLink to="/leave-request" icon={<FaPlaneDeparture />} text="Leave Requests" closeSidebar={closeSidebar} />

        {hasRole(["admin", "manager"]) && (
          <>
            <SidebarLink
              to="/admin/leave-requests"
              icon={<FaUserShield />}
              text="Leave Requests (Admin)"
              closeSidebar={closeSidebar}
            />

            <SidebarLink
              to="/admin/overtime-requests"
              icon={<FaClock />}
              text="Overtime (Admin)"
              closeSidebar={closeSidebar}
            />
          </>
        )}

        {hasRole(["admin"]) && (
          <>
            <SidebarLink to="/admin/payroll" icon={<FaMoneyBill />} text="Payroll" closeSidebar={closeSidebar} />
            <SidebarLink to="/incentives" icon={<FaGift />} text="Incentives Overview" closeSidebar={closeSidebar} />
            <SidebarLink to="/admin/incentives/create" icon={<FaGift />} text="Create Incentive" closeSidebar={closeSidebar} />
            <SidebarLink to="/admin/referrals" icon={<FaUsers />} text="Referral (Admin)" closeSidebar={closeSidebar} />

          </>
        )}

        {hasRole(["employee", "manager", "admin"]) && (
          <SidebarLink to="/referrals" icon={<FaUsers />} text="Referral Form" closeSidebar={closeSidebar} />
        )}
      </nav>
    </aside>
  );
};

const SidebarLink = ({ to, icon, text, closeSidebar }) => (
  <Link
    to={to}
    onClick={() => {
      if (window.innerWidth < 768 && closeSidebar) {
        closeSidebar();
      }
    }}
    className="group flex items-center space-x-4 px-4 py-2 hover:bg-gray-800 transition-colors"
  >
    <span className="text-xl">{icon}</span>
    <span className="whitespace-nowrap">
      {text}
    </span>

  </Link>
);

export default Sidebar;
