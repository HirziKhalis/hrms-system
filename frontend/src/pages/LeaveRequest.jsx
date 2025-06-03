import React, { useEffect, useState } from "react";
import FadeTransition from "../components/FadeTransition";

const LeaveRequest = () => {
  const [form, setForm] = useState({
    leave_type_id: "",
    start_date: "",
    end_date: "",
    notes: "",
  });
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [leaveTypes, setLeaveTypes] = useState([]);

  useEffect(() => {
    fetchRequests();
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const res = await fetch("/api/leave-requests/types", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      setLeaveTypes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/leave-requests/my", {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("/api/leave-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Submission failed");
        return;
      }

      setMessage("Leave request submitted successfully");
      setForm({ leave_type_id: "", start_date: "", end_date: "", notes: "" });
      fetchRequests();
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
    }
  };

  return (
    <FadeTransition>
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white text-gray-800 rounded shadow">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Leave Request</h2>
        {message && <p className="mb-4 text-green-600">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div>
            <label className="block mb-1 font-medium">Leave Type:</label>
            <select
              value={form.leave_type_id}
              onChange={(e) => setForm({ ...form, leave_type_id: e.target.value })}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">-- Select --</option>
              {leaveTypes.map((type) => (
                <option key={type.leave_type_id} value={type.leave_type_id}>
                  {type.type_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Start Date:</label>
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">End Date:</label>
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              required
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Reason:</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
              rows="3"
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
          >
            Submit Request
          </button>
        </form>

        <h3 className="text-xl font-semibold mb-4">My Requests</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-sm text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 border">Type</th>
                <th className="px-4 py-2 border">Dates</th>
                <th className="px-4 py-2 border">Reason</th>
                <th className="px-4 py-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.request_id} className="bg-white even:bg-gray-50">
                  <td className="px-4 py-2 border">{req.leave_type}</td>
                  <td className="px-4 py-2 border">
                    {new Date(req.start_date).toLocaleDateString()} →{" "}
                    {new Date(req.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 border">{req.notes || "-"}</td>
                  <td className="px-4 py-2 border capitalize">{req.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </FadeTransition>
  );
};

export default LeaveRequest;
