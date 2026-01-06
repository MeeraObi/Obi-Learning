import Link from "next/link";
import { Child, QUESTIONS } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AssessmentResultsProps {
    child: Child;
    answers: Record<number, string[]>;
}

export default function AssessmentResults({ child, answers }: AssessmentResultsProps) {
    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                            {child.name}'s Profile
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                            Age: {child.age} • Gender: {child.gender}
                        </p>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="border-t border-gray-100 pt-6 mt-4">
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                            Assessment Insights
                        </h3>
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            {QUESTIONS.map((q) => (
                                <div key={q.id} className="sm:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">
                                        {q.question}
                                    </dt>
                                    <dd className="mt-2 flex flex-wrap gap-2">
                                        {answers[q.id] && answers[q.id].length > 0 ? (
                                            answers[q.id].map((ans, idx) => (
                                                <Badge
                                                    key={idx}
                                                    variant="secondary"
                                                    className="bg-orange-100 text-orange-800 hover:bg-orange-200"
                                                >
                                                    {ans}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-400 italic">
                                                No selection
                                            </span>
                                        )}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-center">
                <Button
                    asChild
                    className="px-8 py-6 text-lg font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-full hover:from-orange-600 hover:to-red-600 shadow-xl transform transition hover:-translate-y-1 gap-2 cursor-pointer"
                >
                    <Link href={`/trails?childId=${child.id}`}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                fillRule="evenodd"
                                d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436h.67a.75.75 0 01.75.75v4.5a.75.75 0 01-.75.75h-4.5a.75.75 0 01-.75-.75v-.67c-2.881 3.701-7.381 6.084-12.436 6.084a.75.75 0 01-.75-.75c0-5.056 2.383-9.555 6.084-12.436V11.25a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v.67zm-3.75 6.916a9.03 9.03 0 01-3.378-4.639 9.033 9.033 0 010-2.365.75.75 0 00-1.5-.05 10.534 10.534 0 003.377 5.754.75.75 0 001.5-1.3l-.001-.001-.001-.001-.002-.002-.005-.005-.01-.01c-.022-.02-.054-.047-.09-.079zM18 12.75a.75.75 0 000 1.5h.75v.75a.75.75 0 001.5 0v-.75h.75a.75.75 0 000-1.5h-.75v-.75a.75.75 0 00-1.5 0v.75H18z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Start Generating Trails
                    </Link>
                </Button>
            </div>
        </div>
    );
}
