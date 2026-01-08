import Link from "next/link";
import { Student } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSearch, Sparkles, UserCircle } from "lucide-react";

interface AssessmentResultsProps {
    student: Student;
    answers: Record<string, string[]>;
}

export default function AssessmentResults({ student, answers }: AssessmentResultsProps) {
    const hasAnswers = Object.keys(answers).length > 0;

    return (
        <div className="space-y-4 max-w-4xl mx-auto px-4">
            <Card className="shadow-xl shadow-gray-200/50 border-none rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-gray-50/50 p-8 border-b border-gray-100">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
                                <UserCircle size={32} className="text-primary" strokeWidth={1.5} />
                            </div>
                            <div>
                                <CardTitle className="text-3xl font-black text-gray-900 tracking-tight">
                                    {student.name}'s Profile
                                </CardTitle>
                                <div className="flex items-center gap-3 mt-1">
                                    <Badge variant="outline" className="rounded-full px-3 py-1 bg-white font-bold text-gray-500 border-gray-200">
                                        Age: {student.age}
                                    </Badge>
                                    <Badge variant="outline" className="rounded-full px-3 py-1 bg-white font-bold text-gray-500 border-gray-200">
                                        Gender: {student.gender}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <Badge className="w-fit h-fit py-2 px-4 rounded-xl bg-blue-50 text-blue-700 border-blue-100 font-black text-[10px] uppercase tracking-widest shadow-none">
                            Profile Verified
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-8 lg:p-12">
                    <div className="space-y-8">
                        <div className="flex items-center gap-2 mb-2">
                            <FileSearch size={20} className="text-primary" />
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">
                                Student Insights
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                            {hasAnswers ? (
                                Object.entries(answers).map(([key, value]) => (
                                    <div key={key} className="space-y-3">
                                        <dt className="text-sm font-black text-gray-900 tracking-tight capitalize">
                                            {key.replace(/_/g, ' ')}
                                        </dt>
                                        <dd className="flex flex-wrap gap-2">
                                            {value.map((ans, idx) => (
                                                <Badge
                                                    key={idx}
                                                    variant="secondary"
                                                    className="bg-primary/5 text-primary hover:bg-primary/10 border-primary/10 rounded-lg px-3 py-1.5 font-bold text-xs shadow-none"
                                                >
                                                    {ans}
                                                </Badge>
                                            ))}
                                        </dd>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 text-center py-10">
                                    <p className="text-gray-400 font-medium italic">No additional diagnostic data available for this profile.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col items-center gap-2 py-2">
                <Button
                    asChild
                    className="h-16 px-12 text-lg font-black text-white bg-primary rounded-2xl hover:bg-primary/90 shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 gap-3 cursor-pointer group"
                >
                    <Link href={`/trails?studentId=${student.id}`}>
                        <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                        Generat learning trails
                    </Link>
                </Button>
                <p className="text-sm text-gray-400 font-bold tracking-tight">AI-Enhanced Trails based on diagnostic data</p>
            </div>
        </div>
    );
}
