'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Student } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signout } from '@/app/auth/actions';

interface TopBarProps {
    selectedStudent: Student | undefined;
    user: {
        name: string;
        email: string;
    };
    onMenuClick?: () => void;
}

export default function TopBar({ user, onMenuClick }: TopBarProps) {
    const pathname = usePathname();

    // Get page title based on path
    const getPageTitle = (path: string) => {
        if (path.includes('/dashboard')) return 'Dashboard';
        if (path.includes('/classes')) return 'Classes';
        if (path.includes('/students')) return 'Students';
        if (path.includes('/curriculum')) return 'Curriculum';
        if (path.includes('/reports')) return 'Reports';
        if (path.includes('/profile')) return 'Profile';
        return 'Dashboard';
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const pageTitle = getPageTitle(pathname);
    const greeting = getGreeting();

    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 h-20 flex items-center justify-between px-4 sm:px-6 lg:px-10 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                {onMenuClick && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden rounded-xl text-gray-500 hover:bg-gray-50"
                        onClick={onMenuClick}
                    >
                        <Menu size={24} />
                    </Button>
                )}
                <div>
                    <h1 className="text-[10px] sm:text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5 sm:mb-1">
                        {greeting}, {user.name}
                    </h1>
                    <p className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight">
                        {pageTitle}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <p className="text-xs sm:text-sm font-black text-gray-900 tracking-tight">{user.name}</p>
                        <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">Institutional Account</p>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-12 w-12 rounded-2xl hover:bg-transparent p-0 transition-transform active:scale-95">
                                <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                                    <AvatarFallback className="bg-primary text-white font-black text-xs">
                                        {user.name ? user.name.charAt(0).toUpperCase() : 'T'}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-64 rounded-2xl p-2 shadow-2xl border-gray-100" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal p-4 pb-3">
                                <Link href="/profile" className="flex flex-col space-y-2 group/profile-link">
                                    <p className="text-sm font-black text-gray-900 tracking-tight leading-none group-hover/profile-link:text-primary transition-colors">{user.name}</p>
                                    <p className="text-xs font-medium leading-none text-gray-400">
                                        {user.email}
                                    </p>
                                </Link>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-50 mx-2" />
                            <DropdownMenuItem asChild className="rounded-xl h-11 px-4 font-bold text-gray-600 focus:bg-gray-50 focus:text-primary m-1">
                                <Link href="/profile" className="flex items-center gap-2 cursor-pointer w-full">
                                    View Teacher Profile
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="rounded-xl h-11 px-4 font-bold text-gray-600 focus:bg-gray-50 focus:text-primary m-1">
                                <Link href="/settings/institution" className="flex items-center gap-2 cursor-pointer w-full">
                                    Manage Institution
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="rounded-xl h-11 px-4 font-bold text-gray-600 focus:bg-gray-50 focus:text-primary m-1">
                                <Link href="/settings/privacy" className="flex items-center gap-2 cursor-pointer w-full">
                                    Privacy Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-50 mx-2" />
                            <DropdownMenuItem asChild className="rounded-xl h-11 px-4 font-bold text-red-600 focus:bg-red-50 focus:text-red-700 m-1">
                                <form action={signout} className="w-full">
                                    <button type="submit" className="w-full text-left cursor-pointer">
                                        Terminate Session
                                    </button>
                                </form>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
