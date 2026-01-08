"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Calendar, Play, Sparkles } from 'lucide-react';
import { ScheduleItem } from '@/app/dashboard/schedule-actions';

interface ScheduleSectionProps {
    todaysSchedule: ScheduleItem[];
}

const ScheduleSection = ({ todaysSchedule }: ScheduleSectionProps) => {
    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Today's Schedule</h2>
                <Link href="/classes">
                    <Button variant="ghost" className="text-primary font-bold text-sm hover:bg-primary/5 rounded-xl">
                        View Full Calendar
                    </Button>
                </Link>
            </div>
            <div className="space-y-4">
                {todaysSchedule.length > 0 ? (
                    todaysSchedule.map((item) => {
                        const isNow = false; // Mocking current class status
                        return (
                            <div
                                key={item.id}
                                className={`p-6 rounded-[2rem] border transition-all flex items-center justify-between gap-6 group ${isNow
                                    ? 'bg-primary/5 border-primary shadow-lg shadow-primary/5'
                                    : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'
                                    }`}
                            >
                                <div className="flex items-center gap-8">
                                    <div className={`text-center min-w-[80px] py-1 rounded-2xl ${isNow ? 'bg-primary text-white' : 'text-gray-900'}`}>
                                        <p className="text-lg font-black leading-none">{item.start_time.slice(0, 5)}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60">AM</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-black text-gray-900 tracking-tight">{item.subject} — {item.class_name}</h3>
                                            {isNow && <Badge className="bg-green-500 text-white border-none rounded-lg h-5 font-black uppercase text-[8px] px-2">In Progress</Badge>}
                                        </div>
                                        <p className="text-sm text-gray-500 font-medium">Room {item.room} • Next Unit: Quantum Mechanics</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="border-gray-100 bg-gray-50/50 text-gray-500 rounded-xl h-8 px-4 font-bold hidden md:flex items-center gap-2">
                                        <Sparkles size={12} className="text-primary" />
                                        High Engagement
                                    </Badge>
                                    <Button className={`rounded-2xl h-12 px-6 font-black gap-2 transition-all ${isNow ? 'bg-primary text-white' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
                                        {isNow ? <Play size={16} fill="currentColor" /> : 'View Plan'}
                                        {isNow ? 'Resume Class' : ''}
                                    </Button>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-12 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-gray-900 font-bold mb-1">No Classes Scheduled Today</h3>
                        <p className="text-gray-500 text-sm">Update your schedule in your teacher profile.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ScheduleSection;
