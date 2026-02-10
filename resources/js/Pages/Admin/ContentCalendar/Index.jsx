import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { FaPlus, FaEdit, FaTrash, FaExternalLinkAlt, FaImage } from 'react-icons/fa';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

export default function Index({ auth, items, projects, users }) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Custom Dropdown State
    const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const { data, setData, post, processing, errors, reset, setError, clearErrors } = useForm({
        project_id: '',
        date: '',
        creative_type: '',
        assignees: [], // Stores IDs as strings or numbers
        status: 'pending',
        drive_link: '',
        thumbnail_link: '',
        caption: '',
    });

    // Handle click outside dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsAssigneeDropdownOpen(false);
            }
        }
        if (isCreateModalOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isCreateModalOpen]);

    const openCreateModal = () => {
        reset();
        setIsCreateModalOpen(true);
        setIsAssigneeDropdownOpen(false);
    };

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        reset();
    };

    const validate = () => {
        const newErrors = {};
        if (data.assignees.length === 0) {
            newErrors.assignees = 'Please select at least one assignee.';
        }
        // You can add other field validations here if needed, but the browser handles 'required' for others
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setError('assignees', validationErrors.assignees);
            return;
        }

        post(route('admin.content-calendar.store'), {
            onSuccess: () => closeCreateModal(),
        });
    };

    const toggleAssigneeDropdown = () => {
        setIsAssigneeDropdownOpen(prev => !prev);
    };

    const handleAssigneeChange = (e) => {
        const { value, checked } = e.target;
        // Ensure values are strings for comparison if needed, but keeping type consistent is key
        const valStr = String(value);

        const currentAssignees = data.assignees.map(String);

        if (checked) {
            if (!currentAssignees.includes(valStr)) {
                setData('assignees', [...currentAssignees, valStr]);
            }
        } else {
            setData('assignees', currentAssignees.filter(id => id !== valStr));
        }
    };

    const getSelectedAssigneeNames = () => {
        // Filter users based on selected IDs
        const selectedUsers = users?.filter(u => data.assignees.map(String).includes(String(u.id)));

        if (!selectedUsers || selectedUsers.length === 0) {
            return "Select Assignee(s)";
        }

        const names = selectedUsers.map(u => u.name);

        if (names.length > 2) {
            return `${names[0]}, ${names[1]} (+${names.length - 2} more)`;
        }
        return names.join(', ');
    };

    const getAvatarUrl = (user) => {
        const basePath = import.meta.env.VITE_BASE_URL || '';
        if (user?.image) {
            return user.image.startsWith("http")
                ? user.image
                : `${basePath}/storage/${user.image}`;
        }
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "U")}&background=random&color=fff`;
    };

    return (
        <AdminLayout title="Content Calendar">
            <Head title="Content Calendar" />

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Content Calendar</h2>
                <PrimaryButton onClick={openCreateModal}>
                    <FaPlus className="mr-2" /> Add Content
                </PrimaryButton>
            </div>

            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creative No</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Links</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Caption</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {items.data.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.creative_uid}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.creative_type || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.assignees && item.assignees.length > 0
                                            ? item.assignees.map(u => u.name).join(', ')
                                            : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${item.status === 'posted' ? 'bg-green-100 text-green-800' :
                                                item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {item.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex gap-2">
                                        {item.drive_link && (
                                            <a href={item.drive_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-900" title="Drive Link">
                                                <FaExternalLinkAlt />
                                            </a>
                                        )}
                                        {item.thumbnail_link && (
                                            <a href={item.thumbnail_link} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-900" title="Thumbnail">
                                                <FaImage />
                                            </a>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={item.caption}>
                                        {item.caption || '-'}
                                    </td>
                                </tr>
                            ))}
                            {items.data.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No content found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Modal */}
            <Modal show={isCreateModalOpen} onClose={closeCreateModal}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Add Content Calendar Task</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Project */}
                            <div>
                                <InputLabel value="Project" />
                                <select
                                    value={data.project_id}
                                    onChange={(e) => setData('project_id', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                >
                                    <option value="">Select Project</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                                {errors.project_id && <div className="text-red-500 text-sm mt-1">{errors.project_id}</div>}
                            </div>

                            {/* Date */}
                            <div>
                                <InputLabel value="Date" />
                                <TextInput
                                    type="date"
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                {errors.date && <div className="text-red-500 text-sm mt-1">{errors.date}</div>}
                            </div>

                            {/* Creative Type */}
                            <div>
                                <InputLabel value="Creative Type" />
                                <TextInput
                                    value={data.creative_type}
                                    onChange={(e) => setData('creative_type', e.target.value)}
                                    className="mt-1 block w-full"
                                    placeholder="e.g. Video Story"
                                />
                            </div>

                            {/* Assignee - Custom Multi Select */}
                            <div>
                                <InputLabel value="Assigned To" />
                                <div ref={dropdownRef} className="relative mt-1">
                                    <button
                                        type="button"
                                        onClick={toggleAssigneeDropdown}
                                        className={`w-full flex justify-between items-center bg-white border rounded-md shadow-sm px-3 py-2 text-left focus:outline-none focus:ring-1 ${errors.assignees ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'}`}
                                    >
                                        <span className="truncate pr-4 text-gray-700 text-sm">
                                            {getSelectedAssigneeNames()}
                                        </span>
                                        <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isAssigneeDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                                    </button>

                                    {isAssigneeDropdownOpen && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                            {users?.map((user) => (
                                                <div
                                                    key={user.id}
                                                    className="flex items-center p-2.5 hover:bg-gray-50 transition cursor-pointer"
                                                    onClick={() => {
                                                        const syntheticEvent = { target: { value: String(user.id), checked: !data.assignees.map(String).includes(String(user.id)) } };
                                                        handleAssigneeChange(syntheticEvent);
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={data.assignees.map(String).includes(String(user.id))}
                                                        onChange={() => { }} // Handled by div click
                                                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                    />
                                                    <div className="ml-3 flex items-center">
                                                        <img
                                                            src={getAvatarUrl(user)}
                                                            alt="avatar"
                                                            className="w-6 h-6 rounded-full border border-gray-200 object-cover"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">{user.name}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {errors.assignees && <div className="text-red-500 text-sm mt-1">{errors.assignees}</div>}
                            </div>

                            {/* Status */}
                            <div>
                                <InputLabel value="Status" />
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="posted">Posted</option>
                                    <option value="shared">Shared</option>
                                </select>
                            </div>

                            {/* Drive Link */}
                            <div className="col-span-1 md:col-span-2">
                                <InputLabel value="Drive Link" />
                                <TextInput
                                    type="url"
                                    value={data.drive_link}
                                    onChange={(e) => setData('drive_link', e.target.value)}
                                    className="mt-1 block w-full"
                                    placeholder="https://..."
                                />
                            </div>

                            {/* Thumbnail Link */}
                            <div className="col-span-1 md:col-span-2">
                                <InputLabel value="Thumbnail Link" />
                                <TextInput
                                    type="url"
                                    value={data.thumbnail_link}
                                    onChange={(e) => setData('thumbnail_link', e.target.value)}
                                    className="mt-1 block w-full"
                                    placeholder="https://..."
                                />
                            </div>

                            {/* Caption */}
                            <div className="col-span-1 md:col-span-2">
                                <InputLabel value="Caption" />
                                <textarea
                                    value={data.caption}
                                    onChange={(e) => setData('caption', e.target.value)}
                                    className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                    rows="3"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeCreateModal}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <PrimaryButton disabled={processing}>
                                Save
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </AdminLayout>
    );
}
