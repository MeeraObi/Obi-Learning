'use server';

import OpenAI from 'openai';
import { createClient } from '@/utils/supabase/server';
import { QUESTIONS } from '@/types';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateTrail(formData: {
    childId: string;
    board: string;
    subject: string;
    topic: string;
    level: string;
}) {
    const supabase = await createClient();

    // 1. Fetch Child and Assessment data
    const { data: child, error } = await supabase
        .from('children')
        .select('*, assessments(*)')
        .eq('id', formData.childId)
        .single();

    if (error || !child) {
        throw new Error('Child not found');
    }

    // 2. Build Profile String
    let profileStr = `Name: ${child.name}\nAge: ${calculateAge(child.date_of_birth)}\n`;

    if (child.assessments && child.assessments.length > 0) {
        const answers = child.assessments[0].answers as Record<number, string[]>;
        QUESTIONS.forEach(q => {
            const ans = answers[q.id];
            if (ans) {
                profileStr += `${q.question}: ${ans.join(', ')}\n`;
            }
        });
    }

    // 3. Call OpenAI
    const prompt = `
You are an expert educator.

Child profile:
${profileStr}

Board: ${formData.board}
Subject: ${formData.subject}
Topic: ${formData.topic}
Level: ${formData.level}

Create ONE personalised hands-on activity aligned strictly to this level.
Format the output in clear Markdown with headers, materials needed, and step-by-step instructions.
`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini-2024-07-18",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.4,
        });

        return {
            content: response.choices[0].message.content,
            profile: profileStr
        };
    } catch (err: any) {
        console.error('OpenAI Error:', err);
        throw new Error('Failed to generate trail');
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
