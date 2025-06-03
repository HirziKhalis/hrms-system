import React from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import LeaveRequest from "./pages/LeaveRequest";
import LeaveRequestsAdmin from "./pages/LeaveRequestAdmin";
import Unauthorized from "./pages/Unauthorized";
import PayrollAdmin from "./pages/PayrollAdmin";
import PrivateRoute from "./components/PrivateRoute";
import RequireRole from "./components/RequireRole";
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
          <RequireRole roles={["admin", "manager"]}>
            <DashboardLayout>
              <LeaveRequestsAdmin />
            </DashboardLayout>
          </RequireRole>
        }
      />

      <Route
        path="/admin/payroll"
        element={
          <RequireRole roles={["admin", "manager"]}>
            <DashboardLayout>
              <PayrollAdmin />
            </DashboardLayout>
          </RequireRole>
        }
      />
    </Routes>
  );
};

export default App;
