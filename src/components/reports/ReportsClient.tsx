'use client';

import { Student } from '@/types';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import { useState } from 'react';
import { differenceInYears } from 'date-fns';
import { BarChart3, PieChart, TrendingUp, Download, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ReportsClientProps {
    user: {
        name: string;
        email: string;
    };
    initialChildren: any[];
}

export default function ReportsClient({ user, initialChildren }: ReportsClientProps) {
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

    return (
        <div className="flex h-screen w-full bg-white overflow-hidden font-sans">
            <Sidebar
                studentsList={students}
                user={user}
            />

            <div className="flex-1 flex flex-col min-w-0 bg-[#fbfbfc]">
                <TopBar selectedStudent={undefined} user={user} />

                <main className="flex-1 overflow-y-auto p-10 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                                <BarChart3 size={12} />
                                Analytics & Insights
                            </div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Intelligence Reports</h1>
                            <p className="text-gray-500 font-medium">Manifest learning outcomes through data-driven visualization.</p>
                        </div>
                        <div className="flex gap-4">
                            <Button variant="outline" className="rounded-2xl h-14 px-6 font-bold gap-2 border-gray-100">
                                <Calendar size={18} />
                                Last 30 Days
                            </Button>
                            <Button className="rounded-2xl h-14 px-8 font-black gap-2 shadow-lg shadow-primary/20">
                                <Download size={20} />
                                Export All
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: 'Avg. Mastery', value: '78%', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
                            { label: 'Active Trails', value: '24', icon: PieChart, color: 'text-purple-600', bg: 'bg-purple-50' },
                            { label: 'Completion Rate', value: '92%', icon: BarChart3, color: 'text-cyan-600', bg: 'bg-cyan-50' }
                        ].map((stat, i) => (
                            <Card key={i} className="rounded-[2rem] border-none shadow-sm bg-white border border-gray-50">
                                <CardContent className="p-8 flex items-center gap-6">
                                    <div className={`${stat.bg} ${stat.color} h-16 w-16 rounded-2xl flex items-center justify-center`}>
                                        <stat.icon size={28} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
                                        <p className="text-3xl font-black text-gray-900">{stat.value}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className="rounded-[2.5rem] border-none shadow-sm bg-white border border-gray-50 overflow-hidden">
                        <CardHeader className="p-10 pb-0 flex flex-row items-center justify-between">
                            <CardTitle className="text-xl font-black text-gray-900">Learning Progress Velocity</CardTitle>
                            <div className="flex gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-primary"></div>
                                    <span className="text-xs font-bold text-gray-400">Mastery</span>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <div className="h-3 w-3 rounded-full bg-blue-100"></div>
                                    <span className="text-xs font-bold text-gray-400">Target</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10 pt-8">
                            <div className="h-64 w-full bg-gray-50 rounded-[2rem] flex items-end justify-between p-8 gap-4">
                                {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                    <div key={i} className="flex-1 bg-primary/20 rounded-t-xl relative group cursor-pointer hover:bg-primary/30 transition-all" style={{ height: `${h}%` }}>
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            {h}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-6 px-4">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                    <span key={day} className="text-xs font-black text-gray-400 uppercase tracking-widest">{day}</span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}
