import React from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import LeaveRequest from "./pages/LeaveRequest";
import LeaveRequestsAdmin from "./pages/LeaveRequestAdmin";
import Unauthorized from "./pages/Unauthorized";

import PrivateRoute from "./components/PrivateRoute";
import RequireAdmin from "./components/RequireAdmin";
import DashboardLayout from "./components/DashboardLayout";

const App = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Private routes with sidebar */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <Attendance />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/leave-request"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <LeaveRequest />
            </DashboardLayout>
          </PrivateRoute>
        }
      />

      {/* Admin route with sidebar */}
      <Route
        path="/admin/leave-requests"
        element={
          <RequireAdmin>
            <DashboardLayout>
              <LeaveRequestsAdmin />
            </DashboardLayout>
          </RequireAdmin>
        }
      />
    </Routes>
  );
};

export default App;
