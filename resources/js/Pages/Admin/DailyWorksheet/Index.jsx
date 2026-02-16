import React from "react";
import { Head, router, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Calendar as CalendarIcon, ClipboardList } from "lucide-react";

export default function Index({ worksheets, selectedDate, selectedUser, users }) {
    const { auth } = usePage().props;

    const handleDateChange = (e) => {
        router.get(route("admin.daily-worksheet.index"),
            { date: e.target.value, user_id: selectedUser },
            { preserveState: true }
        );
    };

    const handleUserChange = (e) => {
        router.get(route("admin.daily-worksheet.index"),
            { date: selectedDate, user_id: e.target.value },
            { preserveState: true }
        );
    };

    return (
        <AdminLayout title="Daily Worksheet Overview">
            <Head title="Daily Worksheet Overview" />

            <div className="font-sans">
                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 mb-6 flex flex-wrap items-center justify-between gap-6 font-sans">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Daily Worksheet Overview</h1>
                        <p className="text-sm text-gray-500 font-medium">View daily activities logged by all employees</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {auth.user.role === 'admin' && (
                            <select
                                value={selectedUser || ''}
                                onChange={handleUserChange}
                                className="w-[200px] bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all hover:bg-white hover:border-gray-300"
                            >
                                <option value="">All Users</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        )}

                        <div className="relative min-w-[200px]">
                            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-4 h-4" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={handleDateChange}
                                className="pl-11 pr-4 py-2.5 w-full bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-[14px] font-semibold text-gray-800 transition-all hover:bg-white hover:border-gray-300"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden ring-1 ring-gray-50">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-[#fcfcfd] border-b border-gray-100">
                                    <th className="py-6 px-4 pl-8 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[200px]">User</th>
                                    <th className="py-6 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[150px]">Client</th>
                                    <th className="py-6 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[150px]">Task Type</th>
                                    <th className="py-6 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[120px]">Status</th>
                                    <th className="py-6 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[150px]">Project</th>
                                    {auth.user.role === 'admin' && (
                                        <th className="py-6 px-4 pr-8 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-right w-[100px]">Settings</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {worksheets.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-4 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
                                                    <CalendarIcon className="text-gray-300" size={32} />
                                                </div>
                                                <p className="text-gray-400 font-bold text-sm">No tasks logged for this date</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    worksheets.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-all group">
                                            <td className="py-6 px-4 pl-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase shadow-sm">
                                                        {item.user?.name?.charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-gray-900 text-sm">{item.user?.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-6 px-4">
                                                <span className="text-[13px] font-bold text-gray-700">{item.client_name || '-'}</span>
                                            </td>
                                            <td className="py-6 px-4">
                                                <span className="px-3 py-1.5 bg-gray-100 rounded-lg text-[12px] font-bold text-gray-600 border border-gray-200/50 uppercase tracking-wide">
                                                    {item.task_type || '-'}
                                                </span>
                                            </td>
                                            <td className="py-6 px-4">
                                                <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest ${getStatusBadgeClass(item.status)}`}>
                                                    {item.status || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="py-6 px-4">
                                                <span className="text-[13px] font-bold text-gray-600 uppercase">{item.project || '-'}</span>
                                            </td>
                                            {auth.user.role === 'admin' && (
                                                <td className="py-6 px-4 pr-8 text-right">
                                                    <a
                                                        href={route("admin.users.worksheet-settings", item.user_id)}
                                                        className="text-gray-400 hover:text-blue-600 inline-block p-2 hover:bg-blue-50 rounded-lg transition-all"
                                                        title="Configure Fields"
                                                    >
                                                        <ClipboardList size={18} />
                                                    </a>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
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
        </AdminLayout>
    );
}

const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
        case 'DONE': return 'bg-green-50 text-green-700 ring-1 ring-green-100';
        case 'IN PROGRESS': return 'bg-blue-50 text-blue-700 ring-1 ring-blue-100';
        case 'NOT DONE': return 'bg-red-50 text-red-700 ring-1 ring-red-100';
        default: return 'bg-gray-50 text-gray-600 ring-1 ring-gray-200';
    }
};
