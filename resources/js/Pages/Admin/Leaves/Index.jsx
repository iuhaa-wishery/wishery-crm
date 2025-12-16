import React from "react";
import { Head, Link, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Check, X } from "lucide-react";
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

    const getDays = (from, to) => {
        const start = new Date(from);
        const end = new Date(to);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return `${diffDays} d`;
    };

    return (
        <AdminLayout>
            <Head title="Leaves" />

            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold">Leaves</h1>
                </div>

                {/* Leaves Table */}
                <table className="w-full border">
                    <thead>
                        <tr className="bg-gray-200 text-left">
                            <th className="p-2">#</th>
                            <th className="p-2">Employee</th>
                            <th className="p-2">Type</th>
                            <th className="p-2">Dates</th>
                            <th className="p-2">Days</th>
                            <th className="p-2">Reason</th>
                            <th className="p-2">Status</th>
                            <th className="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="p-4 text-center text-gray-500">
                                    No leave requests found.
                                </td>
                            </tr>
                        ) : (
                            data.map((leave, index) => (
                                <tr key={leave.id} className="border-t">
                                    <td className="p-2">{(current_page - 1) * 10 + index + 1}</td>
                                    <td className="p-2">{leave.user?.name}</td>
                                    <td className="p-2 capitalize">{leave.leave_type}</td>
                                    <td className="p-2">
                                        {formatDate(leave.from_date)} - {formatDate(leave.to_date)}
                                    </td>
                                    <td className="p-2">{getDays(leave.from_date, leave.to_date)}</td>
                                    <td className="p-2 max-w-xs truncate" title={leave.reason}>
                                        {leave.reason || "-"}
                                    </td>
                                    <td className="p-2 capitalize">
                                        <span className={`px-2 py-1 rounded text-xs text-white ${leave.status === 'approved' ? 'bg-green-500' :
                                            leave.status === 'rejected' ? 'bg-red-500' :
                                                'bg-yellow-500'
                                            }`}>
                                            {leave.status}
                                        </span>
                                    </td>
                                    <td className="p-2">
                                        {leave.status === 'pending' ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAction(leave.id, 'approve')}
                                                    className="text-green-600 hover:text-green-800"
                                                    title="Approve"
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleAction(leave.id, 'reject')}
                                                    className="text-red-600 hover:text-red-800"
                                                    title="Reject"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-sm">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Pagination */}
                {links.length > 3 && (
                    <div className="flex justify-end mt-4 gap-1">
                        {links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url || "#"}
                                className={`px-3 py-1 border rounded text-sm ${link.active
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                    } ${!link.url && "opacity-50 cursor-not-allowed"}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
