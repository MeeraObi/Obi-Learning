"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus } from 'lucide-react';
import Link from 'next/link';

const QuickActions = () => {
    return (
        <div className="bg-primary rounded-[2.5rem] p-8 space-y-4 shadow-xl shadow-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-white/20 transition-all"></div>
            <h3 className="text-lg font-black text-white tracking-tight relative z-10">Quick Actions</h3>
            <div className="space-y-3 relative z-10">
                <Link href="/messages" className="w-full">
                    <Button className="w-full justify-start gap-3 rounded-2xl h-14 bg-white/10 hover:bg-white/20 text-white font-bold border-none transition-all active:scale-[0.98] mb-4">
                        <MessageSquare size={20} fill="currentColor" />
                        Message Parents
                    </Button>
                </Link>
                <Button className="w-full justify-start gap-3 rounded-2xl h-14 bg-white/10 hover:bg-white/20 text-white font-bold border-none transition-all active:scale-[0.98]">
                    <Plus size={20} />
                    Create Resource
                </Button>
            </div>
        </div>
    );
};

export default QuickActions;
