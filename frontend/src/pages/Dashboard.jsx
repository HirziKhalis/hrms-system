// src/pages/Dashboard.jsx (or MainLayout.jsx if reused)
import React from "react";
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
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white p-4 flex flex-col">
                <h1 className="text-xl font-bold mb-6">HRMS</h1>

                <nav className="flex flex-col space-y-2">
                    <Link to="/dashboard" className="hover:text-blue-400">Dashboard</Link>
                    <Link to="/attendance" className="hover:text-blue-400">Attendance</Link>
                    <Link to="/leave-request" className="hover:text-blue-400">Leave Requests</Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-gray-100 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-blue-600">Dashboard</h2>
                    <button
                        onClick={handleLogout}
                        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                    >
                        Logout
                    </button>
                </header>

                <section>
                    <p className="text-lg text-gray-700">Welcome! This is your dashboard.</p>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
