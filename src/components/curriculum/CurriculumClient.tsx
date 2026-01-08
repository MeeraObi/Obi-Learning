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

    const boards = Object.keys(syllabus);
    const ageBands = selectedBoard ? Object.keys(syllabus[selectedBoard] || {}) : [];
    const subjects = (selectedBoard && selectedAgeBand) ? Object.keys(syllabus[selectedBoard][selectedAgeBand] || {}) : [];
    const topics = (selectedBoard && selectedAgeBand && selectedSubject) ? (syllabus[selectedBoard][selectedAgeBand][selectedSubject] || []) : [];

    const filteredTopics = topics.filter((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="flex h-screen w-full bg-white overflow-hidden font-sans">
            <Sidebar
                studentsList={students}
                user={user}
            />

            <div className="flex-1 flex flex-col min-w-0 bg-[#fbfbfc]">
                <TopBar selectedStudent={undefined} user={user} />

                <main className="flex-1 overflow-y-auto p-10 space-y-8">
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
                                            {syllabus[selectedBoard][selectedAgeBand][sub]?.length || 0} Topics
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

                            <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
                                <div className="divide-y divide-gray-50">
                                    {filteredTopics.length > 0 ? (
                                        filteredTopics.map((topic: string, i: number) => (
                                            <div key={i} className="p-8 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-gray-300 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                                                        {i + 1}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xl font-black text-gray-900">{topic}</h4>
                                                        <p className="text-sm font-medium text-gray-400">Core learning objective</p>
                                                    </div>
                                                </div>
                                                <Link href={`/trails?board=${encodeURIComponent(selectedBoard)}&subject=${encodeURIComponent(selectedSubject)}&topic=${encodeURIComponent(topic)}`}>
                                                    <Button className="rounded-xl bg-gray-900 hover:bg-primary text-white font-black flex gap-2 active:scale-95 transition-all">
                                                        <Rocket size={16} />
                                                        Generate Trail
                                                    </Button>
                                                </Link>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-20 text-center text-gray-400 font-medium">
                                            No topics found matching your search.
                                        </div>
                                    )}
                                </div>
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
