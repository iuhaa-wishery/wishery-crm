import AdminLayout from '@/Layouts/AdminLayout';
import UserLayout from '@/Layouts/UserLayout';
import { Head, usePage } from '@inertiajs/react';
import {
    Camera, User as UserIcon, Mail, Phone, Briefcase,
    CheckCircle, Lock, Shield, Fingerprint,
    Twitter, Facebook, Instagram, Linkedin, Home, Plus
} from 'lucide-react';
import { useState } from 'react';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const [activeTab, setActiveTab] = useState('Personal');

    const content = (
        <div className="bg-[#f4f7f6] min-h-screen -m-6">
            <Head title="Profile" />

            {/* Simplified Oreo Header Section */}
            <div className="bg-[#7e89ca] text-white p-8 pb-32">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Account Settings</h1>
                        <div className="flex items-center gap-2 text-indigo-100 text-sm mt-1">
                            <Home className="w-3.5 h-3.5" />
                            <span className="font-semibold uppercase tracking-wider">{user.name}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 -mt-20 space-y-6 pb-20">
                {/* Identity Summary Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-50 ring-1 ring-gray-100">
                        <img
                            src={user.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f3f4f6&color=444&size=256`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                        <p className="text-[#a1a1a1] font-semibold text-sm mt-1">{user.designation || 'Team Member'}</p>
                        <div className="mt-4 flex justify-center md:justify-start gap-4">
                            <div className="px-4 py-1.5 bg-indigo-50 text-[#7e89ca] text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-100">
                                {user.role} Access
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Switcher & Form Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex border-b border-gray-100 px-8">
                        {['Personal', 'Security'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-5 px-6 text-sm font-bold transition-all relative ${activeTab === tab ? 'text-[#7e89ca]' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {tab === 'Personal' ? 'Personal Profile' : 'Security Settings'}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7e89ca]"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="p-8">
                        {activeTab === 'Personal' ? (
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                            />
                        ) : (
                            <UpdatePasswordForm />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    if (user.role === 'admin' || user.role === 'manager') {
        return <AdminLayout>{content}</AdminLayout>;
    }

    return <UserLayout>{content}</UserLayout>;
}
