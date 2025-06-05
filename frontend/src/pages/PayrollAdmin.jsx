import React, { useEffect, useState } from "react";
import FadeTransition from "../components/FadeTransition";

const PayrollAdmin = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPayrolls = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/payroll", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const contentType = res.headers.get("content-type");

        if (!res.ok) {
          if (contentType?.includes("application/json")) {
            const errorData = await res.json();
            throw new Error(errorData.message || "Failed to fetch payrolls");
          } else {
            const errorText = await res.text();
            throw new Error(errorText || "Unknown error occurred");
          }
        }

        if (contentType?.includes("application/json")) {
          const data = await res.json();
          setPayrolls(data);
        } else {
          throw new Error("Unexpected response format (not JSON)");
        }
      } catch (err) {
        console.error("Error fetching payrolls:", err.message);
        setError(err.message);
      }
    };

    fetchPayrolls();
  }, []);

  return (
    <FadeTransition>
      <div className="max-w-6xl mx-auto mt-10 p-6 bg-white text-gray-800 rounded shadow">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Payroll Records</h2>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-sm text-left">
            <thead className="bg-gray-100 text-gray-700 uppercase">
              <tr>
                <th className="px-4 py-2 border">Employee</th>
                <th className="px-4 py-2 border">Month</th>
                <th className="px-4 py-2 border">Base</th>
                <th className="px-4 py-2 border">Bonus</th>
                <th className="px-4 py-2 border">Deductions</th>
                <th className="px-4 py-2 border">Net Salary</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.map((p) => (
                <tr key={p.payroll_id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{p.full_name}</td>
                  <td className="px-4 py-2 border">{new Date(p.month + "-01").toLocaleString("default", { month: "long", year: "numeric" })}</td>
                  <td className="px-4 py-2 border">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0
                    }).format(p.base_salary)}</td>
                  <td className="px-4 py-2 border">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0
                    }).format(p.bonus)}</td>
                  <td className="px-4 py-2 border">  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0
                  }).format(p.deductions)}</td>
                  <td className="px-4 py-2 border font-semibold text-green-600">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0
                    }).format(p.net_salary)}
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

export default PayrollAdmin;
