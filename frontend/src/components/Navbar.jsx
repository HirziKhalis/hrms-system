// src/components/Navbar.js or Header.js
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaBars } from "react-icons/fa";

const Navbar = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    document.body.classList.add("fade-out");
    setTimeout(() => {
      localStorage.removeItem("token");
      navigate("/login");
    }, 300);
  };

  return (
    <nav className="flex items-center justify-between bg-gray-100 px-6 py-3 shadow">
      {/* Hamburger button - only visible on small screens */}
      <button
        onClick={onToggleSidebar}
        className="md:hidden bg-black text-white px-4 py-2 rounded hover:bg-gray-800 focus:outline-none"
      >
        <FaBars size={22} />
      </button>

      <h3 className="text-lg font-semibold text-blue-700 hidden md:block">HRMS System</h3>

      <button
        onClick={handleLogout}
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;