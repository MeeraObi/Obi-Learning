'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BOARDS, SUBJECTS, LEVELS } from "@/types";

function TrailsContent() {
    const searchParams = useSearchParams();
    const childId = searchParams.get('childId');
    // In a real app, we would fetch the child details using the ID.
    // For now, we'll placeholder or just use a generic name if ID is missing.
    const childName = "Child"; // Placeholder

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Trail generation started! (This is a demo)");
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">Generate Learning Trail</h1>
                    <Link href="/dashboard" className="text-sm font-medium text-orange-600 hover:underline">
                        Back to Dashboard
                    </Link>
                </div>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold text-gray-800">
                            {childName} - Customize Trail
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="board">Education Board</Label>
                                <Select required>
                                    <SelectTrigger className="w-full text-black border-gray-300 focus:ring-orange-500">
                                        <SelectValue placeholder="Select Board" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {BOARDS.map((board) => (
                                            <SelectItem key={board} value={board}>{board}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Select required>
                                    <SelectTrigger className="w-full text-black border-gray-300 focus:ring-orange-500">
                                        <SelectValue placeholder="Select Subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SUBJECTS.map((subject) => (
                                            <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="topic">Topic</Label>
                                <Input
                                    id="topic"
                                    placeholder="e.g. Fractions, Photosynthesis"
                                    className="text-black border-gray-300 focus-visible:ring-orange-500"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="level">Difficulty Level</Label>
                                <Select required>
                                    <SelectTrigger className="w-full text-black border-gray-300 focus:ring-orange-500">
                                        <SelectValue placeholder="Select Level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {LEVELS.map((level) => (
                                            <SelectItem key={level} value={level}>{level}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-6 text-lg shadow-md"
                            >
                                Generate Trail
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function TrailsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TrailsContent />
        </Suspense>
    );
}
