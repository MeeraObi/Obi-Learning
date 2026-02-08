'use client';

import { useState } from 'react';
import { Student } from '@/types';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import { format, addDays, subDays, isToday } from 'date-fns';
import {
    ChevronRight,
    ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { ScheduleItem } from '@/types';
import { mapStudentData } from '@/lib/mappers';

// Modular Components
import ScheduleSection from './ScheduleSection';
import NoteToSelf from './NoteToSelf';

interface DashboardClientProps {
    initialChildren: any[];
    initialSchedule: ScheduleItem[];
    user: {
        name: string;
        email: string;
    };
}

export default function DashboardClient({ initialChildren, initialSchedule, user }: DashboardClientProps) {
    const [students] = useState<Student[]>(mapStudentData(initialChildren));
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const handlePreviousDay = () => setSelectedDate(prev => subDays(prev, 1));
    const handleNextDay = () => setSelectedDate(prev => addDays(prev, 1));

    const selectedDayName = format(selectedDate, 'EEEE');
    const filteredSchedule = initialSchedule.filter(item => item.day_of_week === selectedDayName)
        .sort((a, b) => a.start_time.localeCompare(b.start_time));

    return (
        <div className="flex h-screen bg-white overflow-hidden font-sans relative">
            <Sidebar
                studentsList={students}
                user={user}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="flex-1 flex flex-col min-w-0 bg-[#fbfbfc] relative overflow-hidden">
                <TopBar
                    selectedStudent={undefined}
                    user={user}
                    onMenuClick={() => setIsSidebarOpen(true)}
                />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* LEFT COLUMN (70%) */}
                        <div className="lg:col-span-8 space-y-8">
                            <ScheduleSection
                                todaysSchedule={filteredSchedule}
                                selectedDate={selectedDate}
                                onPreviousDay={handlePreviousDay}
                                onNextDay={handleNextDay}
                            />
                        </div>

                        {/* RIGHT COLUMN (30%) */}
                        <div className="lg:col-span-4 space-y-8">
                            <NoteToSelf />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
