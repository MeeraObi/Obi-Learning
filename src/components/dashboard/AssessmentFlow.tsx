import { useState } from 'react';
import { QUESTIONS } from "@/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AssessmentFlowProps {
    step: number;
    onSubmitAnswer: (answer: string[]) => void;
}

export default function AssessmentFlow({ step, onSubmitAnswer }: AssessmentFlowProps) {
    const currentQuestion = QUESTIONS[step - 1];
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

    const toggleOption = (option: string) => {
        if (selectedOptions.includes(option)) {
            setSelectedOptions(selectedOptions.filter((item) => item !== option));
        } else {
            setSelectedOptions([...selectedOptions, option]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedOptions.length === 0) return;
        onSubmitAnswer(selectedOptions);
        setSelectedOptions([]);
    };

    const progress = (step / QUESTIONS.length) * 100;

    return (
        <Card className="max-w-2xl mx-auto shadow-sm">
            <CardHeader className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-orange-600">
                        Question {step} of {QUESTIONS.length}
                    </span>
                    <span className="text-gray-500 font-medium">
                        {Math.round(progress)}% completed
                    </span>
                </div>
                <Progress value={progress} className="h-2 bg-orange-100" />
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {currentQuestion.question}
                        </h3>
                        <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">
                            Select all that apply
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                        {currentQuestion.options.map((option) => (
                            <Button
                                key={option}
                                type="button"
                                variant="outline"
                                onClick={() => toggleOption(option)}
                                className={`h-auto py-4 px-4 justify-between border-2 transition-all hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200 ${selectedOptions.includes(option)
                                        ? "border-orange-500 bg-orange-50 text-orange-700"
                                        : "border-gray-100 text-gray-700"
                                    }`}
                            >
                                <span>{option}</span>
                                {selectedOptions.includes(option) && (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="w-5 h-5 text-orange-500"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                )}
                            </Button>
                        ))}
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={selectedOptions.length === 0}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full px-8"
                        >
                            {step === QUESTIONS.length ? "Finish" : "Next Question"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
