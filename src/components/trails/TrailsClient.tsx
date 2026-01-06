'use client';

import { useState, useEffect } from 'react';
import { Child, QUESTIONS } from '@/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import ReactMarkdown from 'react-markdown';
import { generateTrail } from '@/app/trails/actions';
import { ChevronLeft, Rocket, Info, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface TrailsClientProps {
    child: any; // Using any for simplicity as it includes assessments
    syllabus: any;
}

const BOARD_DIFFICULTY_OFFSET: Record<string, number> = {
    "CBSE": 0,
    "ICSE": 1,
    "IB": 0.5,
    "IGCSE": 0.5
};

const LEVEL_STAGE_LABEL: Record<string, Record<string, string>> = {
    "CBSE": { "L1": "Foundational", "L2": "Grade 1 Ready", "L3": "Grade 1", "L4": "Grade 2", "L5": "Grade 2+" },
    "ICSE": { "L1": "Early Numeracy", "L2": "Foundation", "L3": "Grade 1", "L4": "Grade 2", "L5": "Grade 2+" },
    "IB": { "L1": "Emerging", "L2": "Developing", "L3": "PYP 1", "L4": "PYP 2", "L5": "Advanced PYP" },
    "IGCSE": { "L1": "Starter", "L2": "Developing", "L3": "Primary 1", "L4": "Primary 2", "L5": "Primary Advanced" }
};

const RUBRIC_BY_DOMAIN: Record<string, string[]> = {
    "Numbers": ["Numerical Accuracy", "Problem Solving", "Number Sense", "Independence", "Consistency"],
    "Language": ["Vocabulary", "Expression", "Comprehension", "Fluency", "Consistency"],
    "EVS": ["Concept Understanding", "Observation", "Application", "Explanation", "Consistency"]
};

const RUBRIC_SCORE_GUIDE: Record<string, Record<number, string>> = {
    "Numerical Accuracy": { 1: "Mostly incorrect responses", 2: "Frequent errors", 3: "Mostly correct with some mistakes", 4: "Consistently correct", 5: "Accurate even in new situations" },
    "Problem Solving": { 1: "Unable even with help", 2: "Solves only with full guidance", 3: "Solves familiar problems", 4: "Solves independently", 5: "Solves and explains new problems" },
    "Number Sense": { 1: "No understanding of quantity", 2: "Understands only with aids", 3: "Basic number relationships", 4: "Applies in daily life", 5: "Strong intuitive understanding" },
    "Vocabulary": { 1: "Very limited vocabulary", 2: "Uses few familiar words", 3: "Uses appropriate common words", 4: "Uses varied vocabulary", 5: "Uses rich and expressive vocabulary" },
    "Expression": { 1: "Unable to express ideas", 2: "Expresses with heavy prompting", 3: "Expresses simple ideas", 4: "Expresses clearly", 5: "Expresses ideas confidently and creatively" },
    "Comprehension": { 1: "Does not understand instructions", 2: "Understands with repetition", 3: "Understands basic instructions", 4: "Understands and follows instructions", 5: "Demonstrates deep understanding" },
    "Fluency": { 1: "Very hesitant", 2: "Slow and fragmented", 3: "Reasonably fluent", 4: "Smooth and fluent", 5: "Highly fluent and confident" },
    "Concept Understanding": { 1: "Does not grasp the concept", 2: "Understands only with explanation", 3: "Understands basic idea", 4: "Applies concept correctly", 5: "Explains concept in own words" },
    "Observation": { 1: "Rarely notices details", 2: "Notices with guidance", 3: "Notices obvious details", 4: "Observes patterns", 5: "Makes insightful observations" },
    "Application": { 1: "Cannot apply learning", 2: "Applies with help", 3: "Applies in familiar contexts", 4: "Applies independently", 5: "Applies creatively in new contexts" },
    "Explanation": { 1: "Cannot explain learning", 2: "Explains with prompting", 3: "Explains simply", 4: "Explains clearly", 5: "Explains confidently with examples" },
    "Independence": { 1: "Needs full support", 2: "Needs frequent help", 3: "Works independently for short time", 4: "Works independently", 5: "Initiates learning independently" },
    "Consistency": { 1: "Highly inconsistent", 2: "Occasionally consistent", 3: "Consistent in familiar tasks", 4: "Consistent across situations", 5: "Consistent over time" }
};

export default function TrailsClient({ child, syllabus }: TrailsClientProps) {
    const [board, setBoard] = useState("");
    const [subject, setSubject] = useState("");
    const [topic, setTopic] = useState("");
    const [level, setLevel] = useState("L3");

    const [trailContent, setTrailContent] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [scores, setScores] = useState<Record<string, number>>({});

    const age = calculateAge(child.date_of_birth);
    const ageBand = getAgeBand(age);

    const boards = Object.keys(syllabus);
    const subjects = board ? Object.keys(syllabus[board]?.[ageBand] || {}) : [];
    const topics: string[] = (board && subject) ? (syllabus[board]?.[ageBand]?.[subject] || []) : [];

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const result = await generateTrail({
                childId: child.id,
                board,
                subject,
                topic,
                level
            });
            setTrailContent(result.content);

            // Initialize rubric scores
            const domain = inferDomain(topic);
            const items = RUBRIC_BY_DOMAIN[domain];
            const initialScores: Record<string, number> = {};
            items.forEach(item => initialScores[item] = 3);
            setScores(initialScores);
        } catch (error) {
            console.error(error);
            alert("Failed to generate trail. Please check your API key.");
        } finally {
            setIsGenerating(false);
        }
    };

    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const masteryLevel = scoreToLevel(totalScore);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Top Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/dashboard?childId=${child.id}`}>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Learning Trail</h1>
                            <p className="text-xs text-gray-500">{child.name} • {age} years ({ageBand})</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-7xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Panel: Configuration */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="shadow-sm border-none bg-white">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <Rocket className="h-5 w-5 text-orange-500" />
                                Configuration
                            </CardTitle>
                            <CardDescription>Select board and target subject</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Education Board</Label>
                                <Select onValueChange={setBoard}>
                                    <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                                        <SelectValue placeholder="Select Board" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {boards.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Subject</Label>
                                <Select disabled={!board} onValueChange={setSubject}>
                                    <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                                        <SelectValue placeholder="Select Subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Topic</Label>
                                <Select disabled={!subject} onValueChange={setTopic}>
                                    <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                                        <SelectValue placeholder="Select Topic" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {topics.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3 pt-2">
                                <Label className="text-sm font-medium">Difficulty Level: <span className="text-orange-600 font-bold">{level}</span></Label>
                                <div className="grid grid-cols-5 gap-2">
                                    {["L1", "L2", "L3", "L4", "L5"].map((l) => (
                                        <button
                                            key={l}
                                            onClick={() => setLevel(l)}
                                            className={`py-3 px-1 flex flex-col items-center justify-center transition-all border rounded-xl gap-1 ${level === l
                                                ? "bg-orange-500 text-white border-orange-500 shadow-md ring-2 ring-orange-200 ring-offset-1"
                                                : "bg-white text-gray-600 border-gray-100 hover:border-orange-200 hover:bg-orange-50/30"
                                                }`}
                                        >
                                            <span className="text-sm font-black tracking-tight">{l}</span>
                                            <span className={`text-[9px] uppercase font-bold tracking-widest text-center px-1 leading-tight ${level === l ? "text-orange-100" : "text-gray-400"}`}>
                                                {LEVEL_STAGE_LABEL[board]?.[l] || "General"}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Button
                                className="w-full py-6 bg-orange-500 hover:bg-orange-600 font-bold text-lg shadow-md"
                                disabled={!topic || isGenerating}
                                onClick={handleGenerate}
                            >
                                {isGenerating ? "Generating Trail..." : "🚀 Generate Trail"}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Quick Profile Summary */}
                    <Card className="shadow-sm border-none bg-orange-50/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-orange-900 uppercase tracking-wider">
                                Personalisation Key
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {child.assessments?.[0]?.answers && (
                                <div className="flex flex-wrap gap-2">
                                    {Object.values(child.assessments[0].answers as Record<string, string[]>).flat().slice(0, 6).map((tag, i) => (
                                        <Badge key={i} variant="outline" className="bg-white/80 text-orange-700 border-orange-200">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Panel: Result & Rubric */}
                <div className="lg:col-span-8 space-y-8">
                    {!trailContent && !isGenerating ? (
                        <div className="h-full flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400">
                            <Rocket className="h-16 w-16 mb-4 opacity-20" />
                            <p className="text-lg font-medium">Select a topic and generate a personalized trail</p>
                        </div>
                    ) : isGenerating ? (
                        <div className="h-full flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                            <p className="text-gray-500 font-medium">Curating {child.name}'s personalized activity...</p>
                        </div>
                    ) : (
                        <>
                            {/* AI Content */}
                            <Card className="shadow-sm border-none bg-white">
                                <CardHeader className="flex flex-row items-center justify-between border-b border-gray-50 pb-4">
                                    <div>
                                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                            {topic} Activity
                                        </CardTitle>
                                        <CardDescription>{board} • {subject}</CardDescription>
                                    </div>
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-3 py-1 flex gap-1 items-center">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Personalised
                                    </Badge>
                                </CardHeader>
                                <CardContent className="pt-8 prose prose-orange max-w-none">
                                    <ReactMarkdown>{trailContent}</ReactMarkdown>
                                </CardContent>
                            </Card>

                            {/* Evaluation Rubric */}
                            <Card className="shadow-sm border-none bg-white overflow-hidden">
                                <CardHeader className="bg-gray-900 text-white">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg font-bold">Evaluation Rubric</CardTitle>
                                            <CardDescription className="text-gray-400">Score child's performance on this activity</CardDescription>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Estimated Level</div>
                                            <div className="text-3xl font-black text-orange-400">{masteryLevel}</div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 space-y-10">
                                    {RUBRIC_BY_DOMAIN[inferDomain(topic)].map((item) => (
                                        <div key={item} className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-800">{item}</span>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                                                                <Info className="h-4 w-4" />
                                                            </button>
                                                        </PopoverTrigger>
                                                        <PopoverContent side="right" className="w-80 p-0 shadow-xl border-none">
                                                            <div className="bg-gray-900 text-white p-3 font-bold text-xs uppercase tracking-widest">{item} Guide</div>
                                                            <div className="p-2 space-y-1">
                                                                {[1, 2, 3, 4, 5].map(v => (
                                                                    <div key={v} className="flex gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors">
                                                                        <span className="font-black text-orange-500">{v}</span>
                                                                        <span className="text-xs text-gray-600 leading-relaxed font-medium">
                                                                            {RUBRIC_SCORE_GUIDE[item]?.[v] || "N/A"}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                                <span className="text-sm font-black text-orange-600 bg-orange-50 w-8 h-8 flex items-center justify-center rounded-full border border-orange-100">
                                                    {scores[item] || 0}
                                                </span>
                                            </div>
                                            <Slider
                                                defaultValue={[3]}
                                                max={5}
                                                min={1}
                                                step={1}
                                                onValueChange={(val) => setScores(s => ({ ...s, [item]: val[0] }))}
                                                className="[&_[role=slider]]:bg-orange-600 [&_[role=slider]]:border-orange-600"
                                            />
                                        </div>
                                    ))}

                                    {/* Equilibrium Tables */}
                                    <div className="pt-8 border-t border-gray-100 space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                                                    Cross-Board Equivalence
                                                </h4>
                                                <div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                                                    <table className="w-full text-sm">
                                                        <thead className="bg-gray-50 border-b border-gray-100">
                                                            <tr>
                                                                <th className="text-left py-3 px-4 font-bold text-gray-600">Board</th>
                                                                <th className="text-center py-3 px-4 font-bold text-gray-600">Level</th>
                                                                <th className="text-right py-3 px-4 font-bold text-gray-600">Stage</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-50">
                                                            {Object.keys(BOARD_DIFFICULTY_OFFSET).map(b => {
                                                                const eq = adjustLevel(masteryLevel, BOARD_DIFFICULTY_OFFSET[b]);
                                                                return (
                                                                    <tr key={b} className="bg-white hover:bg-gray-50/50">
                                                                        <td className="py-3 px-4 font-medium text-gray-800">{b}</td>
                                                                        <td className="py-3 px-4 text-center font-black text-orange-600">{eq}</td>
                                                                        <td className="py-3 px-4 text-right text-gray-500 font-medium">{LEVEL_STAGE_LABEL[b]?.[eq] || "N/A"}</td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                                    Next Learning Recommendation
                                                </h4>
                                                <div className="rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                                                    <table className="w-full text-sm text-black">
                                                        <thead className="bg-gray-50 border-b border-gray-100">
                                                            <tr>
                                                                <th className="text-left py-3 px-4 font-bold text-gray-600">Board</th>
                                                                <th className="text-left py-3 px-4 font-bold text-gray-600">What to Practice</th>
                                                                <th className="text-right py-3 px-4 font-bold text-gray-600">Target Stage</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-50">
                                                            {Object.keys(BOARD_DIFFICULTY_OFFSET).map(b => {
                                                                const cur = adjustLevel(masteryLevel, BOARD_DIFFICULTY_OFFSET[b]);
                                                                const nextVal = Math.min(5, parseInt(cur.slice(1)) + 1);
                                                                const nextLevel = `L${nextVal}`;
                                                                return (
                                                                    <tr key={b} className="bg-white hover:bg-gray-50/50">
                                                                        <td className="py-3 px-4 font-medium text-gray-800">{b}</td>
                                                                        <td className="py-3 px-4 text-gray-500 font-medium">{nextLevel} level trails</td>
                                                                        <td className="py-3 px-4 text-right text-orange-700 font-bold">{LEVEL_STAGE_LABEL[b]?.[nextLevel] || "N/A"}</td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}

function calculateAge(dob: string) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function getAgeBand(age: number) {
    if (age <= 5) return "Early Years (2–5)";
    if (age <= 10) return "Primary (6–10)";
    if (age <= 13) return "Middle (11–13)";
    if (age <= 16) return "Secondary (14–16)";
    return "Senior Secondary (16–18)";
}

function inferDomain(topic: string) {
    const t = topic.toLowerCase();
    if (t.includes("number") || t.includes("math")) return "Numbers";
    if (t.includes("language") || t.includes("english")) return "Language";
    return "EVS";
}

function scoreToLevel(score: number) {
    if (score <= 8) return "L1";
    if (score <= 13) return "L2";
    if (score <= 18) return "L3";
    if (score <= 22) return "L4";
    return "L5";
}

function adjustLevel(level: string, offset: number) {
    const base = parseInt(level.slice(1));
    const newVal = Math.max(1, Math.min(5, Math.round(base - offset)));
    return `L${newVal}`;
}
