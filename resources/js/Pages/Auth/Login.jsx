import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="mb-8 text-center">
                <h2 className="text-3xl font-black text-[#2d3436] mb-2">Welcome Back</h2>
                <p className="text-[#636e72] font-medium">Please enter your details to sign in</p>
            </div>

            {status && (
                <div className="mb-6 p-4 bg-green-50 rounded-2xl text-sm font-bold text-green-600 border border-green-100">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <InputLabel htmlFor="email" value="Email Address" className="text-[#2d3436] font-bold mb-2 ml-1" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ff4081] transition-all font-medium text-[#2d3436]"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="Enter your email address"
                    />

                    <InputError message={errors.email} className="mt-2 ml-1" />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2 ml-1">
                        <InputLabel htmlFor="password" value="Password" className="text-[#2d3436] font-bold" />
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm font-bold text-[#ff4081] hover:text-[#e91e63] transition-colors"
                            >
                                Forgot?
                            </Link>
                        )}
                    </div>

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-[#ff4081] transition-all font-medium text-[#2d3436]"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                    />

                    <InputError message={errors.password} className="mt-2 ml-1" />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer group">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded-lg border-gray-300 text-[#ff4081] focus:ring-[#ff4081]"
                        />
                        <span className="ms-3 text-sm font-bold text-[#636e72] group-hover:text-[#2d3436] transition-colors">
                            Remember me
                        </span>
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-4 bg-[#ff4081] text-white rounded-2xl font-black text-lg hover:bg-[#e91e63] transition-all shadow-xl shadow-[#ff4081]/20 active:scale-[0.98] disabled:opacity-50"
                >
                    {processing ? 'SIGNING IN...' : 'SIGN IN'}
                </button>

                <div className="text-center pt-4">
                    <p className="text-[#636e72] font-medium">
                        Don't have an account?{' '}
                        <Link
                            href={route('register')}
                            className="text-[#ff4081] font-black hover:underline decoration-2 underline-offset-4"
                        >
                            Sign Up
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
