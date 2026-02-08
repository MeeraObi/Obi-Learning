import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import CurriculumClient from '@/components/curriculum/CurriculumClient';
import fs from 'fs/promises';
import path from 'path';

async function getSyllabus() {
    const syllabusFiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => `class${n}_full_syllabus.json`);
    const fullSyllabus: Record<string, any> = { "CBSE": {} };

    for (const file of syllabusFiles) {
        const filePath = path.join(process.cwd(), file);
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const parsed = JSON.parse(content);
            if (parsed.CBSE) {
                Object.assign(fullSyllabus.CBSE, parsed.CBSE);
            }
        } catch (e) {
            console.error(`Error loading ${file}:`, e);
        }
    }
    return fullSyllabus;
}

export default async function CurriculumPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    const { data: children } = await supabase
        .from('children')
        .select(`
            *,
            assessments (*)
        `)
        .order('created_at', { ascending: false });

    const syllabus = await getSyllabus();

    const userData = {
        name: profile?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
    };

    return (
        <div className="flex h-screen bg-white overflow-hidden font-sans">
            <CurriculumClient user={userData} initialChildren={children || []} syllabus={syllabus} />
        </div>
    );
}
