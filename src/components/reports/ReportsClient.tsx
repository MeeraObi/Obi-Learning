"use client"
import { Student } from '@/types';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, Download, Calendar, GraduationCap, ArrowUpRight, Activity, Filter, ChevronRight, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getStudentEvaluations } from '@/app/trails/actions';
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { mapStudentData } from '@/lib/mappers';

interface ReportsClientProps {
    user: {
        name: string;
        email: string;
    };
    initialChildren: any[];
    initialClasses: any[];
    initialStudentId?: string;
}

export default function ReportsClient({ user, initialChildren, initialClasses, initialStudentId }: ReportsClientProps) {
    const [students] = useState<Student[]>(mapStudentData(initialChildren));
    const [selectedClassId, setSelectedClassId] = useState<string>(() => {
        if (initialStudentId) {
            const student = mapStudentData(initialChildren).find(s => s.id === initialStudentId);
            if (student?.class_id) return student.class_id;
        }
        return initialClasses.length > 0 ? initialClasses[0].id : 'all';
    });
    const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>(initialStudentId);
    const [evaluations, setEvaluations] = useState<any[]>([]);
    const [stats, setStats] = useState({ maths: 0, science: 0, avg: 0, count: 0 });
    const [readiness, setReadiness] = useState<any>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const filteredStudents = selectedClassId === 'all'
        ? students
        : students.filter(s => s.class_id === selectedClassId);

    const selectedStudent = students.find(s => s.id === selectedStudentId);

    useEffect(() => {
        if (selectedStudentId) {
            const loadData = async () => {
                const evals = await getStudentEvaluations(selectedStudentId);
                setEvaluations(evals);

                // Calculate Stats
                let mTotal = 0, mCount = 0;
                let sTotal = 0, sCount = 0;
                let latestReadiness: any = null;

                evals.forEach((e: any) => {
                    if (e.subject === 'Mathematics') { mTotal += e.score; mCount++; }
                    if (e.subject === 'Science') { sTotal += e.score; sCount++; }
                    if (e.readiness_data && !latestReadiness) latestReadiness = e.readiness_data;
                });

                setStats({
                    maths: mCount ? Math.round(mTotal / mCount) : 0,
                    science: sCount ? Math.round(sTotal / sCount) : 0,
                    avg: evals.length ? Math.round((mTotal + sTotal) / evals.length) : 0,
                    count: evals.length
                });

                if (latestReadiness) setReadiness(latestReadiness);
            };
            loadData();
        } else {
            // Reset if no student selected
            setEvaluations([]);
            setStats({ maths: 0, science: 0, avg: 0, count: 0 });
            setReadiness(null);
        }
    }, [selectedStudentId]);

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
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                                <BarChart3 size={12} />
                                Analytics & Insights
                            </div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Intelligence Reports</h1>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:h-[calc(100vh-250px)]">
                        {/* LEFT COLUMN: Selection Panel */}
                        <div className="lg:col-span-3 flex flex-col gap-6 bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm overflow-hidden">
                            {/* Classes Selection */}
                            <div className="flex flex-col min-h-0 h-1/2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1 mb-3">Classes</label>
                                <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                                    {initialClasses.map((cls) => (
                                        <button
                                            key={cls.id}
                                            onClick={() => { setSelectedClassId(cls.id); setSelectedStudentId(undefined); }}
                                            className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group ${selectedClassId === cls.id
                                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${selectedClassId === cls.id ? 'bg-white/20 text-white' : 'bg-white text-gray-400'}`}>
                                                    {cls.name.charAt(0)}
                                                </div>
                                                <span className="text-sm font-bold truncate">{cls.name}</span>
                                            </div>
                                            {selectedClassId === cls.id && <ChevronRight size={16} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Students Selection */}
                            <div className="flex flex-col min-h-0 h-1/2 border-t border-gray-50 pt-6">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1 mb-3">
                                    Students ({filteredStudents.length})
                                </label>
                                <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                                    {filteredStudents.length === 0 ? (
                                        <div className="p-4 text-center text-gray-400 text-sm font-medium bg-gray-50 rounded-xl">
                                            No students found in this class
                                        </div>
                                    ) : (
                                        filteredStudents.map(student => (
                                            <button
                                                key={student.id}
                                                onClick={() => setSelectedStudentId(student.id)}
                                                className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group ${selectedStudentId === student.id
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                                                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${selectedStudentId === student.id ? 'bg-white/20 text-white' : 'bg-white text-gray-400'
                                                        }`}>
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold truncate max-w-[120px]">{student.name}</p>
                                                    </div>
                                                </div>
                                                {selectedStudentId === student.id && <ChevronRight size={16} />}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Report Content */}
                        <div className="lg:col-span-9 overflow-y-auto pr-2">
                            {!selectedStudent ? (
                                <div className="h-full flex flex-col items-center justify-center p-12 text-center border-4 border-dashed border-gray-100 rounded-[3rem] bg-gray-50/50">
                                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                                        <User size={40} className="text-gray-300" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-2">Select a Student</h3>
                                    <p className="text-gray-400 font-medium max-w-md">
                                        Choose a student from the list on the left to view their detailed performance report, academic proficiency, and readiness analysis.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Header for Report */}
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900">{selectedStudent.name}</h2>
                                            <p className="text-sm font-medium text-gray-500">
                                                {initialClasses.find(c => c.id === selectedStudent.class_id)?.name || 'Class 8'} • {selectedStudent.assessments?.length || 0} Assessments
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* Left Column: Proficiency */}
                                        <div className="lg:col-span-2 space-y-8">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <Card className="rounded-[2.5rem] border-none shadow-sm bg-white border border-gray-50">
                                                    <CardContent className="p-8 pb-6">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="bg-blue-50 text-blue-600 h-12 w-12 rounded-2xl flex items-center justify-center">
                                                                <TrendingUp size={20} strokeWidth={3} />
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Overall</span>
                                                        </div>
                                                        <div className="text-4xl font-black text-gray-900 mb-1">{stats.avg}%</div>
                                                        <p className="text-xs font-bold text-gray-400">Average Mastery</p>
                                                    </CardContent>
                                                </Card>
                                                <Card className="rounded-[2.5rem] border-none shadow-sm bg-white border border-gray-50">
                                                    <CardContent className="p-8 pb-6">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="bg-purple-50 text-purple-600 h-12 w-12 rounded-2xl flex items-center justify-center">
                                                                <PieChart size={20} strokeWidth={3} />
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Maths</span>
                                                        </div>
                                                        <div className="text-4xl font-black text-gray-900 mb-1">{stats.maths}%</div>
                                                        <p className="text-xs font-bold text-gray-400">Numeracy Score</p>
                                                    </CardContent>
                                                </Card>
                                                <Card className="rounded-[2.5rem] border-none shadow-sm bg-white border border-gray-50">
                                                    <CardContent className="p-8 pb-6">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="bg-cyan-50 text-cyan-600 h-12 w-12 rounded-2xl flex items-center justify-center">
                                                                <Activity size={20} strokeWidth={3} />
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Science</span>
                                                        </div>
                                                        <div className="text-4xl font-black text-gray-900 mb-1">{stats.science}%</div>
                                                        <p className="text-xs font-bold text-gray-400">Scientific Aptitude</p>
                                                    </CardContent>
                                                </Card>
                                            </div>

                                            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white border border-gray-50 overflow-hidden">
                                                <CardHeader className="p-10 pb-4">
                                                    <CardTitle className="text-xl font-black text-gray-900">Recent Trail Evaluations</CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-10 pt-4">
                                                    <div className="space-y-4">
                                                        {evaluations.length === 0 ? (
                                                            <p className="text-gray-400 font-medium">No evaluations recorded yet.</p>
                                                        ) : (
                                                            <div className="overflow-x-auto">
                                                                <table className="w-full text-left border-separate border-spacing-y-4">
                                                                    <thead>
                                                                        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">
                                                                            <th className="pb-2 pl-4">#</th>
                                                                            <th className="pb-2">Topic & Subject</th>
                                                                            <th className="pb-2 text-center">Score</th>
                                                                            <th className="pb-2 text-center">IIT</th>
                                                                            <th className="pb-2 text-center">NEET</th>
                                                                            <th className="pb-2 text-center">GATE</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {evaluations.map((ev, i) => {
                                                                            const rd = ev.readiness_data || {};
                                                                            const iit = rd["IIT"]?.closeness_percent || rd["JEE Advanced (IIT)"]?.closeness_percent || 0;
                                                                            const neet = rd["NEET"]?.closeness_percent || 0;
                                                                            const gate = rd["GATE"]?.closeness_percent || 0;

                                                                            return (
                                                                                <tr key={i} className="bg-gray-50/50 rounded-2xl border border-gray-50 hover:bg-white hover:shadow-md transition-all group">
                                                                                    <td className="py-4 pl-4 rounded-l-2xl">
                                                                                        <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center font-black text-gray-300 group-hover:text-primary transition-colors text-xs">
                                                                                            {i + 1}
                                                                                        </div>
                                                                                    </td>
                                                                                    <td className="py-4">
                                                                                        <div>
                                                                                            <h4 className="font-bold text-gray-900 text-sm">{ev.topic}</h4>
                                                                                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{ev.subject}</p>
                                                                                        </div>
                                                                                    </td>
                                                                                    <td className="py-4 text-center">
                                                                                        <div className="text-sm font-black text-gray-900">{ev.score}%</div>
                                                                                    </td>
                                                                                    <td className="py-4 text-center">
                                                                                        <Badge variant="outline" className={`text-[9px] font-black uppercase ${iit > 0 ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-gray-50 text-gray-300 border-gray-100'}`}>
                                                                                            {iit.toFixed(1)}%
                                                                                        </Badge>
                                                                                    </td>
                                                                                    <td className="py-4 text-center">
                                                                                        <Badge variant="outline" className={`text-[9px] font-black uppercase ${neet > 0 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-50 text-gray-300 border-gray-100'}`}>
                                                                                            {neet.toFixed(1)}%
                                                                                        </Badge>
                                                                                    </td>
                                                                                    <td className="py-4 text-center rounded-r-2xl">
                                                                                        <Badge variant="outline" className={`text-[9px] font-black uppercase ${gate > 0 ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-gray-50 text-gray-300 border-gray-100'}`}>
                                                                                            {gate.toFixed(1)}%
                                                                                        </Badge>
                                                                                    </td>
                                                                                </tr>
                                                                            );
                                                                        })}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Right Column: Readiness & Radar */}
                                        <div className="space-y-8">
                                            {readiness && (
                                                <Card className="rounded-[2.5rem] border-none shadow-xl shadow-blue-900/5 bg-gray-900 text-white overflow-hidden relative">
                                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                                                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -ml-10 -mb-10"></div>
                                                    <CardHeader className="p-8 pb-4 relative z-10">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                                                                <GraduationCap className="h-5 w-5 text-white" />
                                                            </div>
                                                            <CardTitle className="text-xl font-black tracking-tight">Exam Readiness Roadmap</CardTitle>
                                                        </div>
                                                        <p className="text-sm text-gray-400 font-medium">Diagnostic projection based on mastery level.</p>
                                                    </CardHeader>
                                                    <CardContent className="p-8 pt-4 space-y-8 relative z-10">
                                                        {Object.entries(readiness).filter(([exam]) => ["IIT", "NEET", "GATE", "JEE Advanced (IIT)"].includes(exam)).map(([exam, data]: [string, any]) => (
                                                            <div key={exam} className="space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-black text-white uppercase tracking-wider">{exam === "JEE Advanced (IIT)" ? "IIT" : exam}</span>
                                                                        <span className="text-[10px] font-bold text-gray-500">Projected Alignment</span>
                                                                    </div>
                                                                    <div className="flex flex-col items-end">
                                                                        <span className="text-2xl font-black text-white">{data.closeness_percent}%</span>
                                                                        <Badge className="bg-white/5 text-[8px] font-black text-gray-400 border-none px-1.5 py-0">Target: 100%</Badge>
                                                                    </div>
                                                                </div>
                                                                <div className="relative pt-1">
                                                                    <Progress value={data.closeness_percent * 20} className="h-2.5 bg-gray-800 [&>div]:bg-white shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
                                                                </div>
                                                                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                                                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic">
                                                                        "{data.reasoning}"
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </CardContent>
                                                </Card>
                                            )}

                                            <Card className="rounded-[2.5rem] border-none shadow-sm bg-white border border-gray-50 p-8 flex flex-col items-center justify-center text-center space-y-4">
                                                <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center text-primary mb-2">
                                                    <Activity size={32} />
                                                </div>
                                                <h3 className="text-xl font-black text-gray-900">Learning DNA</h3>
                                                <p className="text-sm font-medium text-gray-400 leading-relaxed">
                                                    The student shows strong inclination towards <span className="text-primary font-bold">Visual</span> and <span className="text-primary font-bold">Kinesthetic</span> modalities based on recent trail interactions.
                                                </p>
                                                <Button variant="secondary" className="w-full rounded-xl h-12 font-bold bg-gray-50 hover:bg-gray-100 text-gray-900">
                                                    View Full Analysis
                                                </Button>
                                            </Card>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
