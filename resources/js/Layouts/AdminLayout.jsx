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
  FaComments,
} from "react-icons/fa";
import NotificationDropdown from "@/Components/NotificationDropdown";

import { Toaster, toast } from "react-hot-toast";

export default function AdminLayout({ children, title = "Dashboard" }) {
  const { auth, flash } = usePage().props;
  const [collapsed, setCollapsed] = useState(false);

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [sidebarCounts, setSidebarCounts] = useState({ unread_chats: 0, pending_leaves: 0 });

  const fetchSidebarCounts = async () => {
    try {
      const response = await axios.get(route('notifications.counts'));
      setSidebarCounts(response.data);
    } catch (error) {
      console.error("Error fetching sidebar counts:", error);
    }
  };

  useEffect(() => {
    fetchSidebarCounts();
    const interval = setInterval(fetchSidebarCounts, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

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
  }, [flash, flash?.timestamp]);

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
      <div className="flex h-screen bg-gray-100 overflow-hidden">

        {/* MOBILE OVERLAY */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={`bg-white shadow transition-all duration-300 flex flex-col fixed md:relative z-50 h-full
            ${collapsed ? "md:w-20" : "md:w-64"} 
            ${isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"}
          `}
        >
          <div className="h-16 flex items-center justify-between px-4 border-b">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-blue-600">Wishery</span>
            </Link>
            <button onClick={() => setIsMobileOpen(false)} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded">
              <FaBars className="rotate-90 transition-transform" />
            </button>
          </div>

          <nav className="flex-1 p-2 space-y-1 overflow-y-auto custom-scrollbar">

            <Link href={route("dashboard")} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 text-gray-700 transition-colors">
              <FaTachometerAlt className="min-w-[20px]" />
              <span className={`${collapsed && !isMobileOpen ? "md:hidden" : ""}`}>Dashboard</span>
            </Link>

            <Link href={route("admin.projects.index")} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 text-gray-700 transition-colors">
              <FaProjectDiagram className="min-w-[20px]" />
              <span className={`${collapsed && !isMobileOpen ? "md:hidden" : ""}`}>Projects</span>
            </Link>

            {auth.user.role === 'admin' && (
              <>
                <Link href={route("admin.users.index")} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 text-gray-700 transition-colors">
                  <FaUserCircle className="min-w-[20px]" />
                  <span className={`${collapsed && !isMobileOpen ? "md:hidden" : ""}`}>Users</span>
                </Link>

                <Link
                  href={route("admin.leaves.index")}
                  className="flex items-center justify-between px-3 py-2 rounded hover:bg-gray-100 text-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FaFileAlt className="min-w-[20px]" />
                    <span className={`${collapsed && !isMobileOpen ? "md:hidden" : ""}`}>Leaves</span>
                  </div>
                  {sidebarCounts.pending_leaves > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {sidebarCounts.pending_leaves}
                    </span>
                  )}
                </Link>

                <Link
                  href={route("admin.attendance.index")}
                  className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 text-gray-700 transition-colors"
                >
                  <FaClock className="min-w-[20px]" />
                  <span className={`${collapsed && !isMobileOpen ? "md:hidden" : ""}`}>Attendance</span>
                </Link>
              </>
            )}

            <Link
              href={route("calendar.index")}
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 text-gray-700 transition-colors"
            >
              <FaTasks className="min-w-[20px]" />
              <span className={`${collapsed && !isMobileOpen ? "md:hidden" : ""}`}>Calendar</span>
            </Link>

            <Link
              href={route("admin.drive.index")}
              className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 text-gray-700 transition-colors"
            >
              <FaProjectDiagram className="min-w-[20px]" />
              <span className={`${collapsed && !isMobileOpen ? "md:hidden" : ""}`}>Drive</span>
            </Link>

            <Link
              href={route("chat.index")}
              className="flex items-center justify-between px-3 py-2 rounded hover:bg-gray-100 text-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FaComments className="min-w-[20px]" />
                <span className={`${collapsed && !isMobileOpen ? "md:hidden" : ""}`}>Chat</span>
              </div>
              {sidebarCounts.unread_chats > 0 && (
                <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {sidebarCounts.unread_chats}
                </span>
              )}
            </Link>

            {(auth.user.role === 'admin' || auth.user.role === 'manager') && (
              <Link
                href={route("admin.content-calendar.index")}
                className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 text-gray-700 transition-colors"
              >
                <FaTasks className="min-w-[20px]" />
                <span className={`${collapsed && !isMobileOpen ? "md:hidden" : ""}`}>Content Calendar</span>
              </Link>
            )}

            {auth.user.role === 'admin' && (
              <Link
                href={route("admin.settings.index")}
                className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 text-gray-700 transition-colors"
              >
                <FaCog className="min-w-[20px]" />
                <span className={`${collapsed && !isMobileOpen ? "md:hidden" : ""}`}>Settings</span>
              </Link>
            )}

          </nav>

          <div className="p-3 border-t hidden md:block">
            <button
              onClick={toggleSidebar}
              className="flex items-center gap-3 w-full px-2 py-2 rounded hover:bg-gray-100 text-gray-700 transition-all"
            >
              <FaBars className={`${collapsed ? "" : "rotate-90"} transition-transform`} />
              <span className={`${collapsed ? "hidden" : ""}`}>Collapse Menu</span>
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-white shadow flex items-center justify-between px-4 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsMobileOpen(true)} className="md:hidden p-2 rounded hover:bg-gray-100 transition-colors">
                <FaBars className="text-gray-600" />
              </button>
              <button onClick={toggleSidebar} className="hidden md:p-2 rounded hover:bg-gray-100 transition-colors md:block text-gray-600">
                <FaBars className={`${collapsed ? "" : "rotate-90"} transition-transform`} />
              </button>
              <h2 className="text-lg font-bold truncate">{title}</h2>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <NotificationDropdown />
              <Link href={route('profile.edit')} className="flex items-center gap-2 hover:bg-gray-50 p-1 px-2 rounded-lg transition shrink-0 max-w-[150px] md:max-w-none">
                {auth.user.image_url ? (
                  <img
                    src={auth.user.image_url}
                    alt={auth.user.name}
                    className="h-8 w-8 rounded-full object-cover border-2 border-blue-100 shrink-0"
                  />
                ) : (
                  <FaUserCircle className="text-2xl text-gray-400 shrink-0" />
                )}
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-semibold text-gray-900 truncate">{auth?.user?.name}</div>
                  <div className="text-[10px] text-gray-500 truncate">{auth?.user?.email}</div>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all text-sm font-medium"
                title="Logout"
              >
                <FaSignOutAlt className="shrink-0" />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
