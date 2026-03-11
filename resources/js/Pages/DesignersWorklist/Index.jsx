import React, { useState } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import UserLayout from "@/Layouts/UserLayout";
import { CheckCircle, AlertCircle, Clock, Eye, Calendar as CalendarIcon, X } from "lucide-react";
import toast from "react-hot-toast";

export default function Index({ worklists, filters }) {
    const { auth } = usePage().props;
    const [selectedTask, setSelectedTask] = useState(null);
    const rows = worklists.data || [];

    const handleStatusUpdate = (id, newStatus) => {
        router.patch(route("designers-worklist.updateStatus", id), {
            status: newStatus
        }, {
            preserveScroll: true,
        });
    };

    const handleFilterChange = (key, value) => {
        router.get(route("designers-worklist.index"), {
            ...filters,
            [key]: value
        }, { preserveState: true });
    };

    return (
        <UserLayout title="Designers Worklist">
            <Head title="Designers Worklist" />

            <div className="font-sans">
                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 mb-6 flex flex-wrap items-center justify-between gap-6 font-sans">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">My Worklist</h1>
                        <p className="text-sm text-gray-500 font-medium">Tasks assigned to you by managers</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative min-w-[200px]">
                            <div className="relative">
                                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-4 h-4" />
                                <input
                                    type="date"
                                    value={filters.date || ""}
                                    onChange={(e) => handleFilterChange('date', e.target.value)}
                                    className="pl-11 pr-4 py-2.5 w-full bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-[14px] font-semibold text-gray-800 transition-all hover:bg-white hover:border-gray-300"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden ring-1 ring-gray-50">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-[#fcfcfd] border-b border-gray-100">
                                    <th className="py-4 px-4 pl-8 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-[120px]">Date</th>
                                    <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-[150px]">Client</th>
                                    <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-[150px]">Task Type</th>
                                    <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-[200px]">Other Assignees</th>
                                    <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-[120px]">Status</th>
                                    <th className="py-4 px-4 pr-8 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right w-[100px]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {rows.length > 0 ? (
                                    rows.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/30 transition-all group">
                                            <td className="py-5 px-4 pl-8">
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] font-bold text-gray-900">{item.task_date ? new Date(item.task_date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }) : '-'}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{item.task_date ? new Date(item.task_date).toLocaleDateString('en-US', { weekday: 'short' }) : ''}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4">
                                                <span className="text-[13px] font-bold text-gray-700">{item.client_name}</span>
                                            </td>
                                            <td className="py-5 px-4">
                                                <span className="px-3 py-1.5 bg-gray-100/50 rounded-lg text-[11px] font-bold text-gray-600 border border-gray-200/30 uppercase tracking-wide">
                                                    {item.task_type}
                                                </span>
                                            </td>
                                            <td className="py-5 px-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {item.users?.filter(u => u.id !== auth.user.id).map(u => (
                                                        <span key={u.id} className="bg-gray-100 text-gray-600 text-[10px] px-2 py-0.5 rounded font-bold border border-gray-200 uppercase tracking-tight">
                                                            {u.name}
                                                        </span>
                                                    ))}
                                                    {item.users?.length <= 1 && <span className="text-[10px] font-bold text-gray-300 uppercase italic">Only You</span>}
                                                </div>
                                            </td>
                                            <td className="py-5 px-4">
                                                <div className="relative">
                                                    <select
                                                        value={item.status}
                                                        onChange={(e) => handleStatusUpdate(item.id, e.target.value)}
                                                        className={`text-[10px] font-bold uppercase tracking-widest rounded-lg px-3 py-1.5 border-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-all ${getStatusBadgeClass(item.status)}`}
                                                    >
                                                        <option value="Not Done">Not Done</option>
                                                        <option value="In Progress">In Progress</option>
                                                        <option value="Done">Done</option>
                                                        <option value="Approved">Approved</option>
                                                    </select>
                                                </div>
                                            </td>
                                            <td className="py-5 px-4 pr-8 text-right">
                                                <button
                                                    onClick={() => setSelectedTask(item)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
                                                    <CalendarIcon className="text-gray-300" size={32} />
                                                </div>
                                                <p className="text-gray-400 font-bold text-sm">No tasks found for your selection</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* View Modal */}
                {selectedTask && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
                        <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Task Details</h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Reference ID: #{selectedTask.id}</p>
                                </div>
                                <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-200 rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto space-y-8">
                                <div className="grid grid-cols-2 gap-8 font-sans">
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Task Date</label>
                                        <div className="flex items-center gap-2 text-gray-900">
                                            <CalendarIcon size={16} className="text-blue-500" />
                                            <span className="text-sm font-bold uppercase">
                                                {selectedTask.task_date ? new Date(selectedTask.task_date).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Current Status</label>
                                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest ${getStatusBadgeClass(selectedTask.status)}`}>
                                            {selectedTask.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="font-sans">
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Client name</label>
                                    <div className="text-xl font-extrabold text-gray-900 leading-tight">
                                        {selectedTask.client_name}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 font-sans">
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Task Type</label>
                                        <div className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-700 uppercase tracking-wide inline-block">
                                            {selectedTask.task_type}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Assigned By</label>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold ring-2 ring-white shadow-sm uppercase">
                                                {selectedTask.creator?.name?.charAt(0)}
                                            </div>
                                            <span className="text-sm font-bold text-gray-700">{selectedTask.creator?.name}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="font-sans">
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Description / Brief</label>
                                    <div className="text-sm font-medium text-gray-600 bg-gray-50/50 p-6 rounded-[20px] border border-gray-100 whitespace-pre-wrap leading-relaxed shadow-inner italic">
                                        "{selectedTask.description}"
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={() => setSelectedTask(null)}
                                    className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-blue-600 transition-all shadow-lg shadow-gray-200"
                                >
                                    Close View
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
                .font-sans { font-family: 'Plus Jakarta Sans', sans-serif !important; }
                .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            ` }} />
        </UserLayout>
    );
}

const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
        case 'DONE': return 'bg-green-50 text-green-700 ring-1 ring-green-100';
        case 'IN PROGRESS': return 'bg-blue-50 text-blue-700 ring-1 ring-blue-100';
        case 'NOT DONE': return 'bg-red-50 text-red-700 ring-1 ring-red-100';
        case 'APPROVED': return 'bg-purple-50 text-purple-700 ring-1 ring-purple-100';
        default: return 'bg-gray-50 text-gray-600 ring-1 ring-gray-200';
    }
};
