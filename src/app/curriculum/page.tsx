import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import CurriculumClient from '@/components/curriculum/CurriculumClient';
import fs from 'fs/promises';
import path from 'path';

async function getSyllabus() {
    const fullSyllabus: Record<string, any> = { "CBSE": {}, "ICSE": {} };

    const loadSyllabusFromDir = async (dir: string, board: string) => {
        const fullDir = path.join(process.cwd(), 'Syllabus', dir);
        try {
            const files = await fs.readdir(fullDir);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    try {
                        const content = await fs.readFile(path.join(fullDir, file), 'utf8');
                        const parsed = JSON.parse(content);
                        if (parsed[board]) {
                            // Merge the content for the specific board
                            for (const [className, subjects] of Object.entries(parsed[board])) {
                                if (!fullSyllabus[board][className]) {
                                    fullSyllabus[board][className] = {};
                                }
                                Object.assign(fullSyllabus[board][className], subjects);
                            }
                        }
                    } catch (e) {
                        console.error(`Error parsing ${file} in ${dir}:`, e);
                    }
                }
            }
        } catch (e) {
            console.error(`Error reading directory ${dir}:`, e);
        }
    };

    await loadSyllabusFromDir('CBSE', 'CBSE');
    await loadSyllabusFromDir('ICSE', 'ICSE');

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
