import React from "react";
import { Link, usePage } from "@inertiajs/react";

export default function Index() {
    const { tasks } = usePage().props;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Tasks</h1>
                <Link
                    href={route("admin.tasks.create")}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    + New Task
                </Link>
            </div>

            <div className="bg-white shadow rounded overflow-x-auto">
                <table className="min-w-full border">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 border">ID</th>
                            <th className="p-2 border">Task</th>
                            <th className="p-2 border">Project</th>
                            <th className="p-2 border">Assignee</th>
                            <th className="p-2 border">Start</th>
                            <th className="p-2 border">End</th>
                            <th className="p-2 border">Status</th>
                            <th className="p-2 border">Priority</th>
                            <th className="p-2 border">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.data.map((task) => (
                            <tr key={task.id}>
                                <td className="p-2 border">{task.id}</td>
                                <td className="p-2 border">{task.name}</td>
                                <td className="p-2 border">{task.project?.name}</td>
                                <td className="p-2 border">{task.assignee?.name}</td>
                                <td className="p-2 border">{task.start_date}</td>
                                <td className="p-2 border">{task.end_date}</td>
                                <td className="p-2 border">{task.status}</td>
                                <td className="p-2 border">{task.priority}</td>
                                <td className="p-2 border space-x-2">
                                    <Link
                                        href={route("admin.tasks.edit", task.id)}
                                        className="text-blue-600"
                                    >
                                        Edit
                                    </Link>
                                    <Link
                                        href={route("admin.tasks.destroy", task.id)}
                                        method="delete"
                                        as="button"
                                        className="text-red-600"
                                    >
                                        Delete
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
