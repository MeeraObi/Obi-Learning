'use client';

import { useState } from 'react';
import { Student } from '@/types';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import { format } from 'date-fns';
import {
    Clock,
    ChevronRight,
    BookOpen,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { ScheduleItem } from '@/app/dashboard/schedule-actions';
import { mapStudentData } from '@/lib/mappers';

// Modular Components
import ScheduleSection from './ScheduleSection';
import ConceptReinforcement from './ConceptReinforcement';
import NoteToSelf from './NoteToSelf';
import QuickActions from './QuickActions';

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

    const todayDay = format(new Date(), 'EEEE');
    const todaysSchedule = initialSchedule.filter(item => item.day_of_week === todayDay)
        .sort((a, b) => a.start_time.localeCompare(b.start_time));

    const pendingReviews = [
        { id: 1, type: "Quiz", title: "Photosynthesis: Light Reactions", status: "Review Draft", icon: BookOpen },
        { id: 2, type: "Homework", title: "Algebraic Expressions Set 4", status: "Approve Suggestions", icon: CheckCircle2 }
    ];

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
                            <ScheduleSection todaysSchedule={todaysSchedule} />
                            <ConceptReinforcement />

                            {/* Pending Reviews Section */}
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Pending Reviews</h2>
                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{pendingReviews.length} items</span>
                                </div>
                                <div className="space-y-3">
                                    {pendingReviews.map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                                                    <item.icon size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{item.title}</h4>
                                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">{item.type}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" className="rounded-xl h-10 px-4 font-black text-gray-900 hover:bg-gray-50 gap-2 border border-gray-100">
                                                {item.status}
                                                <ChevronRight size={14} />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* RIGHT COLUMN (30%) */}
                        <div className="lg:col-span-4 space-y-8">

                            {/* Preparation Status Widget */}
                            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-black text-gray-900 tracking-tight">Preparation Status</h3>
                                    <Clock className="text-gray-300" size={20} />
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-sm font-bold text-gray-500">Next Week (Oct 31 - Nov 4)</span>
                                            <span className="text-xl font-black text-primary">65%</span>
                                        </div>
                                        <Progress value={65} className="h-2 bg-gray-50 [&>div]:bg-primary" />
                                    </div>
                                    <p className="text-xs text-gray-400 font-medium leading-relaxed">
                                        Missing lesson plan for Thursday and quiz for Friday.
                                    </p>
                                    <Button className="w-full rounded-2xl h-12 bg-white border border-gray-200 text-gray-900 font-black hover:bg-gray-50 hover:border-gray-300 transition-all">
                                        Continue Planning
                                    </Button>
                                </div>
                            </Card>

                            <QuickActions />
                            <NoteToSelf />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
