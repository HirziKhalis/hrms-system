import React, { useEffect, useState } from "react";
import FadeTransition from "../components/FadeTransition";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


const OvertimePage = () => {
    const [overtimes, setOvertimes] = useState([]);
    const [form, setForm] = useState({ date: "", hours: "", reason: "" });
    const [message, setMessage] = useState("");

    const fetchOvertime = async () => {
        try {
            const res = await fetch("/api/overtime", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = await res.json();
            setOvertimes(data);
        } catch (err) {
            console.error("Failed to fetch overtime:", err);
        }
    };

    useEffect(() => {
        fetchOvertime();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/overtime", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error("Failed to submit overtime");
            setMessage("Overtime submitted successfully!");
            setForm({ date: "", hours: "", reason: "" });
            fetchOvertime();
        } catch (err) {
            console.error(err);
            setMessage("Failed to submit overtime");
        }
    };

    return (
        <FadeTransition>
            <div className="max-w-6xl mx-auto mt-10 p-6 bg-white text-gray-800 rounded shadow">
                <h2 className="text-2xl font-bold mb-6 text-blue-700">Overtime Management</h2>

                {message && <div className="text-green-600 mb-6">{message}</div>}

                {/* Overtime Form */}
                <form onSubmit={handleSubmit} className="mb-10 space-y-6">
                    {/* Date Picker */}
                    <div>
                        <label htmlFor="date" className="block text-gray-700 font-medium mb-1">
                            Date
                        </label>
                        <DatePicker
                            id="date"
                            selected={form.date ? new Date(form.date) : null}
                            onChange={(date) =>
                                setForm({ ...form, date: date.toISOString().split("T")[0] })
                            }
                            dateFormat="yyyy-MM-dd"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500 text-gray-900"
                            placeholderText="Select a date"
                        />
                    </div>

                    {/* Hours Slider */}
                    <div>
                        <label htmlFor="hours" className="block text-gray-700 font-medium mb-1">
                            Hours: <span className="text-blue-600 font-semibold">{form.hours}</span>
                        </label>
                        <input
                            type="range"
                            id="hours"
                            name="hours"
                            min="0.5"
                            max="12"
                            step="0.5"
                            value={form.hours}
                            onChange={(e) => setForm({ ...form, hours: e.target.value })}
                            className="w-full accent-blue-600"
                        />
                        <div className="flex justify-between text-sm text-gray-500 mt-1">
                            <span>0.5</span>
                            <span>12</span>
                        </div>
                    </div>

                    {/* Reason Field */}
                    <div>
                        <label htmlFor="reason" className="block text-gray-700 font-medium mb-1">
                            Reason
                        </label>
                        <textarea
                            id="reason"
                            name="reason"
                            value={form.reason}
                            onChange={(e) => setForm({ ...form, reason: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-500 text-gray-900"
                            rows={3}
                            required
                        ></textarea>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 font-medium"
                    >
                        Submit Overtime
                    </button>
                </form>

                {/* Overtime History Table */}
                <div className="max-w-6xl mx-auto mt-10 p-6 bg-white text-gray-800 rounded shadow">
                    <h2 className="text-2xl font-bold mb-4 text-blue-700">Overtime History</h2>

                    {message && <div className="text-green-600 mb-4">{message}</div>}

                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300 text-sm text-left">
                            <thead className="bg-gray-100 text-gray-700 uppercase">
                                <tr>
                                    <th className="px-4 py-2 border">Date</th>
                                    <th className="px-4 py-2 border">Hours</th>
                                    <th className="px-4 py-2 border">Reason</th>
                                    <th className="px-4 py-2 border">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {overtimes.map((ot) => (
                                    <tr key={ot.overtime_id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 border">
                                            {new Date(ot.date).toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </td>
                                        <td className="px-4 py-2 border">{ot.hours} hrs</td>
                                        <td className="px-4 py-2 border">{ot.reason}</td>
                                        <td className="px-4 py-2 border">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${ot.status === "approved"
                                                    ? "bg-green-600"
                                                    : ot.status === "rejected"
                                                        ? "bg-red-600"
                                                        : "bg-yellow-500"
                                                    }`}
                                            >
                                                {ot.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </FadeTransition>
    );
};

export default OvertimePage;
