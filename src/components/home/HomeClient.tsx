'use client';

import { Student } from '@/types';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import { useState } from 'react';
import { differenceInYears } from 'date-fns';
import { WelcomeHero } from '@/components/home/WelcomeHero';
import { QuickActions } from '@/components/home/QuickActions';
import { RecentActivity } from '@/components/home/RecentActivity';

interface HomeClientProps {
    user: {
        name: string;
        email: string;
    };
    initialChildren: any[];
}

export default function HomeClient({ user, initialChildren }: HomeClientProps) {
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

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 space-y-10">
                    <WelcomeHero name={user.name} />
                    <QuickActions />
                    <RecentActivity students={students} />
                </main>
            </div>
        </div>
    );
}
