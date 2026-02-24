'use server';

import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';

const apiKey = process.env.OPENAI_API_KEY

const openai = new OpenAI({
    apiKey: apiKey,
});

export async function generateTrail(formData: {
    studentId: string;
    board: string;
    grade: string;
    subject: string;
    topic: string;
    level: number;
    syllabus: any; // Add syllabus for context in higher levels
    learningStyles?: string[];
    forceRefresh?: boolean;
}) {
    const supabase = await createClient();

    // 1. Fetch Student data
    let student: any = null;
    let studentProfile = 'General Class Context';

    if (formData.studentId && formData.studentId !== 'none') {
        const { data } = await supabase
            .from('children')
            .select('*, assessments(*)')
            .eq('id', formData.studentId)
            .single();

        if (data) {
            student = data;
            studentProfile = `Name: ${student.name}`;
            if (student.learning_style) studentProfile += `, Learning Style: ${student.learning_style}`;
        }
    }

    const { board, grade, subject, topic, level, syllabus } = formData;

    // 2. Determine Scope based on Level
    let scopeText = "";
    let difficultyNote = "";

    const boardData = syllabus?.[board]?.[grade] || {};
    const subjectChapters = boardData[subject] || [];
    const currentChapter = subjectChapters.find((c: any) => c.topics?.some((t: any) => t.topic_name === topic));
    const allTopics = currentChapter?.topics?.map((t: any) => t.topic_name) || [topic];
    const allSubjects = Object.keys(boardData);

    if (level === 1) {
        scopeText = `Focus only on topic: ${topic}`;
        difficultyNote = "Foundational clarity.";
    } else if (level === 2) {
        const otherTopics = allTopics.filter((t: string) => t !== topic);
        scopeText = `Integrate topics: ${topic}, ${otherTopics.slice(0, 2).join(', ')}`;
        difficultyNote = "Moderate integration within chapter.";
    } else if (level === 3) {
        scopeText = `Integrate ALL chapter topics: ${allTopics.join(', ')}`;
        difficultyNote = "Advanced chapter synthesis.";
    } else if (level === 4) {
        const crossSubjects = allSubjects.filter(s => s !== subject).sort(() => 0.5 - Math.random()).slice(0, 2);
        scopeText = `Cross-subject integration between ${subject} and: ${crossSubjects.join(', ')}`;
        difficultyNote = "Multi-intelligence interdisciplinary challenge.";
    } else {
        scopeText = `Astranova Conundrum integrating ALL subjects: ${allSubjects.join(', ')}`;
        difficultyNote = "Highest cognitive complexity and puzzle reasoning.";
    }

    // 3. Check for existing trail in DB
    if (!formData.forceRefresh) {
        const { data: existingTrail } = await supabase
            .from('trails')
            .select('content')
            .eq('board', board)
            .eq('grade', grade)
            .eq('subject', subject)
            .eq('topic', topic)
            .eq('level', level) // Now scoped by level
            .single();

        if (existingTrail) {
            return {
                content: existingTrail.content,
                profile: studentProfile
            };
        }
    }

    // 4. Call OpenAI
    const prompt = `
You are an elite curriculum architect for ${board} board.
Design a mastery-based learning trail (Level ${level}/5).

Board: ${board}
Class: ${grade}
Primary Subject: ${subject}
Topic: ${topic}
Level: ${level}
Scope: ${scopeText}
Difficulty Intent: ${difficultyNote}
Student Profile: ${studentProfile}

Return ONLY valid JSON in this structure:
{
  "objective": "Catchy real-world scenario",
  "concept": "2-line foundation",
  "activities": [
    {
      "title": "Activity Name",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "safety_note": "If any, else empty"
    }
  ],
  "reflection_discussion": ["Question 1", "Question 2"],
  "learning_outcomes": ["Outcome 1", "Outcome 2"],
  "assessment_criteria": [
    {"criterion": "Understanding", "description": "Specific to this topic"},
    {"criterion": "Application", "description": "Specific to this topic"},
    {"criterion": "Reasoning", "description": "Specific to this topic"},
    {"criterion": "Communication", "description": "Specific to this topic"},
    {"criterion": "Creativity", "description": "Specific to this topic"}
  ]
}
`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.7,
        });

        const content = response.choices[0].message.content || "{}";

        // Save to DB
        await supabase.from('trails').upsert({
            board,
            grade,
            subject,
            topic,
            level,
            content: content
        }, { onConflict: 'board, grade, subject, topic, level' });

        return {
            content: content,
            profile: studentProfile
        };
    } catch (err: unknown) {
        console.error('Error generating trail:', err);
        throw new Error('Failed to generate trail');
    }
}

export async function evaluateSubmission(formData: {
    studentId: string;
    submissionText: string;
    topic: string;
    level: number;
    mediaType?: string;
    mediaData?: string;
}) {
    const isImage = formData.mediaType === 'Image' && formData.mediaData;
    const isAudio = formData.mediaType === 'Audio' && formData.mediaData;

    const basePrompt = `
Evaluate this Level ${formData.level} student submission for the topic: ${formData.topic}.
${isAudio ? "The student has submitted an audio recording. Evaluate the provided transcript/notes and the fact that they chose a verbal explanation." : ""}
${isImage ? "Evaluate the attached image of the student's work alongside any text notes provided." : ""}

Score across:
- Understanding
- Application
- Reasoning
- Communication
- Creativity

Each score should be 0–4.

Return ONLY JSON:
{
  "scores": {
    "Understanding": 0,
    "Application": 0,
    "Reasoning": 0,
    "Communication": 0,
    "Creativity": 0
  },
  "feedback": "Encouraging and constructive 2-3 sentence feedback."
}

Submission Text/Notes:
${formData.submissionText || (isImage ? "See attached image." : isAudio ? "See audio recording description." : "No text provided.")}
`;

    const messages: any[] = [];

    if (isImage) {
        messages.push({
            role: "user",
            content: [
                { type: "text", text: basePrompt },
                {
                    type: "image_url",
                    image_url: {
                        url: formData.mediaData,
                    },
                },
            ],
        });
    } else {
        messages.push({ role: "user", content: basePrompt });
    }

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
            response_format: { type: "json_object" },
            temperature: 0.5
        });

        const result = JSON.parse(response.choices[0].message.content || "{}");
        return result;
    } catch (err) {
        console.error('Evaluation Error:', err);
        throw new Error('Failed to evaluate submission');
    }
}

export async function generateTopicSpecificRubric(formData: {
    topic: string;
    subject: string;
    learningStyles: string[];
}) {
    const prompt = `
Create a highly specific evaluation rubric.

Subject: ${formData.subject}
Topic: ${formData.topic}
Learning Styles: ${formData.learningStyles.join(', ')}

Rules:
- Criteria must be topic-specific
- Total criteria should be 4-5
- Each criterion should have a name, description, and max_score (total sum across criteria should be 100)

Return ONLY JSON:
{ "criteria": [{"name": "", "description": "", "max_score": 0}] }
`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini-2024-07-18",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.4,
            response_format: { type: "json_object" }
        });

        return safeJsonLoads(response.choices[0].message.content);
    } catch (err: unknown) {
        console.error('OpenAI Error:', err);
        return {
            "criteria": [
                { "name": "Concept Understanding", "description": "Understanding of core concepts", "max_score": 30 },
                { "name": "Application", "description": "Ability to apply knowledge", "max_score": 30 },
                { "name": "Engagement", "description": "Level of interest and participation", "max_score": 20 },
                { "name": "Learning Style Alignment", "description": "How well the activity aligned with learning styles", "max_score": 20 }
            ]
        };
    }
}

export async function analyzeUniversityReadiness(formData: {
    subject: string;
    score: number;
}) {
    const prompt = `
Estimate REALISTIC exam readiness.

Student:
- Subject: ${formData.subject}
- Evidence: Recent topic assessment
- Topic score: ${formData.score}/100

Rules:
- Readiness is CLOSENESS %, not performance
- Range must be 0.1%–5%
- NEET lowest, GATE slightly higher than IIT
- MUST NOT reflect topic score directly

Return ONLY JSON:
{
  "IIT": { "closeness_percent": 0.0, "reasoning": "" },
  "NEET": { "closeness_percent": 0.0, "reasoning": "" },
  "GATE": { "closeness_percent": 0.0, "reasoning": "" }
}
`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini-2024-07-18",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.5,
            response_format: { type: "json_object" }
        });

        return safeJsonLoads(response.choices[0].message.content);
    } catch (err: unknown) {
        console.error('OpenAI Error:', err);
        return {};
    }
}

function safeJsonLoads(text: string | null) {
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
            try {
                return JSON.parse(match[0]);
            } catch {
                return null;
            }
        }
        return null;
    }
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

export async function getTopicResources(topic: string, subject: string, grade: string) {
    const keywords = [
        "CBSE",
        "NCERT",
        `Class ${grade}`,
        "Khan Academy India",
        "Vedantu",
        "Unacademy",
        "Magnet Brains"
    ];

    const query = `${topic} ${subject} ` + keywords.join(" ");
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

    return {
        title: `${topic} | Class ${grade} | ${subject}`,
        channel: "Top Indian CBSE Educators (Search Results)",
        url: searchUrl
    };
}

export async function saveEvaluation(formData: {
    childId: string;
    board: string;
    subject: string;
    topic: string;
    score: number;
    rubricData: {
        criteria: Array<{
            name: string;
            description: string;
            max_score: number;
        }>;
        scores: Record<string, number>;
    };
    readinessData?: Record<string, {
        closeness_percent: number;
        reasoning: string;
    }>;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // Verify the child belongs to this teacher
    const { data: child } = await supabase
        .from('children')
        .select('id')
        .eq('id', formData.childId)
        .eq('teacher_id', user.id)
        .single();

    if (!child) {
        throw new Error('Child not found or unauthorized');
    }

    const { error } = await supabase
        .from('trail_evaluations')
        .insert({
            child_id: formData.childId,
            board: formData.board,
            subject: formData.subject,
            topic: formData.topic,
            score: formData.score,
            rubric_data: formData.rubricData,
            readiness_data: formData.readinessData
        });

    if (error) {
        console.error('Error saving evaluation:', error);
        throw new Error('Failed to save evaluation');
    }

    return { success: true };
}

export async function getStudentEvaluations(childId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    const { data, error } = await supabase
        .from('trail_evaluations')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching evaluations:', error);
        return [];
    }

    return data || [];
}

export async function getSubjectAverageScores(childId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    const { data, error } = await supabase
        .from('trail_evaluations')
        .select('subject, score')
        .eq('child_id', childId);

    if (error || !data) {
        console.error('Error fetching scores:', error);
        return { Mathematics: 0, Science: 0 };
    }

    // Calculate averages per subject
    const subjectScores: Record<string, number[]> = {};
    data.forEach((evaluation) => {
        if (!subjectScores[evaluation.subject]) {
            subjectScores[evaluation.subject] = [];
        }
        subjectScores[evaluation.subject].push(evaluation.score);
    });

    const averages: Record<string, number> = {};
    Object.keys(subjectScores).forEach(subject => {
        const scores = subjectScores[subject];
        averages[subject] = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    });

    return {
        Mathematics: averages['Mathematics'] || 0,
        Science: averages['Science'] || 0,
        ...averages
    };
}
