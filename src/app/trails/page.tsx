import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import TrailsClient from '@/components/trails/TrailsClient';
import { redirect } from 'next/navigation';
import fs from 'fs/promises';
import path from 'path';

async function getSyllabus() {
    const syllabus: any = { CBSE: {} };

    // Load all 12 class files
    for (let i = 1; i <= 12; i++) {
        try {
            const filePath = path.join(process.cwd(), `class${i}_full_syllabus.json`);
            const fileContent = await fs.readFile(filePath, 'utf8');
            const data = JSON.parse(fileContent);

            // Merge Class data under CBSE
            if (data.CBSE) {
                Object.assign(syllabus.CBSE, data.CBSE);
            }
        } catch (error) {
            console.error(`Error loading syllabus for class ${i}:`, error);
        }
    }

    return syllabus;
}

export default async function TrailsPage({
    searchParams,
}: {
    searchParams: { studentId?: string; board?: string; subject?: string; topic?: string };
}) {
    const { studentId, board, subject, topic } = await searchParams;

    if (!studentId) {
        redirect('/home');
    }

    const supabase = await createClient();
    const { data: student, error } = await supabase
        .from('children')
        .select('*, assessments(*)')
        .eq('id', studentId)
        .single();

    if (error || !student) {
        redirect('/home');
    }

    const syllabus = await getSyllabus();

    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <TrailsClient
                student={student}
                syllabus={syllabus}
                initialBoard={board}
                initialSubject={subject}
                initialTopic={topic}
            />
        </Suspense>
    );
}
