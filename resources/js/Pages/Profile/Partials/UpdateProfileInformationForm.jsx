import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { User as UserIcon, Mail, Briefcase, Phone, Camera, CheckCircle } from 'lucide-react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const { auth } = usePage().props;
    const user = auth.user;

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            designation: user.designation || '',
            phone: user.phone || '',
            thumb: null,
            _method: 'patch',
        });

    const submit = (e) => {
        e.preventDefault();
        post(route('profile.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <section className={className}>
            <form onSubmit={submit} className="space-y-10">
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-center gap-8 pb-10 border-b border-gray-50">
                    <div className="relative group">
                        <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-50 border-4 border-white shadow-md ring-1 ring-gray-100 transition-all duration-500 group-hover:scale-105">
                            <img
                                src={user.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f3f4f6&color=444&size=200`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <label
                            htmlFor="thumb"
                            className="absolute -bottom-1 -right-1 w-10 h-10 bg-[#7e89ca] rounded-full flex items-center justify-center text-white cursor-pointer shadow-lg hover:bg-[#6c78bc] transition-all active:scale-95 border-4 border-white"
                        >
                            <Camera className="w-5 h-5" />
                        </label>
                        <input
                            id="thumb"
                            type="file"
                            className="hidden"
                            onChange={(e) => setData('thumb', e.target.files[0])}
                        />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-1">Profile Photo</h4>
                        <p className="text-xs text-gray-400 font-semibold mb-3">PNG, JPG or High-Res GIF. Max 2MB.</p>
                        {data.thumb && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-[#7e89ca] rounded-full text-[10px] font-bold border border-indigo-100 uppercase tracking-widest animate-pulse">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Image Selected
                            </div>
                        )}
                        {errors.thumb && (
                            <p className="text-red-500 text-[10px] font-bold uppercase mt-2">{errors.thumb}</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
                    {/* Full Name */}
                    <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Legal Name</label>
                        <input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            className={`w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:ring-4 focus:ring-indigo-50 focus:border-[#7e89ca] transition-all placeholder:text-gray-200 ${errors.name ? "border-red-200 ring-red-50" : ""}`}
                            placeholder="Full Name"
                        />
                        {errors.name && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1">{errors.name}</p>}
                    </div>

                    {/* Designation */}
                    <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Designation</label>
                        <input
                            id="designation"
                            value={data.designation}
                            onChange={(e) => setData('designation', e.target.value)}
                            className={`w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:ring-4 focus:ring-indigo-50 focus:border-[#7e89ca] transition-all placeholder:text-gray-200 ${errors.designation ? "border-red-200 ring-red-50" : ""}`}
                            placeholder="E.g. Designer"
                        />
                        {errors.designation && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1">{errors.designation}</p>}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            className={`w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:ring-4 focus:ring-indigo-50 focus:border-[#7e89ca] transition-all placeholder:text-gray-200 ${errors.email ? "border-red-200 ring-red-50" : ""}`}
                            placeholder="email@example.com"
                        />
                        {errors.email && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1">{errors.email}</p>}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider ml-1">Phone Number</label>
                        <input
                            id="phone"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            className={`w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 focus:ring-4 focus:ring-indigo-50 focus:border-[#7e89ca] transition-all placeholder:text-gray-200 ${errors.phone ? "border-red-200 ring-red-50" : ""}`}
                            placeholder="+XX XXX XXX XXXX"
                        />
                        {errors.phone && <p className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1">{errors.phone}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-6 pt-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="px-10 py-3 bg-[#7e89ca] text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg shadow-indigo-100 hover:bg-[#6c78bc] transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        Save Settings
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-out duration-300"
                        enterFrom="opacity-0 translate-x-4"
                        enterTo="opacity-100 translate-x-0"
                        leave="transition ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="flex items-center gap-2 text-emerald-500">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Sync Successful</span>
                        </div>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
