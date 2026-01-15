import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Filter, Edit, RotateCcw, MapPin } from 'lucide-react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import MonthPicker from '@/Components/MonthPicker';
import CalendarView from '@/Components/CalendarView';

export default function Index({ attendanceData, filters, users, viewType, totalMonthlyMinutes, selectedUser, leaves }) {
    const [displayMode, setDisplayMode] = useState('table'); // 'table' or 'calendar'
    const [editingAttendance, setEditingAttendance] = useState(null);
    const { data, setData, put, post, processing, errors, reset } = useForm({
        user_id: '',
        date: '',
        punch_in: '',
        punch_out: '',
    });

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const handleFilterChange = (key, value) => {
        const newParams = {
            date: filters.date || '',
            month: filters.month || '',
            user_id: filters.user_id || '',
            [key]: value
        };

        if (key === 'month' && value) {
            newParams.date = '';
        }
        if (key === 'date' && value) {
            newParams.month = '';
            newParams.user_id = ''; // Clear user filter when switching to daily view
        }

        router.get(route('admin.attendance.index'), newParams, {
            preserveState: true,
            replace: true
        });
    };

    const handleReset = () => {
        router.get(route('admin.attendance.index'), {}, { replace: true });
    };

    const openEditModal = (record) => {
        setEditingAttendance(record);

        const formatDateForInput = (dateStr) => {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            const offset = d.getTimezoneOffset() * 60000;
            return new Date(d.getTime() - offset).toISOString().slice(0, 16);
        };

        let defaultPunchIn = '';
        if (!record.attendance_id && filters.date) {
            defaultPunchIn = `${filters.date}T09:00`;
        } else if (!record.attendance_id && record.date) {
            defaultPunchIn = `${record.date}T09:00`;
        }

        setData({
            user_id: record.id || (selectedUser ? selectedUser.id : ''),
            date: record.date || filters.date,
            punch_in: record.punch_in_raw ? formatDateForInput(record.punch_in_raw) : defaultPunchIn,
            punch_out: record.punch_out_raw ? formatDateForInput(record.punch_out_raw) : '',
        });
    };

    const closeEditModal = () => {
        setEditingAttendance(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const options = {
            onSuccess: () => closeEditModal(),
            preserveScroll: true,
        };

        if (editingAttendance.attendance_id) {
            put(route('admin.attendance.update', editingAttendance.attendance_id), options);
        } else {
            post(route('admin.attendance.store'), options);
        }
    };

    const formatDuration = (minutes) => {
        if (!minutes) return '0h 0m';
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Present': return 'bg-green-100 text-green-800';
            case 'Late': return 'bg-yellow-100 text-yellow-800';
            case 'Early Leave': return 'bg-orange-100 text-orange-800';
            case 'Late & Early Leave': return 'bg-red-100 text-red-800';
            case 'Absent': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AdminLayout>
            <Head title="Attendance Monitoring" />

            <div className="py-12">
                <div className="w-full">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-2xl font-semibold">Attendance Monitoring</h2>
                                    <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium border border-gray-200">
                                        Office Hours: 9 AM - 6 PM IST
                                    </div>
                                </div>
                                {viewType === 'monthly' && (
                                    <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-medium border border-indigo-100">
                                        Monthly Total: {formatDuration(totalMonthlyMinutes)}
                                    </div>
                                )}
                            </div>

                            {/* Tab Switcher */}
                            <div className="flex border-b border-gray-200 mb-6">
                                <button
                                    onClick={() => setDisplayMode('table')}
                                    className={`px-6 py-2 text-sm font-medium transition-colors border-b-2 ${displayMode === 'table'
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    Table View
                                </button>
                                <button
                                    onClick={() => {
                                        if (viewType === 'daily') {
                                            // Switch to monthly view if in daily view
                                            handleFilterChange('month', new Date().toISOString().slice(0, 7));
                                        }
                                        setDisplayMode('calendar');
                                    }}
                                    className={`px-6 py-2 text-sm font-medium transition-colors border-b-2 ${displayMode === 'calendar'
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    Calendar View
                                </button>
                            </div>

                            {/* Filters */}
                            <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-4 rounded-lg items-end">
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-1">User</label>
                                    <select
                                        value={filters.user_id || ''}
                                        onChange={(e) => handleFilterChange('user_id', e.target.value)}
                                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm min-w-[150px]"
                                    >
                                        <option value="">All Users</option>
                                        {users.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-1">Date (Daily View)</label>
                                    <input
                                        type="date"
                                        value={filters.date || ''}
                                        onChange={(e) => handleFilterChange('date', e.target.value)}
                                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-1">Month (Monthly View)</label>
                                    <MonthPicker
                                        value={filters.month || ''}
                                        onChange={(val) => handleFilterChange('month', val)}
                                        className="min-w-[180px]"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={handleReset}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                                        title="Reset Filters"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Reset
                                    </button>
                                </div>
                            </div>

                            {/* Table View (Used for both Daily and Monthly) */}
                            {displayMode === 'table' || viewType === 'daily' ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                {viewType === 'daily' && (
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                )}
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {attendanceData.length > 0 ? (
                                                attendanceData.map((record) => (
                                                    <tr key={record.id}>
                                                        {viewType === 'daily' && (
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm font-medium text-gray-900">{record.name}</div>
                                                            </td>
                                                        )}
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {formatDate(record.date || filters.date)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {record.check_in}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {record.check_out}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                            ${getStatusColor(record.status)}`}>
                                                                {record.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {record.hours}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            <div className="flex items-center gap-3">
                                                                {record.punch_in_lat && (
                                                                    <a
                                                                        href={`https://www.google.com/maps?q=${record.punch_in_lat},${record.punch_in_lng}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-green-600 hover:text-green-800 transition-colors"
                                                                        title="Check-in Location"
                                                                    >
                                                                        <MapPin className="w-4 h-4" />
                                                                    </a>
                                                                )}
                                                                {record.punch_out_lat && (
                                                                    <a
                                                                        href={`https://www.google.com/maps?q=${record.punch_out_lat},${record.punch_out_lng}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-red-600 hover:text-red-800 transition-colors"
                                                                        title="Check-out Location"
                                                                    >
                                                                        <MapPin className="w-4 h-4" />
                                                                    </a>
                                                                )}
                                                                {!record.punch_in_lat && !record.punch_out_lat && '-'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <button
                                                                onClick={() => openEditModal(record)}
                                                                className="text-indigo-600 hover:text-indigo-900"
                                                            >
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={viewType === 'daily' ? 8 : 7} className="px-6 py-4 text-center text-gray-500">
                                                        No records found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <CalendarView
                                    attendanceData={attendanceData}
                                    leaves={leaves}
                                    filters={filters}
                                    onFilterChange={handleFilterChange}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={!!editingAttendance} onClose={closeEditModal}>
                <form onSubmit={handleSubmit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        {editingAttendance?.attendance_id ? 'Edit Attendance' : 'Add Attendance'}
                        {viewType === 'daily' ? ` - ${editingAttendance?.name}` : ` - ${selectedUser?.name}`}
                    </h2>

                    <div className="mb-4">
                        <InputLabel htmlFor="punch_in" value="Check In" />
                        <TextInput
                            id="punch_in"
                            type="datetime-local"
                            className="mt-1 block w-full"
                            value={data.punch_in}
                            onChange={(e) => setData('punch_in', e.target.value)}
                            required
                        />
                        <InputError message={errors.punch_in} className="mt-2" />
                    </div>

                    <div className="mb-4">
                        <InputLabel htmlFor="punch_out" value="Check Out" />
                        <TextInput
                            id="punch_out"
                            type="datetime-local"
                            className="mt-1 block w-full"
                            value={data.punch_out}
                            onChange={(e) => setData('punch_out', e.target.value)}
                        />
                        <InputError message={errors.punch_out} className="mt-2" />
                    </div>

                    <div className="flex items-center justify-end mt-6">
                        <SecondaryButton onClick={closeEditModal} className="mr-3">
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {editingAttendance?.attendance_id ? 'Update' : 'Create'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
