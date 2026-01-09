import { BookOpen, Users, Compass, ArrowRight, BarChart3 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export function QuickActions() {
    const actions = [
        {
            title: "Student Dashboard",
            description: "Manage your students and their assessment flows.",
            icon: Compass, // Changed icon to Compass for distinction
            href: "/dashboard",
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            title: "Manage Students",
            description: "Coordinate your cohort and manage learning groups.",
            icon: Users,
            href: "/students",
            color: "text-green-600",
            bg: "bg-green-50"
        },
        {
            title: "Curriculum Explorer",
            description: "Explore and orchestrate the master syllabus.",
            icon: BookOpen,
            href: "/curriculum",
            color: "text-purple-600",
            bg: "bg-purple-50"
        },
        {
            title: "Intelligence Reports",
            description: "View data-driven insights and learning velocity.",
            icon: BarChart3,
            href: "/reports",
            color: "text-cyan-600",
            bg: "bg-cyan-50"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {actions.map((action, i) => (
                <Link href={action.href} key={i} className="group">
                    <Card className="h-full border-none shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all rounded-[2rem] overflow-hidden bg-white cursor-pointer border border-gray-100">
                        <CardContent className="p-8">
                            <div className={`${action.bg} ${action.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <action.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-primary transition-colors">{action.title}</h3>
                            <p className="text-sm font-medium text-gray-500 leading-relaxed mb-6">
                                {action.description}
                            </p>
                            <div className="flex items-center gap-2 text-primary font-bold text-sm">
                                View Section <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
