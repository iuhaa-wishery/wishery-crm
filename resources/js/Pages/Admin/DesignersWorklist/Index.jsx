import React, { useState, useEffect, useRef } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Edit, Trash2, Plus, X, CheckCircle, AlertCircle, ChevronDown, Calendar as CalendarIcon, ClipboardList, Edit2, ChevronUp } from "lucide-react";
import toast from "react-hot-toast";

export default function Index({ worklists, users, taskTypes, filters, success }) {
    const [deleteId, setDeleteId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingWorklist, setEditingWorklist] = useState(null);
    const [showSuccess, setShowSuccess] = useState(!!success);
    const [fade, setFade] = useState(false);
    const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const { data, setData, post, put, reset, errors, clearErrors, processing } = useForm({
        client_name: "",
        task_date: filters.date || new Date().toISOString().split('T')[0],
        user_ids: [],
        task_type: "",
        description: "",
        status: "Not Done",
    });

    const rows = worklists.data || [];

    useEffect(() => {
        if (success) {
            setShowSuccess(true);
            const timer = setTimeout(() => {
                setFade(true);
                setTimeout(() => setShowSuccess(false), 500);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsAssigneeDropdownOpen(false);
            }
        }
        if (showModal) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showModal]);

    const toggleAssigneeDropdown = () => {
        setIsAssigneeDropdownOpen(prev => !prev);
    };

    const getSelectedAssigneeNames = () => {
        const selectedUsers = users.filter(u => data.user_ids.includes(u.id));
        if (selectedUsers.length === 0) return "Select Designer(s)";
        const names = selectedUsers.map(u => u.name);
        return names.length > 2 ? `${names[0]}, ${names[1]} (+${names.length - 2} more)` : names.join(', ');
    };

    const getAvatarUrl = (user) => {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=random&color=fff`;
    };

    const openCreateModal = () => {
        reset();
        setEditingWorklist(null);
        setShowModal(true);
    };

    const openEditModal = (worklist) => {
        setEditingWorklist(worklist);
        setData({
            client_name: worklist.client_name,
            task_date: worklist.task_date,
            user_ids: worklist.users.map(u => u.id),
            task_type: worklist.task_type,
            description: worklist.description,
            status: worklist.status,
        });
        setShowModal(true);
    };

    const closeModal = () => {
        reset();
        clearErrors();
        setIsAssigneeDropdownOpen(false);
        setShowModal(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingWorklist) {
            put(route("admin.designers-worklist.update", editingWorklist.id), {
                onSuccess: () => closeModal(),
            });
        } else {
            post(route("admin.designers-worklist.store"), {
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this task?")) {
            router.delete(route("admin.designers-worklist.destroy", id), {
                onSuccess: () => toast.success("Task deleted successfully"),
            });
        }
    };

    const handleFilterChange = (key, value) => {
        router.get(route("admin.designers-worklist.index"), {
            ...filters,
            [key]: value
        }, { preserveState: true });
    };

    return (
        <AdminLayout title="Designers Worklist">
            <Head title="Designers Worklist" />
            <div className="font-sans">
                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 mb-6 flex flex-wrap items-center justify-between gap-6 font-sans">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Designers Worklist</h1>
                        <p className="text-sm text-gray-500 font-medium">Assign and manage tasks for designers</p>
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

                        <div className="bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 flex items-center gap-3">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Designer</span>
                            <select
                                value={filters.user_id || ""}
                                onChange={(e) => handleFilterChange('user_id', e.target.value)}
                                className="bg-transparent border-none p-0 text-sm font-bold text-gray-800 focus:ring-0 min-w-[150px]"
                            >
                                <option value="">All Designers</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={openCreateModal}
                            className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:bg-blue-600 transition-all shadow-lg shadow-gray-200 hover:shadow-blue-200 active:scale-95 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Add Task
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden ring-1 ring-gray-50">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-[#fcfcfd] border-b border-gray-100">
                                    <th className="py-4 px-4 pl-8 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-[120px]">Date</th>
                                    <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-[150px]">Client</th>
                                    <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-[200px]">Assigned To</th>
                                    <th className="py-4 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-[150px]">Task Type</th>
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
                                                <div className="flex flex-wrap gap-1">
                                                    {item.users?.map(u => (
                                                        <span key={u.id} className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold border border-blue-100 uppercase tracking-tight">
                                                            {u.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="py-5 px-4">
                                                <span className="px-3 py-1.5 bg-gray-100/50 rounded-lg text-[11px] font-bold text-gray-600 border border-gray-200/30 uppercase tracking-wide">
                                                    {item.task_type}
                                                </span>
                                            </td>
                                            <td className="py-5 px-4">
                                                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest ${getStatusBadgeClass(item.status)}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="py-5 px-4 pr-8 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => openEditModal(item)}
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

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {editingWorklist ? "Edit Task" : "Assign New Task"}
                                </h2>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-200 rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Row 1 */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Task Date</label>
                                        <div className="relative">
                                            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 w-4 h-4" />
                                            <input
                                                required
                                                type="date"
                                                value={data.task_date}
                                                onChange={e => setData("task_date", e.target.value)}
                                                className={`w-full border-gray-200 bg-gray-50/50 rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all ${errors.task_date ? 'border-red-500' : 'border-gray-200'}`}
                                            />
                                        </div>
                                        {errors.task_date && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter mt-1">{errors.task_date}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Client Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={data.client_name}
                                            onChange={e => setData("client_name", e.target.value)}
                                            className={`w-full border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all ${errors.client_name ? 'border-red-500' : 'border-gray-200'}`}
                                            placeholder="Enter client name"
                                        />
                                        {errors.client_name && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter mt-1">{errors.client_name}</p>}
                                    </div>

                                    {/* Row 2 */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Assigned To (Multiple)</label>
                                        <div ref={dropdownRef} className="relative">
                                            <button
                                                type="button"
                                                onClick={toggleAssigneeDropdown}
                                                className={`w-full flex justify-between items-center bg-gray-50/50 px-4 py-3 text-left border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none transition ${errors.user_ids ? "border-red-500" : "border-gray-200"}`}
                                            >
                                                <span className="truncate pr-4 text-gray-800 text-sm font-semibold">
                                                    {getSelectedAssigneeNames()}
                                                </span>
                                                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isAssigneeDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                                            </button>

                                            {isAssigneeDropdownOpen && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                                    {users.map((user) => (
                                                        <div
                                                            key={user.id}
                                                            className="flex items-center p-3 hover:bg-gray-50 transition cursor-pointer"
                                                            onClick={() => {
                                                                const updated = data.user_ids.includes(user.id)
                                                                    ? data.user_ids.filter(id => id !== user.id)
                                                                    : [...data.user_ids, user.id];
                                                                setData("user_ids", updated);
                                                            }}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={data.user_ids.includes(user.id)}
                                                                onChange={() => { }}
                                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                                            />
                                                            <label className="ml-2 text-sm font-bold text-gray-700 flex items-center flex-grow cursor-pointer">
                                                                <img
                                                                    src={getAvatarUrl(user)}
                                                                    alt="avatar"
                                                                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm mr-2 object-cover"
                                                                />
                                                                {user.name}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {errors.user_ids && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter mt-1">{errors.user_ids}</p>}
                                        {errors['user_ids.0'] && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter mt-1">Please select at least one assignee.</p>}
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Task Type</label>
                                        <select
                                            required
                                            value={data.task_type}
                                            onChange={e => setData("task_type", e.target.value)}
                                            className={`w-full border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all ${errors.task_type ? 'border-red-500' : 'border-gray-200'}`}
                                        >
                                            <option value="">Select Type</option>
                                            {taskTypes.map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                        {errors.task_type && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter mt-1">{errors.task_type}</p>}
                                    </div>

                                    {/* Row 3 */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Status</label>
                                        <select
                                            required
                                            value={data.status}
                                            onChange={e => setData("status", e.target.value)}
                                            className="w-full border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                                        >
                                            <option value="Not Done">Not Done</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Done">Done</option>
                                            <option value="Approved">Approved</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Full Width Row 4 */}
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">Description</label>
                                    <textarea
                                        required
                                        value={data.description}
                                        onChange={e => setData("description", e.target.value)}
                                        className={`w-full border-gray-200 bg-gray-50/50 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all min-h-[120px] ${errors.description ? 'border-red-500' : 'border-gray-200'}`}
                                        placeholder="Enter task details..."
                                    />
                                    {errors.description && <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter mt-1">{errors.description}</p>}
                                </div>

                                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-all uppercase tracking-wider"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-gray-900 text-white px-8 py-2.5 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-lg shadow-gray-200 hover:shadow-blue-200 active:scale-95 disabled:opacity-50"
                                    >
                                        {processing ? "Saving..." : (editingWorklist ? 'Update Task' : 'Save Task')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation */}
                {deleteId && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                        <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm">
                            <h2 className="text-lg font-bold mb-2">Confirm Delete</h2>
                            <p className="text-gray-600 mb-6">Are you sure you want to delete this task? This action cannot be undone.</p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setDeleteId(null)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteId)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                                >
                                    Delete
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
        </AdminLayout>
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
