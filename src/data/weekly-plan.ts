// Weekly Plan Data Mapper for Class 8-A
// Maps CBSE Class 8 topics from master_syllabus.json to a weekly schedule

import masterSyllabus from '../../master_syllabus.json';

export interface TopicDetail {
    topic_id: string;
    topic_name: string;
    difficulty: 'easy' | 'medium' | 'hard';
    estimated_minutes: number;
    recommended_methods: string[];
    assessment: {
        quiz?: boolean;
        practice?: boolean;
        activity?: boolean;
        reflection?: boolean;
    };
    prerequisites: string[];
}

export interface ChapterInfo {
    chapter_id: string;
    chapter_no: number;
    chapter_name: string;
    domain: string;
}

export interface PeriodPlan {
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
    time: string;
    subject: string;
    chapter: ChapterInfo;
    topic: TopicDetail;
}

export interface WeeklyPlan {
    classId: string;
    weekNumber: number;
    periods: PeriodPlan[];
}

// Helper to create period from chapter and topic
function createPeriod(
    day: PeriodPlan['day'],
    time: string,
    subject: string,
    chapter: any,
    topic: any
): PeriodPlan {
    return {
        day,
        time,
        subject,
        chapter: {
            chapter_id: chapter.chapter_id,
            chapter_no: chapter.chapter_no,
            chapter_name: chapter.chapter_name,
            domain: chapter.domain
        },
        topic: {
            topic_id: topic.topic_id,
            topic_name: topic.topic_name,
            difficulty: topic.difficulty,
            estimated_minutes: topic.estimated_minutes,
            recommended_methods: topic.recommended_methods,
            assessment: topic.assessment,
            prerequisites: topic.prerequisites
        }
    };
}

// Flatten syllabus into linear list of topics
function flattenSyllabus(subjectData: any[]): Array<{ topic: TopicDetail, chapter: ChapterInfo }> {
    const flattened: Array<{ topic: TopicDetail, chapter: ChapterInfo }> = [];
    subjectData.forEach(chapter => {
        chapter.topics.forEach((topic: any) => {
            flattened.push({
                topic: {
                    topic_id: topic.topic_id,
                    topic_name: topic.topic_name,
                    difficulty: topic.difficulty,
                    estimated_minutes: topic.estimated_minutes,
                    recommended_methods: topic.recommended_methods,
                    assessment: topic.assessment,
                    prerequisites: topic.prerequisites
                },
                chapter: {
                    chapter_id: chapter.chapter_id,
                    chapter_no: chapter.chapter_no,
                    chapter_name: chapter.chapter_name,
                    domain: chapter.domain
                }
            });
        });
    });
    return flattened;
}

// Helper to get effective schedule (provided or fallback)
function getEffectiveSchedule(classId: string, sortedSchedule: any[], subjects: string[]): any[] {
    let classSchedule = sortedSchedule.filter(item => item.class_name === classId);

    if (classSchedule.length === 0 && subjects.length > 0) {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const times = ['09:00:00', '11:00:00'];
        let subIdx = 0;
        const fallbackSchedule: any[] = [];

        days.forEach(day => {
            times.forEach(time => {
                fallbackSchedule.push({
                    day_of_week: day,
                    start_time: time,
                    subject: subjects[subIdx % subjects.length],
                    class_name: classId
                });
                subIdx++;
            });
        });
        return fallbackSchedule;
    }
    return classSchedule;
}

// Generate Plan for any week
export function getWeeklyPlan(classId: string, weekNumber: number = 1, schedule: any[] = [], syllabusData: any = {}): WeeklyPlan {
    const subjects = Object.keys(syllabusData);
    const flattenedSyllabus: Record<string, any[]> = {};
    subjects.forEach(subject => {
        flattenedSyllabus[subject] = flattenSyllabus(syllabusData[subject] || []);
    });

    const periods: PeriodPlan[] = [];

    // Sort schedule by day and time to ensure correct order
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const sortedSchedule = [...schedule].sort((a, b: any) => {
        const dayDiff = daysOrder.indexOf(a.day_of_week) - daysOrder.indexOf(b.day_of_week);
        if (dayDiff !== 0) return dayDiff;
        return a.start_time.localeCompare(b.start_time);
    });

    const classSchedule = getEffectiveSchedule(classId, sortedSchedule, subjects);

    // Track indices for each subject
    const subjectIndices: Record<string, number> = {};
    const classesPerWeek: Record<string, number> = {};

    subjects.forEach(subject => {
        classesPerWeek[subject] = classSchedule.filter(s => s.subject === subject).length || 5;
        subjectIndices[subject] = (weekNumber - 1) * classesPerWeek[subject];
    });

    classSchedule.forEach(item => {
        const subject = item.subject;
        const index = subjectIndices[subject] || 0;
        const allTopics = flattenedSyllabus[subject] || [];

        if (index < allTopics.length) {
            const topicItem = allTopics[index];
            periods.push({
                day: item.day_of_week as any,
                time: normalizeTime(item.start_time),
                subject: subject,
                chapter: topicItem.chapter,
                topic: topicItem.topic
            });
            subjectIndices[subject] = index + 1;
        }
    });

    return {
        classId,
        weekNumber,
        periods
    };
}

function normalizeTime(time: string): string {
    // Convert "14:00:00" to "2:00 PM"
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
}

function matchSubject(scheduleSubject: string, targetSubject: 'Mathematics' | 'Science'): boolean {
    const s = scheduleSubject.toLowerCase();
    const t = targetSubject.toLowerCase();

    if (t === 'mathematics') {
        return s.includes('math') || s.includes('arithmetic') || s.includes('algebra') || s.includes('geometry');
    }

    if (t === 'science') {
        return s.includes('science') || s.includes('physics') || s.includes('chemistry') || s.includes('biology');
    }

    return s === t;
}

// Get available classes (for now just 8-A)
export function getAvailableClasses(): string[] {
    return ['8-A', '8-B', '9-A', '9-B'];
}

// Get teaching method icon
export function getMethodIcon(method: string): string {
    const icons: { [key: string]: string } = {
        'visual': '👁️',
        'practice': '✍️',
        'experiment': '🔬',
        'activity': '🎯',
        'discussion': '💬',
        'real-life': '🌍',
        'problem-solving': '🧩',
        'conceptual': '💡',
        'exploratory': '🔍',
        'model-based': '📐',
        'story-based': '📖'
    };
    return icons[method] || '📚';
}

// Get difficulty color
export function getDifficultyColor(difficulty: string): string {
    const colors = {
        'easy': 'bg-green-100 text-green-700 border-green-200',
        'medium': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'hard': 'bg-red-100 text-red-700 border-red-200'
    };
    return colors[difficulty as keyof typeof colors] || colors.medium;
}

// Get full syllabus with progress status
export function getSubjectProgress(classId: string, weekNumber: number, schedule: any[], syllabusData: any = {}) {
    const subjects = Object.keys(syllabusData);
    const flattenedSyllabus: Record<string, any[]> = {};
    subjects.forEach(subject => {
        flattenedSyllabus[subject] = flattenSyllabus(syllabusData[subject] || []);
    });

    // Sort and filter schedule
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const sortedSchedule = [...schedule].sort((a, b) => {
        const dayDiff = daysOrder.indexOf(a.day_of_week) - daysOrder.indexOf(b.day_of_week);
        if (dayDiff !== 0) return dayDiff;
        return a.start_time.localeCompare(b.start_time);
    });
    const classSchedule = getEffectiveSchedule(classId, sortedSchedule, subjects);

    const progress: Record<string, any> = {};

    // Helper to map chapters with status
    const mapChaptersWithStatus = (chapters: any[], allTopics: any[], startIdx: number, endIdx: number) => {
        let topicCounter = 0;
        return chapters.map((chapter: any) => {
            const chapterTopicsCount = chapter.topics.length;
            const chapterStart = topicCounter;
            const chapterEnd = topicCounter + chapterTopicsCount;

            let status: 'completed' | 'in-progress' | 'upcoming' = 'upcoming';

            if (chapterEnd <= startIdx) {
                status = 'completed';
            }
            else if (chapterStart < endIdx && chapterEnd > startIdx) {
                status = 'in-progress';
            }

            topicCounter += chapterTopicsCount;

            return {
                ...chapter,
                status,
                topics: chapter.topics.map((t: any, i: number) => {
                    const globalIndex = chapterStart + i;
                    let topicStatus = 'upcoming';
                    if (globalIndex < startIdx) topicStatus = 'completed';
                    else if (globalIndex >= startIdx && globalIndex < endIdx) topicStatus = 'in-progress';
                    return { ...t, status: topicStatus };
                })
            };
        });
    };

    subjects.forEach(subject => {
        const classesPerWeek = classSchedule.filter((s: any) => s.subject === subject).length || 5;
        const startIdx = (weekNumber - 1) * classesPerWeek;
        const endIdx = startIdx + classesPerWeek;

        progress[subject] = mapChaptersWithStatus(
            syllabusData[subject] || [],
            flattenedSyllabus[subject] || [],
            startIdx,
            endIdx
        );
    });

    return progress;
}
