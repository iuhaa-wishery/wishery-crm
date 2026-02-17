import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import AdminLayout from '@/Layouts/AdminLayout';
import UserLayout from '@/Layouts/UserLayout';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const localizer = momentLocalizer(moment);

// Custom Toolbar Component
const CustomToolbar = (toolbar) => {
    const goToBack = () => {
        toolbar.onNavigate('PREV');
    };

    const goToNext = () => {
        toolbar.onNavigate('NEXT');
    };

    const goToCurrent = () => {
        toolbar.onNavigate('TODAY');
    };

    const label = () => {
        const date = moment(toolbar.date);
        return (
            <span className="text-2xl font-bold text-gray-800 uppercase">
                {date.format('MMMM YYYY')}
            </span>
        );
    };

    return (
        <div className="flex justify-between items-center mb-6 p-2">
            <div className="flex items-center">
                {label()}
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={goToCurrent}
                    className="px-4 py-2 bg-[#FF9F76] text-white font-semibold rounded-lg hover:bg-[#ff8a5b] transition shadow-sm"
                >
                    Today
                </button>
                <div className="flex bg-[#FFF0E6] rounded-lg p-1">
                    <button
                        onClick={goToBack}
                        className="p-2 text-[#FF9F76] hover:bg-white rounded-md transition"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="p-2 text-[#FF9F76] hover:bg-white rounded-md transition"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function Index({ tasks, projects, users }) {
    const { auth } = usePage().props;
    const isAdminOrManager = ['admin', 'manager'].includes(auth.user.role);

    const [isOpen, setIsOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // Dropdown state
    const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const [form, setForm] = useState({
        name: '',
        description: '',
        project_id: '',
        start_date: '',
        end_date: '',
        status: 'not started',
        priority: 'medium',
        assignee_ids: []
    });

    const [errors, setErrors] = useState({});

    const statusOrder = ["not started", "in progress", "on hold", "completed"];
    const statusLabels = {
        "not started": "To Do",
        "in progress": "In Progress",
        "on hold": "On Hold",
        "completed": "Completed",
    };

    // Handle click outside dropdown
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsAssigneeDropdownOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    const events = useMemo(() => {
        return tasks.map(task => ({
            ...task,
            start: new Date(task.start),
            end: new Date(task.end),
        }));
    }, [tasks]);

    const handleSelectSlot = ({ start, end }) => {
        if (!isAdminOrManager) return;

        setSelectedSlot({ start, end });
        setForm({
            name: '',
            description: '',
            project_id: projects.length > 0 ? projects[0].id : '',
            start_date: moment(start).format('YYYY-MM-DD'),
            end_date: moment(end).format('YYYY-MM-DD'),
            status: 'not started',
            priority: 'medium',
            assignee_ids: [],
        });
        setSelectedEvent(null);
        setIsEditing(false);
        setErrors({});
        setIsOpen(true);
        setIsAssigneeDropdownOpen(false);
    };

    const handleSelectEvent = (event) => {
        setSelectedEvent(event);
        setIsEditing(false);
        setIsOpen(true);
        setIsAssigneeDropdownOpen(false);
    };

    const handleEditClick = () => {
        if (!selectedEvent) return;

        const task = selectedEvent.resource;

        setForm({
            name: task.name || '',
            description: task.description || '',
            project_id: task.project_id || '',
            start_date: task.start_date ? moment(task.start_date).format('YYYY-MM-DD') : '',
            end_date: task.end_date ? moment(task.end_date).format('YYYY-MM-DD') : '',
            status: task.status || 'not started',
            priority: task.priority || 'medium',
            assignee_ids: task.assignees ? task.assignees.map(u => String(u.id)) : [],
        });

        setIsEditing(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setSelectedSlot(null);
        setSelectedEvent(null);
        setIsEditing(false);
        setIsAssigneeDropdownOpen(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditing && selectedEvent) {
            router.post(route('admin.tasks.update', selectedEvent.id), {
                _method: 'PUT',
                ...form
            }, {
                onSuccess: () => closeModal(),
                onError: (err) => setErrors(err),
            });
        } else {
            router.post(route('admin.tasks.store'), form, {
                onSuccess: () => closeModal(),
                onError: (err) => setErrors(err),
            });
        }
    };

    const handleDelete = () => {
        if (!selectedEvent) return;
        // Use manual URL construction to avoid Ziggy issues
        router.delete(`/admin/tasks/${selectedEvent.id}`, {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    const toggleAssigneeDropdown = () => {
        setIsAssigneeDropdownOpen(prev => !prev);
    };

    const handleAssigneeChange = (e) => {
        const { value, checked } = e.target;
        setForm((prev) => {
            const newAssigneeIds = checked
                ? [...prev.assignee_ids, value]
                : prev.assignee_ids.filter((id) => id !== value);
            return { ...prev, assignee_ids: newAssigneeIds };
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const getSelectedAssigneeNames = () => {
        const selectedUsers = users?.filter(u => form.assignee_ids.includes(String(u.id)));
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

    const eventStyleGetter = (event) => {
        // Use project color or default
        const backgroundColor = event.project_color || '#3b82f6';

        return {
            style: {
                backgroundColor: backgroundColor,
                borderRadius: '20px', // Rounded corners
                opacity: 0.9,
                color: 'white', // White text for contrast
                border: '0px',
                display: 'block',
                padding: '2px 10px',
                fontSize: '13px',
                fontWeight: '500',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }
        };
    };

    // Custom components for the calendar
    const components = useMemo(() => ({
        toolbar: CustomToolbar,
    }), []);

    return (
        <>
            <Head title="Task Calendar" />

            <div className="bg-white p-8 rounded-3xl shadow-sm h-[850px]">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    selectable={isAdminOrManager}
                    eventPropGetter={eventStyleGetter}
                    components={components}
                    views={['month', 'week', 'day']}
                    className="font-sans"
                />
            </div>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">
                                {isEditing ? "Edit Task" : (selectedEvent ? "Task Details" : "Add Task")}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {selectedEvent && !isEditing ? (
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{selectedEvent.title}</h3>
                                        <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                                            {selectedEvent.resource.project?.name || "No Project"}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500 mb-1">Date</p>
                                            <p className="font-medium text-gray-800">
                                                {moment(selectedEvent.start).format('YYYY-MM-DD')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 mb-1">Status</p>
                                            <p className="font-medium text-gray-800 capitalize">
                                                {selectedEvent.status}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 mb-1">Priority</p>
                                            <p className="font-medium text-gray-800 capitalize">
                                                {selectedEvent.priority}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-gray-500 mb-1 text-sm">Description</p>
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            {selectedEvent.resource.description || "No description provided."}
                                        </p>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
                                        <button
                                            onClick={handleEditClick}
                                            className="px-6 py-2 bg-[#FF9F76] text-white rounded-lg hover:bg-[#ff8a5b] font-medium transition shadow-sm"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition shadow-sm"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Task Name:</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#FF9F76] focus:border-transparent outline-none transition"
                                            placeholder="Enter Task Name"
                                        />
                                        {errors.name && (
                                            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Project:</label>
                                        <select
                                            name="project_id"
                                            value={form.project_id}
                                            onChange={handleChange}
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-white focus:ring-2 focus:ring-[#FF9F76] focus:border-transparent outline-none transition appearance-none"
                                        >
                                            <option value="">Select Project</option>
                                            {projects.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description:</label>
                                        <textarea
                                            name="description"
                                            value={form.description}
                                            onChange={handleChange}
                                            rows="3"
                                            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#FF9F76] focus:border-transparent outline-none transition resize-none"
                                            placeholder="Enter task description"
                                        ></textarea>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Assignees:</label>
                                        <div ref={dropdownRef} className="relative">
                                            <button
                                                type="button"
                                                onClick={toggleAssigneeDropdown}
                                                className="w-full flex justify-between items-center bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-left focus:ring-2 focus:ring-[#FF9F76] focus:border-transparent outline-none transition"
                                            >
                                                <span className="truncate pr-4 text-gray-600 text-sm">
                                                    {getSelectedAssigneeNames()}
                                                </span>
                                                <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isAssigneeDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                                            </button>

                                            {isAssigneeDropdownOpen && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                                    {users?.map((user) => (
                                                        <div
                                                            key={user.id}
                                                            className="flex items-center p-2.5 hover:bg-orange-50 transition cursor-pointer"
                                                            onClick={() => {
                                                                const syntheticEvent = { target: { value: String(user.id), checked: !form.assignee_ids.includes(String(user.id)) } };
                                                                handleAssigneeChange(syntheticEvent);
                                                            }}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={form.assignee_ids.includes(String(user.id))}
                                                                onChange={() => { }} // Handled by div click
                                                                className="w-4 h-4 text-[#FF9F76] border-gray-300 rounded focus:ring-[#FF9F76]"
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
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Status:</label>
                                            <select
                                                name="status"
                                                value={form.status}
                                                onChange={handleChange}
                                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-white focus:ring-2 focus:ring-[#FF9F76] focus:border-transparent outline-none transition"
                                            >
                                                {statusOrder.map((status) => (
                                                    <option key={status} value={status}>
                                                        {statusLabels[status]}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority:</label>
                                            <select
                                                name="priority"
                                                value={form.priority}
                                                onChange={handleChange}
                                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-white focus:ring-2 focus:ring-[#FF9F76] focus:border-transparent outline-none transition"
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date:</label>
                                            <input
                                                type="date"
                                                name="start_date"
                                                value={form.start_date}
                                                onChange={handleChange}
                                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#FF9F76] focus:border-transparent outline-none transition"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date:</label>
                                            <input
                                                type="date"
                                                name="end_date"
                                                value={form.end_date}
                                                onChange={handleChange}
                                                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#FF9F76] focus:border-transparent outline-none transition"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        {isEditing && (
                                            <button
                                                type="button"
                                                onClick={() => setIsEditing(false)}
                                                className="w-1/3 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold text-sm transition"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        <button
                                            type="submit"
                                            className={`py-3 bg-[#FF9F76] text-white rounded-lg hover:bg-[#ff8a5b] font-semibold text-sm transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${isEditing ? 'w-2/3' : 'w-full'}`}
                                        >
                                            {isEditing ? "Update Task" : "Add Task"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

Index.layout = (page) => {
    const { auth } = page.props;
    const isAdminOrManager = ['admin', 'manager', 'editor'].includes(auth.user.role);
    const Layout = isAdminOrManager ? AdminLayout : UserLayout;
    return <Layout title="Task Calendar">{page}</Layout>;
};
