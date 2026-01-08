import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import TrailsClient from '@/components/trails/TrailsClient';
import { redirect } from 'next/navigation';
import fs from 'fs/promises';
import path from 'path';

async function getSyllabus() {
    const filePath = path.join(process.cwd(), 'master_syllabus.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContent);
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
