'use client';

import { useState } from 'react';
import { login } from '@/app/auth/actions';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon, Mail, Lock } from 'lucide-react';

export default function LoginForm({ error }: { error?: string }) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="space-y-6">
            <div className="mt-4">
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4">
                        {error}
                    </div>
                )}
            </div>

            <form className="space-y-5" action={login}>
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Email Address</Label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            placeholder="name@example.com"
                            className="h-12 pl-11 bg-gray-50/50 border-gray-200 rounded-xl text-black focus-visible:ring-primary focus-visible:bg-white transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                        <Label htmlFor="password" title="Password" className="text-xs font-bold text-gray-700 uppercase tracking-wider">Password</Label>
                        <a href="#" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                            Forgot password?
                        </a>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            required
                            placeholder="Enter your password"
                            className="h-12 pl-11 pr-11 bg-gray-50/50 border-gray-200 rounded-xl text-black focus-visible:ring-primary focus-visible:bg-white transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                            {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <div className="pt-2">
                    <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-7 rounded-2xl text-base shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                    >
                        Log in Now
                    </Button>
                </div>

            </form>
        </div>
    );
}
