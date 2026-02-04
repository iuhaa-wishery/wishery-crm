import React, { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Filter, Edit, RotateCcw, MapPin, Smartphone, Monitor } from 'lucide-react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import MonthPicker from '@/Components/MonthPicker';
import CalendarView from '@/Components/CalendarView';

export default function Index({ attendanceData, filters, users, viewType, totalMonthlyMinutes, selectedUser, leaves, settings }) {
    const [displayMode, setDisplayMode] = useState(filters.display || 'table');
    const [editingAttendance, setEditingAttendance] = useState(null);

    // Update displayMode when filters.display changes from server
    useEffect(() => {
        if (filters.display) {
            setDisplayMode(filters.display);
        }
    }, [filters.display]);
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
            display: displayMode,
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
            case 'Present': return 'bg-green-100 text-green-600';
            case 'Late':
            case 'Early Leave':
            case 'Late & Early Leave': return 'bg-orange-100 text-orange-600';
            case 'Absent': return 'bg-red-100 text-red-600';
            case 'Half Day': return 'bg-blue-100 text-blue-600';
            default: return 'bg-gray-100 text-gray-500';
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
                                    onClick={() => {
                                        setDisplayMode('table');
                                        router.get(route('admin.attendance.index'), { ...filters, display: 'table' }, { preserveState: true });
                                    }}
                                    className={`px-6 py-2 text-sm font-medium transition-colors border-b-2 ${displayMode === 'table'
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    Table View
                                </button>
                                <button
                                    onClick={() => {
                                        setDisplayMode('calendar');
                                        const newParams = { ...filters, display: 'calendar' };
                                        if (!filters.user_id && users.length > 0) {
                                            newParams.user_id = users[0].id;
                                        }
                                        router.get(route('admin.attendance.index'), newParams, { preserveState: true });
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
                                        {displayMode !== 'calendar' && <option value="">All Users</option>}
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
                            {displayMode === 'table' ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr className="border-b border-gray-100">
                                                {viewType === 'daily' && (
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                                                )}
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Check In</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Check Out</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Hours</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Break</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Location</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Device</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {attendanceData && attendanceData.length > 0 ? (
                                                attendanceData.map((record) => (
                                                    <tr key={record?.id || Math.random()}>
                                                        {viewType === 'daily' && (
                                                            <td className="px-4 py-3 whitespace-nowrap">
                                                                <div className="text-sm font-semibold text-gray-900">{record?.name}</div>
                                                            </td>
                                                        )}
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                            {formatDate(record?.date || filters?.date)}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                            {record?.check_in === '-' ? '--' : record?.check_in}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                            {record?.check_out === '-' ? '--' : record?.check_out}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            <span className={`px-4 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getStatusColor(record?.status)}`}>
                                                                {record?.status === 'Late & Early Leave' ? 'Late' : record?.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                            {record?.hours === '0h 0m' ? '--' : record?.hours}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                            {record?.break_time === '0h 0m' ? '--' : record?.break_time}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                            <div className="flex items-center gap-3">
                                                                {record?.punch_in_lat && (
                                                                    <a
                                                                        href={`https://www.google.com/maps?q=${record.punch_in_lat},${record.punch_in_lng}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-green-500 hover:text-green-700 transition-colors"
                                                                        title="Check-in Location"
                                                                    >
                                                                        <MapPin className="w-4 h-4" />
                                                                    </a>
                                                                )}
                                                                {record?.punch_out_lat && (
                                                                    <a
                                                                        href={`https://www.google.com/maps?q=${record.punch_out_lat},${record.punch_out_lng}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-red-500 hover:text-red-700 transition-colors"
                                                                        title="Check-out Location"
                                                                    >
                                                                        <MapPin className="w-4 h-4" />
                                                                    </a>
                                                                )}
                                                                {!record?.punch_in_lat && !record?.punch_out_lat && '--'}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                                            {record?.device_type === 'Mobile' ? (
                                                                <span className="flex items-center gap-1" title="Mobile">
                                                                    <Smartphone className="w-4 h-4 text-gray-500" /> Mobile
                                                                </span>
                                                            ) : record?.device_type === 'Desktop' ? (
                                                                <span className="flex items-center gap-1" title="Desktop">
                                                                    <Monitor className="w-4 h-4 text-gray-500" /> Desktop
                                                                </span>
                                                            ) : (
                                                                '--'
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
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
                                                    <td colSpan={viewType === 'daily' ? 10 : 9} className="px-6 py-4 text-center text-gray-500">
                                                        No records found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : displayMode === 'calendar' ? (
                                <CalendarView
                                    attendanceData={attendanceData}
                                    leaves={leaves}
                                    filters={filters}
                                    settings={settings}
                                    onFilterChange={handleFilterChange}
                                />
                            ) : null}
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
