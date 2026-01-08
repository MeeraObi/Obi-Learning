import { Student } from "@/types";
import { GraduationCap, BookOpen, Target } from "lucide-react";

interface StudentProfileProps {
    student: Student;
    onStartAssessment: () => void;
}

export default function StudentProfile({ student, onStartAssessment }: StudentProfileProps) {
    return (
        <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-[2rem] border border-gray-100 p-8 lg:p-12 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <GraduationCap size={200} />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
                    <div className="flex-shrink-0">
                        <div className="h-40 w-40 bg-primary/5 rounded-[2.5rem] flex items-center justify-center border border-primary/10 relative shadow-inner">
                            <GraduationCap className="w-20 h-20 text-primary" strokeWidth={1.5} />
                            <div className="absolute -bottom-2 -right-2 bg-white p-3 rounded-2xl shadow-lg border border-gray-50">
                                <Target className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-500 mb-6 border border-gray-100">
                            <BookOpen size={12} className="text-primary" />
                            Academic Profile Configuration
                        </div>

                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none">
                            {student.date_of_birth}
                        </p>
                        <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
                            Personalize {student.name}'s <span className="text-primary">Learning Trail.</span>
                        </h2>

                        <p className="text-gray-500 font-medium mb-10 max-w-xl text-lg leading-relaxed">
                            To generate a high-fidelity learning path for {student.name}, please complete a brief diagnostic assessment of their current academic profile and objectives.
                        </p>

                        <button
                            onClick={onStartAssessment}
                            className="group relative inline-flex items-center gap-3 px-10 py-5 text-base font-bold text-white bg-primary rounded-2xl hover:bg-primary/90 shadow-xl shadow-primary/20 transform transition-all hover:scale-[1.02] active:scale-95"
                        >
                            Begin Diagnostic Assessment
                            <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:translate-x-1 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-white">
                                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
