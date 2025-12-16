import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    FaBars,
    FaUser,
    FaSignOutAlt,
    FaHome,
    FaTasks,
    FaFolder,
} from "react-icons/fa";
import AttendanceWidget from "@/Components/AttendanceWidget";

export default function UserLayout({ children, title }) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [collapsed, setCollapsed] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside
                className={`bg-white shadow-md transition-all duration-300 ${collapsed ? "w-16" : "w-64"
                    }`}
            >
                <div className="p-4 border-b flex items-center justify-between">
                    {!collapsed && (
                        <h2 className="text-xl font-bold text-blue-600">User</h2>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-gray-600"
                    >
                        <FaBars />
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    <Link
                        href={route("dashboard")}
                        className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-200"
                    >
                        <FaHome className="text-gray-600" />
                        {!collapsed && <span>Dashboard</span>}
                    </Link>

                    <Link
                        href={route("projects.index")}
                        className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-200"
                    >
                        <FaFolder className="text-gray-600" />
                        {!collapsed && <span>Projects</span>}
                    </Link>

                    <Link
                        href={route("tasks.index")}
                        className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-200"
                    >
                        <FaTasks className="text-gray-600" />
                        {!collapsed && <span>Tasks</span>}
                    </Link>

                    <Link
                        href={route("leave.index")}
                        className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-200"
                    >
                        <FaTasks className="text-gray-600" />
                        {!collapsed && <span>Leaves</span>}
                    </Link>

                    <Link
                        href={route("drive.index")}
                        className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-200"
                    >
                        <FaFolder className="text-gray-600" />
                        {!collapsed && <span>Drive</span>}
                    </Link>
                </nav>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col">
                <header className="bg-white shadow flex justify-between items-center px-6 py-3 relative">
                    <h1 className="text-lg font-bold">{title}</h1>

                    <div className="flex items-center gap-4 relative">
                        <AttendanceWidget />
                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-100"
                            >
                                <FaUser className="text-gray-600" />
                                {!collapsed && <span>{user?.name}</span>}
                            </button>

                            {showMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md z-50">
                                    <Link
                                        href={route("profile")}
                                        className="block px-4 py-2 hover:bg-gray-100"
                                    >
                                        My Profile
                                    </Link>

                                    <Link
                                        method="post"
                                        href={route("logout")}
                                        as="button"
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-red-600"
                                    >
                                        <FaSignOutAlt /> Logout
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6 overflow-y-auto flex-1">{children}</main>
            </div>
        </div>
    );
}
