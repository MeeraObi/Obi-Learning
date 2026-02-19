'use client';

import { useState } from 'react';
import { signup } from '@/app/auth/actions';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EyeIcon, EyeOffIcon, Mail, Lock, User, Phone, Globe, GraduationCap } from 'lucide-react';

export default function SignupForm({ error }: { error?: string }) {
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

            <form className="space-y-5" action={signup}>
                <div className="space-y-2">
                    <Label htmlFor="institution" className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Institution Name</Label>
                    <div className="relative">
                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="institution"
                            name="institution"
                            type="text"
                            placeholder="e.g. Oakridge International"
                            className="h-12 pl-11 bg-gray-50/50 border-gray-200 rounded-xl text-black focus-visible:ring-primary focus-visible:bg-white transition-all"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Full Name</Label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            placeholder="e.g. John Doe"
                            className="h-12 pl-11 bg-gray-50/50 border-gray-200 rounded-xl text-black focus-visible:ring-primary focus-visible:bg-white transition-all"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="contact" className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Contact Number</Label>
                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="contact"
                            name="contact"
                            type="tel"
                            autoComplete="tel"
                            placeholder="+1 (555) 000-0000"
                            className="h-12 pl-11 bg-gray-50/50 border-gray-200 rounded-xl text-black focus-visible:ring-primary focus-visible:bg-white transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="country" className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Country</Label>
                    <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                        <Select name="country">
                            <SelectTrigger className="h-12 pl-11 bg-gray-50/50 border-gray-200 rounded-xl text-black focus:ring-primary focus:bg-white transition-all">
                                <SelectValue placeholder="Select a country" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="US">United States</SelectItem>
                                <SelectItem value="CA">Canada</SelectItem>
                                <SelectItem value="UK">United Kingdom</SelectItem>
                                <SelectItem value="AU">Australia</SelectItem>
                                <SelectItem value="IN">India</SelectItem>
                                <SelectItem value="SG">Singapore</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Email Address</Label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            placeholder="name@example.com"
                            className="h-12 pl-11 bg-gray-50/50 border-gray-200 rounded-xl text-black focus-visible:ring-primary focus-visible:bg-white transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password" title="Password" className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Password</Label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Create a password"
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
                        Sign Up Now
                    </Button>
                </div>


            </form>
        </div>
    );
}
