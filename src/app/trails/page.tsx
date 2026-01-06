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
    searchParams: { childId?: string };
}) {
    const { childId } = await searchParams;

    if (!childId) {
        redirect('/dashboard');
    }

    const supabase = await createClient();
    const { data: child, error } = await supabase
        .from('children')
        .select('*, assessments(*)')
        .eq('id', childId)
        .single();

    if (error || !child) {
        redirect('/dashboard');
    }

    const syllabus = await getSyllabus();

    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <TrailsClient child={child} syllabus={syllabus} />
        </Suspense>
    );
}
