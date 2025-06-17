import React, { useEffect, useState } from "react";
import FadeTransition from "../components/FadeTransition";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const LeaveRequest = () => {
  const [form, setForm] = useState({
    leave_type_id: "",
    start_date: "",
    end_date: "",
    notes: "",
  });

  const [requests, setRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [message, setMessage] = useState("");
  const [quota, setQuota] = useState({ total_days: 0, used_days: 0 });

  useEffect(() => {
    fetchLeaveTypes();
    fetchRequests();
    fetchQuota();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const res = await fetch("/api/leave-requests/types", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to load leave requests");
    }
  };

  const fetchQuota = async () => {
    try {
      const res = await fetch("/api/leave-requests/quota", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setQuota(data);
    } catch (err) {
      console.error("Error fetching quota", err);
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
      fetchQuota(); // update quota after submission
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
    }
  };

  const remainingDays = quota.total_days - quota.used_days;

  return (
    <FadeTransition>
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white text-gray-800 rounded shadow">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Leave Request</h2>
        {message && <p className="mb-4 text-green-600">{message}</p>}

        {/* Quota Display */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900">
          <p>
            <strong>Total Quota:</strong> {quota.total_days} days
          </p>
          <p>
            <strong>Used:</strong> {quota.used_days} days
          </p>
          <p>
            <strong>Remaining:</strong> {remainingDays} days
          </p>
        </div>

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
            <DatePicker
              selected={form.start_date ? new Date(form.start_date) : null}
              onChange={(date) =>
                setForm({ ...form, start_date: date.toISOString().split("T")[0] })
              }
              dateFormat="yyyy-MM-dd"
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholderText="Select start date"
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">End Date:</label>
            <DatePicker
              selected={form.end_date ? new Date(form.end_date) : null}
              onChange={(date) =>
                setForm({ ...form, end_date: date.toISOString().split("T")[0] })
              }
              dateFormat="yyyy-MM-dd"
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholderText="Select end date"
              required
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
                  <td className="px-4 py-2 border">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${req.status === "approved"
                        ? "bg-green-600"
                        : req.status === "rejected"
                          ? "bg-red-600"
                          : "bg-yellow-500"
                        }`}
                    >
                      {req.status}
                    </span>
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

export default LeaveRequest;
