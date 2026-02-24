'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import { BookOpen, FlaskConical, ChevronRight, GraduationCap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ClassesCalendar from '@/components/students/StudentsCalendar';
import { ScheduleItem } from '@/types';

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

const subjectLooks: Record<string, { color: string; bgColor: string; icon: React.ElementType }> = {
    'Mathematics': { color: 'text-blue-600', bgColor: 'bg-blue-50', icon: BookOpen },
    'Science': { color: 'text-green-600', bgColor: 'bg-green-50', icon: FlaskConical },
    'English': { color: 'text-purple-600', bgColor: 'bg-purple-50', icon: BookOpen },
    'Social Science': { color: 'text-orange-600', bgColor: 'bg-orange-50', icon: GraduationCap },
    'Hindi': { color: 'text-red-600', bgColor: 'bg-red-50', icon: BookOpen },
    'Universal Science': { color: 'text-emerald-600', bgColor: 'bg-emerald-50', icon: FlaskConical },
    'Mathematics (Basic)': { color: 'text-cyan-600', bgColor: 'bg-cyan-50', icon: BookOpen },
    'Mathematics (Standard)': { color: 'text-blue-700', bgColor: 'bg-blue-100', icon: BookOpen },
};

const getSubjectLook = (name: string) => {
    return subjectLooks[name] || { color: 'text-gray-600', bgColor: 'bg-gray-50', icon: BookOpen };
};

interface ClassesClientProps {
    user: {
        name: string;
        email: string;
    };
    initialChildren?: any[];
    initialSchedule: ScheduleItem[];
    initialClasses: any[];
    fullSyllabus: Record<string, any>;
}

import { useSearchParams, useRouter } from 'next/navigation';
import WeeklyPlanView from '@/components/weekly-plan/WeeklyPlanView';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ... imports ...

export default function ClassesClient({ user, initialChildren = [], initialSchedule, initialClasses, fullSyllabus }: ClassesClientProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const [view, setView] = useState<'overview' | 'planner'>(searchParams.get('view') === 'planner' ? 'planner' : 'overview');

    // Get subject from URL
    const subjectId = searchParams.get('subject');
    // Get registered classes from students' profiles with divisions
    const allClasses = React.useMemo(() => {
        const registered = Array.from(new Set(initialClasses.map(c => `Class ${c.standard} - Div ${c.division}`)));
        return registered.sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)?.[0] || '0');
            const numB = parseInt(b.match(/\d+/)?.[0] || '0');
            if (numA !== numB) return numA - numB;
            return a.localeCompare(b);
        });
    }, [initialClasses]);

    const [selectedClass, setSelectedClass] = useState<string>(
        searchParams.get('class') || allClasses[0] || 'Class 10 - Div A'
    );
    const [selectedSubjectName, setSelectedSubjectName] = useState<string>('Mathematics');

    // Get subjects for the selected class (extracting base standard like "Class 7")
    const subjectsForClass = React.useMemo(() => {
        const standardKey = selectedClass.split(' - ')[0];
        const classSyllabus = fullSyllabus[standardKey] || {};
        return Object.keys(classSyllabus).sort();
    }, [fullSyllabus, selectedClass]);

    // Auto-select a valid subject if currently selected subject is not in the new class
    useEffect(() => {
        if (selectedClass && !subjectsForClass.includes(selectedSubjectName)) {
            if (subjectsForClass.length > 0) {
                setSelectedSubjectName(subjectsForClass[0]);
            }
        }
    }, [selectedClass, subjectsForClass, selectedSubjectName]);


    // Dynamically generate subjects based on selected class
    const standardKey = selectedClass.split(' - ')[0];
    const classSyllabus = fullSyllabus[standardKey] || {};
    const subjects: Subject[] = React.useMemo(() => Object.keys(classSyllabus).map(subjectName => {
        const look = getSubjectLook(subjectName);
        return {
            id: subjectName.toLowerCase().replace(/\s+/g, '-'),
            name: subjectName,
            color: look.color,
            bgColor: look.bgColor,
            icon: React.createElement(look.icon as any),
            syllabus: {
                units: classSyllabus[subjectName].map((chapter: any) => ({
                    title: chapter.chapter_name,
                    topics: chapter.topics.map((t: any) => t.topic_name)
                }))
            }
        };
    }), [classSyllabus]);

    const selectedSubject = React.useMemo(() => {
        if (!subjectId) return null;
        return subjects.find(s => s.id === subjectId) || null;
    }, [subjects, subjectId]);

    // Update selectedSubjectName when a subject is active via URL
    useEffect(() => {
        if (selectedSubject) {
            setSelectedSubjectName(selectedSubject.name);
        }
    }, [selectedSubject]);

    const subjectParam = searchParams.get('subject');
    const [plannerSubject, setPlannerSubject] = useState<string>(subjectParam || 'Mathematics');

    useEffect(() => {
        if (subjectParam) {
            setPlannerSubject(subjectParam);
        }
    }, [subjectParam]);

    const mode = searchParams.get('mode');
    const classIdParam = searchParams.get('classId');
    const isWeeklyMode = mode === 'weekly' && classIdParam;

    // Derived state for planner
    const currentView = isWeeklyMode ? 'planner' : view;

    // Determine active class for planner
    const dbClassNames = initialClasses.map(c => `${c.standard}-${c.division}`);
    const scheduleClassNames = initialSchedule.map(s => s.class_name);
    const availableClasses = Array.from(new Set([...dbClassNames, ...scheduleClassNames])).sort();
    const activeClassId = classIdParam || availableClasses[0] || '';

    // Standard extractor for syllabus lookup
    const standardMatch = activeClassId.match(/(\d+)/);
    const standard = standardMatch ? `Class ${standardMatch[1]}` : '';

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
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Classes</h1>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Classroom Overview & Planner</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                <SelectTrigger className="w-[180px] rounded-xl font-bold border-gray-100 shadow-sm bg-white">
                                    <SelectValue placeholder="Class" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                                    {allClasses.map(cls => (
                                        <SelectItem key={cls} value={cls} className="font-medium">
                                            {cls}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedSubjectName} onValueChange={(val) => {
                                setSelectedSubjectName(val);
                                const found = subjects.find(s => s.name === val);
                                if (found) {
                                    const params = new URLSearchParams(searchParams);
                                    params.set('subject', found.id);
                                    router.push(`?${params.toString()}`);
                                }
                            }}>
                                <SelectTrigger className="w-[180px] rounded-xl font-bold border-gray-100 shadow-sm bg-white">
                                    <SelectValue placeholder="Subject" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                                    {subjectsForClass.map(sub => (
                                        <SelectItem key={sub} value={sub} className="font-medium">
                                            {sub}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {!selectedSubject && (
                        <div className="flex items-center justify-between">
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
                                    Scope & Sequence
                                </button>
                            </div>
                        </div>
                    )}

                    {currentView === 'planner' ? (
                        <div className="space-y-6">
                            <WeeklyPlanView
                                classId={activeClassId}
                                schedule={initialSchedule}
                                selectedSubject={plannerSubject}
                                onSubjectChange={setPlannerSubject}
                                students={initialChildren}
                                fullSyllabus={fullSyllabus}
                            />
                        </div>
                    ) : selectedSubject ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    className="rounded-xl font-bold bg-white shadow-sm border border-gray-100 hover:bg-gray-50"
                                    onClick={() => {
                                        const params = new URLSearchParams(searchParams);
                                        params.delete('subject');
                                        router.push(`?${params.toString()}`);
                                    }}
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
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {subjects.map((subject) => (
                                    <Card
                                        key={subject.id}
                                        className="rounded-2xl border-none shadow-sm hover:shadow-lg transition-all bg-white border border-gray-50 overflow-hidden group cursor-pointer active:scale-95"
                                        onClick={() => {
                                            const params = new URLSearchParams(searchParams);
                                            params.set('subject', subject.id);
                                            router.push(`?${params.toString()}`);
                                        }}
                                    >
                                        <CardContent className="p-5">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className={`h-10 w-10 rounded-xl ${subject.bgColor} ${subject.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                                    {React.cloneElement(subject.icon as any, { size: 18 })}
                                                </div>
                                                <ChevronRight className={`${subject.color} opacity-0 group-hover:opacity-100 transition-opacity`} size={16} />
                                            </div>
                                            <h3 className="text-lg font-black text-gray-900 mb-0.5 line-clamp-1">{subject.name}</h3>
                                            <p className="text-[8px] font-bold text-gray-400 mb-3 uppercase tracking-wider">Subject Curriculum</p>

                                            <div className="space-y-2 pt-3 border-t border-gray-50">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-medium text-gray-600">Total Topics</span>
                                                    <span className={`text-sm font-black ${subject.color}`}>{subject.syllabus.units.length}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-medium text-gray-600">Subtopics Covered</span>
                                                    <span className={`text-sm font-black ${subject.color}`}>
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
                        </div>
                    )}
                </main>
            </div >
        </div >
    );
}
