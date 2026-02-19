import React, { useState } from "react";
import { useForm, Head, router, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import Modal from "@/Components/Modal";
import MonthPicker from "@/Components/MonthPicker";
import { Calendar as CalendarIcon, ClipboardList, Edit2, Trash2, X, Save, Plus } from "lucide-react";
import toast from "react-hot-toast";

export default function Index({ worksheets, selectedDate, selectedMonth, selectedUser, users }) {
    const { auth } = usePage().props;

    const [editingId, setEditingId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [filterMode, setFilterMode] = useState(selectedMonth ? 'monthly' : 'daily');

    const { data, setData, put, processing, reset, errors } = useForm({
        date: "",
        client_name: "",
        task_type: "",
        status: "",
        file_name: "",
        drive_link: "",
        project: "",
    });

    const handleDateChange = (e) => {
        router.get(route("admin.daily-worksheet.index"),
            { date: e.target.value, user_id: selectedUser },
            { preserveState: true }
        );
    };

    const handleMonthChange = (e) => {
        router.get(route("admin.daily-worksheet.index"),
            { month: e.target.value, user_id: selectedUser },
            { preserveState: true }
        );
    };

    const toggleFilterMode = (mode) => {
        setFilterMode(mode);
        if (mode === 'daily') {
            router.get(route("admin.daily-worksheet.index"),
                { date: new Date().toISOString().split('T')[0], user_id: selectedUser },
                { preserveState: true }
            );
        } else {
            router.get(route("admin.daily-worksheet.index"),
                { month: new Date().toISOString().slice(0, 7), user_id: selectedUser },
                { preserveState: true }
            );
        }
    };

    const handleUserChange = (e) => {
        router.get(route("admin.daily-worksheet.index"),
            {
                date: filterMode === 'daily' ? selectedDate : undefined,
                month: filterMode === 'monthly' ? selectedMonth : undefined,
                user_id: e.target.value
            },
            { preserveState: true }
        );
    };

    const startEdit = (worksheet) => {
        setCurrentItem(worksheet);
        setEditingId(worksheet.id);
        setData({
            date: worksheet.formatted_date || (worksheet.date ? worksheet.date.split('T')[0] : ""),
            client_name: worksheet.client_name || "",
            task_type: worksheet.task_type || "",
            status: worksheet.status || "",
            file_name: worksheet.file_name || "",
            drive_link: worksheet.drive_link || "",
            project: worksheet.project || "",
        });
        setIsEditing(true);
    };

    const cancelEdit = () => {
        setIsEditing(false);
        setEditingId(null);
        setCurrentItem(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("daily-worksheet.update", editingId), {
            onSuccess: () => {
                toast.success("Task updated successfully");
                cancelEdit();
            },
        });
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this task?")) {
            router.delete(route("daily-worksheet.destroy", id), {
                onSuccess: () => toast.success("Task deleted successfully"),
            });
        }
    };

    const getTaskTypeOptions = (item) => {
        const settings = item?.user?.daily_worksheet_setting;
        if (!settings?.task_type_options) return [];
        return settings.task_type_options.split(",").map(s => s.trim()).filter(s => s);
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
                        <div className="bg-gray-50 p-1.5 rounded-xl border border-gray-100 flex items-center">
                            <button
                                onClick={() => toggleFilterMode('daily')}
                                className={`px-4 py-2 text-[12px] font-bold uppercase tracking-wider rounded-lg transition-all ${filterMode === 'daily' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Daily
                            </button>
                            <button
                                onClick={() => toggleFilterMode('monthly')}
                                className={`px-4 py-2 text-[12px] font-bold uppercase tracking-wider rounded-lg transition-all ${filterMode === 'monthly' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Monthly
                            </button>
                        </div>

                        <div className="relative min-w-[200px]">
                            {filterMode === 'daily' ? (
                                <div className="relative">
                                    <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-4 h-4" />
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={handleDateChange}
                                        className="pl-11 pr-4 py-2.5 w-full bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-[14px] font-semibold text-gray-800 transition-all hover:bg-white hover:border-gray-300"
                                    />
                                </div>
                            ) : (
                                <MonthPicker
                                    value={selectedMonth || ''}
                                    onChange={handleMonthChange}
                                    className="w-full"
                                />
                            )}
                        </div>

                        {auth.user.role === 'admin' && (
                            <div className="bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 flex items-center gap-3">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Employee</span>
                                <select
                                    value={selectedUser || ''}
                                    onChange={handleUserChange}
                                    className="bg-transparent border-none p-0 text-sm font-bold text-gray-800 focus:ring-0 min-w-[150px]"
                                >
                                    <option value="">All Users</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                <Modal show={isEditing} onClose={cancelEdit}>
                    <div className="p-8 font-sans">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 tracking-tight">Edit Task</h3>
                                <p className="text-sm text-gray-500 font-medium mt-1">Updating task for <span className="text-blue-600 font-bold">{currentItem?.user?.name}</span></p>
                            </div>
                            <button onClick={cancelEdit} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Date</label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-4 h-4" />
                                    <input
                                        type="date"
                                        value={data.date}
                                        onChange={e => setData("date", e.target.value)}
                                        className="w-full border-gray-200 bg-gray-50/50 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                                    />
                                </div>
                                {errors.date && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter mt-1">{errors.date}</p>}
                            </div>
                            {currentItem?.user?.daily_worksheet_setting?.client_name_enabled && (
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Client Name</label>
                                    <input
                                        type="text"
                                        value={data.client_name}
                                        onChange={e => setData("client_name", e.target.value)}
                                        className="w-full border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                                    />
                                    {errors.client_name && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter mt-1">{errors.client_name}</p>}
                                </div>
                            )}
                            {currentItem?.user?.daily_worksheet_setting?.task_type_enabled && (
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Task Type</label>
                                    {currentItem?.user?.daily_worksheet_setting?.task_type_freetext ? (
                                        <input
                                            type="text"
                                            value={data.task_type}
                                            onChange={e => setData("task_type", e.target.value)}
                                            className="w-full border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all placeholder:text-gray-300"
                                            placeholder="Enter task type"
                                        />
                                    ) : getTaskTypeOptions(currentItem).length > 0 ? (
                                        <select
                                            value={data.task_type}
                                            onChange={e => setData("task_type", e.target.value)}
                                            className="w-full border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                                        >
                                            <option value="">Select Task Type</option>
                                            {getTaskTypeOptions(currentItem).map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            value={data.task_type}
                                            onChange={e => setData("task_type", e.target.value)}
                                            className="w-full border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all placeholder:text-gray-300"
                                            placeholder="Enter task type"
                                        />
                                    )}
                                    {errors.task_type && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter mt-1">{errors.task_type}</p>}
                                </div>
                            )}
                            {currentItem?.user?.daily_worksheet_setting?.status_enabled && (
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Status</label>
                                    <select
                                        value={data.status}
                                        onChange={e => setData("status", e.target.value)}
                                        className="w-full border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                                    >
                                        <option value="">Select Status</option>
                                        <option value="DONE">Done</option>
                                        <option value="NOT DONE">Not Done</option>
                                        <option value="IN PROGRESS">In Progress</option>
                                        <option value="APPROVED">Approved</option>
                                    </select>
                                    {errors.status && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter mt-1">{errors.status}</p>}
                                </div>
                            )}
                            {currentItem?.user?.daily_worksheet_setting?.file_name_enabled && (
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">File Name</label>
                                    <input
                                        type="text"
                                        value={data.file_name}
                                        onChange={e => setData("file_name", e.target.value)}
                                        className="w-full border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                                    />
                                    {errors.file_name && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter mt-1">{errors.file_name}</p>}
                                </div>
                            )}
                            {currentItem?.user?.daily_worksheet_setting?.drive_link_enabled && (
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Drive Link</label>
                                    <input
                                        type="url"
                                        value={data.drive_link}
                                        onChange={e => setData("drive_link", e.target.value)}
                                        className="w-full border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                                    />
                                    {errors.drive_link && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter mt-1">{errors.drive_link}</p>}
                                </div>
                            )}
                            {currentItem?.user?.daily_worksheet_setting?.project_enabled && (
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Project</label>
                                    <input
                                        type="text"
                                        value={data.project}
                                        onChange={e => setData("project", e.target.value)}
                                        className="w-full border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                                    />
                                    {errors.project && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter mt-1">{errors.project}</p>}
                                </div>
                            )}
                            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={cancelEdit}
                                    className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-all uppercase tracking-wider"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-gray-900 text-white px-8 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-lg shadow-gray-200 hover:shadow-blue-200 active:scale-95 disabled:opacity-50"
                                >
                                    {processing ? "Saving..." : "Update Task"}
                                </button>
                            </div>
                        </form>
                    </div >
                </Modal >

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
                                        <th className="py-6 px-4 pr-8 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-right w-[100px]">Action</th>
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
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => startEdit(item)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit Task"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete Task"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div >
            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
                .font-sans { font-family: 'Plus Jakarta Sans', sans-serif !important; }
                .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            ` }} />
        </AdminLayout >
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
