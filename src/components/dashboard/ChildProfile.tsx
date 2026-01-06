import { Child } from "@/types";

interface ChildProfileProps {
    child: Child;
    onStartAssessment: () => void;
}

export default function ChildProfile({ child, onStartAssessment }: ChildProfileProps) {
    return (
        <div className="max-w-3xl mx-auto">
            <div className="text-center py-12">
                <div className="h-24 w-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-12 h-12 text-orange-600"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                        />
                    </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Let's personalize {child.name}'s learning!
                </h2>
                <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                    To generate the best learning trails for {child.name}, we need to
                    understand their interests and learning style.
                </p>
                <button
                    onClick={onStartAssessment}
                    className="px-8 py-3 text-base font-bold text-white bg-orange-500 rounded-full hover:bg-orange-600 shadow-lg transform transition hover:-translate-y-1"
                >
                    Take Assessment
                </button>
            </div>
        </div>
    );
}
