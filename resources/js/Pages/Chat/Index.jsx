import React, { useState, useEffect, useRef } from 'react';
import { usePage, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminLayout from '@/Layouts/AdminLayout';
import UserLayout from '@/Layouts/UserLayout';
import {
    FaSearch, FaPaperPlane, FaPaperclip, FaImage,
    FaCircle, FaEllipsisV, FaPhone, FaVideo, FaTimes
} from 'react-icons/fa';
import axios from 'axios';
import moment from 'moment';

export default function ChatIndex() {
    const { auth, users: initialUsers } = usePage().props;
    const currentUser = auth.user;

    const [users, setUsers] = useState(initialUsers);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'contacts'

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const pollInterval = useRef(null);
    const usersPollInterval = useRef(null);

    // Filter users based on search
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort users for 'chats' tab: those with last_message first, then others
    const sortedChatUsers = [...filteredUsers].sort((a, b) => {
        if (a.last_message && b.last_message) {
            return new Date(b.last_message.created_at) - new Date(a.last_message.created_at);
        }
        if (a.last_message) return -1;
        if (b.last_message) return 1;
        return 0;
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get(route('chat.users'));
            setUsers(response.data.users);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        // Poll users regularly to update unread counts and last messages
        usersPollInterval.current = setInterval(fetchUsers, 5000);
        return () => {
            if (usersPollInterval.current) clearInterval(usersPollInterval.current);
        };
    }, []);

    useEffect(() => {
        if (selectedUser) {
            fetchMessages();
            // Start polling when a user is selected
            if (pollInterval.current) clearInterval(pollInterval.current);
            pollInterval.current = setInterval(fetchMessages, 3000);
        }
        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, [selectedUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        if (!selectedUser) return;
        try {
            const response = await axios.get(route('chat.messages', selectedUser.id));
            setMessages(response.data.messages);

            // If we have messages, also update unread count for the selected user locally
            setUsers(prevUsers => prevUsers.map(u =>
                u.id === selectedUser.id ? { ...u, unread_count: 0 } : u
            ));
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        const messageData = {
            receiver_id: selectedUser.id,
            message: newMessage,
            type: 'text'
        };

        try {
            const response = await axios.post(route('chat.send'), messageData);
            setMessages([...messages, response.data.message]);
            setNewMessage('');

            // Immediately update the last message in the users list locally
            setUsers(prevUsers => prevUsers.map(u =>
                u.id === selectedUser.id ? { ...u, last_message: response.data.message } : u
            ));
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedUser) return;

        const formData = new FormData();
        formData.append('receiver_id', selectedUser.id);
        formData.append('file', file);
        formData.append('type', file.type.startsWith('image/') ? 'image' : 'file');

        setUploading(true);
        try {
            const response = await axios.post(route('chat.send'), formData);
            setMessages([...messages, response.data.message]);
        } catch (error) {
            console.error("Error uploading file:", error);
        } finally {
            setUploading(false);
        }
    };

    // Determine layout based on role
    const Layout = currentUser.role === 'admin' || currentUser.role === 'manager' ? AdminLayout : UserLayout;

    return (
        <Layout title="Chat">
            <Head title="Chat" />

            <div className="flex h-[calc(100vh-160px)] bg-white rounded-xl shadow-lg border overflow-hidden">
                {/* Sidebar */}
                <div className="w-1/3 border-r flex flex-col bg-gray-50/50">
                    <div className="p-4 border-b bg-white">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="relative">
                                <img
                                    src={currentUser.image_url || `https://ui-avatars.com/api/?name=${currentUser.name}`}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-primary-500"
                                    alt="My Profile"
                                />
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">{currentUser.name}</h3>
                                <p className="text-xs text-gray-500">Available</p>
                            </div>
                            <button className="ml-auto text-gray-400 hover:text-gray-600">
                                <FaEllipsisV />
                            </button>
                        </div>

                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-primary-500 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="flex p-2 gap-2 border-b bg-white sticky top-0 z-10">
                            <button
                                onClick={() => setActiveTab('chats')}
                                className={`flex-1 py-2 text-sm font-semibold transition-all ${activeTab === 'chats' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Chats
                            </button>
                            <button
                                onClick={() => setActiveTab('contacts')}
                                className={`flex-1 py-2 text-sm font-semibold transition-all ${activeTab === 'contacts' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Contacts
                            </button>
                        </div>

                        {activeTab === 'chats' ? (
                            sortedChatUsers.filter(u => u.last_message || u.unread_count > 0 || u.id === selectedUser?.id).map(user => (
                                <div
                                    key={user.id}
                                    onClick={() => setSelectedUser(user)}
                                    className={`flex items-center gap-3 p-4 cursor-pointer transition-all hover:bg-white border-b last:border-none
                                        ${selectedUser?.id === user.id ? 'bg-white shadow-sm pr-6 border-l-4 border-l-primary-600' : ''}
                                        ${user.unread_count > 0 ? 'bg-blue-50/50' : ''}
                                    `}
                                >
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={user.image_url || `https://ui-avatars.com/api/?name=${user.name}`}
                                            className="w-12 h-12 rounded-full object-cover shadow-sm"
                                            alt={user.name}
                                        />
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className={`truncate text-sm ${user.unread_count > 0 ? 'font-black text-gray-900' : 'font-bold text-gray-800'}`}>
                                                {user.name}
                                            </h4>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-[10px] text-gray-400">
                                                    {user.last_message ? moment(user.last_message.created_at).format('h:mm A') : ''}
                                                </span>
                                                {user.unread_count > 0 && (
                                                    <span className="flex items-center justify-center w-5 h-5 bg-primary-600 text-white text-[10px] rounded-full font-bold">
                                                        {user.unread_count}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className={`text-xs truncate ${user.unread_count > 0 ? 'text-primary-700 font-semibold' : 'text-gray-500'}`}>
                                            {user.last_message ? (
                                                user.last_message.type === 'text' ? user.last_message.message : 'Sent a file'
                                            ) : 'Tap to start chatting...'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            filteredUsers.map(user => (
                                <div
                                    key={user.id}
                                    onClick={() => {
                                        setSelectedUser(user);
                                        setActiveTab('chats');
                                    }}
                                    className={`flex items-center gap-3 p-4 cursor-pointer transition-all hover:bg-white border-b last:border-none ${selectedUser?.id === user.id ? 'bg-white shadow-sm border-l-4 border-l-primary-600' : ''}`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <img
                                            src={user.image_url || `https://ui-avatars.com/api/?name=${user.name}`}
                                            className="w-12 h-12 rounded-full object-cover shadow-sm"
                                            alt={user.name}
                                        />
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-800 text-sm">{user.name}</h4>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-white">
                    {selectedUser ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b flex items-center justify-between bg-white shadow-sm z-10">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={selectedUser.image_url || `https://ui-avatars.com/api/?name=${selectedUser.name}`}
                                        className="w-10 h-10 rounded-full object-cover shadow-sm"
                                        alt={selectedUser.name}
                                    />
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-sm">{selectedUser.name}</h3>
                                        <div className="flex items-center gap-1">
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                            <span className="text-[10px] text-gray-500">Online</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-gray-400">
                                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><FaEllipsisV size={14} /></button>
                                </div>
                            </div>

                            {/* Messages Container */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
                                {messages.map((msg, idx) => (
                                    <div
                                        key={msg.id || idx}
                                        className={`flex ${msg.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[70%] ${msg.sender_id === currentUser.id ? 'order-2' : ''}`}>
                                            <div className={`
                                                px-4 py-3 rounded-2xl shadow-sm relative text-sm
                                                ${msg.sender_id === currentUser.id
                                                    ? 'bg-primary-600 text-white rounded-tr-none'
                                                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                                                }
                                            `}>
                                                {msg.type === 'text' && msg.message}
                                                {msg.type === 'image' && (
                                                    <img src={`/storage/${msg.file_path}`} className="max-w-full rounded-lg" alt="Sent image" />
                                                )}
                                                {msg.type === 'file' && (
                                                    <a href={`/storage/${msg.file_path}`} target="_blank" className="flex items-center gap-2 underline">
                                                        <FaPaperclip /> View File
                                                    </a>
                                                )}
                                                <div className={`text-[9px] mt-1 ${msg.sender_id === currentUser.id ? 'text-primary-100' : 'text-gray-400'}`}>
                                                    {moment(msg.created_at).format('h:mm A')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <div className="p-4 bg-white border-t">
                                <form onSubmit={handleSendMessage} className="flex items-end gap-3 max-w-5xl mx-auto">


                                    <div className="flex-1 relative">
                                        <textarea
                                            rows="1"
                                            placeholder="Type your message..."
                                            className="w-full bg-gray-100 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 resize-none max-h-32"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage(e);
                                                }
                                            }}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() || uploading}
                                        className="mb-1 p-3.5 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                                    >
                                        <FaPaperPlane size={16} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                <FaPaperPlane size={40} className="text-gray-300" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Your Messages</h3>
                            <p className="max-w-xs text-sm">Select a user from the sidebar to start a conversation or view history.</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .bg-primary-600 { background-color: #2563eb; }
                .bg-primary-700 { background-color: #1d4ed8; }
                .text-primary-600 { color: #2563eb; }
                .text-primary-100 { color: #dbeafe; }
                .border-primary-600 { border-color: #2563eb; }
                .focus\\:ring-primary-500:focus { --tw-ring-color: #3b82f6; }
                .border-l-primary-600 { border-left-color: #2563eb; }
            `}</style>
        </Layout>
    );
}
