// src/pages/Attendance.jsx
import React, { useState, useEffect } from "react";
import { format } from "date-fns";

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
                setRecords([]); // Set to empty array to avoid crash
                return;
            }

            setRecords(data);
        } catch (err) {
            console.error("Fetch error:", err);
            setMessage("Failed to load records");
            setRecords([]); // Avoid crash on render
        }
    };

    const handleCheck = async (type) => {
        setMessage("");

        try {
            const res = await fetch(`/api/attendance/${type}`, {
                method: type === "check-in" ? "POST" : "PATCH", // ✅ use PATCH for check-out
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
            fetchRecords(); // Refresh
        } catch (err) {
            console.error(err);
            setMessage("Something went wrong");
        }
    };


    useEffect(() => {
        fetchRecords();
    }, []);

    return (
        <div style={{ maxWidth: "600px", margin: "2rem auto" }}>
            <h2>Attendance</h2>
            {message && <p style={{ color: "green" }}>{message}</p>}

            <div style={{ marginBottom: "1rem" }}>
                <button onClick={() => handleCheck("check-in")}>Check In</button>{" "}
                <button onClick={() => handleCheck("check-out")}>Check Out</button>
            </div>

            <table border="1" cellPadding="8" cellSpacing="0" width="100%">
                <thead>
                    <tr>
                        <th>Attendance ID</th>
                        <th>Employee Name</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((record) => (
                        <tr key={record.attendance_id}>
                            <td>{record.attendance_id}</td>
                            <td>{record.employee_name}</td>
                            <td>{format(new Date(record.check_in), "eee, MMM d, yyyy - hh:mm a")}</td>
                            <td>{format(new Date(record.check_out), "eee, MMM d, yyyy - hh:mm a")}</td>
                            <td>{record.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Attendance;
