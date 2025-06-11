import React from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import LeaveRequest from "./pages/LeaveRequest";
import LeaveRequestsAdmin from "./pages/LeaveRequestAdmin";
import Unauthorized from "./pages/Unauthorized";
import PayrollAdmin from "./pages/PayrollAdmin";
import IncentiveAdmin from "./pages/IncentiveAdmin";
import ReferralForm from "./pages/ReferralForm";
import PrivateRoute from "./components/PrivateRoute";
import RequireRole from "./components/RequireRole";
import DashboardLayout from "./components/DashboardLayout";
import ReferralsAdmin from "./pages/ReferralsAdmin";
import IncentiveFormAdmin from "./pages/IncentiveFormAdmin";
import OvertimePage from "./pages/OvertimePage";

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

      <Route path="/referrals" element={
        <RequireRole roles={["employee", "admin", "manager"]}>
          <DashboardLayout>
            <ReferralForm />
          </DashboardLayout>
        </RequireRole>
      } />

      <Route path="/incentives" element={
        <RequireRole roles={["admin"]}>
          <DashboardLayout>
            <IncentiveAdmin />
          </DashboardLayout>
        </RequireRole>
      } />

      <Route
        path="/admin/referrals"
        element={
          <RequireRole roles={["admin"]}>
            <DashboardLayout>
              <ReferralsAdmin />
            </DashboardLayout>
          </RequireRole>
        }
      />

      <Route
        path="/admin/incentives/create"
        element={
          <RequireRole roles={["admin"]}>
            <DashboardLayout>
              <IncentiveFormAdmin />
            </DashboardLayout>
          </RequireRole>
        }
      />

      <Route
        path="/overtime"
        element={
          <PrivateRoute>
            <DashboardLayout>
              <OvertimePage />
            </DashboardLayout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default App;
