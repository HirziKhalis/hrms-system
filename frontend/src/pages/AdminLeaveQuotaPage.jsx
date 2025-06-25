import React, { useEffect, useState } from "react";
import FadeTransition from "../components/FadeTransition";
import AdminLayout from "@/components/layouts/AdminLayout"; // ⬅️ new layout wrapper
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationPrevious,
    PaginationNext,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";

const ROWS_PER_PAGE = 8;

const AdminLeaveQuotaPage = () => {
    const [quotas, setQuotas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeEmployee, setActiveEmployee] = useState(null);
    const [editQuotas, setEditQuotas] = useState([]);

    const fetchLeaveQuotas = async (page = 1) => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");

            const res = await fetch(`/api/leave-quotas?page=${page}&limit=${ROWS_PER_PAGE}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Failed to fetch leave quotas");

            const data = await res.json();
            setQuotas(data.data || []);
            setTotalPages(data.totalPages || 1);
            setCurrentPage(data.currentPage || 1);
        } catch (err) {
            console.error("Error fetching admin leave quotas:", err);
            setQuotas([]);
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (employeeId) => {
        const employeeData = quotas.filter((q) => q.employee_id === employeeId);
        setActiveEmployee(employeeData[0]);
        setEditQuotas(employeeData.map((q) => ({ ...q }))); // clone
    };

    const updateEditQuota = (index, newTotal) => {
        const updated = [...editQuotas];
        updated[index].total_days = newTotal;
        updated[index].remaining_days = newTotal - updated[index].used_days;
        setEditQuotas(updated);
    };

    const handleSave = async () => {
        const payload = {
            year: new Date().getFullYear(),
            quotas: editQuotas.map((q) => ({
                leave_type_id: q.leave_type_id,
                total_days: q.total_days,
            })),
        };

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`/api/leave-quotas/${activeEmployee.employee_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to update quotas");

            alert("Updated successfully!");
            fetchLeaveQuotas(currentPage);
        } catch (err) {
            console.error("Save error:", err);
            alert("Error saving quota: " + err.message);
        }
    };

    useEffect(() => {
        fetchLeaveQuotas(currentPage);
    }, [currentPage]);

    return (
        <FadeTransition>
            <AdminLayout>
                <h2 className="text-2xl font-bold mb-6 text-blue-700">Employee Leave Quotas (Admin)</h2>

                {loading ? (
                    <p className="text-center text-gray-600">Loading...</p>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[...new Set(quotas.map((q) => q.employee_id))].map((id) => {
                                        const employee = quotas.find((q) => q.employee_id === id);
                                        return (
                                            <TableRow key={id}>
                                                <TableCell>{employee.employee_name}</TableCell>
                                                <TableCell>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => openEditModal(id)}
                                                                className="bg-blue-500 text-white px-5"
                                                            >
                                                                Edit
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="bg-white text-black p-6 rounded-lg shadow-2xl border border-gray-200 dark:border-zinc-800 w-full max-w-xl">
                                                            <DialogHeader>
                                                                <DialogTitle>
                                                                    Edit Quotas – {employee.employee_name}
                                                                </DialogTitle>
                                                            </DialogHeader>
                                                            <div className="space-y-4 mt-4">
                                                                {editQuotas.map((q, i) => (
                                                                    <div key={q.leave_type_id} className="flex items-center gap-4">
                                                                        <div className="w-1/2">{q.type_name}</div>
                                                                        <Input
                                                                            type="number"
                                                                            className="w-24"
                                                                            value={q.total_days}
                                                                            onChange={(e) =>
                                                                                updateEditQuota(i, Number(e.target.value))
                                                                            }
                                                                        />
                                                                        <div className="text-sm text-gray-600">
                                                                            Used: {q.used_days} | Remaining: {q.remaining_days}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <DialogFooter className="mt-6">
                                                                <Button
                                                                    onClick={handleSave}
                                                                    className="bg-green-500 text-white"
                                                                >
                                                                    Save Changes
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <div className="mt-6 flex justify-center">
                            <Pagination>
                                <PaginationContent className="space-x-1 text-sm">
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => currentPage > 1 && setCurrentPage((p) => p - 1)}
                                            className={`border border-gray-300 px-3 py-1 rounded hover:bg-gray-100 ${currentPage === 1 ? "pointer-events-none opacity-50" : ""
                                                }`}
                                        />
                                    </PaginationItem>

                                    <PaginationItem>
                                        <span className="px-3 py-1 text-gray-700 border border-gray-200 rounded">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                    </PaginationItem>

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => currentPage < totalPages && setCurrentPage((p) => p + 1)}
                                            className={`border border-gray-300 px-3 py-1 rounded hover:bg-gray-100 ${currentPage === totalPages ? "pointer-events-none opacity-50" : ""
                                                }`}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    </>
                )}
            </AdminLayout>
        </FadeTransition>
    );
};

export default AdminLeaveQuotaPage;
