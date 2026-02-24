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
import { generateTrail, evaluateSubmission, saveEvaluation, getSubjectAverageScores, getTopicResources } from '@/app/trails/actions';
import { ChevronLeft, Rocket, Info, Sparkles, Brain, GraduationCap, ChevronDown, ChevronUp, Youtube, ExternalLink, RefreshCw, Loader2, Send, CheckCircle2, XCircle, ImagePlus, Mic, Music, Play, Square, Trash2, Camera, BarChart3 } from 'lucide-react';
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

interface TrailContent {
    objective: string;
    concept: string;
    activities: Array<{
        title: string;
        steps: string[];
        safety_note?: string;
    }>;
    reflection_discussion: string[];
    learning_outcomes: string[];
    assessment_criteria: Array<{
        criterion: string;
        description: string;
    }>;
}

interface TrailsClientProps {
    student: Student;
    syllabus: SyllabusData;
    initialBoard?: string;
    initialSubject?: string;
    initialTopic?: string;
}

interface SubmissionState {
    type: 'Text' | 'Image' | 'Audio';
    text: string;
    imageFile?: File;
    imageUrl?: string;
    audioFile?: File;
    audioUrl?: string;
}

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
    const [level, setLevel] = useState(1);
    const [learningStyles, setLearningStyles] = useState<string[]>(
        student.learning_style ? [student.learning_style] : []
    );

    const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
    const [topicTrails, setTopicTrails] = useState<Record<string, TrailContent>>({});
    const [topicSubmissions, setTopicSubmissions] = useState<Record<string, SubmissionState>>({});
    const [topicEvaluations, setTopicEvaluations] = useState<Record<string, {
        scores: Record<string, number>;
        feedback: string;
        passed: boolean;
        percentage?: number;
        masteredLevels?: number[]; // Track levels mastered for this topic
    }>>({});

    const [topicLevels, setTopicLevels] = useState<Record<string, number>>({}); // Track active level selection per topic

    const [topicResources, setTopicResources] = useState<Record<string, {
        title: string;
        channel: string;
        url: string;
    }>>({});
    const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
    const [isEvaluating, setIsEvaluating] = useState<Record<string, boolean>>({});

    const [evaluationSuccess, setEvaluationSuccess] = useState<string | null>(null);

    // Reset standard & subject when board changes
    useEffect(() => {
        setStandard("");
        setSubject("");
    }, [board]);

    // Reset subject when standard changes
    useEffect(() => {
        setSubject("");
    }, [standard]);

    const handleFileChange = (topicName: string, type: 'Image' | 'Audio', file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setTopicSubmissions(prev => ({
                ...prev,
                [topicName]: {
                    ...prev[topicName],
                    [type === 'Image' ? 'imageFile' : 'audioFile']: file,
                    [type === 'Image' ? 'imageUrl' : 'audioUrl']: reader.result as string
                }
            }));
        };
        reader.readAsDataURL(file);
    };

    const clearSubmissionMedia = (topicName: string, type: 'Image' | 'Audio') => {
        setTopicSubmissions(prev => {
            const current = prev[topicName];
            if (!current) return prev;

            const newState = { ...current };
            if (type === 'Image') {
                delete newState.imageFile;
                delete newState.imageUrl;
            } else {
                delete newState.audioFile;
                delete newState.audioUrl;
            }

            return {
                ...prev,
                [topicName]: newState
            };
        });
    };

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

    const handleGenerateTrail = async (topicName: string, forceRefresh: boolean = false, levelOverride?: number) => {
        setIsGenerating(prev => ({ ...prev, [topicName]: true }));
        try {
            const currentTopicLevel = levelOverride || topicLevels[topicName] || 1;
            const trailRes = await generateTrail({
                studentId: student.id,
                board,
                grade: standard,
                subject,
                topic: topicName,
                level: currentTopicLevel, // Use topic-specific level
                syllabus,
                learningStyles,
                forceRefresh
            });

            const content = JSON.parse(trailRes.content) as TrailContent;
            setTopicTrails(prev => ({ ...prev, [topicName]: content }));

            // Initialize submission state if not exists
            if (!topicSubmissions[topicName]) {
                setTopicSubmissions(prev => ({
                    ...prev,
                    [topicName]: { type: 'Text', text: '' }
                }));
            }
        } catch (error) {
            console.error(error);
            alert("Failed to generate trail.");
        } finally {
            setIsGenerating(prev => ({ ...prev, [topicName]: false }));
        }
    };

    const handleSubmitSubmission = async (topicName: string) => {
        const submission = topicSubmissions[topicName];
        if (!submission) return;

        const hasText = submission.text.trim() !== '';
        const hasMedia = submission.imageUrl || submission.audioUrl;

        if (!hasText && !hasMedia) {
            alert("Please provide a submission (text, image, or audio).");
            return;
        }
        setIsEvaluating(prev => ({ ...prev, [topicName]: true }));
        try {
            const currentTopicLevel = topicLevels[topicName] || 1;
            const result = await evaluateSubmission({
                studentId: student.id,
                submissionText: submission.text,
                topic: topicName,
                level: currentTopicLevel, // Use topic-specific level
                mediaType: submission.type,
                mediaData: submission.imageUrl || submission.audioUrl
            });

            const scores = result.scores;
            const totalScore = Object.values(scores).reduce((a: number, b) => (a as number) + (b as number), 0) as number;
            const maxScore = Object.keys(scores).length * 4;
            const percentage = (totalScore / maxScore) * 100;
            const passed = percentage >= 70;

            setTopicEvaluations(prev => ({
                ...prev,
                [topicName]: {
                    scores,
                    feedback: result.feedback,
                    passed,
                    percentage: Math.round(percentage),
                    masteredLevels: passed
                        ? Array.from(new Set([...(prev[topicName]?.masteredLevels || []), currentTopicLevel]))
                        : prev[topicName]?.masteredLevels || []
                }
            }));

            // Save evaluation to DB
            await saveEvaluation({
                childId: student.id,
                board,
                subject,
                topic: topicName,
                score: Math.round(percentage),
                rubricData: {
                    criteria: topicTrails[topicName].assessment_criteria.map(c => ({
                        name: c.criterion,
                        description: c.description,
                        max_score: 4
                    })),
                    scores
                }
            });

            if (passed) {
                setEvaluationSuccess(topicName);
                // The user can now progress to the next level
            }
        } catch (error) {
            console.error(error);
            alert("Failed to evaluate submission.");
        } finally {
            setIsEvaluating(prev => ({ ...prev, [topicName]: false }));
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
                                    <p className="text-sm font-medium text-gray-400 mt-1">{allTopics.length} topics available</p>
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
                                                        <CollapsibleTrigger asChild>
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
                                                                            {topicEvaluations[topic.topic_name]?.passed && (
                                                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none text-[9px] font-black uppercase py-0">Mastered L{topicLevels[topic.topic_name] || 1}</Badge>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    <div
                                                                        className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl"
                                                                        onClick={(e) => e.stopPropagation()} // Stop propagation here
                                                                    >
                                                                        {[1, 2, 3, 4, 5].map(lvl => {
                                                                            const isCurrent = (topicLevels[topic.topic_name] || 1) === lvl;
                                                                            const masteredLevels = topicEvaluations[topic.topic_name]?.masteredLevels || [];
                                                                            const isUnlocked = lvl === 1 || masteredLevels.includes(lvl - 1);

                                                                            return (
                                                                                <Button
                                                                                    key={lvl}
                                                                                    variant={isCurrent ? "default" : "ghost"}
                                                                                    size="sm"
                                                                                    disabled={!isUnlocked}
                                                                                    className={`h-7 px-2.5 rounded-lg font-black text-[10px] transition-all ${isCurrent ? "bg-gray-900 text-white" :
                                                                                        isUnlocked ? "text-gray-500 hover:text-gray-900" : "text-gray-300 cursor-not-allowed"
                                                                                        }`}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setTopicLevels(prev => ({ ...prev, [topic.topic_name]: lvl }));
                                                                                        // Clear current trail when level changed manually if needed
                                                                                        setTopicTrails(prev => {
                                                                                            const nextData = { ...prev };
                                                                                            delete nextData[topic.topic_name];
                                                                                            return nextData;
                                                                                        });
                                                                                    }}
                                                                                >
                                                                                    L{lvl}
                                                                                </Button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                    {expandedTopics[topic.topic_name] ? (
                                                                        <ChevronUp className="h-5 w-5 text-gray-400" />
                                                                    ) : (
                                                                        <ChevronDown className="h-5 w-5 text-gray-400" />
                                                                    )}
                                                                </div>
                                                            </CardHeader>
                                                        </CollapsibleTrigger>

                                                        <CollapsibleContent>
                                                            <CardContent className="p-8 pt-0 space-y-8">
                                                                {!topicTrails[topic.topic_name] ? (
                                                                    <div className="space-y-6">
                                                                        {topicResources[topic.topic_name] && (
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
                                                                        )}
                                                                        <Button
                                                                            className="w-full h-14 bg-primary hover:bg-primary/90 font-black text-lg rounded-xl shadow-xl shadow-primary/20 transition-all active:scale-95"
                                                                            disabled={isGenerating[topic.topic_name]}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleGenerateTrail(topic.topic_name);
                                                                            }}
                                                                        >
                                                                            {isGenerating[topic.topic_name] ? `Generating Level ${topicLevels[topic.topic_name] || 1} Trail...` : `🚀 Generate Level ${topicLevels[topic.topic_name] || 1} Trail`}
                                                                        </Button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="space-y-10">
                                                                        {/* Trail Content */}
                                                                        <div className="space-y-8">
                                                                            <div>
                                                                                <div className="flex items-center gap-2 mb-4">
                                                                                    <Rocket className="h-5 w-5 text-primary" />
                                                                                    <h5 className="text-sm font-black text-gray-900 uppercase tracking-widest">Objective</h5>
                                                                                </div>
                                                                                <p className="text-xl font-black text-gray-900 leading-tight">{topicTrails[topic.topic_name].objective}</p>
                                                                            </div>

                                                                            <Card className="border-none bg-gray-50 rounded-[2rem] p-8">
                                                                                <div className="flex items-center gap-2 mb-4">
                                                                                    <Brain className="h-5 w-5 text-primary" />
                                                                                    <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest">The Concept</h5>
                                                                                </div>
                                                                                <p className="text-lg font-bold text-gray-700 leading-relaxed italic">"{topicTrails[topic.topic_name].concept}"</p>
                                                                            </Card>

                                                                            <div className="space-y-6">
                                                                                <div className="flex items-center gap-2">
                                                                                    <Sparkles className="h-5 w-5 text-primary" />
                                                                                    <h5 className="text-sm font-black text-gray-900 uppercase tracking-widest">Activities</h5>
                                                                                </div>
                                                                                <div className="grid grid-cols-1 gap-6">
                                                                                    {topicTrails[topic.topic_name].activities.map((activity, idx) => (
                                                                                        <Card key={idx} className="border-2 border-gray-100 rounded-[2rem] p-8 shadow-none hover:border-primary/20 transition-all">
                                                                                            <h6 className="text-xl font-black text-gray-900 mb-4">{activity.title}</h6>
                                                                                            <ul className="space-y-3">
                                                                                                {activity.steps.map((step, sIdx) => (
                                                                                                    <li key={sIdx} className="flex gap-3 text-gray-600 font-medium leading-relaxed">
                                                                                                        <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{sIdx + 1}</span>
                                                                                                        {step}
                                                                                                    </li>
                                                                                                ))}
                                                                                            </ul>
                                                                                            {activity.safety_note && (
                                                                                                <div className="mt-6 flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold leading-none">
                                                                                                    <Info className="h-3 w-3" />
                                                                                                    {activity.safety_note}
                                                                                                </div>
                                                                                            )}
                                                                                        </Card>
                                                                                    ))}
                                                                                </div>
                                                                            </div>

                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10 border-b border-gray-100">
                                                                                <div>
                                                                                    <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Reflection & Discussion</h5>
                                                                                    <div className="space-y-2">
                                                                                        {topicTrails[topic.topic_name].reflection_discussion.map((q, qIdx) => (
                                                                                            <div key={qIdx} className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                                                                                <p className="text-sm font-bold text-blue-900">{q}</p>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                                <div>
                                                                                    <h5 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Learning Outcomes</h5>
                                                                                    <div className="space-y-2">
                                                                                        {topicTrails[topic.topic_name].learning_outcomes.map((lo, loIdx) => (
                                                                                            <div key={loIdx} className="flex items-center gap-3">
                                                                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                                                                <p className="text-sm font-medium text-gray-600">{lo}</p>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            <div className="space-y-6 pt-10 border-t border-gray-100">
                                                                                <div className="flex items-center gap-2">
                                                                                    <BarChart3 className="h-5 w-5 text-primary" />
                                                                                    <h5 className="text-sm font-black text-gray-900 uppercase tracking-widest">Assessment Criteria</h5>
                                                                                </div>
                                                                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                                                                    {topicTrails[topic.topic_name].assessment_criteria.map((criteria, index) => (
                                                                                        <div key={index} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-2">
                                                                                            <span className="text-[10px] font-black text-primary uppercase tracking-wider">{criteria.criterion}</span>
                                                                                            <p className="text-xs font-bold text-gray-600 leading-tight">{criteria.description}</p>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                            {/* Submission Section */}
                                                                            <div className="space-y-6 pt-10">
                                                                                <div className="flex items-center justify-between">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <Send className="h-5 w-5 text-primary" />
                                                                                        <h5 className="text-sm font-black text-gray-900 uppercase tracking-widest">Submit Your Work</h5>
                                                                                    </div>
                                                                                    <div className="flex bg-gray-100 p-1 rounded-lg gap-1">
                                                                                        {(['Text', 'Image', 'Audio'] as const).map(type => (
                                                                                            <Button
                                                                                                key={type}
                                                                                                variant="ghost"
                                                                                                size="sm"
                                                                                                className={`h-7 px-3 rounded-md text-[10px] font-black uppercase tracking-tight ${topicSubmissions[topic.topic_name]?.type === type ? "bg-white shadow-sm text-gray-900" : "text-gray-400"}`}
                                                                                                onClick={() => setTopicSubmissions(prev => ({
                                                                                                    ...prev,
                                                                                                    [topic.topic_name]: { ...prev[topic.topic_name], type }
                                                                                                }))}
                                                                                            >
                                                                                                {type}
                                                                                            </Button>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>

                                                                                <div className="space-y-4">
                                                                                    {topicSubmissions[topic.topic_name]?.type === 'Text' ? (
                                                                                        <textarea
                                                                                            className="w-full min-h-[150px] p-4 rounded-2xl border-2 border-gray-100 focus:border-primary outline-none transition-all font-medium text-gray-700 text-sm placeholder:text-gray-300"
                                                                                            placeholder="Write your response here..."
                                                                                            value={topicSubmissions[topic.topic_name]?.text || ''}
                                                                                            onChange={(e) => setTopicSubmissions(prev => ({
                                                                                                ...prev,
                                                                                                [topic.topic_name]: { ...prev[topic.topic_name], text: e.target.value }
                                                                                            }))}
                                                                                        />
                                                                                    ) : topicSubmissions[topic.topic_name]?.type === 'Image' ? (
                                                                                        <div className="space-y-4">
                                                                                            {topicSubmissions[topic.topic_name]?.imageUrl ? (
                                                                                                <div className="relative group rounded-2xl overflow-hidden border-2 border-gray-100 bg-gray-50">
                                                                                                    <img
                                                                                                        src={topicSubmissions[topic.topic_name].imageUrl}
                                                                                                        alt="Preview"
                                                                                                        className="w-full h-auto max-h-[400px] object-contain"
                                                                                                    />
                                                                                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                                        <Button
                                                                                                            size="icon"
                                                                                                            variant="destructive"
                                                                                                            className="rounded-xl shadow-lg"
                                                                                                            onClick={() => clearSubmissionMedia(topic.topic_name, 'Image')}
                                                                                                        >
                                                                                                            <Trash2 className="w-4 h-4" />
                                                                                                        </Button>
                                                                                                    </div>
                                                                                                </div>
                                                                                            ) : (
                                                                                                <div
                                                                                                    className="w-full min-h-[200px] border-2 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                                                                                                    onClick={() => document.getElementById(`image-upload-${topic.topic_name}`)?.click()}
                                                                                                >
                                                                                                    <div className="w-16 h-16 rounded-2xl bg-gray-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                                                                                                        <ImagePlus className="w-8 h-8 text-gray-400 group-hover:text-primary" />
                                                                                                    </div>
                                                                                                    <div className="text-center">
                                                                                                        <p className="font-black text-gray-900">Upload Your Work</p>
                                                                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Click to take a photo or upload</p>
                                                                                                    </div>
                                                                                                    <input
                                                                                                        id={`image-upload-${topic.topic_name}`}
                                                                                                        type="file"
                                                                                                        accept="image/*"
                                                                                                        className="hidden"
                                                                                                        onChange={(e) => {
                                                                                                            const file = e.target.files?.[0];
                                                                                                            if (file) handleFileChange(topic.topic_name, 'Image', file);
                                                                                                        }}
                                                                                                    />
                                                                                                </div>
                                                                                            )}
                                                                                            <textarea
                                                                                                className="w-full min-h-[100px] p-4 rounded-2xl border-2 border-gray-100 focus:border-primary outline-none transition-all font-medium text-gray-700 text-sm placeholder:text-gray-300"
                                                                                                placeholder="Add a caption or notes about your work (optional)..."
                                                                                                value={topicSubmissions[topic.topic_name]?.text || ''}
                                                                                                onChange={(e) => setTopicSubmissions(prev => ({
                                                                                                    ...prev,
                                                                                                    [topic.topic_name]: { ...prev[topic.topic_name], text: e.target.value }
                                                                                                }))}
                                                                                            />
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="space-y-4">
                                                                                            {topicSubmissions[topic.topic_name]?.audioUrl ? (
                                                                                                <div className="p-6 bg-gray-50 rounded-[2rem] border-2 border-gray-100 space-y-4">
                                                                                                    <div className="flex items-center justify-between">
                                                                                                        <div className="flex items-center gap-4">
                                                                                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                                                                                                <Music className="w-6 h-6 text-primary" />
                                                                                                            </div>
                                                                                                            <div>
                                                                                                                <p className="font-black text-gray-900">Audio Recording</p>
                                                                                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ready for evaluation</p>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                        <Button
                                                                                                            size="icon"
                                                                                                            variant="ghost"
                                                                                                            className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                                                                                                            onClick={() => clearSubmissionMedia(topic.topic_name, 'Audio')}
                                                                                                        >
                                                                                                            <Trash2 className="w-4 h-4" />
                                                                                                        </Button>
                                                                                                    </div>
                                                                                                    <audio
                                                                                                        src={topicSubmissions[topic.topic_name].audioUrl}
                                                                                                        controls
                                                                                                        className="w-full h-10 accent-primary"
                                                                                                    />
                                                                                                </div>
                                                                                            ) : (
                                                                                                <div
                                                                                                    className="w-full min-h-[200px] border-2 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
                                                                                                    onClick={() => document.getElementById(`audio-upload-${topic.topic_name}`)?.click()}
                                                                                                >
                                                                                                    <div className="w-16 h-16 rounded-2xl bg-gray-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                                                                                                        <Mic className="w-8 h-8 text-gray-400 group-hover:text-primary" />
                                                                                                    </div>
                                                                                                    <div className="text-center">
                                                                                                        <p className="font-black text-gray-900">Add Voice Submission</p>
                                                                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Record or upload your explanation</p>
                                                                                                    </div>
                                                                                                    <input
                                                                                                        id={`audio-upload-${topic.topic_name}`}
                                                                                                        type="file"
                                                                                                        accept="audio/*"
                                                                                                        className="hidden"
                                                                                                        onChange={(e) => {
                                                                                                            const file = e.target.files?.[0];
                                                                                                            if (file) handleFileChange(topic.topic_name, 'Audio', file);
                                                                                                        }}
                                                                                                    />
                                                                                                </div>
                                                                                            )}
                                                                                            <textarea
                                                                                                className="w-full min-h-[100px] p-4 rounded-2xl border-2 border-gray-100 focus:border-primary outline-none transition-all font-medium text-gray-700 text-sm placeholder:text-gray-300"
                                                                                                placeholder="Add transcript or extra notes (optional)..."
                                                                                                value={topicSubmissions[topic.topic_name]?.text || ''}
                                                                                                onChange={(e) => setTopicSubmissions(prev => ({
                                                                                                    ...prev,
                                                                                                    [topic.topic_name]: { ...prev[topic.topic_name], text: e.target.value }
                                                                                                }))}
                                                                                            />
                                                                                        </div>
                                                                                    )}
                                                                                    <Button
                                                                                        className="w-full h-14 bg-gray-900 hover:bg-black font-black text-white rounded-xl shadow-xl transition-all active:scale-95 gap-2"
                                                                                        disabled={isEvaluating[topic.topic_name]}
                                                                                        onClick={() => handleSubmitSubmission(topic.topic_name)}
                                                                                    >
                                                                                        {isEvaluating[topic.topic_name] ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                                                                        {isEvaluating[topic.topic_name] ? "Evaluating..." : "Evaluate Submission"}
                                                                                    </Button>
                                                                                </div>

                                                                                {/* Evaluation Results */}
                                                                                {topicEvaluations[topic.topic_name] && (
                                                                                    <Card className={`rounded-[2rem] border-none p-8 ${topicEvaluations[topic.topic_name].passed ? "bg-green-50" : "bg-red-50"}`}>
                                                                                        <div className="flex items-center justify-between mb-6">
                                                                                            <div className="flex items-center gap-3">
                                                                                                {topicEvaluations[topic.topic_name].passed ? (
                                                                                                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                                                                                                ) : (
                                                                                                    <XCircle className="h-8 w-8 text-red-500" />
                                                                                                )}
                                                                                                <div>
                                                                                                    <h6 className={`text-xl font-black ${topicEvaluations[topic.topic_name].passed ? "text-green-900" : "text-red-900"}`}>
                                                                                                        {topicEvaluations[topic.topic_name].passed ? (
                                                                                                            level < 5 ? `✅ Mastery achieved! Unlock Level ${level + 1}` : "🌌 Astranova Conquered. Full Cognitive Mastery Achieved."
                                                                                                        ) : (
                                                                                                            "❌ Score below 70% — Repeat this level."
                                                                                                        )}
                                                                                                    </h6>
                                                                                                    <p className={`text-xs font-bold uppercase tracking-widest ${topicEvaluations[topic.topic_name].passed ? "text-green-600" : "text-red-600"}`}>
                                                                                                        Score: {topicEvaluations[topic.topic_name].percentage}%
                                                                                                    </p>
                                                                                                </div>
                                                                                            </div>
                                                                                            {topicEvaluations[topic.topic_name].passed && (topicLevels[topic.topic_name] || 1) < 5 && (
                                                                                                <Button
                                                                                                    className="bg-green-600 hover:bg-green-700 text-white font-black rounded-xl"
                                                                                                    onClick={() => {
                                                                                                        const currentTopicLevel = topicLevels[topic.topic_name] || 1;
                                                                                                        const nextLevel = currentTopicLevel + 1;

                                                                                                        // Update topic level state
                                                                                                        setTopicLevels(prev => ({ ...prev, [topic.topic_name]: nextLevel }));

                                                                                                        // Clear evaluation state and submission for next level
                                                                                                        setTopicEvaluations(prev => {
                                                                                                            const next = { ...prev };
                                                                                                            delete next[topic.topic_name];
                                                                                                            return next;
                                                                                                        });
                                                                                                        setTopicSubmissions(prev => ({
                                                                                                            ...prev,
                                                                                                            [topic.topic_name]: { type: 'Text', text: '' }
                                                                                                        }));
                                                                                                        handleGenerateTrail(topic.topic_name, true, nextLevel);
                                                                                                    }}
                                                                                                >
                                                                                                    Generate Level {(topicLevels[topic.topic_name] || 1) + 1}
                                                                                                </Button>
                                                                                            )}
                                                                                        </div>

                                                                                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
                                                                                            {Object.entries(topicEvaluations[topic.topic_name].scores).map(([name, score]) => (
                                                                                                <div key={name} className="bg-white/50 p-3 rounded-2xl text-center border border-white/20">
                                                                                                    <div className="text-[10px] font-black text-gray-400 uppercase mb-1">{name}</div>
                                                                                                    <div className="text-lg font-black text-gray-900">{score}/4</div>
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>

                                                                                        <div className="space-y-2">
                                                                                            <h6 className="text-xs font-black text-gray-400 uppercase tracking-widest">Feedback</h6>
                                                                                            <p className={`text-sm font-bold leading-relaxed ${topicEvaluations[topic.topic_name].passed ? "text-green-800" : "text-red-800"}`}>
                                                                                                {topicEvaluations[topic.topic_name].feedback}
                                                                                            </p>
                                                                                        </div>
                                                                                    </Card>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
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
