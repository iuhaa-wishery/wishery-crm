import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen bg-[#fff5f8] relative overflow-hidden font-sans flex flex-col items-center justify-center p-6">
            {/* Decorative Background Blobs */}
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#fce4ec] rounded-full blur-[100px] opacity-60 animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#e3f2fd] rounded-full blur-[120px] opacity-70"></div>

            <div className="relative z-10 w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex flex-col items-center gap-4 group">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#ff4081] to-[#7c4dff] rounded-2xl flex items-center justify-center shadow-xl transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
                            <span className="text-white font-black text-3xl -rotate-12 group-hover:rotate-0 transition-transform duration-500">W</span>
                        </div>
                        <span className="text-2xl font-black tracking-tight text-[#2d3436]">
                            WISHERY <span className="text-[#ff4081]">CRM</span>
                        </span>
                    </Link>
                </div>

                <div className="bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-[32px] shadow-2xl shadow-[#ff4081]/5 border border-white/20">
                    {children}
                </div>
            </div>

            {/* Floating Leaf Shapes */}
            <div className="absolute bottom-10 left-10 w-24 h-24 text-[#ff4081] opacity-10 rotate-45">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8.13,20C11,20 13.85,18.08 15,15.5C15.91,13.5 15.61,11.5 15,9.5C14.34,7.5 13,5.5 12,3.5C11,1.5 10,0 10,0C10,0 10,1.5 10.5,3.5C11,5.5 12.34,7.5 13,9.5C13.61,11.5 13.91,13.5 13,15.5C11.85,18.08 9,20 6.13,20C5.64,20 5.14,19.87 4.66,19.7L17,8Z" /></svg>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes pulse {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 0.4; }
                }
                .animate-pulse {
                    animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}} />
        </div>
    );
}
