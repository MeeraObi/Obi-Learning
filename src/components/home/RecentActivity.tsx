import { Student } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function RecentActivity({ students }: { students: Student[] }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Recent Activity</h2>
                <button className="text-xs font-bold text-primary hover:underline">View All</button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-50">
                    {students.length > 0 ? (
                        students.slice(0, 4).map((student) => (
                            <div key={student.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                        <AvatarFallback className="bg-blue-100 text-blue-600 font-bold text-sm">
                                            {student.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-black text-gray-900">{student.name}</p>
                                        <p className="text-xs font-bold text-gray-400">Student Profile Updated</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {student.trailsGenerated ? (
                                        <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border-none font-bold text-[10px] uppercase px-3 py-1">
                                            Trail Active
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-none font-bold text-[10px] uppercase px-3 py-1">
                                            Pending Diagnostic
                                        </Badge>
                                    )}
                                    <span className="text-[10px] font-bold text-gray-300">2h ago</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-10 text-center text-gray-400 font-medium">
                            No recent student activity found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
