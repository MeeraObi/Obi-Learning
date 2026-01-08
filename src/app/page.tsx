import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';
import AuthPromotionalContent from '@/components/auth/AuthPromo';
import { GraduationCap } from 'lucide-react';

export default async function LoginPage({
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
            <span className="text-gray-400">Don't have an account? </span>
            <Link href="/signup" className="text-primary hover:text-primary/80 transition-colors font-bold underline decoration-primary/30 underline-offset-4">
              Sign Up
            </Link>
          </div>
        </div>

        {/* Main Form Content */}
        <div className="mx-auto w-full max-w-md py-12">
          <h1 className="text-4xl font-black text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-500 font-medium mb-10">Enter your credentials to continue your journey.</p>

          <LoginForm error={error} />
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
      <AuthPromotionalContent />
    </div>
  );
}
