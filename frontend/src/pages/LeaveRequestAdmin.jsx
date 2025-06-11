import React, { useEffect, useState } from "react";
import FadeTransition from "../components/FadeTransition";

const LeaveRequestsAdmin = () => {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/leave-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        setMessage(errorData.message || "Unauthorized or failed to fetch data");
        setRequests([]);
        return;
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        setMessage("Unexpected data format from server.");
        setRequests([]);
        return;
      }

      setRequests(data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to fetch leave requests");
      setRequests([]);
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
        setMessage(data.message || "Failed to update status");
        return;
      }

      setMessage(`Request ${status} successfully`);
      fetchRequests(); // Refresh
    } catch (err) {
      console.error(err);
      setMessage("Error processing request");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <FadeTransition>
      <div className="max-w-6xl mx-auto mt-10 p-6 bg-white text-gray-800 rounded shadow">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Leave Requests (Admin)</h2>
        {message && <p className="mb-4 text-green-600">{message}</p>}

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 uppercase">
              <tr>
                <th className="px-4 py-2 border">Employee Name</th>
                <th className="px-4 py-2 border">Leave Type</th>
                <th className="px-4 py-2 border">Start</th>
                <th className="px-4 py-2 border">End</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Notes</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.request_id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{req.employee_name}</td>
                  <td className="px-4 py-2 border">{req.leave_type}</td>
                  <td className="px-4 py-2 border">
                    {new Date(req.start_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 border">
                    {new Date(req.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 border">
                    <span
                      className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${req.status === "approved"
                        ? "bg-green-600"
                        : req.status === "rejected"
                          ? "bg-red-600"
                          : "bg-blue-600"
                        }`}
                    >
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-2 border">{req.notes || "-"}</td>
                  <td className="px-4 py-2 border">
                    {req.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                          onClick={() => handleAction(req.request_id, "approved")}
                        >
                          Approve
                        </button>
                        <button
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                          onClick={() => handleAction(req.request_id, "rejected")}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <em className="text-gray-600">{req.status}</em>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </FadeTransition>
  );
};

export default LeaveRequestsAdmin;
