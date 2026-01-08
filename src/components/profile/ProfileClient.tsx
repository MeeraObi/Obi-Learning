"use client"
import { Student } from '@/types';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import { useState } from 'react';
import { differenceInYears } from 'date-fns';
import { User, Mail, Phone, Building, Shield, Settings, Edit2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import ScheduleManager from './ScheduleManager';
import { ScheduleItem } from '@/app/dashboard/schedule-actions';

interface ProfileClientProps {
    user: {
        name: string;
        email: string;
        phone: string;
        institution: string;
        role: string;
    };
    initialChildren: any[];
    initialSchedule: ScheduleItem[];
}

export default function ProfileClient({ user, initialChildren, initialSchedule }: ProfileClientProps) {
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
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen w-full bg-white overflow-hidden font-sans relative">
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

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                                <User size={12} />
                                Personal Account
                            </div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Teacher Profile</h1>
                            <p className="text-gray-500 font-medium">Manage your personal information and contact details.</p>
                        </div>
                        <Button className="rounded-2xl h-14 px-8 font-black gap-2 shadow-lg shadow-primary/20">
                            <Edit2 size={20} />
                            Edit Profile
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Profile Header Card */}
                        <div className="lg:col-span-1 space-y-10">
                            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white border border-gray-50 overflow-hidden">
                                <CardContent className="p-10 flex flex-col items-center text-center">
                                    <Avatar className="h-32 w-32 border-4 border-white shadow-xl mb-6">
                                        <AvatarFallback className="bg-primary text-white text-3xl font-black">
                                            {user.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h2 className="text-2xl font-black text-gray-900 mb-1">{user.name}</h2>
                                    <p className="text-primary font-bold text-sm mb-6 uppercase tracking-widest">{user.role}</p>
                                    <div className="w-full pt-6 border-t border-gray-50 space-y-4 text-left">
                                        <div className="flex items-center gap-4 text-gray-500">
                                            <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                                                <Building size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Institution</p>
                                                <p className="text-sm font-bold text-gray-900">{user.institution}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-4">
                                <Button variant="outline" className="w-full justify-start gap-3 h-14 rounded-2xl font-bold border-gray-100 hover:bg-gray-50">
                                    <Shield className="w-5 h-5 text-gray-400" />
                                    Privacy Preferences
                                </Button>
                                <Button variant="outline" className="w-full justify-start gap-3 h-14 rounded-2xl font-bold border-gray-100 hover:bg-gray-50">
                                    <Settings className="w-5 h-5 text-gray-400" />
                                    Account Preferences
                                </Button>
                            </div>
                        </div>

                        {/* Contact & Schedule */}
                        <div className="lg:col-span-2 space-y-10">
                            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white border border-gray-50 overflow-hidden">
                                <CardHeader className="p-10 pb-0">
                                    <CardTitle className="text-xl font-black text-gray-900">Contact Details & Account Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="p-10 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                                    <Mail size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Email Address</p>
                                                    <p className="text-base font-bold text-gray-900">{user.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                                                    <Phone size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Phone Number</p>
                                                    <p className="text-base font-bold text-gray-900">{user.phone}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-gray-50">
                                        <h3 className="text-sm font-black text-gray-900 mb-4 uppercase tracking-widest">About Teacher</h3>
                                        <p className="text-gray-500 font-medium leading-relaxed">
                                            Passionate educator with a focus on personalized learning trails and AI-driven pedagogical orchestration. Dedicated to fostering an environment where every student can manifest their unique potential through tailored cognitive pathways.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <ScheduleManager initialSchedule={initialSchedule} />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
