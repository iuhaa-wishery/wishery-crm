import React from "react";
import { Head, Link } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Settings, ChevronRight } from "lucide-react";

export default function UserList({ users }) {
    return (
        <AdminLayout title="Worksheet Settings - Select User">
            <Head title="Worksheet Settings - Select User" />

            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Worksheet Configuration</h1>
                    <p className="text-gray-500">Select a user to configure their daily worksheet fields.</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <ul className="divide-y divide-gray-100">
                        {users.map((user) => (
                            <li key={user.id} className="hover:bg-gray-50 transition-colors">
                                <Link
                                    href={route("admin.users.worksheet-settings", user.id)}
                                    className="flex items-center justify-between p-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{user.name}</p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <span className="text-sm font-medium text-gray-500">Configure</span>
                                        <ChevronRight size={18} />
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </AdminLayout>
    );
}
