import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams;
  const error = params.error;
  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left Side - Form */}
      <div className="flex w-full flex-col justify-between p-8 lg:w-1/2 lg:p-12 xl:p-16">
        {/* Header with Logo */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">Obi Learning</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Don't have an account? </span>
            <Link href="/signup" className="font-semibold text-orange-500 hover:text-orange-600">
              Sign Up
            </Link>
          </div>
        </div>

        {/* Main Form Content */}
        <div className="mx-auto w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back!</h1>
          <p className="mt-2 text-gray-600">Enter your credentials to continue your trail.</p>

          <LoginForm error={error} />

          <p className="mt-8 text-center text-xs text-gray-500">
            © 2026 Obi Learning Inc. All rights reserved. <a href="#" className="underline">Privacy</a> & <a href="#" className="underline">Terms</a>
          </p>
        </div>

        <div className="hidden lg:block">
        </div>
      </div>

      {/* Right Side - Image/Content */}
      <div className="hidden relative lg:flex w-1/2 flex-col justify-end bg-black text-white p-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
          <div className="absolute top-1/4 left-1/4 h-2 w-2 rounded-full bg-orange-500 opacity-50"></div>
          <div className="absolute top-1/3 right-1/4 h-2 w-2 rounded-full bg-orange-500 opacity-50"></div>
          <div className="absolute top-1/2 left-1/3 h-64 w-64 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-1/3 right-1/3 h-64 w-64 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 mb-12">
          <div className="inline-flex items-center rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400 mb-6">
            <span className="mr-2">⚡</span> TRENDING THIS WEEK
          </div>
          <h2 className="text-5xl font-bold leading-tight">
            Master new skills<br />
            with <span className="text-orange-500">curated trails.</span>
          </h2>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex -space-x-4">
              <div className="h-10 w-10 rounded-full border-2 border-black bg-gray-300 flex items-center justify-center text-xs text-black">A</div>
              <div className="h-10 w-10 rounded-full border-2 border-black bg-gray-400 flex items-center justify-center text-xs text-black">B</div>
              <div className="h-10 w-10 rounded-full border-2 border-black bg-gray-500 flex items-center justify-center text-xs text-black">C</div>
            </div>
            <p className="text-sm font-medium text-gray-400">
              <span className="text-orange-500 font-bold">+500</span> learners joined trails today.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
