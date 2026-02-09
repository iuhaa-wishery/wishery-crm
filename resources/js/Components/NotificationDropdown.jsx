import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import { FaBell, FaComments, FaFileAlt, FaTimes, FaCircle } from 'react-icons/fa';
import axios from 'axios';

export default function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get(route('notifications'));
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unread_count);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'chat': return <FaComments className="text-blue-500" />;
            case 'leave':
            case 'leave_update': return <FaFileAlt className="text-purple-500" />;
            default: return <FaBell className="text-gray-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all focus:outline-none"
            >
                <FaBell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] transform origin-top-right transition-all">
                    <div className="p-4 border-b bg-gray-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-800">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                    {unreadCount} New
                                </span>
                            )}
                        </div>
                        <button className="text-xs text-blue-600 hover:underline font-medium">Clear All</button>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map((notif) => (
                                <Link
                                    key={notif.id}
                                    href={notif.link}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-start gap-3 p-4 hover:bg-blue-50/50 border-b border-gray-50 transition-colors group"
                                >
                                    <div className="mt-1 w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-white transition-colors">
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <p className="text-sm font-bold text-gray-900 truncate">
                                                {notif.title}
                                            </p>
                                            <FaCircle className="text-blue-500 mt-1" size={6} />
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-2 mb-1 leading-relaxed">
                                            {notif.message}
                                        </p>
                                        <span className="text-[10px] text-gray-400 font-medium">
                                            {notif.time}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center text-gray-400 text-center px-6">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <FaBell size={24} className="text-gray-300" />
                                </div>
                                <p className="text-sm font-bold text-gray-800 mb-1">No new notifications</p>
                                <p className="text-xs">We'll notify you when something new arrives!</p>
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t bg-gray-50/50 text-center">
                        <Link href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                            See All Notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
