'use client';

import { useState, useEffect } from 'react';
import { Student } from '@/types';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import { differenceInYears, format } from 'date-fns';
import {
    Calendar,
    Clock,
    MessageSquare,
    Plus,
    ChevronRight,
    Sparkles,
    BookOpen,
    CheckCircle2,
    AlertCircle,
    Play
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScheduleItem } from '@/app/dashboard/schedule-actions';

interface DashboardClientProps {
    initialChildren: any[];
    initialSchedule: ScheduleItem[];
    user: {
        name: string;
        email: string;
    };
}

export default function DashboardClient({ initialChildren, initialSchedule, user }: DashboardClientProps) {
    const mapStudents = (data: any[]): Student[] => data.map(c => ({
        id: c.id,
        name: c.name,
        date_of_birth: c.date_of_birth,
        gender: c.gender,
        age: c.date_of_birth ? differenceInYears(new Date(), new Date(c.date_of_birth)).toString() : '0',
        trailsGenerated: c.assessments && c.assessments.length > 0,
        assessments: c.assessments
    }));

    const [students] = useState<Student[]>(mapStudents(initialChildren));

    const todayDay = format(new Date(), 'EEEE');
    const todaysSchedule = initialSchedule.filter(item => item.day_of_week === todayDay)
        .sort((a, b) => a.start_time.localeCompare(b.start_time));

    const conceptReinforcements = [
        {
            class: "Grade 9 • Math",
            topic: "Linear Equations",
            period: "Period 1",
            students: "Arjun, Meera and 4 others",
            insight: "Class struggled with multi-step equations in yesterday's exit ticket.",
            action: "5-min recap suggestions"
        },
        {
            class: "Grade 8 • Science",
            topic: "Cell Structures",
            period: "Period 2",
            students: "Group B",
            insight: "40% lower score on mitochondrial function MCQ.",
            action: "View quiz breakdown"
        }
    ];

    const pendingReviews = [
        { id: 1, type: "Quiz", title: "Photosynthesis: Light Reactions", status: "Review Draft", icon: BookOpen },
        { id: 2, type: "Homework", title: "Algebraic Expressions Set 4", status: "Approve Suggestions", icon: CheckCircle2 }
    ];

    return (
        <div className="flex h-screen bg-white overflow-hidden font-sans">
            <Sidebar
                studentsList={students}
                user={user}
            />

            <div className="flex-1 flex flex-col min-w-0 bg-[#fbfbfc]">
                <TopBar selectedStudent={undefined} user={user} />

                <main className="flex-1 overflow-y-auto p-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* LEFT COLUMN (70%) */}
                        <div className="lg:col-span-8 space-y-8">

                            {/* Today's Schedule Section */}
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Today's Schedule</h2>
                                    <Button variant="ghost" className="text-primary font-bold text-sm hover:bg-primary/5 rounded-xl">
                                        View Full Calendar
                                    </Button>
                                </div>
                                <div className="space-y-4">
                                    {todaysSchedule.length > 0 ? (
                                        todaysSchedule.map((item, idx) => {
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

                            {/* Concept Reinforcement Section */}
                            <div className="bg-blue-50/50 rounded-[2.5rem] border border-blue-100 p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-blue-500 rounded-xl text-white">
                                        <Sparkles size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-gray-900 tracking-tight">Concept Reinforcement Needed</h2>
                                        <p className="text-sm text-gray-500 font-medium tracking-tight">AI-flagged groups that may benefit from a quick recap segment.</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {conceptReinforcements.map((item, idx) => (
                                        <Card key={idx} className="rounded-3xl border-none shadow-sm bg-white p-6 transition-all hover:shadow-md">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{item.class}</p>
                                                    <p className="text-sm font-black text-gray-900">{item.period}</p>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium mb-3 leading-relaxed">
                                                {item.students} may need reinforcement on <span className="text-gray-900 font-bold">{item.topic}</span> based on recent data.
                                            </p>
                                            <Button variant="outline" className="w-full rounded-xl h-10 text-xs font-bold border-gray-100 hover:bg-gray-50 text-primary">
                                                {item.action}
                                            </Button>
                                        </Card>
                                    ))}
                                </div>
                            </div>

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
                                    <Calendar className="text-gray-300" size={20} />
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

                            {/* Quick Actions */}
                            <div className="bg-primary rounded-[2.5rem] p-8 space-y-4 shadow-xl shadow-primary/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-white/20 transition-all"></div>
                                <h3 className="text-lg font-black text-white tracking-tight relative z-10">Quick Actions</h3>
                                <div className="space-y-3 relative z-10">
                                    <Button className="w-full justify-start gap-3 rounded-2xl h-14 bg-white/10 hover:bg-white/20 text-white font-bold border-none transition-all active:scale-[0.98]">
                                        <MessageSquare size={20} fill="currentColor" />
                                        Message Parents
                                    </Button>
                                    <Button className="w-full justify-start gap-3 rounded-2xl h-14 bg-white/10 hover:bg-white/20 text-white font-bold border-none transition-all active:scale-[0.98]">
                                        <Plus size={20} />
                                        Create Resource
                                    </Button>
                                </div>
                            </div>

                            {/* Upcoming Events / Notes */}
                            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-8">
                                <h3 className="text-lg font-black text-gray-900 tracking-tight mb-4">Note to Self</h3>
                                <div className="bg-yellow-50/50 border border-yellow-100 p-4 rounded-2xl">
                                    <p className="text-sm text-gray-700 font-medium leading-relaxed">
                                        Check in with Arjun's parents regarding his sudden drop in engagement during the Science lab.
                                    </p>
                                    <div className="mt-3 flex items-center gap-2 text-[10px] font-black text-yellow-600 uppercase tracking-widest">
                                        <Clock size={12} />
                                        Set 2h ago
                                    </div>
                                </div>
                                <Button variant="ghost" className="w-full mt-4 text-xs font-black text-primary uppercase tracking-widest hover:bg-primary/5 rounded-xl">
                                    See all notes
                                </Button>
                            </Card>

                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
