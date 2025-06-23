import React, { useEffect, useState } from "react";
import FadeTransition from "../components/FadeTransition";
import DatePicker from "react-datepicker";
import { parseISO, format } from "date-fns";
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
  const [quotaMap, setQuotaMap] = useState({});
  const [message, setMessage] = useState("");
  const [loadingQuota, setLoadingQuota] = useState(false);

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
      console.error("Error fetching leave types:", err);
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
      console.error("Error fetching requests:", err);
      setMessage("Failed to load leave requests");
    }
  };

  const fetchQuota = async () => {
    setLoadingQuota(true);
    try {
      const res = await fetch("/api/leave-requests/quota", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();

      console.log("Fetched quota:", data); // Debug log

      const mapped = {};
      data.forEach((q) => {
        mapped[q.leave_type_id] = q;
      });
      setQuotaMap(mapped);
    } catch (err) {
      console.error("Error fetching quota:", err);
    } finally {
      setLoadingQuota(false);
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
      fetchQuota();
    } catch (err) {
      console.error("Submit error:", err);
      setMessage("Something went wrong");
    }
  };

  const selectedQuota = form.leave_type_id
    ? quotaMap[form.leave_type_id] ?? null
    : null;

  const remainingDays =
    selectedQuota && selectedQuota.total_days != null && selectedQuota.used_days != null
      ? Number(selectedQuota.total_days) - Number(selectedQuota.used_days)
      : null;

  return (
    <FadeTransition>
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white text-gray-800 rounded shadow">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Leave Request</h2>
        {message && <p className="mb-4 text-green-600">{message}</p>}

        {/* Quota Display */}
        {form.leave_type_id && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900">
            {loadingQuota ? (
              <p>Loading quota...</p>
            ) : selectedQuota ? (
              <>
                <p>
                  <strong>Total Quota:</strong> {selectedQuota.total_days ?? "N/A"} days
                </p>
                <p>
                  <strong>Used:</strong> {selectedQuota.used_days ?? 0} days
                </p>
                <p>
                  <strong>Remaining:</strong> {Number.isFinite(remainingDays) ? remainingDays : "N/A"} days
                </p>
              </>
            ) : (
              <p>No quota data available for this leave type.</p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div>
            <label className="block mb-1 font-medium">Leave Type:</label>
            <select
              value={form.leave_type_id}
              onChange={(e) =>
                setForm({ ...form, leave_type_id: e.target.value })
              }
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
              selected={form.start_date ? parseISO(form.start_date) : null}
              onChange={(date) =>
                setForm({
                  ...form,
                  start_date: format(date, "yyyy-MM-dd"),
                })
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
              selected={form.end_date ? parseISO(form.end_date) : null}
              onChange={(date) =>
                setForm({
                  ...form,
                  end_date: format(date, "yyyy-MM-dd"),
                })
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