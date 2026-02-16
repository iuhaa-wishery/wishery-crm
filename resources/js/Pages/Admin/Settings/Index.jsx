import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

export default function Index({ settings }) {
    const { data, setData, post, processing, errors } = useForm({
        admin_email: settings.admin_email || '',
        monthly_working_days: settings.monthly_working_days || '',
        beta_menu_items: JSON.parse(settings.beta_menu_items || '[]'),
    });

    const [showMenuSettings, setShowMenuSettings] = React.useState(false);

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
        post(route('admin.settings.update'));
    };

    return (
        <AdminLayout title="Settings">
            <Head title="Settings" />

            <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-[#2d3436]">General Settings</h2>
                        <p className="text-[#636e72] font-medium">Manage your application's global configurations</p>
                    </div>

                    <form onSubmit={submit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Admin Email */}
                            <div className="space-y-2">
                                <InputLabel htmlFor="admin_email" value="Admin Email Address" className="text-[#2d3436] font-bold ml-1" />
                                <TextInput
                                    id="admin_email"
                                    type="email"
                                    value={data.admin_email}
                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ff4081] transition-all font-medium text-[#2d3436]"
                                    onChange={(e) => setData('admin_email', e.target.value)}
                                    placeholder="admin@example.com"
                                />
                                <InputError message={errors.admin_email} className="mt-2 ml-1" />
                                <p className="text-[11px] text-gray-400 font-medium ml-1">This email will be used for system notifications.</p>
                            </div>

                            {/* Monthly Working Days */}
                            <div className="space-y-2">
                                <InputLabel htmlFor="monthly_working_days" value="Monthly Working Days" className="text-[#2d3436] font-bold ml-1" />
                                <TextInput
                                    id="monthly_working_days"
                                    type="number"
                                    value={data.monthly_working_days}
                                    className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ff4081] transition-all font-medium text-[#2d3436]"
                                    onChange={(e) => setData('monthly_working_days', e.target.value)}
                                    min="0"
                                    max="31"
                                />
                                <InputError message={errors.monthly_working_days} className="mt-2 ml-1" />
                                <p className="text-[11px] text-gray-400 font-medium ml-1">Automatically calculated (excluding weekends). Edit to override.</p>
                            </div>
                        </div>

                        {/* Menu Settings Accordion */}
                        <div className="border-t border-gray-50 pt-8">
                            <button
                                type="button"
                                onClick={() => setShowMenuSettings(!showMenuSettings)}
                                className="flex items-center justify-between w-full text-left"
                            >
                                <div>
                                    <h3 className="text-xl font-black text-[#2d3436]">Menu Settings</h3>
                                    <p className="text-[#636e72] font-medium text-sm">Select menu items to show "Beta" tag</p>
                                </div>
                                <svg
                                    className={`w-6 h-6 transition-transform ${showMenuSettings ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {showMenuSettings && (
                                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {menuItems.map((item) => (
                                        <label key={item.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={data.beta_menu_items.includes(item.id)}
                                                onChange={() => toggleMenuItem(item.id)}
                                                className="w-5 h-5 rounded border-gray-300 text-[#ff4081] focus:ring-[#ff4081]"
                                            />
                                            <span className="font-bold text-[#2d3436] text-sm">{item.label}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="pt-6 border-t border-gray-50 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-10 py-4 bg-[#ff4081] text-white rounded-2xl font-black text-lg hover:bg-[#e91e63] transition-all shadow-xl shadow-[#ff4081]/20 active:scale-[0.98] disabled:opacity-50"
                            >
                                {processing ? 'SAVING...' : 'SAVE SETTINGS'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Info Card */}
                <div className="bg-blue-50 rounded-[32px] p-8 border border-blue-100">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-blue-900 mb-1">Settings Overview</h4>
                            <p className="text-blue-700 font-medium text-sm leading-relaxed">
                                Use these settings to control global application behavior. Menu tags allow you to highlight new features as "Beta" to your users while they are still in testing.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
