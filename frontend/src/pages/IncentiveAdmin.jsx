import React, { useEffect, useState } from "react";
import FadeTransition from "../components/FadeTransition";

const IncentiveAdmin = () => {
  const [incentives, setIncentives] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchIncentives = async () => {
      try {
        const res = await fetch("/api/incentives", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (!res.ok) throw new Error("Failed to fetch incentives");
        const data = await res.json();
        setIncentives(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchIncentives();
  }, []);

  return (
    <FadeTransition>
      <div className="max-w-6xl mx-auto mt-10 p-6 bg-white text-gray-800 rounded shadow">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Incentive Records</h2>
        {error && <p className="text-red-600">{error}</p>}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 uppercase">
              <tr>
                <th className="px-4 py-2 border">Employee</th>
                <th className="px-4 py-2 border">Title</th>
                <th className="px-4 py-2 border">Description</th>
                <th className="px-4 py-2 border">Points</th>
                <th className="px-4 py-2 border">Value</th>
                <th className="px-4 py-2 border">Awarded On</th>
              </tr>
            </thead>
            <tbody>
              {incentives.map((item) => (
                <tr key={item.incentive_id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{item.employee_name}</td>
                  <td className="px-4 py-2 border">{item.title}</td>
                  <td className="px-4 py-2 border">{item.description}</td>
                  <td className="px-4 py-2 border">{item.points}</td>
                  <td className="px-4 py-2 border">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0
                    }).format(item.monetary_value)}
                  </td>
                  <td className="px-4 py-2 border">
                    {new Date(item.date_awarded).toLocaleDateString()}
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

export default IncentiveAdmin;
