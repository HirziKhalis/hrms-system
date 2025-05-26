// src/pages/LeaveRequestsAdmin.jsx
import React, { useEffect, useState } from "react";

const LeaveRequestsAdmin = () => {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/leave-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to fetch leave requests");
    }
  };

  const handleAction = async (id, status) => {
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/leave-requests/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) {
        return setMessage(data.message || "Error updating status");
      }

      setMessage(`Request ${status} successfully`);
      fetchRequests();
    } catch (err) {
      console.error(err);
      setMessage("Error processing request");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div style={{ maxWidth: "900px", margin: "2rem auto" }}>
      <h2>Leave Requests (Admin)</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}

      <table border="1" cellPadding="8" cellSpacing="0" width="100%">
        <thead>
          <tr>
            <th>Request ID</th>
            <th>Employee ID</th>
            <th>Leave Type</th>
            <th>Start</th>
            <th>End</th>
            <th>Status</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.request_id}>
              <td>{req.request_id}</td>
              <td>{req.employee_id}</td>
              <td>{req.leave_type}</td>
              <td>{new Date(req.start_date).toLocaleDateString()}</td>
              <td>{new Date(req.end_date).toLocaleDateString()}</td>
              <td>{req.status}</td>
              <td>{req.notes || "-"}</td>
              <td>
                {req.status === "pending" ? (
                  <>
                    <button onClick={() => handleAction(req.request_id, "approved")}>
                      Approve
                    </button>{" "}
                    <button onClick={() => handleAction(req.request_id, "rejected")}>
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

export default LeaveRequestsAdmin;
