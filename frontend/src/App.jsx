import React from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RequireAdmin from "./components/RequireAdmin";
import Unauthorized from "./pages/Unauthorized";
import Attendance from "./pages/Attendance";
import PrivateRoute from "./components/PrivateRoute";
import LeaveRequest from "./pages/LeaveRequest";
import LeaveRequestsAdmin from "./pages/LeaveRequestAdmin";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <PrivateRoute>
            <Attendance />
          </PrivateRoute>
        }
      />
      <Route
        path="/leave-request"
        element={
          <PrivateRoute>
            <LeaveRequest />
          </PrivateRoute>
        }
      />
      <Route path="/admin/leave-requests" element={
        <RequireAdmin>
          <LeaveRequestsAdmin />
        </RequireAdmin>
      } />

      <Route path="/unauthorized" element={<Unauthorized />} />
    </Routes>

  );
};

export default App;
