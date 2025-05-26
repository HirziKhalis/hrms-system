// src/pages/AdminLeaveRequests.jsx
import React, { useEffect, useState } from "react";

const AdminLeaveRequests = () => {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/leave-requests/admin", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load leave requests");
    }
  };

  const handleAction = async (request_id, action) => {
    try {
      const res = await fetch(`/api/leave-requests/${request_id}/${action}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) throw new Error("Action failed");
      setMessage(`Request ${action}ed successfully`);
      fetchRequests(); // refresh list
    } catch (err) {
      console.error(err);
      setMessage("Failed to update request");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div style={{ maxWidth: "1000px", margin: "2rem auto" }}>
      <h2>Admin - Leave Requests</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}

      <table border="1" cellPadding="8" cellSpacing="0" width="100%">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Type</th>
            <th>Dates</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.request_id}>
              <td>{req.employee_name}</td>
              <td>{req.leave_type}</td>
              <td>
                {new Date(req.start_date).toLocaleDateString()} →{" "}
                {new Date(req.end_date).toLocaleDateString()}
              </td>
              <td>{req.notes || "-"}</td>
              <td>{req.status}</td>
              <td>
                {req.status === "pending" ? (
                  <>
                    <button
                      onClick={() => handleAction(req.request_id, "approve")}
                    >
                      Approve
                    </button>{" "}
                    <button
                      onClick={() => handleAction(req.request_id, "reject")}
                      style={{ color: "red" }}
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <em>{req.status}</em>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminLeaveRequests;
