import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "../styles/DashboardLayout.css"; // Optional styling

const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="content">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
