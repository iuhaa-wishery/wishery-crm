import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Search, Filter, Download, Edit, MapPin } from 'lucide-react';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Index({ attendances, filters, users, totalWorkedMinutes }) {
    const [params, setParams] = useState({
        date: filters.date || '',
        month: filters.month || '',
        user_id: filters.user_id || '',
    });

    const [editingAttendance, setEditingAttendance] = useState(null);
    const { data, setData, put, processing, errors, reset } = useForm({
        punch_in: '',
        punch_out: '',
    });

    const openEditModal = (attendance) => {
        setEditingAttendance(attendance);
        setData({
            punch_in: attendance.punch_in ? new Date(attendance.punch_in).toISOString().slice(0, 16) : '',
            punch_out: attendance.punch_out ? new Date(attendance.punch_out).toISOString().slice(0, 16) : '',
        });
    };

    const closeEditModal = () => {
        setEditingAttendance(null);
        reset();
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        router.post(route('admin.attendance.update', editingAttendance.id), {
            ...data,
            _method: 'PUT',
        }, {
            onSuccess: () => closeEditModal(),
            preserveScroll: true,
        });
    };

    const handleSearch = () => {
        router.get(route('admin.attendance.index'), params, {
            preserveState: true,
            replace: true,
        });
    };

    const handleReset = () => {
        setParams({ date: '', month: '', user_id: '' });
        router.get(route('admin.attendance.index'));
    };

    const formatTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatDuration = (minutes) => {
        if (!minutes) return '0h 0m';
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    };

    return (
        <AdminLayout>
            <Head title="Attendance Monitoring" />

            <div className="py-12">
                <div className="w-full">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold">Attendance Monitoring</h2>
                                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium">
                                    Total Time: {formatDuration(totalWorkedMinutes)}
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="flex flex-wrap gap-4 mb-6 bg-gray-50 p-4 rounded-lg items-end">
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-1">User</label>
                                    <select
                                        value={params.user_id}
                                        onChange={(e) => setParams({ ...params, user_id: e.target.value })}
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
                                    <label className="text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        value={params.date}
                                        onChange={(e) => setParams({ ...params, date: e.target.value, month: '' })}
                                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-1">Month</label>
                                    <input
                                        type="month"
                                        value={params.month}
                                        onChange={(e) => setParams({ ...params, month: e.target.value, date: '' })}
                                        className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    />
                                </div>
                                <div className="flex items-end gap-2">
                                    <button
                                        onClick={handleSearch}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                                    >
                                        <Filter className="w-4 h-4 mr-2" /> Filter
                                    </button>
                                    <button
                                        onClick={handleReset}
                                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Punch In</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Punch Out</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Break</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {attendances.data.length > 0 ? (
                                            attendances.data.map((attendance) => (
                                                <tr key={attendance.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {attendance.user?.name || 'Unknown'}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatDate(attendance.date)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                                        {formatTime(attendance.punch_in)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                                                        {formatTime(attendance.punch_out)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {attendance.total_break_minutes} mins
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                            ${attendance.status === 'punched_in' ? 'bg-green-100 text-green-800' :
                                                                attendance.status === 'on_break' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-gray-100 text-gray-800'}`}>
                                                            {attendance.status.replace('_', ' ').toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <div className="flex flex-col space-y-1">
                                                            {attendance.punch_in_lat && (
                                                                <a
                                                                    href={`https://www.google.com/maps?q=${attendance.punch_in_lat},${attendance.punch_in_lng}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center text-green-600 hover:text-green-800"
                                                                    title="Punch In Location"
                                                                >
                                                                    <MapPin className="w-3 h-3 mr-1" /> In
                                                                </a>
                                                            )}
                                                            {attendance.punch_out_lat && (
                                                                <a
                                                                    href={`https://www.google.com/maps?q=${attendance.punch_out_lat},${attendance.punch_out_lng}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center text-red-600 hover:text-red-800"
                                                                    title="Punch Out Location"
                                                                >
                                                                    <MapPin className="w-3 h-3 mr-1" /> Out
                                                                </a>
                                                            )}
                                                            {!attendance.punch_in_lat && !attendance.punch_out_lat && '-'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => openEditModal(attendance)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                                                    No attendance records found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="mt-4">
                                {attendances.links && (
                                    <div className="flex justify-center">
                                        {attendances.links.map((link, key) => (
                                            <button
                                                key={key}
                                                onClick={() => link.url && router.get(link.url, params)}
                                                disabled={!link.url || link.active}
                                                className={`mx-1 px-3 py-1 rounded ${link.active ? 'bg-blue-600 text-white' :
                                                    !link.url ? 'text-gray-400 cursor-not-allowed' :
                                                        'bg-white border text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={!!editingAttendance} onClose={closeEditModal}>
                <form onSubmit={handleUpdate} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        Edit Attendance - {editingAttendance?.user?.name}
                    </h2>

                    <div className="mb-4">
                        <InputLabel htmlFor="punch_in" value="Punch In" />
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
                        <InputLabel htmlFor="punch_out" value="Punch Out" />
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
                            Update Attendance
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
