// src/components/Navbar.js or Header.js
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="flex items-center justify-between bg-gray-100 px-6 py-3 shadow">
      <h3 className="text-lg font-semibold text-blue-700">HRMS System</h3>
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



