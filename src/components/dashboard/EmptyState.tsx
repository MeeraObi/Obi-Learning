interface EmptyStateProps {
    onAddChildClick: () => void;
}

export default function EmptyState({ onAddChildClick }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="h-32 w-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1}
                    stroke="currentColor"
                    className="w-16 h-16 text-gray-400"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome to Obi Learning!</h2>
            <p className="text-gray-500 mt-2 max-w-md">
                Get started by adding your child's profile on the left to personalize
                their learning experience.
            </p>
            <button
                onClick={onAddChildClick}
                className="mt-8 px-6 py-3 text-sm font-bold text-white bg-orange-500 rounded-full hover:bg-orange-600 shadow-lg"
            >
                Add Your First Child
            </button>
        </div>
    );
}
