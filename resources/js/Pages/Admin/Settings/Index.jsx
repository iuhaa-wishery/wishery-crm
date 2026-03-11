import React, { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Settings, ClipboardList, Users, Save, ChevronRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Index({ settings, users, designers_task_types }) {
    const [activeTab, setActiveTab] = useState('general');

    const { data, setData, post, processing, errors } = useForm({
        admin_email: settings.admin_email || '',
        monthly_working_days: settings.monthly_working_days || '',
        beta_menu_items: JSON.parse(settings.beta_menu_items || '[]'),
        designers_task_types: designers_task_types || settings.designers_task_types || "",
    });

    const [showMenuSettings, setShowMenuSettings] = useState(false);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'projects', label: 'Projects' },
        { id: 'users', label: 'Users' },
        { id: 'leaves', label: 'Leaves' },
        { id: 'attendance', label: 'Attendance' },
        { id: 'calendar', label: 'Calendar' },
        { id: 'drive', label: 'Drive' },
        { id: 'chat', label: 'Chat' },
        { id: 'content-calendar', label: 'Content Calendar' },
        { id: 'daily-worksheet', label: 'Daily Worksheet' },
        { id: 'worksheet-settings', label: 'Worksheet Settings' },
    ];

    const toggleMenuItem = (id) => {
        const current = [...data.beta_menu_items];
        if (current.includes(id)) {
            setData('beta_menu_items', current.filter(item => item !== id));
        } else {
            setData('beta_menu_items', [...current, id]);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'), {
            onSuccess: () => toast.success("Settings saved successfully"),
        });
    };

    const tabs = [
        { id: 'general', label: 'General Settings', icon: Settings },
        { id: 'worksheet', label: 'Worksheet Configuration', icon: Users },
        { id: 'designers', label: 'Designers Worklist', icon: ClipboardList },
    ];

    return (
        <AdminLayout title="System Settings">
            <Head title="Settings" />

            <div className="max-w-5xl mx-auto space-y-6 font-sans">
                {/* Header Section */}
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">System Settings</h1>
                        <p className="text-gray-500 font-medium">Configure global application behavior and module defaults</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
                        <Settings size={32} />
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex bg-white p-1.5 rounded-[20px] shadow-sm border border-gray-100 gap-1 overflow-x-auto custom-scrollbar">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold uppercase tracking-widest text-[11px] transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-gray-900 text-white shadow-lg shadow-gray-200'
                                : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* TAB CONTENT: General Settings */}
                {activeTab === 'general' && (
                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="mb-8 border-b border-gray-50 pb-6">
                            <h2 className="text-xl font-bold text-gray-900">General Configurations</h2>
                            <p className="text-sm text-gray-500 font-medium mt-1">Manage core system variables and menu appearance</p>
                        </div>

                        <form onSubmit={submit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Admin Email Address</label>
                                    <input
                                        type="email"
                                        value={data.admin_email}
                                        className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-gray-800"
                                        onChange={(e) => setData('admin_email', e.target.value)}
                                        placeholder="admin@example.com"
                                    />
                                    {errors.admin_email && <p className="text-xs text-red-500 font-bold ml-1">{errors.admin_email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Monthly Working Days</label>
                                    <input
                                        type="number"
                                        value={data.monthly_working_days}
                                        className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold text-gray-800"
                                        onChange={(e) => setData('monthly_working_days', e.target.value)}
                                        min="0"
                                        max="31"
                                    />
                                    {errors.monthly_working_days && <p className="text-xs text-red-500 font-bold ml-1">{errors.monthly_working_days}</p>}
                                </div>
                            </div>

                            <div className="bg-gray-50/50 rounded-[28px] p-8 border border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setShowMenuSettings(!showMenuSettings)}
                                    className="flex items-center justify-between w-full group"
                                >
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Menu Beta Labels</h3>
                                        <p className="text-gray-500 font-medium text-sm">Select items to highlight with a "Beta" tag</p>
                                    </div>
                                    <div className={`p-2 bg-white rounded-full shadow-sm border border-gray-100 transition-transform duration-300 ${showMenuSettings ? 'rotate-180' : ''}`}>
                                        <ChevronRight className="rotate-90 text-gray-400" />
                                    </div>
                                </button>

                                {showMenuSettings && (
                                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 animate-in fade-in zoom-in-95 duration-200">
                                        {menuItems.map((item) => (
                                            <label key={item.id} className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl cursor-pointer hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5 transition-all">
                                                <input
                                                    type="checkbox"
                                                    checked={data.beta_menu_items.includes(item.id)}
                                                    onChange={() => toggleMenuItem(item.id)}
                                                    className="w-5 h-5 rounded-lg border-gray-200 text-blue-600 focus:ring-blue-500/20"
                                                />
                                                <span className="font-bold text-gray-700 text-sm">{item.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end pt-6">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 hover:shadow-blue-200 active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
                                >
                                    <Save size={18} />
                                    {processing ? 'SAVING...' : 'SAVE GENERAL SETTINGS'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* TAB CONTENT: Worksheet Configuration */}
                {activeTab === 'worksheet' && (
                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="mb-8 border-b border-gray-50 pb-6">
                            <h2 className="text-xl font-bold text-gray-900">Worksheet Configuration</h2>
                            <p className="text-sm text-gray-500 font-medium mt-1">Select a user to customize their daily worksheet field visibility</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {users.map((user) => (
                                <Link
                                    key={user.id}
                                    href={route("admin.users.worksheet-settings", user.id)}
                                    className="group flex items-center justify-between p-5 bg-gray-50/50 border border-gray-100 rounded-[24px] hover:bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-blue-600 font-black text-xl shadow-sm group-hover:bg-blue-50 transition-colors">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900">{user.name}</p>
                                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-white border border-gray-50 flex items-center justify-center text-gray-400 group-hover:text-blue-600 group-hover:border-blue-100 transition-all">
                                        <ChevronRight size={20} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB CONTENT: Designers Worklist Settings */}
                {activeTab === 'designers' && (
                    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="mb-8 border-b border-gray-50 pb-6">
                            <h2 className="text-xl font-bold text-gray-900">Designers Worklist Defaults</h2>
                            <p className="text-sm text-gray-500 font-medium mt-1">Configure global default values for the designers module</p>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-3">
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                    Task Type Options (Comma Separated)
                                </label>
                                <textarea
                                    value={data.designers_task_types}
                                    onChange={(e) => setData("designers_task_types", e.target.value)}
                                    className="w-full bg-gray-50/50 border border-gray-200 rounded-[28px] p-6 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all min-h-[160px] leading-relaxed shadow-inner"
                                    placeholder="e.g. POSTER, REEL, STORY, CAROUSEL, LOGO DESIGN"
                                />
                                <div className="flex items-center gap-2 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                    <div className="text-blue-600">
                                        <CheckCircle size={16} />
                                    </div>
                                    <p className="text-[10px] font-bold text-blue-700 uppercase tracking-tight">
                                        These options will appear in the "Task Type" dropdown for all designers tasks.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end pt-6 border-t border-gray-50">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 hover:shadow-blue-200 active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
                                >
                                    <Save size={18} />
                                    {processing ? 'SAVING...' : 'SAVE DESIGNERS SETTINGS'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
                .font-sans { font-family: 'Plus Jakarta Sans', sans-serif !important; }
                .custom-scrollbar::-webkit-scrollbar { height: 4px; width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            ` }} />
        </AdminLayout>
    );
}

