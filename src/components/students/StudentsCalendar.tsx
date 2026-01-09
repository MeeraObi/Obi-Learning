import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, isValid } from 'date-fns';
import { ScheduleItem } from '@/app/dashboard/schedule-actions';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { getTopicForClass } from '@/data/curriculum-plan';

interface ClassesCalendarProps {
    schedule: ScheduleItem[];
    onClassClick?: (className: string) => void;
}

const ClassesCalendar = ({ schedule, onClassClick }: ClassesCalendarProps) => {
    // Default to October 2024 as shown in the reference image
    const [currentMonth, setCurrentMonth] = useState(new Date(2024, 9, 1));

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Reference events from the provided image
    const specialEvents = useMemo(() => [
        { date: new Date(2024, 9, 2), title: 'Gandhi Jayanti', type: 'holiday' },
        { date: new Date(2024, 9, 12), title: 'Dussehra', type: 'holiday' },
        { date: new Date(2024, 9, 28), title: 'Autumn Break', type: 'vacation', isLong: true, end: new Date(2024, 9, 31) },
        { date: new Date(2024, 9, 30), title: 'Diwali', type: 'holiday' },
    ], []);

    const getDayEvents = (day: Date) => {
        const dayName = format(day, 'EEEE');
        const dayClasses = schedule.filter(item => item.day_of_week === dayName);

        const daySpecials = specialEvents.filter(event => {
            if (event.isLong && event.end) {
                return day >= event.date && day <= event.end;
            }
            return isSameDay(day, event.date);
        });

        return {
            classes: dayClasses.sort((a, b) => a.start_time.localeCompare(b.start_time)),
            specials: daySpecials
        };
    };

    return (
        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden mt-6 sm:mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <CardHeader className="p-6 sm:p-10 pb-4 sm:pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4 sm:gap-6">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-1">
                            <CalendarIcon size={12} />
                            Academic Timetable
                        </div>
                        <CardTitle className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight">
                            {format(currentMonth, 'MMMM yyyy')}
                        </CardTitle>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl">
                        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg hover:bg-white hover:shadow-sm" onClick={prevMonth}>
                            <ChevronLeft size={16} className="sm:text-20 text-gray-400" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg hover:bg-white hover:shadow-sm" onClick={nextMonth}>
                            <ChevronRight size={16} className="sm:text-20 text-gray-400" />
                        </Button>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 sm:gap-8 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]" />
                        <span className="text-[9px] sm:text-[11px] font-black text-gray-500 uppercase tracking-widest">Class</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.3)]" />
                        <span className="text-[9px] sm:text-[11px] font-black text-gray-500 uppercase tracking-widest">Holiday</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.3)]" />
                        <span className="text-[9px] sm:text-[11px] font-black text-gray-500 uppercase tracking-widest">Vacation</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <div className="min-w-[700px]">
                        <div className="grid grid-cols-7 border-y border-gray-100 bg-gray-50/30">
                            {dayHeaders.map(day => (
                                <div key={day} className="py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-r border-gray-100 last:border-r-0">
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7">
                            {calendarDays.map((day, i) => {
                                const { classes, specials } = getDayEvents(day);
                                const isCurrentMonth = isSameMonth(day, monthStart);
                                const isToday = isSameDay(day, new Date());

                                return (
                                    <div
                                        key={day.toString()}
                                        className={cn(
                                            "min-h-[160px] p-3 border-r border-b border-gray-100 relative group transition-colors",
                                            !isCurrentMonth ? "bg-gray-50/50" : "bg-white",
                                            (i + 1) % 7 === 0 && "border-r-0"
                                        )}
                                    >
                                        <span className={cn(
                                            "text-xs font-black mb-3 block",
                                            isCurrentMonth ? "text-gray-400" : "text-gray-200",
                                            isToday && "text-primary bg-primary/10 w-6 h-6 rounded-full flex items-center justify-center -ml-1 -mt-1"
                                        )}>
                                            {format(day, 'd')}
                                        </span>

                                        <div className="space-y-2">
                                            {specials.map((event, idx) => (
                                                <div
                                                    key={idx}
                                                    className={cn(
                                                        "px-2.5 py-1.5 rounded-lg text-[9px] font-black leading-none truncate border",
                                                        event.type === 'holiday'
                                                            ? "bg-red-50 border-red-100/50 text-red-500"
                                                            : "bg-orange-50 border-orange-100/50 text-orange-500"
                                                    )}
                                                >
                                                    {event.title}
                                                </div>
                                            ))}

                                            {classes.map((c) => (
                                                <div
                                                    key={c.id}
                                                    className="flex items-start gap-2.5 px-3 py-2 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50/50 hover:shadow-sm transition-all group/event cursor-pointer"
                                                    onClick={() => onClassClick?.(c.class_name)}
                                                >
                                                    <div className="w-[2px] h-7 bg-blue-500 rounded-full mt-0.5" />
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-black text-gray-900 leading-tight mb-1">
                                                            {c.start_time.slice(0, 5)} {c.subject}
                                                        </p>
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider truncate">
                                                            {getTopicForClass(c.subject as 'Mathematics' | 'Science')}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ClassesCalendar;

