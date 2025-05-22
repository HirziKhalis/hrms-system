// src/pages/Dashboard.js or similar
import React from "react";
import Navbar from "../components/Navbar";
import DashboardLayout from "../components/DashboardLayout";

const Dashboard = () => {
    return (
        <>
            <DashboardLayout>
                <h2>Welcome to the Dashboard</h2>
                <p>This is the main dashboard content area.</p>
            </DashboardLayout>
        </>
    );
};

export default Dashboard;
