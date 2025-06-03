import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import FadeTransition from "../components/FadeTransition";

const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState("");

  const fetchRecords = async () => {
    try {
      const token = localStorage.getItem("token");

      const userRes = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = await userRes.json();
      const isAdmin = userData.role_name === "admin";

      const res = await fetch(isAdmin ? "/api/attendance" : "/api/attendance/my", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error("Expected array but got:", data);
        setMessage(data.message || "Unexpected response from server");
        setRecords([]);
        return;
      }

      setRecords(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setMessage("Failed to load records");
      setRecords([]);
    }
  };

  const handleCheck = async (type) => {
    setMessage("");

    try {
      const res = await fetch(`/api/attendance/${type}`, {
        method: type === "check-in" ? "POST" : "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        return setMessage(data.message || "Error");
      }

      setMessage(`${type === "check-in" ? "Checked in" : "Checked out"} successfully`);
      fetchRecords();
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <FadeTransition>
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">Attendance</h2>

        {message && <p className="mb-4 text-green-600">{message}</p>}

        <div className="mb-6 space-x-4">
          <button
            onClick={() => handleCheck("check-in")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Check In
          </button>
          <button
            onClick={() => handleCheck("check-out")}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Check Out
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-700 border border-gray-200">
            <thead className="bg-gray-100 text-gray-900">
              <tr>
                <th className="px-4 py-2 border">Attendance ID</th>
                <th className="px-4 py-2 border">Employee Name</th>
                <th className="px-4 py-2 border">Check In</th>
                <th className="px-4 py-2 border">Check Out</th>
                <th className="px-4 py-2 border">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.attendance_id} className="bg-white even:bg-gray-50">
                  <td className="px-4 py-2 border">{record.attendance_id}</td>
                  <td className="px-4 py-2 border">{record.employee_name}</td>
                  <td className="px-4 py-2 border">
                    {record.check_in ? format(new Date(record.check_in), "eee, MMM d, yyyy - hh:mm a") : "-"}
                  </td>
                  <td className="px-4 py-2 border">
                    {record.check_out ? format(new Date(record.check_out), "eee, MMM d, yyyy - hh:mm a") : "-"}
                  </td>
                  <td className="px-4 py-2 border">{record.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </FadeTransition>
  );
};

export default Attendance;
