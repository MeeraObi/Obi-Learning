import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import CurriculumClient from '@/components/curriculum/CurriculumClient';
import fs from 'fs/promises';
import path from 'path';

async function getSyllabus() {
    const filePath = path.join(process.cwd(), 'master_syllabus.json');
    const fileContent = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContent);
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
