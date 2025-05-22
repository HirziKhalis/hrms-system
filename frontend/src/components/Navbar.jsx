// src/components/Navbar.js or Header.js
import { logout } from "../utils/auth";

const Navbar = () => {
  return (
    <nav className="navbar">
      <h3>HRMS System</h3>
      <button onClick={logout}>Logout</button>
    </nav>
  );
};

export default Navbar;

