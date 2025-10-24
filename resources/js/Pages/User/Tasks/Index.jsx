import React, { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import UserLayout from "@/Layouts/UserLayout";

export default function Index() {
    const { tasks } = usePage().props;
    const [taskList, setTaskList] = useState(tasks.data);
    const [openDropdownId, setOpenDropdownId] = useState(null);

    // Admin-style status mapping
    const statusMap = {
        "not started": "To Do",
        "in progress": "In Progress",
        "on hold": "Hold",
        "completed": "Completed",
    };

    const statusClasses = {
        "not started": "bg-gray-100 text-gray-700",
        "in progress": "bg-yellow-100 text-yellow-700",
        "on hold": "bg-purple-100 text-purple-700",
        "completed": "bg-green-100 text-green-700",
    };

    const priorityClasses = {
        "low": "bg-green-100 text-green-700",
        "medium": "bg-yellow-100 text-yellow-800",
        "high": "bg-red-100 text-red-700",
    };

    const statusOptions = Object.keys(statusMap);

    const handleStatusChange = (taskId, newStatus) => {
        // Update locally
        setTaskList(prev =>
            prev.map(task => (task.id === taskId ? { ...task, status: newStatus } : task))
        );
        setOpenDropdownId(null);

        // Update on server
        router.post(`/tasks/${taskId}/update-status`, { status: newStatus });
    };

    return (
        <UserLayout title="My Tasks">
            <div className="p-6">
                <h1 className="text-3xl font-bold mb-6">My Tasks</h1>

                {/* Table wrapper with overflow-y visible to fix dropdown scroll issue */}
                <div className="bg-white shadow rounded overflow-x-auto overflow-y-visible relative">
                    <table className="w-full border text-base">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="p-3 border">#</th>
                                <th className="p-3 border">Task</th>
                                <th className="p-3 border">Start</th>
                                <th className="p-3 border">End</th>
                                <th className="p-3 border">Priority</th>
                                <th className="p-3 border">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {taskList.length > 0 ? (
                                taskList.map((task, index) => (
                                    <tr key={task.id} className="hover:bg-gray-50 relative">
                                        <td className="p-3 border">{index + 1}</td>
                                        <td className="p-3 border font-medium">{task.name}</td>
                                        <td className="p-3 border">{task.start_date}</td>
                                        <td className="p-3 border">{task.end_date}</td>
                                        <td className="p-3 border">
                                            <span
                                                className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${priorityClasses[task.priority]}`}
                                            >
                                                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                            </span>
                                        </td>
                                        <td className="p-3 border relative">
                                            {/* Status badge */}
                                            <div
                                                className={`inline-block px-3 py-1 text-xs font-semibold rounded-full cursor-pointer ${statusClasses[task.status]}`}
                                                onClick={() =>
                                                    setOpenDropdownId(
                                                        openDropdownId === task.id ? null : task.id
                                                    )
                                                }
                                            >
                                                {statusMap[task.status]}
                                            </div>

                                            {/* Dropdown */}
                                            {openDropdownId === task.id && (
                                                <div className="absolute mt-1 bg-white border rounded shadow z-10">
                                                    {statusOptions
                                                        .filter((s) => s !== task.status)
                                                        .map((s) => (
                                                            <div
                                                                key={s}
                                                                onClick={() => handleStatusChange(task.id, s)}
                                                                className={`px-3 py-1 text-xs font-semibold cursor-pointer hover:bg-gray-100 ${statusClasses[s]}`}
                                                            >
                                                                {statusMap[s]}
                                                            </div>
                                                        ))}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center text-gray-500 py-6">
                                        No tasks assigned yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </UserLayout>
    );
}
