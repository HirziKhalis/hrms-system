import React, { useState, useEffect } from "react";
import FadeTransition from "../components/FadeTransition";
import InputField from "../components/InputField";

const IncentiveFormAdmin = () => {
    const [employees, setEmployees] = useState([]);
    const [form, setForm] = useState({
        employee_id: "",
        title: "",
        description: "",
        monetary_value: "",
        date_awarded: "",
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchEmployees = async () => {
            const token = localStorage.getItem("token");
            try {
                const res = await fetch("/api/employees", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setEmployees(data);
            } catch (err) {
                console.error("Failed to fetch employees");
            }
        };

        fetchEmployees();
    }, []);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/incentives", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...form,
                    monetary_value: parseFloat(form.monetary_value),
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to submit");
            }

            setMessage("Incentive created successfully.");
            setForm({
                employee_id: "",
                type: "",
                description: "",
                monetary_value: "",
                status: "approved",
            });
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <FadeTransition>
            <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
                <div className="bg-white border border-gray-300 shadow-md rounded-lg p-8 w-full max-w-xl">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                        Create Incentive
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Employee dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Employee
                            </label>
                            <select
                                name="employee_id"
                                value={form.employee_id}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-800"
                                required
                            >
                                <option value="">Select employee</option>
                                {employees.map((emp) => (
                                    <option key={emp.employee_id} value={emp.employee_id}>
                                        {emp.first_name} {emp.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <InputField
                            label="Title"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="Incentive title (e.g. Monthly Star)"
                            required
                        />

                        {/* Type input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Type
                            </label>
                            <input
                                type="text"
                                name="type"
                                value={form.type}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-800"
                                placeholder="e.g. Performance, Milestone"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-800"
                                rows={3}
                                required
                            />
                        </div>

                        {/* Amount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Monetary Value
                            </label>
                            <input
                                type="number"
                                name="monetary_value"
                                value={form.monetary_value}
                                onChange={handleChange}
                                className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-800"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
                        >
                            Submit Incentive
                        </button>

                        {/* Messages */}
                        {message && <p className="text-green-600 text-center">{message}</p>}
                        {error && <p className="text-red-600 text-center">{error}</p>}
                    </form>
                </div>
            </div>
        </FadeTransition>
    );
};

export default IncentiveFormAdmin;