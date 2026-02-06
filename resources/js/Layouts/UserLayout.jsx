import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
    FaBars,
    FaUser,
    FaSignOutAlt,
    FaHome,
    FaTasks,
    FaFolder,
    FaClock,
} from "react-icons/fa";

import toast, { Toaster } from "react-hot-toast";
import { useEffect } from "react";

export default function UserLayout({ children, title }) {
    const { auth, flash } = usePage().props;
    const user = auth?.user;
    const [collapsed, setCollapsed] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash, flash?.timestamp]);

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* MOBILE OVERLAY */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`bg-white shadow-md transition-all duration-300 flex flex-col fixed md:relative z-50 h-full
                    ${collapsed ? "md:w-16" : "md:w-64"}
                    ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"}
                `}
            >
                <div className="p-4 border-b flex items-center justify-between h-16">
                    {(!collapsed || isMobileOpen) && (
                        <h2 className="text-xl font-bold text-blue-600 truncate">User</h2>
                    )}
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="md:hidden text-gray-600 p-2 hover:bg-gray-100 rounded"
                    >
                        <FaBars />
                    </button>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden md:block text-gray-600 p-2 hover:bg-gray-100 rounded"
                    >
                        <FaBars className={`${collapsed ? "" : "rotate-90"} transition-transform`} />
                    </button>
                </div>

                <nav className="p-2 space-y-1 overflow-y-auto custom-scrollbar flex-1">
                    <Link
                        href={route("dashboard")}
                        className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
                    >
                        <FaHome className="min-w-[20px]" />
                        <span className={`${collapsed && !isMobileOpen ? "md:hidden" : ""}`}>Dashboard</span>
                    </Link>

                    <Link
                        href={route("attendance.index")}
                        className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
                    >
                        <FaClock className="min-w-[20px]" />
                        <span className={`${collapsed && !isMobileOpen ? "md:hidden" : ""}`}>Attendance</span>
                    </Link>

                    <Link
                        href={route("projects.index")}
                        className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
                    >
                        <FaFolder className="min-w-[20px]" />
                        <span className={`${collapsed && !isMobileOpen ? "md:hidden" : ""}`}>Projects</span>
                    </Link>

                    <Link
                        href={route("leave.index")}
                        className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
                    >
                        <FaTasks className="min-w-[20px]" />
                        <span className={`${collapsed && !isMobileOpen ? "md:hidden" : ""}`}>Leaves</span>
                    </Link>

                    <Link
                        href={route("drive.index")}
                        className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-200 transition-colors text-gray-700"
                    >
                        <FaFolder className="min-w-[20px]" />
                        <span className={`${collapsed && !isMobileOpen ? "md:hidden" : ""}`}>Drive</span>
                    </Link>
                </nav>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white shadow flex justify-between items-center px-4 md:px-6 h-16 sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsMobileOpen(true)} className="md:hidden p-2 rounded hover:bg-gray-100 transition-colors">
                            <FaBars className="text-gray-600" />
                        </button>
                        <h1 className="text-lg font-bold truncate">{title}</h1>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="flex items-center gap-2 p-1 px-2 rounded-lg hover:bg-gray-100 transition shrink-0"
                            >
                                {user?.image_url ? (
                                    <img
                                        src={user.image_url}
                                        alt={user.name}
                                        className="h-8 w-8 rounded-full object-cover border-2 border-blue-50 shrink-0"
                                    />
                                ) : (
                                    <FaUser className="text-gray-600 shrink-0" />
                                )}
                                <span className="hidden lg:inline font-medium truncate max-w-[100px]">{user?.name}</span>
                            </button>

                            {showMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-xl z-50 py-1 overflow-hidden">
                                    <div className="px-4 py-2 border-b bg-gray-50 md:hidden">
                                        <div className="text-sm font-bold truncate text-gray-900">{user?.name}</div>
                                        <div className="text-[10px] text-gray-500 truncate">{user?.email}</div>
                                    </div>
                                    <Link
                                        href={route("profile.edit")}
                                        className="block px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                        onClick={() => setShowMenu(false)}
                                    >
                                        My Profile
                                    </Link>

                                    <Link
                                        method="post"
                                        href={route("logout")}
                                        as="button"
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 flex items-center gap-2 text-red-600 transition-colors"
                                    >
                                        <FaSignOutAlt /> Logout
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="p-6 overflow-y-auto flex-1">
                    {children}
                </main>
            </div >
            <Toaster position="top-right" />
        </div >
    );
}
