import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import { FaPlus, FaMagic, FaExternalLinkAlt, FaImage, FaChevronLeft, FaChevronRight, FaFilter, FaTrashAlt, FaEraser, FaEye, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import debounce from 'lodash/debounce';
import toast from 'react-hot-toast';
import MonthPicker from '@/Components/MonthPicker';

const DetailField = ({ label, value, icon }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">{label}</label>
        <div className="flex items-center gap-2 pt-1 font-sans">
            {icon && <span className="text-lg">{icon}</span>}
            <span className="text-[14px] font-semibold text-gray-800">{value}</span>
        </div>
    </div>
);

const DetailLink = ({ label, url, type }) => {
    if (!url) return null;
    const icon = type === 'drive' ? <FaExternalLinkAlt className="text-blue-600" /> : <FaImage className="text-purple-600" />;
    const linkColor = type === 'drive' ? 'text-blue-600' : 'text-purple-600';
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">{label}</label>
            <a href={url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 pt-1 text-sm font-semibold underline ${linkColor} hover:opacity-80 transition`}>
                {icon}
                <span className="truncate max-w-xs">{url}</span>
            </a>
        </div>
    );
};

export default function Index({ auth, items_data, projects, users, filters, is_month_generated }) {
    const [localItems, setLocalItems] = useState(items_data || []);
    const [selectedProject, setSelectedProject] = useState(filters?.project_id || '');
    const [selectedMonth, setSelectedMonth] = useState(filters?.month || (new Date().getMonth() + 1));
    const [selectedYear, setSelectedYear] = useState(filters?.year || new Date().getFullYear());
    const [selectedUser, setSelectedUser] = useState(filters?.user_id || '');
    const [selectedDate, setSelectedDate] = useState(filters?.date || '');
    const [showDetailId, setShowDetailId] = useState(null);

    const selectedTask = localItems.find(item => item.id === showDetailId);

    // Sync state with props when filters change, ensuring numeric types
    useEffect(() => {
        if (filters) {
            setSelectedProject(filters.project_id || '');
            setSelectedMonth(parseInt(filters.month) || (new Date().getMonth() + 1));
            setSelectedYear(parseInt(filters.year) || new Date().getFullYear());
            setSelectedUser(filters.user_id || '');
            setSelectedDate(filters.date || '');
        }
    }, [filters]);

    useEffect(() => {
        setLocalItems(items_data || []);
    }, [items_data]);

    const handleFilterChange = (newFilters = {}) => {
        const params = {
            project_id: newFilters.project_id !== undefined ? newFilters.project_id : selectedProject,
            month: newFilters.month !== undefined ? newFilters.month : selectedMonth,
            year: newFilters.year !== undefined ? newFilters.year : selectedYear,
            user_id: newFilters.user_id !== undefined ? newFilters.user_id : selectedUser,
            date: newFilters.date !== undefined ? newFilters.date : selectedDate,
        };
        router.get(route('admin.content-calendar.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const onProjectFilterChange = (val) => {
        setSelectedProject(val);
        handleFilterChange({ project_id: val });
    };

    const handlePrevMonth = () => {
        let m = parseInt(selectedMonth) - 1;
        let y = parseInt(selectedYear);
        if (m < 1) { m = 12; y--; }
        setSelectedMonth(m);
        setSelectedYear(y);
        handleFilterChange({ month: m, year: y });
    };

    const handleNextMonth = () => {
        let m = parseInt(selectedMonth) + 1;
        let y = parseInt(selectedYear);
        if (m > 12) { m = 1; y++; }
        setSelectedMonth(m);
        setSelectedYear(y);
        handleFilterChange({ month: m, year: y });
    };

    const onUserFilterChange = (val) => {
        setSelectedUser(val);
        handleFilterChange({ user_id: val });
    };

    const onDateFilterChange = (val) => {
        setSelectedDate(val);
        handleFilterChange({ date: val });
    };

    const handleGenerateMonth = () => {
        const tid = toast.loading("Generating month...");
        router.post(route('admin.content-calendar.generate-month'), {
            project_id: selectedProject || null,
            month: parseInt(selectedMonth),
            year: parseInt(selectedYear)
        }, {
            onSuccess: () => toast.success("Month generated", { id: tid }),
            onError: (err) => toast.error("Generation failed", { id: tid }),
        });
    };

    const handleReset = () => {
        const now = new Date();
        const m = now.getMonth() + 1;
        const y = now.getFullYear();

        setSelectedProject('');
        setSelectedMonth(m);
        setSelectedYear(y);
        setSelectedUser('');
        setSelectedDate('');

        router.get(route('admin.content-calendar.index'), {
            project_id: '',
            month: m,
            year: y,
            user_id: '',
            date: ''
        }, { replace: true });
    };

    const handleAddRowContextual = (date) => {
        const projectId = selectedProject || (projects.length > 0 ? projects[0].id : null);
        if (!projectId) {
            toast.error("Please select a project first.");
            return;
        }

        const tid = toast.loading("Adding row...");
        router.post(route('admin.content-calendar.add-row'), {
            project_id: projectId,
            month: parseInt(selectedMonth),
            year: parseInt(selectedYear),
            date: date
        }, {
            onSuccess: () => toast.success("Row added", { id: tid }),
            onError: (err) => toast.error("Failed", { id: tid }),
        });
    };

    const handleDeleteRow = (id) => {
        if (confirm("Are you sure you want to delete this added row?")) {
            const tid = toast.loading("Deleting...");
            router.delete(route('admin.content-calendar.destroy', id), {
                onSuccess: () => toast.success("Row deleted", { id: tid }),
                onError: () => toast.error("Delete failed. You can only delete additional rows."),
            });
        }
    };

    const handleClearRow = (id) => {
        if (confirm("Clear all information for this row?")) {
            const tid = toast.loading("Clearing...");
            router.post(route('admin.content-calendar.clear-row', id), {}, {
                onSuccess: () => toast.success("Row cleared", { id: tid }),
                onError: () => toast.error("Clear failed"),
            });
        }
    };

    const updateCell = useCallback(debounce(async (id, field, value) => {
        try {
            await axios.patch(route('admin.content-calendar.update-cell', id), {
                field,
                value
            });
            toast.success('Saved', { duration: 800 });
        } catch (error) {
            toast.error('Failed to save');
            console.error(error);
        }
    }, 800), []);

    const onCellChange = (id, field, value) => {
        const updated = localItems.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        );
        setLocalItems(updated);
        updateCell(id, field, value);
    };

    const onAssigneeChange = (id, newAssignees) => {
        const updated = localItems.map(item =>
            item.id === id ? { ...item, assignees: newAssignees } : item
        );
        setLocalItems(updated);
        updateCell(id, 'assignees', newAssignees.map(u => u.id));
    };

    const isSunday = (dateStr) => {
        const date = new Date(dateStr);
        return date.getDay() === 0;
    };

    const getDayName = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    };

    const getAvatarUrl = (user) => {
        const basePath = import.meta.env.VITE_BASE_URL || '';
        if (user?.image) return user.image.startsWith("http") ? user.image : `${basePath}/storage/${user.image}`;
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=random&color=fff`;
    };

    const currentProjectName = projects.find(p => String(p.id) === String(selectedProject))?.name || 'All Projects';

    // Inline Multi-Select Component logic
    const [openAssigneeId, setOpenAssigneeId] = useState(null);
    const assigneeRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (assigneeRef.current && !assigneeRef.current.contains(event.target)) {
                setOpenAssigneeId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isMonthAlreadyGenerated = is_month_generated;

    return (
        <AdminLayout title="Content Calendar">
            <Head title="Content Calendar" />

            {/* Aesthetic Header */}
            <div className="bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 mb-6 flex flex-wrap items-center justify-between gap-6 font-sans">
                <div className="flex items-center gap-8 flex-wrap">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.05em]">Project</label>
                        <select
                            value={selectedProject}
                            onChange={(e) => onProjectFilterChange(e.target.value)}
                            className="text-[14px] border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-gray-800 bg-gray-50/50 min-w-[200px] h-11 transition-all hover:bg-white hover:border-gray-300"
                        >
                            <option value="">Select Project</option>
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.05em]">Month (Monthly View)</label>
                        <MonthPicker
                            value={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`}
                            onChange={(val) => {
                                const [y, m] = val.split('-');
                                setSelectedYear(parseInt(y));
                                setSelectedMonth(parseInt(m));
                                handleFilterChange({ year: parseInt(y), month: parseInt(m) });
                            }}
                            className="min-w-[200px]"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.05em]">Quick Filters</label>
                        <div className="flex gap-2">
                            <select
                                value={selectedUser}
                                onChange={(e) => onUserFilterChange(e.target.value)}
                                className="text-[14px] border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400/20 bg-gray-50/50 font-semibold text-gray-700 h-11 px-4 transition-all hover:bg-white hover:border-gray-300"
                            >
                                <option value="">By User</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => onDateFilterChange(e.target.value)}
                                className="text-[14px] border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400/20 bg-gray-50/50 font-semibold text-gray-700 h-11 transition-all hover:bg-white hover:border-gray-300"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 items-end">
                    {(selectedProject || selectedUser || selectedDate) && (
                        <button
                            onClick={handleReset}
                            className="text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-red-500 px-4 h-11 transition-colors flex items-center gap-2"
                        >
                            Reset Filters
                        </button>
                    )}
                    <button
                        onClick={handleGenerateMonth}
                        disabled={isMonthAlreadyGenerated}
                        title={isMonthAlreadyGenerated ? "Month structure already exists" : "Generate calendar skeleton for this month"}
                        className={`flex items-center gap-3 px-8 py-3 rounded-xl transition-all font-bold uppercase tracking-[0.1em] text-[12px] shadow-lg ${isMonthAlreadyGenerated ? 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-50' : 'bg-orange-600 text-white hover:bg-orange-700 active:scale-95 shadow-orange-100'}`}
                    >
                        <FaMagic /> Generate Month
                    </button>
                </div>
            </div>

            {/* Courses List Style Table - High Visibility Edition */}
            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 font-sans ring-1 ring-gray-100">
                <div className="overflow-x-auto overflow-y-hidden w-full custom-scrollbar-h">
                    <table className="w-full text-left border-collapse min-w-[1400px]">
                        <thead className="bg-[#fcfcfd] border-b border-gray-100">
                            <tr>
                                <th className="py-6 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[70px] pl-10">#</th>
                                <th className="py-6 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[140px]">Creative No:</th>
                                <th className="py-6 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[120px]">Date</th>
                                <th className="py-6 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[160px]">Project</th>
                                <th className="py-6 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[220px]">Creative Type</th>
                                <th className="py-6 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[160px]">Assigned To</th>
                                <th className="py-6 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[130px]">Updation</th>
                                <th className="py-6 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[150px]">Drive Link</th>
                                <th className="py-6 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[150px]">Thumbnail</th>
                                <th className="py-6 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[250px]">Creative Caption</th>
                                <th className="py-6 px-4 text-[11px] font-bold text-gray-500 uppercase tracking-widest w-[160px] text-right pr-10">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {localItems.map((item, idx) => {
                                const isSun = isSunday(item.date);
                                return (
                                    <tr key={item.id} className="group hover:bg-gray-50/30 transition-all relative">
                                        <td className="py-8 px-4 pl-10 text-[14px] font-bold text-gray-300 relative">
                                            {String(idx + 1).padStart(2, '0')}
                                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all z-10">
                                                <button onClick={() => handleAddRowContextual(item.date)} className="w-8 h-8 bg-blue-600 text-white rounded-full shadow-xl hover:scale-110 active:scale-90 transition-all flex items-center justify-center">
                                                    <FaPlus size={10} />
                                                </button>
                                            </div>
                                        </td>

                                        <td className="py-8 px-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-[13px] shadow-sm ring-1 ring-inset ${isSun ? 'bg-red-50 text-red-600 ring-red-100' : 'bg-gray-50 text-gray-600 ring-gray-200/50'}`}>
                                                {item.creative_uid.split('-')[1]}
                                            </div>
                                        </td>

                                        <td className="py-8 px-4">
                                            <div className={`inline-flex flex-col gap-0.5`}>
                                                <span className={`text-[15px] font-bold tracking-tight ${isSun ? 'text-red-600' : 'text-gray-900'}`}>
                                                    {new Date(item.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                                                </span>
                                                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">{getDayName(item.date)}</span>
                                            </div>
                                        </td>

                                        <td className="py-8 px-4">
                                            <select
                                                value={item.project_id || ''}
                                                onChange={(e) => onCellChange(item.id, 'project_id', e.target.value)}
                                                className="text-[14px] font-bold text-gray-800 bg-transparent border-0 p-1 focus:ring-2 focus:ring-blue-500/20 rounded-xl w-full cursor-pointer hover:bg-gray-50 transition-colors"
                                            >
                                                <option value="">Select Project</option>
                                                {projects.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </td>

                                        <td className="py-8 px-4">
                                            <div className="flex flex-col gap-1 w-full">
                                                <textarea
                                                    className="w-full text-[14px] font-bold text-gray-900 bg-transparent border-0 p-1 focus:ring-2 focus:ring-blue-500/20 rounded-xl resize-none overflow-hidden min-h-[44px] leading-tight placeholder:text-gray-300 placeholder:font-medium"
                                                    value={item.creative_type || ''}
                                                    onChange={(e) => onCellChange(item.id, 'creative_type', e.target.value)}
                                                    placeholder="Enter Type..."
                                                />
                                                <span className="text-[10px] font-bold text-gray-400 px-1">UID: {item.creative_uid}</span>
                                            </div>
                                        </td>

                                        <td className="py-8 px-4">
                                            <div className="flex -space-x-3 overflow-hidden items-center group/assignees" onClick={() => setOpenAssigneeId(item.id)}>
                                                {item.assignees?.length > 0 ? (
                                                    item.assignees.slice(0, 3).map(u => (
                                                        <img key={u.id} src={getAvatarUrl(u)} className="inline-block h-9 w-9 rounded-full ring-4 ring-white object-cover shadow-sm cursor-pointer hover:scale-110 transition-transform" alt={u.name} title={u.name} />
                                                    ))
                                                ) : (
                                                    <div className="h-9 w-9 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 cursor-pointer hover:border-gray-400 hover:text-gray-500 transition-colors">
                                                        <FaPlus size={12} />
                                                    </div>
                                                )}
                                                {item.assignees?.length > 3 && (
                                                    <div className="h-9 w-9 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-500 shadow-sm">
                                                        +{item.assignees.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                            {openAssigneeId === item.id && (
                                                <div ref={assigneeRef} className="absolute z-[50] w-72 mt-3 bg-white border border-gray-100 rounded-[24px] shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200">
                                                    <div className="max-h-56 overflow-y-auto custom-scrollbar pr-1">
                                                        {users?.map(u => {
                                                            const isSelected = item.assignees?.some(a => String(a.id) === String(u.id));
                                                            return (
                                                                <div key={u.id} className="flex items-center gap-4 p-2.5 hover:bg-gray-50 rounded-2xl cursor-pointer transition-colors" onClick={() => {
                                                                    const current = item.assignees || [];
                                                                    const next = isSelected ? current.filter(a => String(a.id) !== String(u.id)) : [...current, u];
                                                                    onAssigneeChange(item.id, next);
                                                                }}>
                                                                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                                                                        {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                                    </div>
                                                                    <img src={getAvatarUrl(u)} className="w-7 h-7 rounded-full shadow-sm" alt="" />
                                                                    <span className="text-[13px] font-bold text-gray-700">{u.name}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </td>

                                        <td className="py-8 px-4">
                                            <input
                                                type="text"
                                                className={`text-[11px] font-bold uppercase tracking-[0.1em] rounded-xl border-0 py-2 px-4 w-full transition-all focus:ring-4 focus:ring-blue-500/10 text-center shadow-sm
                                                    ${item.updation?.toLowerCase() === 'posted' ? 'bg-green-50 text-green-700 ring-1 ring-green-100' :
                                                        item.updation?.toLowerCase() === 'shared' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100' : 'bg-gray-50 text-gray-600'}`}
                                                value={item.updation || ''}
                                                onChange={(e) => onCellChange(item.id, 'updation', e.target.value)}
                                                placeholder="STATUS"
                                            />
                                        </td>

                                        <td className="py-8 px-4">
                                            <div className="flex items-center gap-2 group/link">
                                                <input
                                                    type="text"
                                                    className="w-full text-[12px] font-semibold text-blue-600 underline bg-transparent border-0 p-1 focus:ring-2 focus:ring-blue-500/20 rounded-lg truncate hover:bg-white transition-colors"
                                                    value={item.drive_link || ''}
                                                    onChange={(e) => onCellChange(item.id, 'drive_link', e.target.value)}
                                                    placeholder="Paste Link..."
                                                />
                                                {item.drive_link && <a href={item.drive_link} target="_blank" className="text-blue-400 hover:text-blue-700 p-2 bg-blue-50 rounded-lg transition-all active:scale-95"><FaExternalLinkAlt size={12} /></a>}
                                            </div>
                                        </td>

                                        <td className="py-8 px-4">
                                            <div className="flex items-center gap-2 group/link">
                                                <input
                                                    type="text"
                                                    className="w-full text-[12px] font-semibold text-purple-600 underline bg-transparent border-0 p-1 focus:ring-2 focus:ring-purple-500/20 rounded-lg truncate hover:bg-white transition-colors"
                                                    value={item.thumbnail_link || ''}
                                                    onChange={(e) => onCellChange(item.id, 'thumbnail_link', e.target.value)}
                                                    placeholder="Paste Image URL..."
                                                />
                                                {item.thumbnail_link && <a href={item.thumbnail_link} target="_blank" className="text-purple-400 hover:text-purple-700 p-2 bg-purple-50 rounded-lg transition-all active:scale-95"><FaImage size={12} /></a>}
                                            </div>
                                        </td>

                                        <td className="py-8 px-4">
                                            <textarea
                                                className="w-full text-[13px] font-semibold text-gray-600 bg-transparent border-0 p-1 focus:ring-2 focus:ring-blue-500/20 rounded-xl resize-none overflow-hidden min-h-[44px] leading-relaxed placeholder:text-gray-300 italic"
                                                value={item.creative_caption || ''}
                                                onChange={(e) => onCellChange(item.id, 'creative_caption', e.target.value)}
                                                placeholder="Enter caption..."
                                            />
                                        </td>

                                        <td className="py-8 px-4 text-right pr-10">
                                            <div className="flex items-center justify-end gap-2.5">
                                                <button onClick={() => setShowDetailId(item.id)} className="w-10 h-10 bg-white text-blue-500 rounded-xl hover:shadow-xl hover:shadow-blue-100 transition-all active:scale-90 border border-gray-100 flex items-center justify-center shrink-0" title="View"><FaEye size={16} /></button>
                                                <button onClick={() => handleClearRow(item.id)} className="w-10 h-10 bg-white text-orange-500 rounded-xl hover:shadow-xl hover:shadow-orange-100 transition-all active:scale-90 border border-gray-100 flex items-center justify-center shrink-0" title="Clear"><FaEraser size={16} /></button>
                                                {item.is_additional ? (
                                                    <button onClick={() => handleDeleteRow(item.id)} className="w-10 h-10 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-90 flex items-center justify-center shrink-0" title="Delete"><FaTrashAlt size={16} /></button>
                                                ) : (
                                                    <button disabled className="w-10 h-10 bg-gray-50 text-gray-200 rounded-xl border border-gray-100 cursor-not-allowed flex items-center justify-center shrink-0"><FaTrashAlt size={16} /></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {localItems.length === 0 && (
                    <div className="p-40 text-center bg-[#fcfcfd]/30">
                        <div className="flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center shadow-xl shadow-gray-100/50 ring-1 ring-gray-100">
                                <FaFilter size={32} className="text-gray-100" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-[18px] font-bold text-gray-900">No items detected</h4>
                                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest px-4 py-1 bg-gray-50 rounded-full inline-block">Use the filters or generate a month</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Premium Detail Modal - High Vis */}
            {showDetailId && selectedTask && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-500 font-sans">
                    <div className="bg-white rounded-[48px] shadow-3xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-500 border border-white">
                        <div className="p-12 border-b border-gray-50 flex justify-between items-center bg-[#fcfcfd]">
                            <div className="flex items-center gap-8">
                                <div className="w-20 h-20 bg-blue-600 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-blue-200 rotate-[-4deg]">
                                    <span className="text-2xl font-black">{selectedTask.creative_uid.split('-')[1]}</span>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-[28px] font-black text-gray-900 tracking-tight leading-tight">{selectedTask.creative_type || 'Untitled Creative Content'}</h3>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-gray-200/50">
                                            {selectedTask.creative_uid}
                                        </span>
                                        <span className="text-[12px] font-bold text-blue-600 uppercase tracking-widest">{new Date(selectedTask.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setShowDetailId(null)} className="p-6 hover:bg-gray-100 rounded-[32px] transition-all text-gray-400 hover:text-gray-900 hover:rotate-90 group active:scale-95">
                                <FaTimes size={24} />
                            </button>
                        </div>
                        <div className="p-14 max-h-[70vh] overflow-y-auto custom-scrollbar bg-white">
                            <div className="grid grid-cols-2 gap-16">
                                <DetailField label="Project Folder" value={selectedTask.project?.name || 'Unassigned Project'} icon="📁" />
                                <DetailField label="Current Updation Status" value={selectedTask.updation || 'Pending/Planned'} icon="📊" />
                                <div className="col-span-2 space-y-5">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block">Assigned Creative Team</label>
                                    <div className="flex flex-wrap gap-4">
                                        {selectedTask.assignees?.length > 0 ? selectedTask.assignees.map(u => (
                                            <div key={u.id} className="flex items-center gap-4 bg-gray-50 border border-gray-100 rounded-[24px] px-6 py-3.5 hover:ring-2 hover:ring-blue-100 transition-all shadow-sm group">
                                                <img src={getAvatarUrl(u)} className="w-10 h-10 rounded-full shadow-md group-hover:scale-110 transition-transform" alt="" />
                                                <span className="text-[15px] font-bold text-gray-800">{u.name}</span>
                                            </div>
                                        )) : <span className="text-[15px] text-gray-300 italic">No team members assigned.</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-14 pt-14 border-t border-gray-100 space-y-12">
                                <div className="grid grid-cols-2 gap-12">
                                    <DetailLink label="Creative Assets (Google Drive)" url={selectedTask.drive_link} type="drive" />
                                    <DetailLink label="Thumbnail Visual Preview" url={selectedTask.thumbnail_link} type="thumb" />
                                </div>
                                <div className="bg-gray-50/50 rounded-[40px] p-12 border border-gray-100 shadow-inner ring-1 ring-inset ring-gray-100">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-8">Creative Caption Copy</label>
                                    <div className="bg-white p-10 rounded-3xl border border-gray-100 text-[17px] text-gray-800 leading-[1.8] font-medium whitespace-pre-wrap shadow-xl shadow-gray-100/50 italic font-serif">
                                        {selectedTask.creative_caption || "The caption content for this creative is currently being drafted."}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-12 border-t border-gray-50 flex justify-end bg-gray-50/20">
                            <button onClick={() => setShowDetailId(null)} className="px-14 py-5 bg-gray-900 text-white rounded-[24px] font-bold uppercase tracking-[0.25em] text-[11px] hover:bg-blue-600 transition-all active:scale-95 shadow-2xl px-20">
                                Return to List
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
                .font-sans { font-family: 'Plus Jakarta Sans', sans-serif !important; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #eef2f6; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #dde5ed; }

                .custom-scrollbar-h { overflow-y: hidden !important; }
                .custom-scrollbar-h::-webkit-scrollbar { height: 6px; }
                .custom-scrollbar-h::-webkit-scrollbar-track { background: #f8fafc; border-radius: 10px; }
                .custom-scrollbar-h::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar-h::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
                input[type="date"]::-webkit-calendar-picker-indicator { cursor: pointer; filter: opacity(0.2); }
                textarea::-webkit-scrollbar { display: none; }
                textarea { scrollbar-width: none; }
                ::placeholder { color: #cbd5e1; opacity: 1; }
            ` }} />
        </AdminLayout>
    );
}
