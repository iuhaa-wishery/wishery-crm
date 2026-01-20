// resources/js/Layouts/AdminLayout.jsx
import React, { useEffect, useState } from "react";
import { Link, router, Head, usePage } from "@inertiajs/react";
import {
  FaBars,
  FaTachometerAlt,
  FaProjectDiagram,
  FaTasks,
  FaUserCircle,
  FaSignOutAlt,
  FaClock,
  FaFileAlt,
  FaCog,
} from "react-icons/fa";

import { Toaster, toast } from "react-hot-toast";

export default function AdminLayout({ children, title = "Dashboard" }) {
  const { auth, flash } = usePage().props;
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    setCollapsed(stored === "true");
  }, []);

  // Handle Flash Messages
  useEffect(() => {
    if (flash?.success) {
      toast.success(flash.success);
    }
    if (flash?.error) {
      toast.error(flash.error);
    }
  }, [flash]);

  const toggleSidebar = () => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  };

  const handleLogout = () => {
    router.post(route("logout"));
  };

  return (
    <>
      <Head title={title} />
      <Toaster position="top-right" />
      <div className="flex h-screen bg-gray-100">

        {/* SIDEBAR */}
        <aside
          className={`bg-white shadow transition-all duration-200 flex flex-col ${collapsed ? "w-20" : "w-64"
            }`}
        >
          <div className="h-16 flex items-center justify-center border-b">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              {!collapsed && (
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Wishery CRM
                </span>
              )}
            </Link>
          </div>

          <nav className="flex-1 p-2 space-y-1">

            <Link href={route("dashboard")} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 text-gray-700">
              <FaTachometerAlt />
              <span className={`${collapsed ? "hidden" : ""}`}>Dashboard</span>
            </Link>

            <Link href={route("admin.projects.index")} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 text-gray-700">
              <FaProjectDiagram />
              <span className={`${collapsed ? "hidden" : ""}`}>Projects</span>
            </Link>

            {auth.user.role === 'admin' && (
              <>
                <Link href={route("admin.users.index")} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 text-gray-700">
                  <FaUserCircle />
                  <span className={`${collapsed ? "hidden" : ""}`}>Users</span>
                </Link>

                {/* NEW - Leaves Menu */}
                <Link
                  href={route("admin.leaves.index")}
                  className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 text-gray-700"
                >
                  <FaTasks />
                  <span className={`${collapsed ? "hidden" : ""}`}>Leaves</span>
                </Link>

                {/* Attendance Menu */}
                <Link
                  href={route("admin.attendance.index")}
                  className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 text-gray-700"
                >
                  <FaClock />
                  <span className={`${collapsed ? "hidden" : ""}`}>Attendance</span>
                </Link>
              </>
            )}

            <Link
              href={route("calendar.index")}
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 text-gray-700"
            >
              <FaTasks />
              <span className={`${collapsed ? "hidden" : ""}`}>Calendar</span>
            </Link>

            <Link
              href={route("admin.drive.index")}
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 text-gray-700"
            >
              <FaProjectDiagram />
              <span className={`${collapsed ? "hidden" : ""}`}>Drive</span>
            </Link>

            {auth.user.role === 'admin' && (
              <Link
                href={route("admin.settings.index")}
                className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 text-gray-700"
              >
                <FaCog />
                <span className={`${collapsed ? "hidden" : ""}`}>Settings</span>
              </Link>
            )}

          </nav>

          <div className="p-3 border-t">
            <button
              onClick={toggleSidebar}
              className="flex items-center gap-3 w-full px-2 py-2 rounded hover:bg-gray-100 text-gray-700"
            >
              <FaBars />
              <span className={`${collapsed ? "hidden" : ""}`}>Collapse</span>
            </button>
          </div>
        </aside >

        {/* MAIN */}
        < div className="flex-1 flex flex-col overflow-hidden" >
          <header className="h-16 bg-white shadow flex items-center justify-between px-4">
            <button onClick={toggleSidebar} className="p-2 rounded hover:bg-gray-100">
              <FaBars />
            </button>
            <h2 className="text-lg font-semibold">{title}</h2>

            <div className="flex items-center gap-4">
              <Link href={route('profile.edit')} className="flex items-center gap-3 hover:bg-gray-50 p-1 px-2 rounded-lg transition">
                {auth.user.image_url ? (
                  <img
                    src={auth.user.image_url}
                    alt={auth.user.name}
                    className="h-8 w-8 rounded-full object-cover border"
                  />
                ) : (
                  <FaUserCircle className="text-2xl text-gray-600" />
                )}
                <div className="text-sm">
                  <div className="font-medium">{auth?.user?.name}</div>
                  <div className="text-xs text-gray-500">{auth?.user?.email}</div>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </header>

          <main className="p-6 overflow-auto">{children}</main>
        </div >
      </div >
    </>
  );
}
