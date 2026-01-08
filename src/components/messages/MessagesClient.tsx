"use client"
import { Student } from '@/types';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import { useState, useEffect } from 'react';
import { MessageSquare, Send, User, ChevronRight, BarChart3, Mail, Phone, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getStudentEvaluations } from '@/app/trails/actions';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { mapStudentData } from '@/lib/mappers';

interface MessagesClientProps {
    user: {
        name: string;
        email: string;
    };
    initialChildren: any[];
    initialClasses: any[];
}

export default function MessagesClient({ user, initialChildren, initialClasses }: MessagesClientProps) {
    const [students] = useState<Student[]>(mapStudentData(initialChildren));
    const [searchQuery, setSearchQuery] = useState("");
    const [sendingId, setSendingId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSendEvaluation = async (student: Student) => {
        setSendingId(student.id);
        try {
            const evaluations = await getStudentEvaluations(student.id);
            if (evaluations.length === 0) {
                alert(`No evaluations found for ${student.name}. Generate some trails first!`);
                return;
            }

            // Mock sending message
            console.log(`Sending evaluation for ${student.name}:`, evaluations);
            alert(`Evaluation report for ${student.name} has been sent to the parent's registered email/phone.`);
        } catch (error) {
            console.error(error);
            alert("Failed to send evaluation.");
        } finally {
            setSendingId(null);
        }
    };

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
                            <MessageSquare size={12} />
                            Communication Hub
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Parent Portal </h1>
                        <p className="text-gray-500 font-medium">Send detailed performance evaluations and updates to parents.</p>
                    </div>

                    <div className="flex items-center gap-4 max-w-md">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by student name..."
                                className="h-12 pl-12 rounded-2xl bg-white border-gray-100 shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                        {filteredStudents.length > 0 ? (
                            filteredStudents.map((student, idx) => (
                                <Card key={student.id} className="rounded-[2.5rem] border-none shadow-sm hover:shadow-xl transition-all bg-white group overflow-hidden border border-gray-100/50">
                                    <CardContent className="p-8 flex flex-col">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black text-xl uppercase">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black text-gray-900 leading-tight">{student.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-[9px] font-bold uppercase rounded-md py-0">
                                                        {initialClasses.find(c => c.id === student.class_id)?.name || 'Class 8'}
                                                    </Badge>
                                                    <span className="text-[10px] text-gray-400 font-bold tracking-tight">ID: {24001 + idx}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4 mb-8">
                                            <div className="flex items-center gap-3 text-gray-500">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                                    <Mail size={14} className="text-gray-400" />
                                                </div>
                                                <span className="text-[11px] font-bold truncate">parent.{student.name.toLowerCase().replace(' ', '.')}@example.com</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-gray-500">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                                    <Phone size={14} className="text-gray-400" />
                                                </div>
                                                <span className="text-[11px] font-bold">+91 98765 43210</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mt-auto">
                                            <Button
                                                variant="outline"
                                                className="rounded-xl font-black text-[10px] uppercase tracking-widest h-11 border-gray-100 bg-gray-50 hover:bg-white"
                                                onClick={() => window.location.href = `/reports?studentId=${student.id}`}
                                            >
                                                <BarChart3 size={14} className="mr-2" />
                                                Review
                                            </Button>
                                            <Button
                                                className="rounded-xl font-black text-[10px] uppercase tracking-widest h-11 shadow-lg shadow-primary/20"
                                                disabled={sendingId === student.id}
                                                onClick={() => handleSendEvaluation(student)}
                                            >
                                                <Send size={14} className="mr-2" />
                                                {sendingId === student.id ? "Sending..." : "Send Eval"}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-100 text-gray-400">
                                <User size={48} className="mb-4 opacity-20" />
                                <p className="text-lg font-black uppercase tracking-tight">No Students Found</p>
                                <p className="text-sm font-medium">Try searching for a different name.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
