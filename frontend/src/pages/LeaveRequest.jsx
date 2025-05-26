import React, { useEffect, useState } from "react";

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
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Failed with status ${res.status}: ${text}`);
            }
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
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Failed with status ${res.status}: ${text}`);
            }
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
            setForm({ leave_type: "", start_date: "", end_date: "", notes: "" });
            fetchRequests();
        } catch (err) {
            console.error(err);
            setMessage("Something went wrong");
        }
    };

    return (
        <div style={{ maxWidth: "600px", margin: "2rem auto" }}>
            <h2>Leave Request</h2>
            {message && <p style={{ color: "green" }}>{message}</p>}

            <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
                <label>Type:</label>
                <select
                    value={form.leave_type_id}
                    onChange={(e) => setForm({ ...form, leave_type_id: e.target.value })}
                    required
                >
                    <option value="">--Select--</option>
                    {leaveTypes.map((type) => (
                        <option key={type.leave_type_id} value={type.leave_type_id}>
                            {type.type_name}
                        </option>
                    ))}
                </select>
                <br /><br />

                <label>Start Date:</label>
                <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    required
                />
                <br /><br />

                <label>End Date:</label>
                <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    required
                />
                <br /><br />

                <label>Reason:</label>
                <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
                <br /><br />

                <button type="submit">Submit Request</button>
            </form>

            <h3>My Requests</h3>
            <table border="1" cellPadding="8" cellSpacing="0" width="100%">
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Dates</th>
                        <th>Reason</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map((req) => (
                        <tr key={req.request_id}>
                            <td>{req.leave_type}</td>
                            <td>
                                {new Date(req.start_date).toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })} →{" "}
                                {new Date(req.end_date).toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </td>
                            <td>{req.notes || "-"}</td>
                            <td>{req.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default LeaveRequest;
