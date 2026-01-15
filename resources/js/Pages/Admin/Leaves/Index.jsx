import React from "react";
import { Head, Link, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Check, X, Calendar, User, FileText } from "lucide-react";
import toast from "react-hot-toast";

export default function Index({ leaves }) {
    const { data, links, current_page } = leaves;

    const handleAction = (id, action) => {
        router.post(route(`admin.leaves.${action}`, id), {}, {
            onSuccess: () => toast.success(`Leave ${action}d successfully`),
            onError: () => toast.error("Something went wrong"),
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };


    const getStatusBadge = (status) => {
        const s = status?.toLowerCase();
        if (s === "approved")
            return (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-medium">
                    Approved
                </span>
            );
        if (s === "rejected")
            return (
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm font-medium">
                    Rejected
                </span>
            );
        return (
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg text-sm font-medium">
                Pending
            </span>
        );
    };

    return (
        <AdminLayout>
            <Head title="Leave Requests" />

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Leave Requests</h1>
            </div>

            {/* Leaves Table */}
            <div className="overflow-x-auto bg-white rounded-2xl shadow">
                <table className="min-w-full border-collapse">
                    <thead>
                        <tr className="bg-blue-50 text-gray-700 text-sm uppercase">
                            <th className="px-4 py-2 text-left">Employee</th>
                            <th className="px-4 py-2 text-left">Type</th>
                            <th className="px-4 py-2 text-left">Dates</th>
                            <th className="px-4 py-2 text-left">Days</th>
                            <th className="px-4 py-2 text-left">Reason</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-8 text-gray-500 italic">
                                    No leave requests found.
                                </td>
                            </tr>
                        ) : (
                            data.map((leave) => (
                                <tr key={leave.id} className="border-t text-gray-700 hover:bg-gray-50 transition">
                                    <td className="px-4 py-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                                <User size={14} />
                                            </div>
                                            <span className="font-semibold text-gray-900 text-sm">{leave.user?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 capitalize text-sm">
                                        <span className="flex items-center gap-1">
                                            <FileText size={14} className="text-gray-400" />
                                            {leave.leave_type.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-gray-900 font-medium text-sm">
                                                {formatDate(leave.from_date)} - {formatDate(leave.to_date)}
                                            </span>
                                            <span className="text-[10px] text-blue-600 uppercase font-bold">
                                                {leave.day_type.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 font-medium text-blue-600 text-sm">
                                        {leave.day_type === 'full'
                                            ? `${parseFloat(leave.no_of_days)} ${parseFloat(leave.no_of_days) > 1 ? 'Days' : 'Day'}`
                                            : leave.day_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
                                        }
                                    </td>
                                    <td className="px-4 py-2 max-w-xs">
                                        <p className="text-sm text-gray-600 truncate" title={leave.reason}>
                                            {leave.reason || "-"}
                                        </p>
                                    </td>
                                    <td className="px-4 py-2">
                                        {getStatusBadge(leave.status)}
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex justify-center gap-2">
                                            {leave.status === 'pending' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleAction(leave.id, 'approve')}
                                                        className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition"
                                                        title="Approve"
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(leave.id, 'reject')}
                                                        className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                                                        title="Reject"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="text-gray-300">-</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {links.length > 3 && (
                <div className="flex justify-center mt-8 gap-2">
                    {links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.url || "#"}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${link.active
                                ? "bg-blue-600 text-white shadow-md"
                                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                                } ${!link.url && "opacity-50 cursor-not-allowed"}`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
