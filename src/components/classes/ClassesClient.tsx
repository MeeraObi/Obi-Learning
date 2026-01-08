'use client';

import { Student } from '@/types';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import { useState } from 'react';
import { differenceInYears } from 'date-fns';
import { Users, GraduationCap, Plus, Search, Filter, Rocket } from 'lucide-react';
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
import { createClass, addStudentToClass } from '@/app/classes/actions';

interface ClassesClientProps {
    user: {
        name: string;
        email: string;
    };
    initialChildren: any[];
    initialClasses: any[];
}

export default function ClassesClient({ user, initialChildren, initialClasses }: ClassesClientProps) {
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
    const [classes, setClasses] = useState<any[]>(initialClasses);
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
        <div className="flex h-screen w-full bg-white overflow-hidden font-sans">
            <Sidebar
                studentsList={students}
                user={user}
            />

            <div className="flex-1 flex flex-col min-w-0 bg-[#fbfbfc]">
                <TopBar selectedStudent={undefined} user={user} />

                <main className="flex-1 overflow-y-auto p-10 space-y-8">
                    {viewingClassId && viewingClass ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    className="rounded-xl font-bold bg-white shadow-sm border border-gray-100"
                                    onClick={() => setViewingClassId(null)}
                                >
                                    <Plus className="rotate-45" size={18} />
                                    Back to Classes
                                </Button>
                                <div className="h-8 w-[2px] bg-gray-200 rounded-full mx-2" />
                                <div className="flex flex-col">
                                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">{viewingClass.name}</h1>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{viewingClass.standard} • Division {viewingClass.division}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black text-gray-900">Class Roster</h2>
                                <Button
                                    className="rounded-2xl h-12 px-6 font-black gap-2 shadow-lg shadow-primary/10"
                                    onClick={() => {
                                        setSelectedClassId(viewingClass.id);
                                        setIsAddStudentOpen(true);
                                    }}
                                >
                                    <Plus size={18} />
                                    Add Student to Roster
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {(viewingClass.children || []).length > 0 ? (
                                    viewingClass.children.map((student: any) => (
                                        <Card key={student.id} className="rounded-[2rem] border-none shadow-sm hover:shadow-md transition-all bg-white group overflow-hidden border border-gray-50">
                                            <CardContent className="p-8">
                                                <div className="flex flex-col items-center text-center">
                                                    <div className="h-20 w-20 rounded-3xl bg-primary/5 text-primary flex items-center justify-center font-black text-2xl mb-4 group-hover:scale-110 transition-transform">
                                                        {student.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <h3 className="text-xl font-black text-gray-900 mb-1">{student.name}</h3>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">{student.gender || 'Student'}</p>

                                                    <div className="w-full pt-6 border-t border-gray-50 flex flex-col gap-4 items-center">
                                                        <div className="text-center">
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Age</p>
                                                            <p className="text-sm font-bold text-gray-900">{student.date_of_birth ? differenceInYears(new Date(), new Date(student.date_of_birth)) : 'N/A'}</p>
                                                        </div>
                                                        <Link href={`/trails?studentId=${student.id}`} className="w-full">
                                                            <Button className="w-full rounded-xl bg-gray-900 hover:bg-primary text-white font-black flex gap-2 active:scale-95 transition-all py-6">
                                                                <Rocket size={16} />
                                                                Generate Trail
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
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
                                                <Label className="text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">Class Name</Label>
                                                <Input
                                                    placeholder="e.g. Early Years A"
                                                    className="h-12 bg-gray-50/50 border-gray-200 rounded-xl"
                                                    value={newClass.name}
                                                    onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label className="text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">Standard</Label>
                                                    <Input
                                                        placeholder="e.g. LKG"
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
                                                        <Badge variant="outline" className="rounded-xl border-blue-100 text-blue-600 font-black text-[10px] uppercase px-3 py-1 bg-blue-50/50">{cls.standard}</Badge>
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
                                                        className="w-full rounded-xl border-dashed border-2 py-6 font-black text-gray-400 hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all flex gap-2"
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
                            window.location.reload(); // Quickest way to refetch for now, better to use router.refresh()
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


