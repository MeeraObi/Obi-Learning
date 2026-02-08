"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format, isToday } from 'date-fns';
import { Calendar, Play, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { ScheduleItem } from '@/types';
import { getTopicForClass } from '@/data/curriculum-plan';
import { formatTimeTo12h } from '@/lib/utils';

interface ScheduleSectionProps {
    todaysSchedule: ScheduleItem[];
    selectedDate: Date;
    onPreviousDay: () => void;
    onNextDay: () => void;
}

const ScheduleSection = ({ todaysSchedule, selectedDate, onPreviousDay, onNextDay }: ScheduleSectionProps) => {
    const isDateToday = isToday(selectedDate);
    const dateTitle = isDateToday ? "Today's Schedule" : `Schedule for ${format(selectedDate, 'MMM d')}`;

    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">{dateTitle}</h2>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onPreviousDay}
                            className="h-8 w-8 rounded-full hover:bg-gray-100"
                        >
                            <ChevronLeft size={18} className="text-gray-600" />
                        </Button>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest min-w-[100px] text-center">
                            {format(selectedDate, 'EEEE')}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onNextDay}
                            className="h-8 w-8 rounded-full hover:bg-gray-100"
                        >
                            <ChevronRightIcon size={18} className="text-gray-600" />
                        </Button>
                    </div>
                </div>
                <Link href="/classes?view=planner">
                    <Button variant="ghost" className="text-primary font-bold text-sm hover:bg-primary/5 rounded-xl">
                        View Full Calendar
                    </Button>
                </Link>
            </div>
            <div className="space-y-4">
                {todaysSchedule.length > 0 ? (
                    todaysSchedule.map((item) => {
                        const isNow = false; // Mocking current class status
                        const currentTopic = getTopicForClass(item.subject as 'Mathematics' | 'Science');
                        const { time, period } = formatTimeTo12h(item.start_time);

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
                                        <p className="text-lg font-black leading-none">{time}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-60">{period}</p>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-black text-gray-900 tracking-tight">{item.subject} — {item.class_name}</h3>
                                            {isNow && <Badge className="bg-green-500 text-white border-none rounded-lg h-5 font-black uppercase text-[8px] px-2">In Progress</Badge>}
                                        </div>
                                        <p className="text-sm text-gray-500 font-medium">Room {item.room} • {currentTopic}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Link href={`/classes?mode=weekly&classId=${item.class_name}&subject=${item.subject}`}>
                                        <Button className={`rounded-2xl h-12 px-6 font-black gap-2 transition-all ${isNow ? 'bg-primary text-white' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
                                            {isNow ? <Play size={16} fill="currentColor" /> : 'View Plan'}
                                            {isNow ? 'Resume Class' : ''}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-12 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-gray-900 font-bold mb-1">No Classes Scheduled {isDateToday ? 'Today' : `on ${format(selectedDate, 'EEEE')}`}</h3>
                        <p className="text-gray-500 text-sm">Update your schedule in your teacher profile.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ScheduleSection;
