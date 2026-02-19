'use client';

import { useState, useEffect } from 'react';
import { getWeeklyPlan, getSubjectProgress, getMethodIcon, getDifficultyColor, type WeeklyPlan, type PeriodPlan } from '@/data/weekly-plan';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, BookOpen, FlaskConical, Clock, Target, CheckCircle2, Circle, Layout, FileText, Youtube, Microscope, ExternalLink, MoreHorizontal, Pencil, Calendar, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { ScheduleItem } from '@/types';
import { Progress } from "@/components/ui/progress";
import { format, addDays, subDays, startOfWeek, differenceInCalendarWeeks } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { generateTrail, getTopicResources, generateTopicSpecificRubric } from '@/app/trails/actions';

// Calculate week number relative to term start (Example: Feb 2, 2026)
// NOTE: This should eventually be a configurable setting in the database
const TERM_START_DATE = new Date(2026, 1, 2); // Feb 2, 2026 is a Monday

interface WeeklyPlanViewProps {
    classId: string;
    initialWeekNumber?: number;
    schedule?: ScheduleItem[];
    selectedSubject: string;
    onSubjectChange: (subject: string) => void;
    students?: any[];
    fullSyllabus: Record<string, any>;
}

export default function WeeklyPlanView({
    classId,
    initialWeekNumber = 1,
    schedule = [],
    selectedSubject,
    onSubjectChange,
    students = [],
    fullSyllabus
}: WeeklyPlanViewProps) {
    // Determine the standard (e.g., "Class 8") from classId (e.g., "8-A")
    // If classId is "1-A", standard is "Class 1"
    const standardMatch = classId.match(/^(\d+)/);
    const standard = standardMatch ? `Class ${standardMatch[1]}` : '';
    const classSyllabus = fullSyllabus[standard] || {};

    // Default to current date
    const [currentDate, setCurrentDate] = useState(new Date());

    // State for generated trails (Topic Name -> Content)
    const [generatedTrails, setGeneratedTrails] = useState<Record<string, string>>({});
    const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});
    // State for fetched resources (Topic Name -> Resource)
    const [trailResources, setTrailResources] = useState<Record<string, { title: string, channel: string, url: string }>>({});
    // State for assessment criteria
    const [topicCriteria, setTopicCriteria] = useState<Record<string, any[]>>({});

    // Consolidate core plan data
    const weekNumber = Math.max(1, differenceInCalendarWeeks(currentDate, TERM_START_DATE, { weekStartsOn: 1 }) + 1);
    const weeklyPlan = getWeeklyPlan(classId, weekNumber, schedule, classSyllabus);
    const subjectProgress = getSubjectProgress(classId, weekNumber, schedule, classSyllabus);

    // Fetch resources when topics change
    useEffect(() => {
        const fetchResources = async () => {
            // Get periods for the SPECIFIC day using the same syllabus and term dates
            const dayName = format(currentDate, 'EEEE');
            const currentTopics = weeklyPlan.periods
                .filter(p => p.day === dayName);

            const newResources: Record<string, { title: string, channel: string, url: string }> = {};

            // We don't put trailResources in deps to avoid loops, so we check it here
            // But we need to be careful if we want it to react to cache fills. 
            // In this case, we only want to fetch when the topic list changes.
            const topicsToFetch = currentTopics.filter(p => !trailResources[p.topic.topic_name]);

            if (topicsToFetch.length === 0) return;

            await Promise.all(topicsToFetch.map(async (period) => {
                try {
                    const resource = await getTopicResources(period.topic.topic_name, period.subject, standard.replace('Class ', ''));
                    newResources[period.topic.topic_name] = resource;
                } catch (err) {
                    console.error(`Failed to fetch resource for ${period.topic.topic_name}`, err);
                }
            }));

            if (Object.keys(newResources).length > 0) {
                setTrailResources(prev => ({ ...prev, ...newResources }));
            }
        };

        fetchResources();
        // Dependencies are the core data that determines WHICH topics are showing
        // We exclude trailResources to prevent update loops, and use primitives where possible
    }, [currentDate, selectedSubject, classId, schedule, fullSyllabus, standard, weekNumber]);

    const handleGenerateTrail = async (topic: string, subject: string, forceRefresh: boolean = false) => {
        setIsGenerating(prev => ({ ...prev, [topic]: true }));
        try {
            // Use the first student as the default context if available
            const studentId = students.length > 0 ? students[0].id : '';

            // Generate Trail and Rubric
            const [trailResult, rubricResult] = await Promise.all([
                generateTrail({
                    studentId,
                    board: 'CBSE',
                    grade: standard,
                    subject,
                    topic,
                    forceRefresh
                }),
                generateTopicSpecificRubric({
                    topic,
                    subject,
                    learningStyles: ['visual', 'practice'] // Default fallback
                })
            ]);

            setGeneratedTrails(prev => ({ ...prev, [topic]: trailResult.content }));
            setTopicCriteria(prev => ({ ...prev, [topic]: rubricResult.criteria || [] }));

        } catch (error) {
            console.error("Failed to generate trail:", error);
            // Optionally set an error state here
        } finally {
            setIsGenerating(prev => ({ ...prev, [topic]: false }));
        }
    };

    // Calculate completion percentage
    const currentSubjectProgress = subjectProgress[selectedSubject] || [];
    const totalTopics = currentSubjectProgress.length;
    const completedTopics = currentSubjectProgress.filter((c: any) => c.status === 'completed').length;
    const completionPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    // Get periods for the SPECIFIC day
    const dayName = format(currentDate, 'EEEE');
    // Filter by day ONLY to show ALL subjects for the day (as requested by user)
    const todaysTopics = weeklyPlan.periods
        .filter(p => p.day === dayName)
        .sort((a, b) => {
            return new Date(`1970/01/01 ${a.time}`).getTime() - new Date(`1970/01/01 ${b.time}`).getTime();
        });

    // Get default student ID for trails (first student in list)
    // ideally we would filter students by classId if that data was available on student object
    const defaultStudentId = students.length > 0 ? students[0].id : '';

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/classes">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100 -ml-2">
                                <ChevronLeft size={20} className="text-gray-400" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">{selectedSubject}</h1>
                    </div>
                </div>

                <div className="w-full md:w-64 space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                        <span className="text-gray-400">{selectedSubject} Syllabus</span>
                        <span className="text-primary">{completionPercentage}%</span>
                    </div>
                    <Progress value={completionPercentage} className="h-2.5" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Sidebar: Scope & Sequence (remains mostly same, context awareness) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Scope & Sequence Card - largely unchanged, maybe highlight current topic more if feasible */}
                    <Card className="rounded-[2rem] border-none shadow-sm bg-blue-50/50 overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-lg font-black text-gray-900">Scope & Sequence</CardTitle>
                            <CardDescription className="font-medium text-gray-500">2026-27 Academic Plan</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-blue-100/50 max-h-[600px] overflow-y-auto">
                                {currentSubjectProgress.map((topic: any, idx: number) => {
                                    const isToday = todaysTopics.some(p => p.chapter.chapter_name === topic.chapter_name);
                                    return (
                                        <div key={idx} className={`p-6 flex items-start gap-4 hover:bg-white/50 transition-colors ${isToday ? 'bg-white shadow-sm ring-1 ring-blue-100/50' : ''}`}>
                                            <div className="mt-1 flex-shrink-0">
                                                {topic.status === 'completed' && <CheckCircle2 className="text-green-500" size={22} />}
                                                {topic.status === 'in-progress' && <div className="h-5 w-5 rounded-full border-[5px] border-primary ml-[1px]" />}
                                                {topic.status === 'upcoming' && <div className="h-5 w-5 rounded-full border-2 border-gray-200 ml-[1px]" />}
                                            </div>
                                            <div>
                                                <h4 className={`font-bold text-sm ${topic.status === 'upcoming' ? 'text-gray-400' : 'text-gray-900'}`}>
                                                    Topic {topic.chapter_no}: {topic.chapter_name}
                                                </h4>
                                                <div className="mt-2 space-y-1">
                                                    {topic.topics.map((subtopic: any, sIdx: number) => (
                                                        <div key={sIdx} className="flex items-center gap-2">
                                                            <div className={`w-1 h-1 rounded-full ${subtopic.status === 'completed' ? 'bg-green-500' : subtopic.status === 'in-progress' ? 'bg-primary' : 'bg-gray-300'}`} />
                                                            <span className={`text-[11px] font-medium leading-tight ${subtopic.status === 'upcoming' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                                {subtopic.topic_name}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-3">
                                                    {topic.status === 'completed' && 'Completed'}
                                                    {topic.status === 'in-progress' && <span className="text-primary font-bold">In Progress • Week {weekNumber}</span>}
                                                    {topic.status === 'upcoming' && 'Upcoming'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Content: Focus View (Daily) */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-black text-gray-900">
                                Focus: {format(currentDate, 'EEEE, MMM d')}
                            </h2>
                            {/* Mock status based on day */}
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-3 py-1 text-xs font-bold uppercase tracking-wide">
                                {['Saturday', 'Sunday'].includes(dayName) ? 'No Classes' : 'On Track'}
                            </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-xl h-9 w-9"
                                onClick={() => setCurrentDate(subDays(currentDate, 1))}
                            >
                                <ChevronLeft size={16} />
                            </Button>
                            <Button
                                variant="outline"
                                className="h-9 font-bold"
                                onClick={() => setCurrentDate(new Date())} // Reset to today
                            >
                                Today
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="rounded-xl h-9 w-9"
                                onClick={() => setCurrentDate(addDays(currentDate, 1))}
                            >
                                <ChevronRight size={16} />
                            </Button>
                        </div>
                    </div>

                    {todaysTopics.length > 0 ? (
                        todaysTopics.map((period, idx) => (
                            <Card key={idx} className="rounded-[2rem] border-none shadow-sm bg-white border border-gray-50 overflow-hidden">
                                <CardHeader className="p-8 pb-4 flex flex-row items-start justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-gray-900">{period.chapter.chapter_name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/5 px-2 py-0.5 rounded-md">Subtopic</span>
                                            <p className="text-sm font-bold text-gray-600">
                                                {period.topic.topic_name}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <Badge variant="secondary" className={`text-[10px] font-bold ${period.subject === 'Mathematics' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                <BookOpen size={10} className="mr-1" />
                                                {period.subject}
                                            </Badge>
                                            <Badge variant="secondary" className="text-[10px] font-bold bg-gray-100 text-gray-600">
                                                <Clock size={10} className="mr-1" />
                                                {period.time} • 45 mins
                                            </Badge>
                                        </div>
                                    </div>
                                    {/* Edit button removed */}
                                </CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    {/* Resources Section */}
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Teaching Resources</div>
                                        <div className="space-y-3">
                                            {/* Fetched YouTube Resource */}
                                            {trailResources[period.topic.topic_name] ? (
                                                <div className="flex items-center justify-between p-4 rounded-xl border border-indigo-100 hover:border-indigo-200 hover:shadow-sm transition-all bg-indigo-50/50 group cursor-pointer" onClick={() => window.open(trailResources[period.topic.topic_name].url, '_blank')}>
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-white text-red-500 shadow-sm border border-indigo-50">
                                                            <Youtube size={20} />
                                                        </div>
                                                        <div>
                                                            <h5 className="font-bold text-gray-900 text-sm line-clamp-1">{trailResources[period.topic.topic_name].title}</h5>
                                                            <p className="text-xs font-medium text-gray-500 mt-0.5">{trailResources[period.topic.topic_name].channel}</p>
                                                        </div>
                                                    </div>
                                                    <ExternalLink size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
                                                </div>
                                            ) : (
                                                <div
                                                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all bg-gray-50 group cursor-pointer"
                                                    onClick={() => {
                                                        const query = `${period.topic.topic_name} ${period.subject} CBSE Class ${standard.replace('Class ', '')}`;
                                                        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, '_blank');
                                                    }}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-white text-gray-400 shadow-sm border border-gray-100">
                                                            <Youtube size={20} />
                                                        </div>
                                                        <div>
                                                            <h5 className="font-bold text-gray-900 text-sm">{period.topic.topic_name} Resources</h5>
                                                            <p className="text-xs font-medium text-gray-400 mt-0.5">Search on YouTube</p>
                                                        </div>
                                                    </div>
                                                    <ExternalLink size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div title="Coming Soon" className="w-full">
                                            <Button disabled className="w-full h-12 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed">
                                                <FileText size={18} className="mr-2" />
                                                Generate Worksheet
                                            </Button>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            className="h-12 w-full rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200"
                                            disabled={isGenerating[period.topic.topic_name]}
                                            onClick={() => handleGenerateTrail(period.topic.topic_name, period.subject)}
                                        >
                                            {isGenerating[period.topic.topic_name] ? (
                                                <>
                                                    <Loader2 size={18} className="mr-2 animate-spin" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <Layout size={18} className="mr-2" />
                                                    Generate Learning Trail
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    {/* Generated Trail Content */}
                                    {generatedTrails[period.topic.topic_name] && (
                                        <div className="mt-6 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-2xl border border-indigo-100/50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                                            <div className="p-6 space-y-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="prose prose-sm max-w-none text-gray-600 prose-headings:font-black prose-headings:text-gray-900 prose-p:leading-relaxed prose-li:marker:text-primary prose-strong:text-primary flex-1">
                                                        <ReactMarkdown>{generatedTrails[period.topic.topic_name]}</ReactMarkdown>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 shrink-0"
                                                        disabled={isGenerating[period.topic.topic_name]}
                                                        onClick={() => handleGenerateTrail(period.topic.topic_name, period.subject, true)}
                                                        title="Generate New Trail"
                                                    >
                                                        {isGenerating[period.topic.topic_name] ? (
                                                            <Loader2 size={14} className="animate-spin text-primary" />
                                                        ) : (
                                                            <RefreshCw size={14} />
                                                        )}
                                                    </Button>
                                                </div>

                                                {topicCriteria[period.topic.topic_name] && topicCriteria[period.topic.topic_name].length > 0 && (
                                                    <div className="mt-8 pt-6 border-t border-indigo-100">
                                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-4">Assessment Criteria</div>
                                                        <div className="space-y-3">
                                                            {topicCriteria[period.topic.topic_name].map((c, i) => (
                                                                <div key={i} className="flex items-start gap-4">
                                                                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-indigo-300 shrink-0" />
                                                                    <div>
                                                                        <p className="text-sm font-bold text-gray-900">{c.name}</p>
                                                                        <p className="text-xs text-gray-500">{c.description}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center rounded-[2rem] bg-gray-50 border-2 border-dashed border-gray-200 text-gray-400">
                            <Calendar size={32} className="mb-4 opacity-50" />
                            <p className="font-bold">No classes scheduled for {dayName}</p>
                            <p className="text-xs font-medium mt-1">Enjoy your free time!</p>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}

function ResourceCard({ icon, title, type, bgColor }: { icon: React.ReactNode, title: string, type: string, bgColor: string }) {
    return (
        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all bg-white group cursor-pointer">
            <div className="flex items-center gap-4">
                <div className={`h-10 w-10 flex items-center justify-center rounded-lg ${bgColor}`}>
                    {icon}
                </div>
                <div>
                    <h5 className="font-bold text-gray-900 text-sm">{title}</h5>
                    <p className="text-xs font-medium text-gray-500 mt-0.5">{type}</p>
                </div>
            </div>
            <ExternalLink size={16} className="text-gray-300 group-hover:text-primary transition-colors" />
        </div>
    );
}
