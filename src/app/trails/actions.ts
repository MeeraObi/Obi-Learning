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
    grade?: string;
    subject: string;
    topic: string;
    learningStyles?: string[];
}) {
    const supabase = await createClient();

    // 1. Fetch Student and Assessment data
    const { data: student, error } = await supabase
        .from('children')
        .select('*, assessments(*)')
        .eq('id', formData.studentId)
        .single();

    if (error || !student) {
        throw new Error('Student not found');
    }

    // 2. Calculate grade for filtering/storing
    const age = calculateAge(student.date_of_birth);
    const gradeStr = formData.grade || (age >= 13 ? "Class 8" : "Class 8");

    // 3. Check for existing trail in DB
    const { data: existingTrail } = await supabase
        .from('trails')
        .select('content')
        .eq('board', formData.board)
        .eq('grade', gradeStr)
        .eq('subject', formData.subject)
        .eq('topic', formData.topic)
        .single();

    if (existingTrail) {
        return {
            content: existingTrail.content,
            profile: `Name: ${student.name}`
        };
    }

    // 4. Call OpenAI if not found
    const prompt = `
You are an expert ${formData.board} Class ${formData.grade || '8'} ${formData.subject} teacher.

Create a HIGHLY ENGAGING, PROJECT-BASED and INTERACTIVE learning trail
for the following topic:

Topic: ${formData.topic}

The response MUST follow this EXACT format:

🧩 Generated Learning Trail

Objective: (Catchy, real-world scenario to grab interest)
Concept: (Simple, 2-line theoretical foundation)
Activity: (Step-by-step hands-on exploration)
Parent Involvement: (A small task for the parent to participate)
Learning Outcomes: (List 3 bullet points of what they'll master)

Keep language child-friendly and encouraging.
Use emojis where appropriate, except for the title emoji which MUST be exactly the puzzle 🧩.
`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini-2024-07-18",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.4,
        });

        const content = response.choices[0].message.content || "Could not generate content.";

        // Save generated trail to DB for reuse
        await supabase.from('trails').upsert({
            board: formData.board,
            grade: gradeStr,
            subject: formData.subject,
            topic: formData.topic,
            content: content
        }, { onConflict: 'board, grade, subject, topic' });

        return {
            content: content,
            profile: `Name: ${student.name}`
        };
    } catch (err: unknown) {
        console.error('Error generating trail:', err);
        throw new Error('Failed to generate trail');
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
