import React, { useEffect, useState } from "react";
import FadeTransition from "../components/FadeTransition";
import dayjs from "dayjs";

const ReferralsAdmin = () => {
    const [message, setMessage] = useState("");
    const [referrals, setReferrals] = useState([]);

    // ✅ Move fetchReferrals to the top level of the component
    const fetchReferrals = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await fetch("/api/referrals", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (Array.isArray(data)) {
                setReferrals(data);
            } else if (Array.isArray(data.referrals)) {
                setReferrals(data.referrals);
            } else {
                console.error("Unexpected response format:", data);
                setReferrals([]);
            }
        } catch (err) {
            console.error("Failed to fetch referrals:", err);
            setReferrals([]);
        }
    };

    useEffect(() => {
        fetchReferrals();
    }, []);

    const handleAction = async (id, action) => {
        try {
            console.log("Updating referral:", {
                id,
                status: action,
                reward_granted: action === "approved",
            });

            const res = await fetch(`/api/referrals/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    status: action,
                    reward_granted: action === "approved",
                }),
            });

            if (!res.ok) throw new Error("Failed to update referral");

            setMessage(`Referral ${action} successfully.`);
            fetchReferrals(); // ✅ Now accessible
        } catch (err) {
            console.error(err);
            setMessage("Error updating referral");
        }
    };

    return (
        <FadeTransition>
            <div className="max-w-6xl mx-auto mt-10 p-6 bg-white shadow rounded">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Referral Management</h2>
                {message && <p className="mb-4 text-green-600">{message}</p>}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-300 text-sm text-left bg-white rounded-lg overflow-hidden shadow">
                        <thead className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
                            <tr>
                                <th className="px-4 py-3 border">Candidate</th>
                                <th className="px-4 py-3 border">Position</th>
                                <th className="px-4 py-3 border">Referred By</th>
                                <th className="px-4 py-3 border">Status</th>
                                <th className="px-4 py-3 border">Submitted</th>
                                <th className="px-4 py-3 border">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-gray-800">
                            {referrals.map((r) => (
                                <tr key={r.referral_id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-4 py-3 border text-gray-800">{r.candidate_name}</td>
                                    <td className="px-4 py-3 border text-gray-800">{r.position}</td>
                                    <td className="px-4 py-3 border text-gray-800">{r.employee_name}</td>
                                    <td className="px-4 py-3 border capitalize text-gray-800">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${r.status === "approved"
                                                ? "bg-green-600"
                                                : r.status === "rejected"
                                                    ? "bg-red-600"
                                                    : "bg-blue-600"
                                                }`}
                                        >
                                            {r.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 border text-gray-800">
                                        {r.referred_on ? dayjs(r.referred_on).format("DD MMM YYYY") : "N/A"}
                                    </td>
                                    <td className="px-4 py-3 border text-gray-800">
                                        {r.status === "pending" ? (
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                                    onClick={() => handleAction(r.referral_id, "approved")}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                                    onClick={() => handleAction(r.referral_id, "rejected")}
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
                        </tbody>

                    </table>
                </div>
            </div>
        </FadeTransition>
    );
};

export default ReferralsAdmin;
