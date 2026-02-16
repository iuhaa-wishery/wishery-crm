import React, { useState } from "react";
import { useForm, Head, router } from "@inertiajs/react";
import UserLayout from "@/Layouts/UserLayout";
import AdminLayout from "@/Layouts/AdminLayout";
import Modal from "@/Components/Modal";
import MonthPicker from "@/Components/MonthPicker";
import { Trash2, Edit2, Plus, Calendar as CalendarIcon, Save, X, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

export default function Index({ worksheets, settings, selectedDate, selectedMonth, auth }) {
    const Layout = auth.user.role === 'admin' || auth.user.role === 'manager' || auth.user.role === 'editor' ? AdminLayout : UserLayout;

    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [filterMode, setFilterMode] = useState(selectedMonth ? 'monthly' : 'daily');

    const { data, setData, post, put, processing, reset, errors } = useForm({
        date: selectedDate,
        client_name: "",
        task_type: "",
        status: "",
        file_name: "",
        drive_link: "",
        project: "",
    });



    const taskTypeOptions = settings.task_type_options ? settings.task_type_options.split(",").map(s => s.trim()).filter(s => s) : [];

    const handleDateChange = (e) => {
        router.get(route("daily-worksheet.index"), { date: e.target.value }, { preserveState: true });
    };

    const handleMonthChange = (e) => {
        router.get(route("daily-worksheet.index"), { month: e.target.value }, { preserveState: true });
    };

    const toggleFilterMode = (mode) => {
        setFilterMode(mode);
        if (mode === 'daily') {
            router.get(route("daily-worksheet.index"), { date: new Date().toISOString().split('T')[0] }, { preserveState: true });
        } else {
            router.get(route("daily-worksheet.index"), { month: new Date().toISOString().slice(0, 7) }, { preserveState: true });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            put(route("daily-worksheet.update", editingId), {
                onSuccess: () => {
                    toast.success("Task updated successfully");
                    reset();
                    setIsAdding(false);
                    setEditingId(null);
                },
            });
        } else {
            post(route("daily-worksheet.store"), {
                onSuccess: () => {
                    toast.success("Task added successfully");
                    reset();
                    setIsAdding(false);
                },
            });
        }
    };

    const startEdit = (worksheet) => {
        setEditingId(worksheet.id);
        setData({
            date: worksheet.date,
            client_name: worksheet.client_name || "",
            task_type: worksheet.task_type || "",
            status: worksheet.status || "",
            file_name: worksheet.file_name || "",
            drive_link: worksheet.drive_link || "",
            project: worksheet.project || "",
        });
        setIsAdding(true);
    };

    const cancelEdit = () => {
        setIsAdding(false);
        setEditingId(null);
        reset();
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this task?")) {
            router.delete(route("daily-worksheet.destroy", id), {
                onSuccess: () => toast.success("Task deleted successfully"),
            });
        }
    };

    return (
        <Layout title="Daily Worksheet">
            <Head title="Daily Worksheet" />

            <div className="font-sans">
                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 mb-6 flex flex-wrap items-center justify-between gap-6 font-sans">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Daily Worksheet</h1>
                        <p className="text-sm text-gray-500 font-medium">Track your daily activities</p>
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
                        <button
                            onClick={() => {
                                setEditingId(null);
                                reset();
                                setIsAdding(true);
                            }}
                            className="bg-gray-900 hover:bg-blue-600 text-white pl-4 pr-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all flex items-center gap-2 shadow-lg shadow-gray-200 hover:shadow-blue-200 active:scale-95"
                        >
                            <Plus size={16} />
                            Add Task
                        </button>
                    </div>
                </div>

                <Modal show={isAdding} onClose={() => setIsAdding(false)}>
                    <div className="p-8 font-sans">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 tracking-tight">{editingId ? 'Edit Task' : 'Log New Task'}</h3>
                                <p className="text-sm text-gray-500 font-medium mt-1">{editingId ? 'Update the details below' : 'Fill in the details below'}</p>
                            </div>
                            <button onClick={cancelEdit} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
                            {settings.client_name_enabled && (
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Client Name</label>
                                    <input
                                        type="text"
                                        value={data.client_name}
                                        onChange={e => setData("client_name", e.target.value)}
                                        className="w-full border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all placeholder:text-gray-300"
                                        placeholder="Enter client name"
                                    />
                                </div>
                            )}
                            {settings.task_type_enabled && (
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Task Type</label>
                                    {taskTypeOptions.length > 0 ? (
                                        <select
                                            value={data.task_type}
                                            onChange={e => setData("task_type", e.target.value)}
                                            className="w-full border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                                        >
                                            <option value="">Select Task Type</option>
                                            {taskTypeOptions.map(opt => (
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
                                </div>
                            )}
                            {settings.status_enabled && (
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
                                    </select>
                                </div>
                            )}
                            {settings.file_name_enabled && (
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">File Name</label>
                                    <input
                                        type="text"
                                        value={data.file_name}
                                        onChange={e => setData("file_name", e.target.value)}
                                        className="w-full border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all placeholder:text-gray-300"
                                        placeholder="Enter file name"
                                    />
                                </div>
                            )}
                            {settings.drive_link_enabled && (
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Drive Link</label>
                                    <input
                                        type="url"
                                        value={data.drive_link}
                                        onChange={e => setData("drive_link", e.target.value)}
                                        className="w-full border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all placeholder:text-gray-300"
                                        placeholder="https://drive.google.com/..."
                                    />
                                </div>
                            )}
                            {settings.project_enabled && (
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Project</label>
                                    <input
                                        type="text"
                                        value={data.project}
                                        onChange={e => setData("project", e.target.value)}
                                        className="w-full border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all placeholder:text-gray-300"
                                        placeholder="Project name"
                                    />
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
                                    className="bg-gray-900 text-white px-8 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-lg shadow-gray-200 hover:shadow-blue-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? "Saving..." : (editingId ? "Update Task" : "Save Task")}
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>

                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden ring-1 ring-gray-50">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[1200px]">
                            <thead>
                                <tr className="bg-[#fcfcfd] border-b border-gray-100">
                                    <th className="py-6 px-4 pl-8 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[120px]">Date</th>
                                    {settings.client_name_enabled && (
                                        <th className="py-6 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[180px]">Client</th>
                                    )}
                                    {settings.task_type_enabled && (
                                        <th className="py-6 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[180px]">Task Type</th>
                                    )}
                                    {settings.status_enabled && (
                                        <th className="py-6 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[150px]">Status</th>
                                    )}
                                    {settings.file_name_enabled && (
                                        <th className="py-6 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[200px]">File Name</th>
                                    )}
                                    {settings.drive_link_enabled && (
                                        <th className="py-6 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[150px]">Link</th>
                                    )}
                                    {settings.project_enabled && (
                                        <th className="py-6 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[180px]">Project</th>
                                    )}
                                    <th className="py-6 px-4 pr-8 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-right w-[100px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {worksheets.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" className="px-4 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
                                                    <CalendarIcon className="text-gray-300" size={32} />
                                                </div>
                                                <p className="text-gray-400 font-bold text-sm">No tasks found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    worksheets.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-all group">
                                            <td className="py-6 px-4 pl-8">
                                                <div className="flex flex-col">
                                                    <span className="text-[14px] font-bold text-gray-900">{new Date(item.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                                </div>
                                            </td>

                                            {/* Client Name */}
                                            {settings.client_name_enabled && (
                                                <td className="py-6 px-4">
                                                    <span className="text-[14px] font-bold text-gray-800">{item.client_name}</span>
                                                </td>
                                            )}

                                            {/* Task Type */}
                                            {settings.task_type_enabled && (
                                                <td className="py-6 px-4">
                                                    <span className="px-3 py-1.5 bg-gray-100 rounded-lg text-[12px] font-bold text-gray-600 border border-gray-200/50 uppercase tracking-wide">{item.task_type}</span>
                                                </td>
                                            )}

                                            {/* Status */}
                                            {settings.status_enabled && (
                                                <td className="py-6 px-4">
                                                    <span className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest ${getStatusBadgeClass(item.status)}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                            )}

                                            {/* File Name */}
                                            {settings.file_name_enabled && (
                                                <td className="py-6 px-4">
                                                    <span className="text-[13px] font-semibold text-gray-600 truncate block max-w-[200px]">{item.file_name}</span>
                                                </td>
                                            )}

                                            {/* Drive Link */}
                                            {settings.drive_link_enabled && (
                                                <td className="py-6 px-4">
                                                    {item.drive_link && (
                                                        <a href={item.drive_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 text-[12px] font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                                                            <ExternalLink size={12} />
                                                            Open
                                                        </a>
                                                    )}
                                                </td>
                                            )}

                                            {/* Project */}
                                            {settings.project_enabled && (
                                                <td className="py-6 px-4">
                                                    <span className="text-[13px] font-bold text-gray-700">{item.project}</span>
                                                </td>
                                            )}

                                            {/* Actions */}
                                            <td className="py-6 px-4 pr-8 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => startEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
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
        </Layout>
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
