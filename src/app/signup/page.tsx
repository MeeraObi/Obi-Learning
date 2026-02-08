import Link from 'next/link';
import SignupForm from '@/components/auth/SignupForm';
import { GraduationCap } from 'lucide-react';

export default async function SignupPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const params = await searchParams;
    const error = params.error;
    return (
        <div className="flex min-h-screen w-full bg-white font-sans">
            {/* Left Side - Form */}
            <div className="flex w-full flex-col justify-between p-8 lg:w-1/2 lg:p-12 xl:p-16">
                {/* Header with Logo */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
                            <GraduationCap className="w-6 h-6" strokeWidth={2.5} />
                        </div>
                        <span className="text-2xl font-black text-gray-900 tracking-tight">Obi Learning</span>
                    </div>
                    <div className="text-[13px] font-medium">
                        <span className="text-gray-400">Already a member? </span>
                        <Link href="/" className="text-primary hover:text-primary/80 transition-colors font-bold underline decoration-primary/30 underline-offset-4">
                            Sign In
                        </Link>
                    </div>
                </div>

                {/* Main Form Content */}
                <div className="mx-auto w-full max-w-md py-12">
                    <h1 className="text-4xl font-black text-gray-900 mb-2">Create Account</h1>
                    <p className="text-gray-500 font-medium mb-10">Join us to start your learning journey.</p>

                    <SignupForm error={error} />
                </div>

                {/* Footer */}
                <div className="flex items-center justify-center text-[10px] text-gray-400 font-medium pb-8 lg:pb-0">
                    <p>© 2026 Obi Learning Inc. All rights reserved.</p>
                    <span className="mx-2">•</span>
                    <a href="#" className="hover:text-gray-600 transition-colors">Privacy</a>
                    <span className="mx-2">&</span>
                    <a href="#" className="hover:text-gray-600 transition-colors">Terms</a>
                </div>
            </div>

            {/* Right Side - Promotional Content */}
            {/* Right Side - Branded Content */}
            <div className="hidden lg:flex w-1/2 bg-[#050B1C] relative overflow-hidden items-center justify-center p-12">
                {/* Background - Space BG */}
                <div
                    className="absolute inset-0 z-0 opacity-80"
                    style={{
                        backgroundImage: "url('/space-bg.webp')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                />

                {/* Overlay Gradient for better text readability */}
                <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/20 via-transparent to-black/60" />

                {/* Top Left - Obi White Logo */}
                <div className="absolute top-8 left-8 z-20">
                    <img src="/obi-white.svg" alt="Obi Learning" className="h-12 lg:h-20 w-auto opacity-90" />
                </div>

                {/* Top Right - Sticky Astronaut */}
                <div className="absolute top-10 -right-0 z-20">
                    <img src="/sticky-astronaut.webp" alt="Astronaut" className="w-48 md:w-56 lg:w-64 h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500" />
                </div>

                {/* Center Content */}
                <div className="relative z-20 max-w-lg text-center space-y-6">
                    <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-2xl">
                        Unlock your child's potential with personalized learning.
                    </h2>
                    <h4 className="text-lg md:text-xl font-medium text-blue-100/90 leading-relaxed tracking-wide drop-shadow-lg max-w-md mx-auto">
                        Transforming education through adaptive trails designed just for each kid.
                    </h4>
                </div>
            </div>        </div>
    );
}
