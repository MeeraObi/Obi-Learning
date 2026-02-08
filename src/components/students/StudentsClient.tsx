'use client';

import { Student } from '@/types';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { differenceInYears } from 'date-fns';
import { Users, GraduationCap, Plus, Search, Filter, Rocket, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import AddStudentForm from '@/components/dashboard/AddStudentForm';
import Link from 'next/link';

/*
- **Relocated Student Registration**: Removed the "Register Student" button from the global Sidebar. Integrated the student registration form directly into the Classes page via the "Add Child to Class" button on class cards (and now within the table view).
- **Table-Centric Roster Management**: Replaced the class grid with a structured `ClassesTable` showing registered cohorts. Clicking a class reveals a detailed `StudentsTable` for that specific group, allowing for organized enrollment and member tracking.
*/
import { createClass, addStudentToClass } from '@/app/students/actions';
import { ScheduleItem } from '@/types';
import { mapStudentData } from '@/lib/mappers';

interface StudentsClientProps {
    user: {
        name: string;
        email: string;
    };
    initialChildren: any[];
    initialClasses: any[];
    initialSchedule: ScheduleItem[];
}

export default function StudentsClient({ user, initialChildren, initialClasses, initialSchedule }: StudentsClientProps) {
    const router = useRouter();
    const [students, setStudents] = useState<Student[]>(mapStudentData(initialChildren));
    const [classes, setClasses] = useState<any[]>(initialClasses);
    const [schedule, setSchedule] = useState<ScheduleItem[]>(initialSchedule);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Sync state when props change (after router.refresh())
    useEffect(() => {
        setClasses(initialClasses);
        setStudents(mapStudentData(initialChildren));
        setSchedule(initialSchedule);
    }, [initialClasses, initialChildren, initialSchedule]);
    const [viewingClassId, setViewingClassId] = useState<string | null>(null);
    const [isAddClassOpen, setIsAddClassOpen] = useState(false);
    const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
    const [newClass, setNewClass] = useState({ name: '', standard: '', division: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddClass = async () => {
        if (!newClass.name) return;
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('name', newClass.name);
        formData.append('standard', newClass.standard);
        formData.append('division', newClass.division);

        const result = await createClass(formData);
        if (result.success) {
            setNewClass({ name: '', standard: '', division: '' });
            setIsAddClassOpen(false);
            if (result.class) {
                setClasses([result.class, ...classes]);
            }
        }
        setIsSubmitting(false);
    };

    const viewingClass = classes.find(c => c.id === viewingClassId);

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
                    {viewingClassId && viewingClass ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    className="rounded-xl font-bold bg-white shadow-sm border border-gray-100 hover:bg-gray-50"
                                    onClick={() => setViewingClassId(null)}
                                >
                                    <ChevronRight className="rotate-180" size={18} />
                                    Back to Classes
                                </Button>
                                <div className="h-8 w-[2px] bg-gray-200 rounded-full mx-2" />
                                <div className="flex flex-col">
                                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">{viewingClass.name}</h1>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{viewingClass.standard} • Division {viewingClass.division}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">{viewingClass.name} Students</h1>
                                    <p className="text-sm font-medium text-gray-400">
                                        Managing {(viewingClass.children || []).length} students • {(viewingClass.children || []).length > 0 ? (viewingClass.children[0].subject || 'General Education') : 'N/A'}
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="outline" className="rounded-xl border-gray-200 font-bold text-gray-600 bg-white">Filter</Button>
                                    <Button variant="outline" className="rounded-xl border-gray-200 font-bold text-gray-600 bg-white">Export</Button>
                                    <Button
                                        className="rounded-xl px-6 font-black gap-2 shadow-lg shadow-primary/10 ml-2 opacity-50 cursor-not-allowed"
                                        disabled
                                        onClick={() => {
                                            setSelectedClassId(viewingClass.id);
                                            setIsAddStudentOpen(true);
                                        }}
                                    >
                                        <Plus size={18} />
                                        Add Student
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-12">
                                {(viewingClass.children || []).length > 0 ? (
                                    viewingClass.children.map((student: any, idx: number) => {
                                        // Mock some data for the UI
                                        const progress = [62, 75, 72, 92, 88, 84, 94, 78, 82, 90, 58, 87][idx % 12];
                                        const insights = [
                                            "Needs reinforcement on cell division concepts.",
                                            "Struggling with long-answer structuring.",
                                            "Inconsistent homework submission this week.",
                                            "Takes initiative in group work and discussions.",
                                            "Shows strong improvement in recent tests.",
                                            "Requested extra practice questions on genetics.",
                                            "Consistently completes all extension tasks.",
                                            "Missed one lab session; may need recap.",
                                            "Participates actively in class discussions.",
                                            "Very consistent performance and preparation.",
                                            "Needs support with organising study schedule.",
                                            "Shows curiosity and asks deep questions in class."
                                        ][idx % 12];

                                        const getProgressColor = (p: number) => {
                                            if (p < 60) return 'bg-red-500';
                                            if (p < 80) return 'bg-orange-500';
                                            return 'bg-blue-600';
                                        };

                                        const getStatusBg = (p: number) => {
                                            if (p >= 85) return 'bg-green-50 text-green-700';
                                            if (p < 65) return 'bg-red-50 text-red-700';
                                            return 'bg-gray-50 text-gray-700';
                                        };

                                        return (
                                            <Card key={student.id} className="rounded-[2rem] border-none shadow-sm hover:shadow-xl transition-all bg-white group overflow-hidden border border-gray-100/50">
                                                <CardContent className="p-8 flex flex-col items-center">
                                                    {/* Avatar */}
                                                    <div className="h-24 w-24 rounded-full bg-gray-100 overflow-hidden mb-6 relative ring-4 ring-offset-4 ring-gray-50/50">
                                                        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-black text-2xl uppercase">
                                                            {student.name.charAt(0)}
                                                        </div>
                                                    </div>

                                                    {/* Names & ID */}
                                                    <h3 className="text-xl font-black text-gray-900 mb-1">{student.name}</h3>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">ID: {24001 + idx}</p>


                                                    {/* Hidden Action Overlay */}
                                                    <div className="mt-4 w-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Link href={`/trails?studentId=${student.id}`} className="w-full">
                                                            <Button size="sm" className="w-full rounded-xl bg-gray-900 hover:bg-primary text-white font-black h-10 flex gap-2">
                                                                <Rocket size={14} />
                                                                Generate Trail
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-full py-20 flex flex-col items-center justify-center bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-100 text-gray-400">
                                        <GraduationCap size={48} className="mb-4 opacity-20" />
                                        <p className="text-lg font-black uppercase tracking-tight">Empty Roster</p>
                                        <p className="text-sm font-medium">No students registered in this class yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px]">
                                        <Users size={12} />
                                        Cohort Management
                                    </div>
                                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Active Classes</h1>
                                    <p className="text-gray-500 font-medium">Coordinate and manage your learning groups.</p>
                                </div>
                                <Dialog open={isAddClassOpen} onOpenChange={setIsAddClassOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="rounded-2xl h-14 px-8 font-black gap-2 shadow-lg shadow-primary/20">
                                            <Plus size={20} />
                                            Create New Class
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="rounded-[2rem] border-none shadow-2xl p-10 bg-white">
                                        <DialogHeader>
                                            <DialogTitle className="text-3xl font-black text-gray-900 tracking-tight">Create New Class</DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-6 py-6">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">Subject Name</Label>
                                                <Input
                                                    placeholder="e.g. Mathematics"
                                                    className="h-12 bg-gray-50/50 border-gray-200 rounded-xl"
                                                    value={newClass.name}
                                                    onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">Class</Label>
                                                    <Input
                                                        placeholder="e.g. 8"
                                                        className="h-12 bg-gray-50/50 border-gray-200 rounded-xl"
                                                        value={newClass.standard}
                                                        onChange={(e) => setNewClass({ ...newClass, standard: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">Division</Label>
                                                    <Input
                                                        placeholder="e.g. A"
                                                        className="h-12 bg-gray-50/50 border-gray-200 rounded-xl"
                                                        value={newClass.division}
                                                        onChange={(e) => setNewClass({ ...newClass, division: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setIsAddClassOpen(false)}>Cancel</Button>
                                            <Button className="rounded-xl font-black bg-primary text-white px-8" onClick={handleAddClass}>Finalize Class</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <div className="flex gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input placeholder="Search classes or teachers..." className="h-12 pl-12 rounded-2xl bg-white border-gray-100 shadow-sm" />
                                </div>
                                <button className="flex items-center gap-2 px-6 bg-white border border-gray-100 rounded-2xl font-bold text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                                    <Filter size={16} />
                                    Filters
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {classes.length > 0 ? (
                                    classes.map((cls) => (
                                        <Card
                                            key={cls.id}
                                            className="rounded-[2.5rem] border-none shadow-sm hover:shadow-xl transition-all bg-white border border-gray-50 overflow-hidden group cursor-pointer active:scale-95"
                                            onClick={() => setViewingClassId(cls.id)}
                                        >
                                            <CardContent className="p-10">
                                                <div className="flex items-center justify-between mb-8">
                                                    <div className="h-14 w-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <GraduationCap size={24} strokeWidth={2.5} />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Badge variant="outline" className="rounded-xl border-blue-100 text-blue-600 font-black text-[10px] uppercase px-3 py-1 bg-blue-50/50">Class {cls.standard}</Badge>
                                                        <Badge variant="outline" className="rounded-xl border-green-100 text-green-600 font-black text-[10px] uppercase px-3 py-1 bg-green-50/50">Div {cls.division}</Badge>
                                                    </div>
                                                </div>
                                                <h3 className="text-2xl font-black text-gray-900 mb-2">{cls.name}</h3>
                                                <p className="text-sm font-bold text-gray-400 mb-8 uppercase tracking-wider">Class Cohort</p>

                                                <div className="space-y-6">
                                                    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                                        <div className="flex -space-x-3">
                                                            {(cls.children || []).slice(0, 4).map((s: any) => (
                                                                <div key={s.id} className="h-10 w-10 rounded-full border-4 border-white bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                                                                    {s.name.charAt(0).toUpperCase()}
                                                                </div>
                                                            ))}
                                                            {(cls.children || []).length > 4 && (
                                                                <div className="h-10 w-10 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">
                                                                    +{(cls.children || []).length - 4}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-sm font-black text-primary">{(cls.children || []).length} Students</span>
                                                    </div>

                                                    <Button
                                                        variant="outline"
                                                        className="w-full rounded-xl border-dashed border-2 py-6 font-black text-gray-700 hover:text-primary bg-gray-50/50 hover:bg-primary/5 flex gap-2"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedClassId(cls.id);
                                                            setIsAddStudentOpen(true);
                                                        }}
                                                    >
                                                        <Plus size={16} />
                                                        Add Child to Class
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <div className="col-span-full py-20 flex flex-col items-center justify-center bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-100 text-gray-400">
                                        <Users size={48} className="mb-4 opacity-20" />
                                        <p className="text-lg font-black uppercase tracking-tight">No Classes Defined</p>
                                        <p className="text-sm font-medium">Create your first class to start organizing students.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </main>
            </div>

            <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
                <DialogContent className="max-w-2xl p-0 overflow-hidden border-none rounded-[2rem]">
                    <DialogHeader className="opacity-0 h-0 p-0 pointer-events-none">
                        <DialogTitle>Register New Student</DialogTitle>
                    </DialogHeader>
                    <AddStudentForm
                        onAddStudent={() => {
                            setIsAddStudentOpen(false);
                            router.refresh();
                        }}
                        onCancel={() => setIsAddStudentOpen(false)}
                        mode="add"
                        classId={selectedClassId || undefined}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}


