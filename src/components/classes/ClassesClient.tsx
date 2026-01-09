'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import { BookOpen, FlaskConical, ChevronRight, GraduationCap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ClassesCalendar from '@/components/students/StudentsCalendar';
import { ScheduleItem } from '@/app/dashboard/schedule-actions';

interface Subject {
    id: string;
    name: string;
    color: string;
    bgColor: string;
    icon: React.ReactNode;
    syllabus: {
        units: Array<{
            title: string;
            topics: string[];
        }>;
    };
}

const subjects: Subject[] = [
    {
        id: 'maths',
        name: 'Mathematics',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        icon: <BookOpen size={32} strokeWidth={2.5} />,
        syllabus: {
            units: [
                {
                    title: 'A Square and a Cube',
                    topics: [
                        'Squares and Square Roots',
                        'Cubes and Cube Roots',
                        'Estimating Roots',
                        'Patterns in Squares and Cubes'
                    ]
                },
                {
                    title: 'Power Play',
                    topics: [
                        'Exponents and Powers',
                        'Negative Exponents',
                        'Scientific Notation',
                        'Laws of Exponents'
                    ]
                },
                {
                    title: 'A Story of Numbers',
                    topics: [
                        'Number Systems',
                        'Rational Numbers',
                        'Comparing and Ordering Numbers'
                    ]
                },
                {
                    title: 'Quadrilaterals',
                    topics: [
                        'Types of Quadrilaterals',
                        'Properties of Quadrilaterals',
                        'Special Quadrilaterals'
                    ]
                },
                {
                    title: 'Number Play',
                    topics: [
                        'Factors and Multiples',
                        'Divisibility Rules',
                        'Prime and Composite Numbers'
                    ]
                },
                {
                    title: 'We Distribute, Yet Things Multiply',
                    topics: [
                        'Algebraic Expressions',
                        'Algebraic Identities',
                        'Distributive Property'
                    ]
                },
                {
                    title: 'Proportional Reasoning – I',
                    topics: [
                        'Ratio and Proportion',
                        'Direct Variation',
                        'Inverse Variation'
                    ]
                }
            ]
        }
    },
    {
        id: 'science',
        name: 'Science',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: <FlaskConical size={32} strokeWidth={2.5} />,
        syllabus: {
            units: [
                {
                    title: 'Exploring the Investigative World of Science',
                    topics: ['Exploring the Investigative World of Science']
                },
                {
                    title: 'The Invisible Living World: Beyond Our Naked Eye',
                    topics: [
                        'What is a Cell?',
                        'Levels of Organisation in Living Organisms',
                        'Microorganisms',
                        'Connection Between Humans and Microbes',
                        'Cell as the Basic Unit of Life'
                    ]
                },
                {
                    title: 'Health: The Ultimate Treasure',
                    topics: [
                        'Concept of Health',
                        'Ways to Stay Healthy',
                        'Identifying Illness',
                        'Diseases: Causes and Types',
                        'Prevention and Control of Diseases'
                    ]
                },
                {
                    title: 'Electricity: Magnetic and Heating Effect',
                    topics: [
                        'Magnetic Effect of Electric Current',
                        'Heating Effect of Electric Current',
                        'Electricity from Batteries'
                    ]
                },
                {
                    title: 'Exploring Forces',
                    topics: [
                        'What is a Force?',
                        'Effects of Force',
                        'Forces as Interactions',
                        'Types of Forces',
                        'Weight and Its Measurement',
                        'Floating and Sinking'
                    ]
                },
                {
                    title: 'Pressure, Winds, Storms, and Cyclones',
                    topics: [
                        'Pressure',
                        'Pressure Exerted by Air',
                        'Formation of Wind',
                        'High-Speed Winds and Low Pressure',
                        'Storms and Thunderstorms',
                        'Cyclones'
                    ]
                },
                {
                    title: 'Particulate Nature of Matter',
                    topics: [
                        'Composition of Matter',
                        'States of Matter',
                        'Interparticle Spacing',
                        'Movement of Particles'
                    ]
                },
                {
                    title: 'Nature of Matter: Elements, Compounds and Mixtures',
                    topics: [
                        'Mixtures',
                        'Pure Substances',
                        'Types of Pure Substances'
                    ]
                },
                {
                    title: 'The Amazing World of Solutes, Solvents and Solutions',
                    topics: [
                        'Solute, Solvent and Solution',
                        'Solubility',
                        'Solubility of Gases',
                        'Floating and Sinking in Liquids',
                        'Density'
                    ]
                },
                {
                    title: 'Light: Mirrors and Lenses',
                    topics: [
                        'Spherical Mirrors',
                        'Images Formed by Spherical Mirrors',
                        'Laws of Reflection',
                        'Lenses'
                    ]
                },
                {
                    title: 'Keeping Time with the Skies',
                    topics: [
                        'Phases of the Moon',
                        'Origin of Calendars',
                        'Astronomy and Festivals',
                        'Artificial Satellites'
                    ]
                },
                {
                    title: 'How Nature Works in Harmony',
                    topics: [
                        'Our Surroundings and Perception',
                        'Living Together in Nature',
                        'Interactions Among Organisms',
                        'Food Chains and Food Webs',
                        'Balance in Ecosystems'
                    ]
                }
            ]
        }
    }
];

interface ClassesClientProps {
    user: {
        name: string;
        email: string;
    };
    initialChildren?: any[];
    initialSchedule: ScheduleItem[];
}

import { useSearchParams, useRouter } from 'next/navigation';
import WeeklyPlanView from '@/components/weekly-plan/WeeklyPlanView';

// ... imports ...

export default function ClassesClient({ user, initialChildren = [], initialSchedule }: ClassesClientProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [view, setView] = useState<'overview' | 'planner'>('overview');
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();

    const subjectParam = searchParams.get('subject');
    const [plannerSubject, setPlannerSubject] = useState<'Mathematics' | 'Science'>((subjectParam === 'Mathematics' || subjectParam === 'Science') ? subjectParam : 'Mathematics');

    const mode = searchParams.get('mode');
    const classIdParam = searchParams.get('classId');
    const isWeeklyMode = mode === 'weekly' && classIdParam;

    // Derived state for planner
    const currentView = isWeeklyMode ? 'planner' : view;

    // Determine active class for planner
    const availableClasses = Array.from(new Set(initialSchedule.map(s => s.class_name)));
    const activeClassId = classIdParam || availableClasses[0] || '8-A';

    return (
        <div className="flex h-screen w-full bg-white overflow-hidden font-sans relative">
            <Sidebar
                studentsList={initialChildren}
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
                    {/* View Switcher Tabs */}
                    {!selectedSubject && (
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-1 bg-gray-100/80 p-1 rounded-xl w-fit">
                                <button
                                    onClick={() => {
                                        setView('overview');
                                        router.push('/classes'); // Reset URL params
                                    }}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${currentView === 'overview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Overview
                                </button>
                                <button
                                    onClick={() => setView('planner')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${currentView === 'planner' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Daily Planner
                                </button>
                            </div>

                            {currentView === 'planner' && (
                                <div className="flex items-center space-x-1 bg-gray-100/80 p-1 rounded-xl w-fit">
                                    <Button
                                        variant={plannerSubject === 'Mathematics' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setPlannerSubject('Mathematics')}
                                        className={`px-4 h-9 rounded-lg font-bold transition-all ${plannerSubject === 'Mathematics' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Math
                                    </Button>
                                    <Button
                                        variant={plannerSubject === 'Science' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setPlannerSubject('Science')}
                                        className={`px-4 h-9 rounded-lg font-bold transition-all ${plannerSubject === 'Science' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        Science
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {currentView === 'planner' ? (
                        <div className="space-y-6">
                            {/* Class Selector for Planner */}
                            <div className="flex items-center gap-4 mb-4">
                                <label className="text-sm font-bold text-gray-500">Select Class:</label>
                                <div className="flex gap-2">
                                    {availableClasses.map(cls => (
                                        <Button
                                            key={cls}
                                            variant={cls === activeClassId ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => {
                                                const params = new URLSearchParams(searchParams);
                                                params.set('mode', 'weekly');
                                                params.set('classId', cls);
                                                router.push(`?${params.toString()}`);
                                            }}
                                            className="rounded-lg"
                                        >
                                            {cls}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <WeeklyPlanView
                                classId={activeClassId}
                                schedule={initialSchedule}
                                selectedSubject={plannerSubject}
                                onSubjectChange={setPlannerSubject}
                                students={initialChildren}
                            />
                        </div>
                    ) : selectedSubject ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* ... existing selectedSubject content ... */}
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    className="rounded-xl font-bold bg-white shadow-sm border border-gray-100 hover:bg-gray-50"
                                    onClick={() => setSelectedSubject(null)}
                                >
                                    <ChevronRight className="rotate-180" size={18} />
                                    Back to Subjects
                                </Button>
                                <div className="h-8 w-[2px] bg-gray-200 rounded-full mx-2" />
                                <div className="flex items-center gap-3">
                                    <div className={`h-12 w-12 rounded-2xl ${selectedSubject.bgColor} ${selectedSubject.color} flex items-center justify-center`}>
                                        {selectedSubject.icon}
                                    </div>
                                    <div className="flex flex-col">
                                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">{selectedSubject.name}</h1>
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Topic Explorer</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-6">
                                {selectedSubject.syllabus.units.map((unit, idx) => (
                                    <Card key={idx} className="rounded-[2rem] border-none shadow-sm hover:shadow-md transition-all bg-white border border-gray-50 overflow-hidden">
                                        <CardContent className="p-8">
                                            <div className="flex items-start gap-6">
                                                <div className="flex-shrink-0">
                                                    <div className={`h-16 w-16 rounded-2xl ${selectedSubject.bgColor} ${selectedSubject.color} flex items-center justify-center font-black text-2xl`}>
                                                        {idx + 1}
                                                    </div>
                                                </div>
                                                <div className="flex-1 space-y-4">
                                                    <div>
                                                        <h3 className="text-2xl font-black text-gray-900 mb-2">{unit.title}</h3>
                                                        <Badge variant="outline" className={`rounded-xl border-gray-100 ${selectedSubject.color} font-black text-[10px] uppercase px-3 py-1 ${selectedSubject.bgColor}`}>
                                                            {unit.topics.length} Subtopics
                                                        </Badge>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {unit.topics.map((topic, topicIdx) => (
                                                            <div key={topicIdx} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50/50 transition-colors">
                                                                <div className="flex-shrink-0 mt-1">
                                                                    <div className="h-2 w-2 rounded-full bg-gray-300" />
                                                                </div>
                                                                <p className="text-sm font-medium text-gray-700 leading-relaxed">{topic}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                                    <GraduationCap size={12} />
                                    Curriculum Overview
                                </div>
                                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Classes</h1>
                                <p className="text-gray-500 font-medium">Explore subject syllabuses and learning objectives.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {subjects.map((subject) => (
                                    <Card
                                        key={subject.id}
                                        className="rounded-[2.5rem] border-none shadow-sm hover:shadow-xl transition-all bg-white border border-gray-50 overflow-hidden group cursor-pointer active:scale-95"
                                        onClick={() => setSelectedSubject(subject)}
                                    >
                                        <CardContent className="p-10">
                                            <div className="flex items-center justify-between mb-8">
                                                <div className={`h-20 w-20 rounded-2xl ${subject.bgColor} ${subject.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                    {subject.icon}
                                                </div>
                                                <ChevronRight className={`${subject.color} opacity-0 group-hover:opacity-100 transition-opacity`} size={24} />
                                            </div>
                                            <h3 className="text-3xl font-black text-gray-900 mb-2">{subject.name}</h3>
                                            <p className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-wider">Subject Curriculum</p>

                                            <div className="space-y-4 pt-6 border-t border-gray-50">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-600">Total Topics</span>
                                                    <span className={`text-lg font-black ${subject.color}`}>{subject.syllabus.units.length}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-600">Subtopics Covered</span>
                                                    <span className={`text-lg font-black ${subject.color}`}>
                                                        {subject.syllabus.units.reduce((acc, unit) => acc + unit.topics.length, 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <ClassesCalendar
                                schedule={initialSchedule}
                                onClassClick={(className) => {
                                    const params = new URLSearchParams(searchParams);
                                    params.set('mode', 'weekly');
                                    params.set('classId', className);
                                    router.push(`?${params.toString()}`);
                                }}
                            />
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
