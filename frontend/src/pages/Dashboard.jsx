// src/pages/Dashboard.jsx (or MainLayout.jsx if reused)
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="flex h-screen w-screen">

            {/* Main Content */}
            <main className="flex-1 bg-gray-100 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-blue-600">Dashboard</h2>
                </header>

                <section>
                    <p className="text-lg text-gray-700">Welcome! This is your dashboard.</p>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
