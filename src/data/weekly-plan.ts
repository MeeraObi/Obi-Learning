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
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
    time: string;
    subject: 'Mathematics' | 'Science';
    chapter: ChapterInfo;
    topic: TopicDetail;
}

export interface WeeklyPlan {
    classId: string;
    weekNumber: number;
    periods: PeriodPlan[];
}

// Get CBSE Class 8 data
const class8Data = (masterSyllabus as any).CBSE['Class 8'];

// Helper to create period from chapter and topic
function createPeriod(
    day: PeriodPlan['day'],
    time: string,
    subject: 'Mathematics' | 'Science',
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

// Generate Plan for any week
export function getWeeklyPlan(classId: string, weekNumber: number = 1, schedule: any[] = []): WeeklyPlan {
    const mathChapters = class8Data.Mathematics;
    const scienceChapters = class8Data.Science;

    const allMathTopics = flattenSyllabus(mathChapters);
    const allScienceTopics = flattenSyllabus(scienceChapters);

    const periods: PeriodPlan[] = [];

    // Sort schedule by day and time to ensure correct order
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const sortedSchedule = [...schedule].sort((a, b) => {
        const dayDiff = daysOrder.indexOf(a.day_of_week) - daysOrder.indexOf(b.day_of_week);
        if (dayDiff !== 0) return dayDiff;
        return a.start_time.localeCompare(b.start_time);
    });

    // Filter schedule for this class
    const classSchedule = sortedSchedule.filter(item => item.class_name === classId);

    // Track used topics count for this week calculation
    // Start index for this week (assuming we just continue linearly)

    // For a more persistent calculation we'd need to know how many classes happened in previous weeks
    // For now, we'll estimate based on weekNumber and number of classes per week for each subject

    const mathClassesPerWeek = classSchedule.filter(s => matchSubject(s.subject, 'Mathematics')).length || 5;
    const scienceClassesPerWeek = classSchedule.filter(s => matchSubject(s.subject, 'Science')).length || 5;

    let mathTopicIndex = (weekNumber - 1) * mathClassesPerWeek;
    let scienceTopicIndex = (weekNumber - 1) * scienceClassesPerWeek;

    classSchedule.forEach(item => {
        if (matchSubject(item.subject, 'Mathematics') && mathTopicIndex < allMathTopics.length) {
            const mathItem = allMathTopics[mathTopicIndex];
            periods.push({
                day: item.day_of_week as any,
                time: normalizeTime(item.start_time),
                subject: 'Mathematics',
                chapter: mathItem.chapter,
                topic: mathItem.topic
            });
            mathTopicIndex++;
        } else if (matchSubject(item.subject, 'Science') && scienceTopicIndex < allScienceTopics.length) {
            const sciItem = allScienceTopics[scienceTopicIndex];
            periods.push({
                day: item.day_of_week as any,
                time: normalizeTime(item.start_time),
                subject: 'Science',
                chapter: sciItem.chapter,
                topic: sciItem.topic
            });
            scienceTopicIndex++;
        }
    });

    // If no schedule provided or found, fallback to default (or maybe empty?)
    // Keeping fallback for now if schedule is empty to avoid broken UI during transition
    if (periods.length === 0 && schedule.length === 0) {
        // ... existing fallback or empty return
        return { classId, weekNumber, periods: [] };
    }

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
export function getSubjectProgress(classId: string, weekNumber: number, schedule: any[]) {
    // We need to determine which topics are "done", "in-progress", and "upcoming".
    // We'll use the same logic as getWeeklyPlan to determine the current index.

    // Default to Math for structure (assuming consistent structure or we iterate both)
    // For this UI, we might want to return progress for the SELECTED subject.
    // Let's return both for now.

    const mathChapters = class8Data.Mathematics;
    const scienceChapters = class8Data.Science;

    const allMathTopics = flattenSyllabus(mathChapters);
    const allScienceTopics = flattenSyllabus(scienceChapters);

    // Sort and filter schedule
    const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const sortedSchedule = [...schedule].sort((a, b) => {
        const dayDiff = daysOrder.indexOf(a.day_of_week) - daysOrder.indexOf(b.day_of_week);
        if (dayDiff !== 0) return dayDiff;
        return a.start_time.localeCompare(b.start_time);
    });
    const classSchedule = sortedSchedule.filter(item => item.class_name === classId);

    const mathClassesPerWeek = classSchedule.filter(s => matchSubject(s.subject, 'Mathematics')).length || 5;
    const scienceClassesPerWeek = classSchedule.filter(s => matchSubject(s.subject, 'Science')).length || 5;

    // Start indices for current week
    const currentMathStartIndex = (weekNumber - 1) * mathClassesPerWeek;
    const currentScienceStartIndex = (weekNumber - 1) * scienceClassesPerWeek;

    // End indices (exclusive)
    const currentMathEndIndex = currentMathStartIndex + mathClassesPerWeek;
    const currentScienceEndIndex = currentScienceStartIndex + scienceClassesPerWeek;

    // Helper to map chapters with status
    const mapChaptersWithStatus = (chapters: any[], allTopics: any[], startIdx: number, endIdx: number) => {
        let topicCounter = 0;
        return chapters.map((chapter: any) => {
            const chapterTopicsCount = chapter.topics.length;
            const chapterStart = topicCounter;
            const chapterEnd = topicCounter + chapterTopicsCount;

            let status: 'completed' | 'in-progress' | 'upcoming' = 'upcoming';

            // If the entire chapter is before the start index -> Completed
            if (chapterEnd <= startIdx) {
                status = 'completed';
            }
            // If the chapter overlaps with the current window -> In Progress
            else if (chapterStart < endIdx && chapterEnd > startIdx) {
                status = 'in-progress';
            }
            // Else -> Upcoming (default)

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

    return {
        Mathematics: mapChaptersWithStatus(mathChapters, allMathTopics, currentMathStartIndex, currentMathEndIndex),
        Science: mapChaptersWithStatus(scienceChapters, allScienceTopics, currentScienceStartIndex, currentScienceEndIndex)
    };
}
