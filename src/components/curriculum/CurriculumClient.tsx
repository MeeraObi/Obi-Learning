'use client';

import { Student } from '@/types';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import { useState } from 'react';
import { differenceInYears } from 'date-fns';
import { Book, Search, Filter, BookOpen, ChevronRight, Rocket } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CurriculumClientProps {
    user: {
        name: string;
        email: string;
    };
    initialChildren: any[];
    syllabus: any;
}

export default function CurriculumClient({ user, initialChildren, syllabus }: CurriculumClientProps) {
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
    const [selectedBoard, setSelectedBoard] = useState<string | null>(null);
    const [selectedAgeBand, setSelectedAgeBand] = useState<string | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const boards = Object.keys(syllabus);
    const ageBands = selectedBoard ? Object.keys(syllabus[selectedBoard] || {}) : [];
    const subjects = (selectedBoard && selectedAgeBand) ? Object.keys(syllabus[selectedBoard][selectedAgeBand] || {}) : [];
    const rawData = (selectedBoard && selectedAgeBand && selectedSubject) ? (syllabus[selectedBoard][selectedAgeBand][selectedSubject] || []) : [];

    const filteredData = rawData.map((chapter: any) => {
        if (typeof chapter === 'string') {
            if (chapter.toLowerCase().includes(searchQuery.toLowerCase())) return chapter;
            return null;
        }
        const filteredSubtopics = chapter.topics.filter((t: any) =>
            t.topic_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        // Show chapter if it matches search OR if any of its topics match
        if (filteredSubtopics.length > 0 || chapter.chapter_name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return { ...chapter, topics: filteredSubtopics.length > 0 ? filteredSubtopics : chapter.topics };
        }
        return null;
    }).filter(Boolean);

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
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                            <Book size={12} />
                            Academic Orchestration
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Curriculum Explorer</h1>
                        <p className="text-gray-500 font-medium">Navigate through global educational standards and manifest learning paths.</p>
                    </div>

                    {/* Breadcrumbs / Selection Header */}
                    <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm">
                        <Button
                            variant={!selectedBoard ? "default" : "ghost"}
                            onClick={() => { setSelectedBoard(null); setSelectedAgeBand(null); setSelectedSubject(null); }}
                            className="rounded-xl font-bold"
                        >
                            All Boards
                        </Button>
                        {selectedBoard && (
                            <>
                                <ChevronRight className="h-4 w-4 text-gray-300" />
                                <Button
                                    variant={!selectedAgeBand ? "default" : "ghost"}
                                    onClick={() => { setSelectedAgeBand(null); setSelectedSubject(null); }}
                                    className="rounded-xl font-bold"
                                >
                                    {selectedBoard}
                                </Button>
                            </>
                        )}
                        {selectedAgeBand && (
                            <>
                                <ChevronRight className="h-4 w-4 text-gray-300" />
                                <Button
                                    variant={!selectedSubject ? "default" : "ghost"}
                                    onClick={() => { setSelectedSubject(null); }}
                                    className="rounded-xl font-bold"
                                >
                                    {selectedAgeBand}
                                </Button>
                            </>
                        )}
                        {selectedSubject && (
                            <>
                                <ChevronRight className="h-4 w-4 text-gray-300" />
                                <Badge className="bg-primary/10 text-primary border-none text-sm px-4 py-2 rounded-xl font-bold">
                                    {selectedSubject}
                                </Badge>
                            </>
                        )}
                    </div>

                    {!selectedBoard ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {boards.map((board) => (
                                <Card
                                    key={board}
                                    className="rounded-[2.5rem] border-none shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer bg-white group"
                                    onClick={() => setSelectedBoard(board)}
                                >
                                    <CardContent className="p-8">
                                        <div className="bg-primary/5 text-primary w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                                            <BookOpen size={24} strokeWidth={2.5} />
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900 mb-2">{board}</h3>
                                        <p className="text-sm font-medium text-gray-400 mb-6">Standardized educational framework with structured learning outcomes.</p>
                                        <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-primary">
                                            <span>Explore</span>
                                            <ChevronRight size={16} />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : !selectedAgeBand ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {ageBands.map((band) => (
                                <Card
                                    key={band}
                                    className="rounded-[2.5rem] border-none shadow-sm hover:shadow-xl transition-all cursor-pointer bg-white"
                                    onClick={() => setSelectedAgeBand(band)}
                                >
                                    <CardContent className="p-8 flex items-center justify-between group">
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors">{band}</h3>
                                            <p className="text-sm font-medium text-gray-400">View subjects for this stage</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary/5 group-hover:text-primary transition-all">
                                            <ChevronRight size={20} />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : !selectedSubject ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {subjects.map((sub) => (
                                <Card
                                    key={sub}
                                    className="rounded-[2rem] border-none shadow-sm hover:shadow-xl transition-all cursor-pointer bg-white"
                                    onClick={() => setSelectedSubject(sub)}
                                >
                                    <CardContent className="p-8">
                                        <h3 className="text-lg font-black text-gray-900 mb-4">{sub}</h3>
                                        <Badge variant="outline" className="rounded-lg bg-gray-50 text-gray-400 font-bold border-gray-100 text-[10px] uppercase">
                                            {(() => {
                                                const rawSub = syllabus[selectedBoard][selectedAgeBand][sub] || [];
                                                if (Array.isArray(rawSub) && rawSub.length > 0 && typeof rawSub[0] === 'object') {
                                                    return rawSub.reduce((acc: number, chap: any) => acc + (chap.topics?.length || 0), 0);
                                                }
                                                return rawSub.length;
                                            })()} Subtopics
                                        </Badge>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder={`Search topics in ${selectedSubject}...`}
                                        className="h-14 pl-12 rounded-2xl bg-white border-gray-100 shadow-sm"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-12">
                                {filteredData.length > 0 ? (
                                    filteredData.map((item: any, i: number) => (
                                        <div key={item.chapter_id || i} className="space-y-6">
                                            {typeof item === 'object' ? (
                                                <>
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-black">
                                                            {item.chapter_no || i + 1}
                                                        </div>
                                                        <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">{item.chapter_name}</h3>
                                                    </div>

                                                    <div className="space-y-4 border-l-2 border-gray-100 ml-5 pl-8">
                                                        {item.topics.map((topic: any, tIndex: number) => (
                                                            <Card key={topic.topic_id || tIndex} className="shadow-sm border-none rounded-[2rem] overflow-hidden bg-white hover:shadow-md transition-all">
                                                                <CardHeader className="p-6 flex flex-row items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center font-black text-xs text-primary">
                                                                            {tIndex + 1}
                                                                        </div>
                                                                        <div className="text-left">
                                                                            <h4 className="text-lg font-black text-gray-900">{topic.topic_name}</h4>
                                                                            <div className="flex items-center gap-2 mt-1">
                                                                                <Badge variant="outline" className="text-[9px] font-bold uppercase rounded-md py-0">{topic.difficulty}</Badge>
                                                                                <span className="text-[10px] text-gray-400 font-bold">{topic.estimated_minutes} mins</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <ChevronRight className="h-5 w-5 text-gray-400" />
                                                                </CardHeader>
                                                            </Card>
                                                        ))}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="p-8 bg-white rounded-[2rem] border border-gray-100 flex items-center gap-6">
                                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-gray-300">
                                                        {i + 1}
                                                    </div>
                                                    <h4 className="text-xl font-black text-gray-900">{item}</h4>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-20 text-center text-gray-400 font-medium bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                                        No topics found matching your search.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-[2.5rem] p-12 border border-blue-50 relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
                        <div className="relative z-10 max-w-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <Rocket className="h-5 w-5 text-primary" />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900">Dynamic Syllabus Integration</h2>
                            </div>
                            <p className="text-gray-500 font-medium leading-relaxed">
                                Our curriculum module is directly integrated with global educational standards. Any selection here influences the AI learning trail generation for your students. Choose a topic to manifest a personalized hands-on adventure.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
