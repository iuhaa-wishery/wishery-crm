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
} from "react-icons/fa";

export default function AdminLayout({ children, title = "Dashboard" }) {
  const { auth } = usePage().props; // shared auth (see server step below)
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // load collapse state from localStorage so it persists across pages
    const stored = localStorage.getItem("sidebar-collapsed");
    setCollapsed(stored === "true");
  }, []);

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
      <div className="flex h-screen bg-gray-100">
        {/* SIDEBAR */}
        <aside
          className={`bg-white shadow transition-all duration-200 flex flex-col ${
            collapsed ? "w-20" : "w-64"
          }`}
        >
          <div className="h-16 flex items-center justify-center border-b">
            <div className="flex items-center gap-2">
              <div className="font-bold text-lg">
                {collapsed ? "W" : "Wishery CRM"}
              </div>
            </div>
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

          <Link href={route("admin.users.index")} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 text-gray-700">
            {/* pick an icon, e.g. FaUserCircle */}
            <FaUserCircle />
            <span className={`${collapsed ? "hidden" : ""}`}>Users</span>
          </Link>

          <Link href={route("tasks.index")} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 text-gray-700">
            <FaTasks />
            <span className={`${collapsed ? "hidden" : ""}`}>Tasks</span>
          </Link>

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
        </aside>

        {/* MAIN AREA */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* HEADER */}
          <header className="h-16 bg-white shadow flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded hover:bg-gray-100"
                aria-label="Toggle sidebar"
              >
                <FaBars />
              </button>
              <h2 className="text-lg font-semibold">{title}</h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <FaUserCircle className="text-2xl text-gray-600" />
                <div className="text-sm">
                  <div className="font-medium">
                    {auth?.user?.name ?? "User"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {auth?.user?.email ?? ""}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
              >
                <FaSignOutAlt />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <main className="p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </>
  );
}
