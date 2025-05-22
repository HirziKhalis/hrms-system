import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        {/* Add more links later based on role */}
      </ul>
    </aside>
  );
};

export default Sidebar;
