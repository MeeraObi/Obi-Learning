import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ClassesClient from '@/components/classes/ClassesClient';
import { getSchedule } from '@/app/dashboard/schedule-actions';
import fs from 'fs';
import path from 'path';

export default async function ClassesPage() {
    // Load all class syllabus files from both CBSE and ICSE
    const fullSyllabus: Record<string, any> = {};

    const loadSyllabusFromDir = (dir: string, board: string) => {
        const fullDir = path.join(process.cwd(), 'Syllabus', dir);
        if (fs.existsSync(fullDir)) {
            const files = fs.readdirSync(fullDir);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    try {
                        const content = JSON.parse(fs.readFileSync(path.join(fullDir, file), 'utf8'));
                        if (content[board]) {
                            // Deep merge or Object.assign depending on structure
                            // The structure is { BOARD: { "Class X": { ... } } }
                            for (const [className, subjects] of Object.entries(content[board])) {
                                if (!fullSyllabus[className]) {
                                    fullSyllabus[className] = {};
                                }
                                Object.assign(fullSyllabus[className], subjects);
                            }
                        }
                    } catch (e) {
                        console.error(`Error parsing ${file} in ${dir}:`, e);
                    }
                }
            }
        }
    };

    loadSyllabusFromDir('CBSE', 'CBSE');
    loadSyllabusFromDir('ICSE', 'ICSE');

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

    const { data: classes } = await supabase
        .from('classes')
        .select(`
            *,
            children (*)
        `)
        .order('created_at', { ascending: false });

    const { data: children } = await supabase
        .from('children')
        .select(`
            *,
            assessments (*)
        `)
        .order('created_at', { ascending: false });

    const userData = {
        name: profile?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
    };

    const schedule = await getSchedule();

    return (
        <div className="flex h-screen bg-white overflow-hidden font-sans">
            <ClassesClient
                user={userData}
                initialChildren={children || []}
                initialSchedule={schedule}
                initialClasses={classes || []}
                fullSyllabus={fullSyllabus}
            />
        </div>
    );
}
