import { GraduationCap, UserPlus } from "lucide-react";

interface EmptyStateProps {
    onAddStudentClick: () => void;
}

export default function EmptyState({ onAddStudentClick }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto px-4">
            <div className="h-40 w-40 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mb-10 border border-gray-100 shadow-inner">
                <GraduationCap className="w-20 h-20 text-gray-300" strokeWidth={1} />
            </div>

            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-4">Initialize Your Cohort</h2>
            <p className="text-gray-500 font-medium mb-10 leading-relaxed">
                Welcome to the institutional management interface. Register your first student profile to begin generating personalized academic trajectories.
            </p>

            <button
                onClick={onAddStudentClick}
                className="group relative flex items-center gap-3 px-10 py-5 text-base font-bold text-white bg-primary rounded-2xl hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
            >
                <UserPlus size={20} />
                Register New Student
            </button>
        </div>
    );
}
