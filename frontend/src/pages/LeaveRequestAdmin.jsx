import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FadeTransition from "../components/FadeTransition";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/layouts/AdminLayout";

const ROWS_PER_PAGE = 8;

const LeaveRequestsAdmin = () => {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const fetchRequests = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`/api/leave-requests?page=${page}&limit=${ROWS_PER_PAGE}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok || !Array.isArray(data.data)) {
        setMessage(data.message || "Failed to load data.");
        setRequests([]);
        setTotalPages(1);
        return;
      }

      setRequests(data.data);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.currentPage || 1);
    } catch (err) {
      console.error(err);
      setMessage("Error fetching leave requests");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    setMessage("");
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`/api/leave-requests/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Failed to update status");
        return;
      }

      setMessage(`Request ${status} successfully`);
      fetchRequests(currentPage);
    } catch (err) {
      console.error(err);
      setMessage("Error processing request");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-600";
      case "rejected":
        return "bg-red-600";
      default:
        return "bg-blue-600";
    }
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  useEffect(() => {
    fetchRequests(currentPage);
  }, [currentPage]);

  return (
    <AdminLayout>
      <FadeTransition>
        <div className="max-w-6xl mx-auto p-6 bg-white text-gray-800 rounded shadow">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">Leave Requests (Admin)</h2>

          <div className="flex gap-2 mb-6">
            <Button
              onClick={() => navigate("/admin/leave-requests")}
              className={`mb-3 ${currentPath === "/admin/leave-requests"
                ? "bg-gray-300 text-gray-800"
                : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
            >
              Leave Requests
            </Button>
            <Button
              onClick={() => navigate("/admin/leave-quotas")}
              className={`mb-3 ${currentPath === "/admin/leave-quotas"
                ? "bg-gray-300 text-gray-800"
                : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
            >
              Manage Quotas
            </Button>
          </div>

          {message && <p className="mb-4 text-green-600">{message}</p>}

          {loading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 text-sm text-left">
                  <thead className="bg-gray-100 text-gray-700 uppercase">
                    <tr>
                      <th className="px-4 py-2 border">Employee Name</th>
                      <th className="px-4 py-2 border">Supervisor</th>
                      <th className="px-4 py-2 border">Leave Type</th>
                      <th className="px-4 py-2 border">Start</th>
                      <th className="px-4 py-2 border">End</th>
                      <th className="px-4 py-2 border">Requested Days</th>
                      <th className="px-4 py-2 border">Status</th>
                      <th className="px-4 py-2 border">Notes</th>
                      <th className="px-4 py-2 border">Remaining Quota</th>
                      <th className="px-4 py-2 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req.request_id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border">{req.employee_name}</td>
                        <td className="px-4 py-2 border">{req.supervisor_name || "-"}</td>
                        <td className="px-4 py-2 border">{req.leave_type}</td>
                        <td className="px-4 py-2 border">{formatDate(req.start_date)}</td>
                        <td className="px-4 py-2 border">{formatDate(req.end_date)}</td>
                        <td className="px-4 py-2 text-center border">{req.requested_days} days</td>
                        <td className="px-4 py-2 border">
                          <span
                            className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${getStatusColor(
                              req.status
                            )}`}
                          >
                            {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-2 border">{req.notes || "-"}</td>
                        <td
                          className={`px-4 py-2 text-center font-semibold border border-gray-600 ${req.is_quota_limited === false
                            ? "text-blue-600"
                            : req.remaining_days != null
                              ? req.remaining_days < 5
                                ? "text-red-600"
                                : req.remaining_days < 8
                                  ? "text-yellow-600"
                                  : "text-gray-800"
                              : "text-gray-400"
                            }`}
                        >
                          {req.is_quota_limited === false
                            ? "Unlimited"
                            : req.remaining_days != null
                              ? `${req.remaining_days} days`
                              : "N/A"}
                        </td>
                        <td className="px-4 py-2 border">
                          {req.status === "pending" ? (
                            <div className="flex gap-2">
                              <button
                                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                                onClick={() => handleAction(req.request_id, "approved")}
                              >
                                Approve
                              </button>
                              <button
                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                                onClick={() => handleAction(req.request_id, "rejected")}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <em className="text-gray-600">{req.status}</em>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex justify-center">
                <Pagination>
                  <PaginationContent className="space-x-1 text-sm">
                    <PaginationItem>
                      <PaginationPrevious
                        className="border border-gray-300 px-3 py-1 rounded hover:bg-gray-100"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      />
                    </PaginationItem>

                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              setCurrentPage(page)
                            }}
                            isActive={page === currentPage}
                            className={`px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 ${page === currentPage ? "bg-blue-600 text-white" : ""
                              }`}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}

                    <PaginationItem>
                      <PaginationNext
                        className="border border-gray-300 px-3 py-1 rounded hover:bg-gray-100"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </div>
      </FadeTransition>
    </AdminLayout>
  );
};

export default LeaveRequestsAdmin;
