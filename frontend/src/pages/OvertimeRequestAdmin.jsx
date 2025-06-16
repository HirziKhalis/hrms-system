import React, { useEffect, useState } from "react";
import FadeTransition from "../components/FadeTransition";
import dayjs from "dayjs";

const OvertimeRequestsAdmin = () => {
    const [requests, setRequests] = useState([]);
    const [message, setMessage] = useState("");

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/overtime/all", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();

            if (!res.ok || !Array.isArray(data)) {
                setMessage(data.message || "Failed to fetch overtime requests");
                setRequests([]);
                return;
            }

            setRequests(data);
        } catch (err) {
            console.error(err);
            setMessage("Server error while fetching overtime requests");
        }
    };

    const handleStatusChange = async (id, status) => {
        setMessage("");
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/overtime/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status }),
            });

            const data = await res.json();
            if (!res.ok) {
                setMessage(data.message || "Failed to update request");
                return;
            }

            setMessage(`Request ${status} successfully`);
            fetchRequests(); // refresh
        } catch (err) {
            console.error(err);
            setMessage("Error updating status");
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    return (
        <FadeTransition>
            <div className="max-w-6xl mx-auto mt-10 p-6 bg-white shadow rounded">
                <h2 className="text-2xl font-bold mb-4 text-blue-700">Overtime Requests (Admin)</h2>
                {message && <p className="mb-4 text-green-600">{message}</p>}

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-300 text-sm text-left bg-white rounded-lg overflow-hidden shadow">
                        <thead className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-4 py-3 border">Employee</th>
                                <th className="px-4 py-2 border">Supervisor</th>
                                <th className="px-4 py-3 border">Date</th>
                                <th className="px-4 py-3 border">Hours</th>
                                <th className="px-4 py-3 border">Reason</th>
                                <th className="px-4 py-3 border">Status</th>
                                <th className="px-4 py-3 border">Submitted</th>
                                <th className="px-4 py-3 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-gray-800">
                            {requests.map((req) => (
                                <tr
                                    key={req.overtime_id}
                                    className="hover:bg-gray-50 transition-colors duration-150"
                                >
                                    <td className="px-4 py-3 border">{req.employee_name || "Unknown"}</td>
                                    <td className="px-4 py-2 border">{req.supervisor_name || "-"}</td>
                                    <td className="px-4 py-3 border">{dayjs(req.date).format("DD MMM YYYY")}</td>
                                    <td className="px-4 py-3 border text-center">{req.hours} hrs</td>
                                    <td className="px-4 py-3 border">{req.reason || "-"}</td>
                                    <td className="px-4 py-3 border capitalize">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${req.status === "approved"
                                                ? "bg-green-600"
                                                : req.status === "rejected"
                                                    ? "bg-red-600"
                                                    : "bg-blue-600"
                                                }`}
                                        >
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 border">
                                        {req.submitted_at ? dayjs(req.submitted_at).format("DD MMM YYYY") : "N/A"}
                                    </td>
                                    <td className="px-4 py-3 border">
                                        {req.status === "pending" ? (
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                                    onClick={() => handleStatusChange(req.overtime_id, "approved")}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                                    onClick={() => handleStatusChange(req.overtime_id, "rejected")}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <em className="text-gray-600 text-sm block text-center">No action</em>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {requests.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center py-4 text-gray-500">
                                        No overtime requests found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </FadeTransition>
    );
};

export default OvertimeRequestsAdmin;
