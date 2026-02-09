'use client';

import { useState, useEffect, useMemo } from 'react';
import { Student, LEARNING_STYLES } from '@/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import ReactMarkdown from 'react-markdown';
import { generateTrail, generateTopicSpecificRubric, analyzeUniversityReadiness, saveEvaluation, getSubjectAverageScores, getTopicResources } from '@/app/trails/actions';
import { ChevronLeft, Rocket, Info, Sparkles, Brain, GraduationCap, ChevronDown, ChevronUp, Youtube, ExternalLink, RefreshCw, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Topic {
    topic_id: string;
    topic_name: string;
    difficulty: string;
    estimated_minutes: number;
    recommended_methods: string[];
    assessment: {
        quiz?: boolean;
        practice?: boolean;
    };
    prerequisites: string[];
}

interface Chapter {
    chapter_id: string;
    chapter_no: number;
    chapter_name: string;
    domain: string;
    topics: Topic[];
}

interface SyllabusData {
    [board: string]: {
        [standard: string]: {
            [subject: string]: Chapter[];
        };
    };
}

interface TrailsClientProps {
    student: Student;
    syllabus: SyllabusData;
    initialBoard?: string;
    initialSubject?: string;
    initialTopic?: string;
}

// const LEARNING_STYLES = ["Visual", "Auditory", "Kinesthetic", "Read/Write"];

export default function TrailsClient({
    student,
    syllabus,
    initialBoard = "",
    initialSubject = "",
    initialTopic = ""
}: TrailsClientProps) {
    const [board, setBoard] = useState(initialBoard);
    const [standard, setStandard] = useState("");
    const [subject, setSubject] = useState(initialSubject);
    const [learningStyles, setLearningStyles] = useState<string[]>(
        student.learning_style ? [student.learning_style] : []
    );

    const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
    const [topicTrails, setTopicTrails] = useState<Record<string, string>>({});
    const [topicRubrics, setTopicRubrics] = useState<Record<string, {
        criteria: Array<{
            name: string;
            description: string;
            max_score: number;
        }>;
    }>>({});
    const [topicScores, setTopicScores] = useState<Record<string, Record<string, number>>>({});
    const [topicResources, setTopicResources] = useState<Record<string, {
        title: string;
        channel: string;
        url: string;
    }>>({});
    const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});

    const [universityReadiness, setUniversityReadiness] = useState<Record<string, {
        closeness_percent: number;
        reasoning: string;
    }> | null>(null);
    const [evaluationSuccess, setEvaluationSuccess] = useState<string | null>(null); // NEW: Track which topic was just evaluated
    const [subjectAverages, setSubjectAverages] = useState<Record<string, number>>({ Mathematics: 0, Science: 0 });

    const age = calculateAge(student.date_of_birth);
    const ageBand = getAgeBand(age);

    const boards = Object.keys(syllabus);
    const standards = useMemo(() => board ? Object.keys(syllabus[board] || {}) : [], [board, syllabus]);

    // Auto-select standard based on age band if standards are available
    // Auto-select standard extraction removed to prevent render loops
    // useEffect(() => {
    //     if (standards.length > 0 && !standard) {
    //         const defaultStd = standards.find(s => s.includes(age === 13 ? "8" : "9")) || standards[0];
    //         setStandard(defaultStd);
    //     }
    // }, [standards, standard, age]);

    const subjects = (board && standard) ? Object.keys(syllabus[board]?.[standard] || {}) : [];

    // Deriving topics and subtopics
    const syllabusData = (board && standard && subject) ? (syllabus[board][standard][subject] || []) : [];

    interface SyllabusTopic {
        topic_id: string;
        topic_name: string;
        chapter_name: string;
    }

    const allTopics: SyllabusTopic[] = syllabusData.flatMap((chapter: Chapter) => {
        if (chapter.topics && Array.isArray(chapter.topics)) {
            return chapter.topics.map((t: Topic) => ({
                topic_id: t.topic_id,
                topic_name: t.topic_name,
                chapter_name: chapter.chapter_name
            }));
        }
        return [];
    });

    useEffect(() => {
        if (initialTopic && allTopics.some(t => t.topic_name === initialTopic)) {
            setExpandedTopics({ [initialTopic]: true });
        }
    }, [initialTopic, allTopics]);

    useEffect(() => {
        const loadAverages = async () => {
            const averages = await getSubjectAverageScores(student.id);
            setSubjectAverages(averages);
        };
        loadAverages();
    }, [student.id]);

    // Fetch resources when a topic is expanded
    useEffect(() => {
        const fetchResourcesForExpandedTopics = async () => {
            const topicsToFetch = Object.keys(expandedTopics).filter(
                topic => expandedTopics[topic] && !topicResources[topic]
            );

            if (topicsToFetch.length === 0) return;

            // Fetch resources for newly expanded topics
            await Promise.all(topicsToFetch.map(async (topicName) => {
                try {
                    // Start fetching immediately
                    const resource = await getTopicResources(topicName, subject, standard || '8');
                    setTopicResources(prev => ({ ...prev, [topicName]: resource }));
                } catch (err) {
                    console.error(`Failed to fetch resource for ${topicName}`, err);
                }
            }));
        };

        fetchResourcesForExpandedTopics();
    }, [expandedTopics, topicResources, subject, standard]);

    const toggleLearningStyle = (style: string) => {
        setLearningStyles(prev =>
            prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
        );
    };

    const toggleTopic = (topic: string) => {
        setExpandedTopics(prev => ({ ...prev, [topic]: !prev[topic] }));
    };

    const handleGenerateTrail = async (topicName: string, forceRefresh: boolean = false) => {
        setIsGenerating(prev => ({ ...prev, [topicName]: true }));
        try {
            const [trailRes, rubricRes] = await Promise.all([
                generateTrail({
                    studentId: student.id,
                    board,
                    grade: standard,
                    subject,
                    topic: topicName,
                    learningStyles,
                    forceRefresh
                }),
                generateTopicSpecificRubric({
                    topic: topicName,
                    subject,
                    learningStyles
                })
            ]);

            setTopicTrails(prev => ({ ...prev, [topicName]: trailRes.content || '' }));
            setTopicRubrics(prev => ({ ...prev, [topicName]: rubricRes }));
            // Resource is already fetched via effect, no need to set here again

            const initialScores: Record<string, number> = {};
            rubricRes.criteria.forEach((c: { name: string; max_score: number }) => initialScores[c.name] = Math.floor(c.max_score / 2));
            setTopicScores(prev => ({ ...prev, [topicName]: initialScores }));
        } catch (error) {
            console.error(error);
            alert("Failed to generate trail.");
        } finally {
            setIsGenerating(prev => ({ ...prev, [topicName]: false }));
        }
    };

    const handleSubmitEvaluation = async (topicName: string) => {
        setIsSubmitting(prev => ({ ...prev, [topicName]: true }));
        try {
            const rubric = topicRubrics[topicName];
            const scores = topicScores[topicName];

            const totalMax = rubric.criteria.reduce((a: number, b) => a + b.max_score, 0);
            const obtained = Object.values(scores).reduce((a, b) => a + b, 0);
            const percentageScore = Math.round((obtained / totalMax) * 100);

            // First calculate readiness impact for this evaluation
            const readiness = await analyzeUniversityReadiness({
                subject,
                score: percentageScore
            });

            await saveEvaluation({
                childId: student.id,
                board,
                subject,
                topic: topicName,
                score: percentageScore,
                rubricData: { criteria: rubric.criteria, scores },
                readinessData: readiness
            });

            const averages = await getSubjectAverageScores(student.id);
            setSubjectAverages(averages);
            setUniversityReadiness(readiness);
            setEvaluationSuccess(topicName);

            // Hide success message after 10 seconds
            setTimeout(() => setEvaluationSuccess(null), 10000);
        } catch (error) {
            console.error(error);
            alert("Failed to save evaluation.");
        } finally {
            setIsSubmitting(prev => ({ ...prev, [topicName]: false }));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 sm:py-6 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-6">
                        <Link href={`/dashboard?studentId=${student.id}`}>
                            <Button variant="ghost" size="icon" className="rounded-2xl h-10 w-10 sm:h-12 sm:w-12 hover:bg-gray-50">
                                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-lg sm:text-2xl font-black text-gray-900 tracking-tight leading-none mb-1">Learning Trail Genesis</h1>
                            <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{student.name} • {age} years • {ageBand}</p>
                        </div>
                    </div>
                    <Link href={`/reports?studentId=${student.id}`}>
                        <Button className="rounded-xl h-10 px-4 font-bold gap-2 bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-lg shadow-gray-200/50">
                            <GraduationCap className="h-4 w-4" />
                            <span className="hidden sm:inline">View Report Card</span>
                        </Button>
                    </Link>
                </div>
            </div>

            <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-4 space-y-6">
                    <Card className="shadow-xl shadow-gray-200/50 border-none rounded-[2rem] overflow-hidden bg-white">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-lg font-black flex items-center gap-2 text-gray-900 uppercase tracking-tight">
                                <Rocket className="h-5 w-5 text-primary" />
                                Parameters
                            </CardTitle>
                            <CardDescription className="text-gray-400 font-medium">Define diagnostic and content constraints</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">Board</Label>
                                <div className="relative">
                                    <select
                                        value={board}
                                        onChange={(e) => setBoard(e.target.value)}
                                        className="w-full h-12 bg-gray-50/50 border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-primary/20 focus:border-primary hover:bg-white transition-all px-4 appearance-none outline-none font-medium"
                                    >
                                        <option value="" disabled>Select Framework</option>
                                        {boards.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">Standard / Grade</Label>
                                <div className="relative">
                                    <select
                                        disabled={!board}
                                        value={standard}
                                        onChange={(e) => setStandard(e.target.value)}
                                        className="w-full h-12 bg-gray-50/50 border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-primary/20 focus:border-primary hover:bg-white transition-all px-4 appearance-none outline-none font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="" disabled>Select Grade</option>
                                        {standards.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">Subject</Label>
                                <div className="relative">
                                    <select
                                        disabled={!standard}
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full h-12 bg-gray-50/50 border border-gray-200 rounded-xl text-black focus:ring-2 focus:ring-primary/20 focus:border-primary hover:bg-white transition-all px-4 appearance-none outline-none font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="" disabled>Select Discipline</option>
                                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">Learning Styles</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    {LEARNING_STYLES.map(style => (
                                        <div key={style} className="flex items-center space-x-2 bg-gray-50/50 p-3 rounded-xl border border-gray-100 hover:bg-white transition-all">
                                            <Checkbox
                                                id={style}
                                                checked={learningStyles.includes(style)}
                                                onCheckedChange={() => toggleLearningStyle(style)}
                                            />
                                            <label htmlFor={style} className="text-xs font-bold text-gray-600 cursor-pointer">{style}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {(subjectAverages.Mathematics > 0 || subjectAverages.Science > 0) && (
                        <Card className="shadow-xl shadow-gray-200/50 border-none rounded-[2rem] overflow-hidden bg-white">
                            <CardHeader className="p-8 pb-4">
                                <CardTitle className="text-lg font-black flex items-center gap-2 text-gray-900 uppercase tracking-tight">
                                    <Brain className="h-5 w-5 text-primary" />
                                    Academic Proficiency
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-4 space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-bold text-gray-600">Numeracy (Maths)</span>
                                            <span className="text-2xl font-black text-primary">{subjectAverages.Mathematics}/100</span>
                                        </div>
                                        <Progress value={subjectAverages.Mathematics} className="h-3" />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-bold text-gray-600">Science</span>
                                            <span className="text-2xl font-black text-primary">{subjectAverages.Science}/100</span>
                                        </div>
                                        <Progress value={subjectAverages.Science} className="h-3" />
                                    </div>
                                </div>

                                {universityReadiness && (
                                    <div className="pt-6 border-t border-gray-100 space-y-4">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                                            <GraduationCap className="h-3 w-3" />
                                            University Readiness
                                        </div>
                                        {Object.entries(universityReadiness).map(([exam, data]) => (
                                            <div key={exam} className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-gray-600">{exam}</span>
                                                    <span className="text-lg font-black text-gray-900">{data.closeness_percent}%</span>
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-medium">{data.reasoning}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                </div>

                <div className="lg:col-span-8 space-y-8">
                    {!subject ? (
                        <div className="h-full min-h-[500px] flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border-4 border-dashed border-gray-50 text-gray-300">
                            <Rocket className="h-24 w-24 mb-6 opacity-10" />
                            <p className="text-xl font-black tracking-tight uppercase">Select Board & Subject</p>
                            <p className="text-sm font-medium text-gray-400 mt-2">Choose parameters to view available topics</p>
                        </div>
                    ) : allTopics.length === 0 ? (
                        <div className="h-full min-h-[500px] flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border-4 border-dashed border-gray-50 text-gray-300">
                            <Rocket className="h-24 w-24 mb-6 opacity-10" />
                            <p className="text-xl font-black tracking-tight uppercase">No Topics Found</p>
                            <p className="text-sm font-medium text-gray-400 mt-2">This subject has no topics defined</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">{subject} Topics</h2>
                                    <p className="text-sm font-medium text-gray-400 mt-1">{allTopics.length} topics available in {syllabusData.length} chapters</p>
                                </div>
                            </div>

                            <div className="space-y-12">
                                {syllabusData.map((chapter: Chapter, cIndex: number) => (
                                    <div key={chapter.chapter_id || cIndex} className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-black">
                                                {chapter.chapter_no || cIndex + 1}
                                            </div>
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">{chapter.chapter_name}</h3>
                                        </div>

                                        <div className="space-y-4 border-l-2 border-gray-100 ml-5 pl-8">
                                            {chapter.topics.map((topic: Topic, tIndex: number) => (
                                                <Collapsible
                                                    key={topic.topic_id || tIndex}
                                                    open={expandedTopics[topic.topic_name]}
                                                    onOpenChange={() => toggleTopic(topic.topic_name)}
                                                >
                                                    <Card className="shadow-sm border-none rounded-[2rem] overflow-hidden bg-white hover:shadow-md transition-all">
                                                        <CollapsibleTrigger className="w-full">
                                                            <CardHeader className="p-6 flex flex-row items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center font-black text-xs text-primary">
                                                                        {tIndex + 1}
                                                                    </div>
                                                                    <div className="text-left">
                                                                        <h4 className="text-lg font-black text-gray-900">{topic.topic_name}</h4>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <Badge variant="outline" className="text-[9px] font-bold uppercase rounded-md py-0">{topic.difficulty}</Badge>
                                                                            <span className="text-[10px] text-gray-400 font-bold">{topic.estimated_minutes} mins</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {expandedTopics[topic.topic_name] ? (
                                                                    <ChevronUp className="h-5 w-5 text-gray-400" />
                                                                ) : (
                                                                    <ChevronDown className="h-5 w-5 text-gray-400" />
                                                                )}
                                                            </CardHeader>
                                                        </CollapsibleTrigger>

                                                        <CollapsibleContent>
                                                            <CardContent className="p-8 pt-0 space-y-8">
                                                                {/* Display Resource Proactively */}
                                                                {topicResources[topic.topic_name] && !topicTrails[topic.topic_name] && (
                                                                    <div className="mb-6">
                                                                        <Card className="border border-blue-100 bg-blue-50/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                                                                            <CardContent className="p-4 flex items-center justify-between">
                                                                                <div className="flex items-center gap-4">
                                                                                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                                                                                        <Youtube className="w-5 h-5 text-red-500" />
                                                                                    </div>
                                                                                    <div className="min-w-0">
                                                                                        <p className="font-black text-gray-900 text-sm leading-tight truncate">{topicResources[topic.topic_name].title}</p>
                                                                                        <div className="flex items-center gap-2 mt-0.5">
                                                                                            <Badge variant="outline" className="text-[8px] font-black uppercase text-gray-400 border-gray-200">Video Resource</Badge>
                                                                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">{topicResources[topic.topic_name].channel}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="rounded-xl hover:bg-white text-blue-600"
                                                                                    onClick={() => window.open(topicResources[topic.topic_name].url, '_blank')}
                                                                                >
                                                                                    <ExternalLink className="w-4 h-4" />
                                                                                </Button>
                                                                            </CardContent>
                                                                        </Card>
                                                                    </div>
                                                                )}

                                                                {!topicTrails[topic.topic_name] ? (
                                                                    <Button
                                                                        className="w-full h-14 bg-primary hover:bg-primary/90 font-black text-lg rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-95"
                                                                        disabled={isGenerating[topic.topic_name]}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleGenerateTrail(topic.topic_name);
                                                                        }}
                                                                    >
                                                                        {isGenerating[topic.topic_name] ? "Generating..." : "🚀 Generate Learning Trail"}
                                                                    </Button>
                                                                ) : (
                                                                    <>
                                                                        <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:font-medium prose-p:text-gray-600">
                                                                            {(() => {
                                                                                const content = topicTrails[topic.topic_name];
                                                                                const lines = content.split('\n');
                                                                                const heading = lines[0];
                                                                                const rest = lines.slice(1).join('\n');
                                                                                const resource = topicResources[topic.topic_name];

                                                                                return (
                                                                                    <>
                                                                                        <ReactMarkdown>{heading}</ReactMarkdown>

                                                                                        {resource && (
                                                                                            <div className="my-6">
                                                                                                <Card className="border border-blue-100 bg-blue-50/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                                                                                                    <CardContent className="p-4 flex items-center justify-between">
                                                                                                        <div className="flex items-center gap-4">
                                                                                                            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                                                                                                                <Youtube className="w-5 h-5 text-red-500" />
                                                                                                            </div>
                                                                                                            <div className="min-w-0">
                                                                                                                <p className="font-black text-gray-900 text-sm leading-tight truncate">{resource.title}</p>
                                                                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                                                                    <Badge variant="outline" className="text-[8px] font-black uppercase text-gray-400 border-gray-200">Video Resource</Badge>
                                                                                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">{resource.channel}</span>
                                                                                                                </div>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <Button
                                                                                                            variant="ghost"
                                                                                                            size="icon"
                                                                                                            className="rounded-xl hover:bg-white text-blue-600"
                                                                                                            onClick={() => window.open(resource.url, '_blank')}
                                                                                                        >
                                                                                                            <ExternalLink className="w-4 h-4" />
                                                                                                        </Button>
                                                                                                    </CardContent>
                                                                                                </Card>
                                                                                            </div>
                                                                                        )}

                                                                                        <ReactMarkdown>{rest}</ReactMarkdown>
                                                                                    </>
                                                                                );
                                                                            })()}
                                                                        </div>

                                                                        {topicRubrics[topic.topic_name] && (
                                                                            <div className="bg-gray-900 rounded-[2rem] overflow-hidden">
                                                                                <div className="p-8 border-b border-gray-800 flex items-center justify-between">
                                                                                    <div>
                                                                                        <h4 className="text-xl font-black text-white">Performance Matrix</h4>
                                                                                        <p className="text-sm text-gray-400 font-medium">Diagnostic evaluation of student execution</p>
                                                                                    </div>
                                                                                    <Button
                                                                                        variant="outline"
                                                                                        size="sm"
                                                                                        className="h-8 rounded-lg bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 font-bold text-[10px] uppercase tracking-wider gap-2"
                                                                                        disabled={isGenerating[topic.topic_name]}
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            handleGenerateTrail(topic.topic_name, true);
                                                                                        }}
                                                                                    >
                                                                                        {isGenerating[topic.topic_name] ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                                                                                        New Trail
                                                                                    </Button>
                                                                                </div>
                                                                                <div className="p-8 space-y-8">
                                                                                    {topicRubrics[topic.topic_name].criteria.map((item) => (
                                                                                        <div key={item.name} className="space-y-4">
                                                                                            <div className="flex items-center justify-between">
                                                                                                <div className="flex items-center gap-3">
                                                                                                    <span className="text-lg font-black text-white tracking-tight">{item.name}</span>
                                                                                                    <Popover>
                                                                                                        <PopoverTrigger asChild>
                                                                                                            <button className="text-gray-500 hover:text-primary transition-colors">
                                                                                                                <Info className="h-5 w-5" />
                                                                                                            </button>
                                                                                                        </PopoverTrigger>
                                                                                                        <PopoverContent side="right" className="w-[400px] p-6 shadow-2xl border-none rounded-2xl overflow-hidden bg-white">
                                                                                                            <div className="font-black text-[10px] uppercase tracking-[0.2em] text-primary mb-2">Criterion Detail</div>
                                                                                                            <p className="text-sm font-bold text-gray-600 leading-relaxed">{item.description}</p>
                                                                                                        </PopoverContent>
                                                                                                    </Popover>
                                                                                                </div>
                                                                                                <div className="flex items-center gap-3">
                                                                                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Score / {item.max_score}</span>
                                                                                                    <span className="text-xl font-black text-primary bg-primary/5 w-12 h-12 flex items-center justify-center rounded-2xl border border-primary/10 shadow-inner">
                                                                                                        {topicScores[topic.topic_name]?.[item.name] || 0}
                                                                                                    </span>
                                                                                                </div>
                                                                                            </div>
                                                                                            <Slider
                                                                                                value={[topicScores[topic.topic_name]?.[item.name] || 0]}
                                                                                                max={item.max_score}
                                                                                                min={0}
                                                                                                step={1}
                                                                                                onValueChange={(val) => setTopicScores(prev => ({
                                                                                                    ...prev,
                                                                                                    [topic.topic_name]: { ...prev[topic.topic_name], [item.name]: val[0] }
                                                                                                }))}
                                                                                                className="[&_[role=slider]]:h-6 [&_[role=slider]]:w-6 [&_[role=slider]]:bg-primary [&_[role=slider]]:border-4 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-lg"
                                                                                            />
                                                                                        </div>
                                                                                    ))}

                                                                                    <div className="pt-6 border-t border-gray-800 space-y-4">
                                                                                        {evaluationSuccess === topic.topic_name && (
                                                                                            <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                                                                                                <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest mb-3">
                                                                                                    <Sparkles className="h-3 w-3" />
                                                                                                    Academic Intelligence Update
                                                                                                </div>
                                                                                                <div className="grid grid-cols-3 gap-3">
                                                                                                    {universityReadiness && Object.entries(universityReadiness)
                                                                                                        .filter(([exam]) => ["IIT", "NEET", "GATE", "JEE Advanced (IIT)"].includes(exam))
                                                                                                        .map(([exam, data]) => (
                                                                                                            <div key={exam} className="text-center p-2 rounded-xl bg-white/5 border border-white/5">
                                                                                                                <div className="text-[9px] font-bold text-gray-400 uppercase mb-1">{exam === "JEE Advanced (IIT)" ? "IIT" : exam}</div>
                                                                                                                <div className="text-sm font-black text-white">+{data.closeness_percent}%</div>
                                                                                                            </div>
                                                                                                        ))}
                                                                                                </div>
                                                                                                <p className="text-[10px] text-gray-400 font-medium mt-3 text-center">Score: {Math.round((Object.values(topicScores[topic.topic_name] || {}).reduce((a, b) => a + b, 0) / topicRubrics[topic.topic_name].criteria.reduce((a, b) => a + b.max_score, 0)) * 100)}% Mastered</p>
                                                                                            </div>
                                                                                        )}
                                                                                        <div className="flex justify-end">
                                                                                            <Button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    handleSubmitEvaluation(topic.topic_name);
                                                                                                }}
                                                                                                disabled={isSubmitting[topic.topic_name]}
                                                                                                className="bg-primary hover:bg-primary/90 text-white font-black px-10 h-14 rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-95 w-full sm:w-auto"
                                                                                            >
                                                                                                {isSubmitting[topic.topic_name] ? "Saving..." : "✅ Submit Evaluation"}
                                                                                            </Button>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </CardContent>
                                                        </CollapsibleContent>
                                                    </Card>
                                                </Collapsible>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
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
