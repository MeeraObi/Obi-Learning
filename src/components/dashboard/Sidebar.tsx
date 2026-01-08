'use client';

import { Student } from "@/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreVertical, Users, GraduationCap, LayoutDashboard, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, BarChart3 } from "lucide-react";

interface SidebarProps {
    studentsList: Student[];
    user?: {
        name: string;
        email: string;
    };
}

export default function Sidebar({
    studentsList,
    user,
}: SidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Classes", href: "/classes", icon: Users },
        { name: "Curriculum", href: "/curriculum", icon: BookOpen },
        { name: "Reports", href: "/reports", icon: BarChart3 },
    ];

    return (
        <aside className={`${isCollapsed ? "w-20" : "w-72"} bg-white border-r border-gray-100 flex-shrink-0 flex flex-col shadow-[1px_0_10px_rgba(0,0,0,0.02)] transition-all duration-300 relative group/sidebar`}>
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-10 h-6 w-6 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-sm text-gray-400 hover:text-primary z-50 transition-all opacity-0 group-hover/sidebar:opacity-100"
            >
                {isCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
            </button>

            <div className={`p-8 flex items-center gap-3 ${isCollapsed ? "justify-center px-0" : ""}`}>
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform flex-shrink-0">
                        <GraduationCap className="w-6 h-6" strokeWidth={2.5} />
                    </div>
                    {!isCollapsed && <span className="text-2xl font-black text-gray-900 tracking-tight whitespace-nowrap">Obi Learning</span>}
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2">
                <div className={`mb-8 space-y-1 ${isCollapsed ? "px-2" : ""}`}>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Button
                                key={item.name}
                                asChild
                                variant="ghost"
                                title={isCollapsed ? item.name : undefined}
                                className={`w-full justify-start gap-3 h-12 rounded-xl font-bold transition-all ${isCollapsed ? "px-0 justify-center" : "px-4"} ${isActive
                                    ? "text-primary bg-primary/5 shadow-sm"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                            >
                                <Link href={item.href}>
                                    <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className="flex-shrink-0" />
                                    {!isCollapsed && <span>{item.name}</span>}
                                </Link>
                            </Button>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}
