import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ClassesClient from '@/components/classes/ClassesClient';
import { getSchedule } from '@/app/dashboard/schedule-actions';
import fs from 'fs';
import path from 'path';

export default async function ClassesPage() {
    // Load all class syllabus files
    const syllabusFiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => `class${n}_full_syllabus.json`);
    const fullSyllabus: Record<string, any> = {};

    for (const file of syllabusFiles) {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
            try {
                const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                if (content.CBSE) {
                    Object.assign(fullSyllabus, content.CBSE);
                }
            } catch (e) {
                console.error(`Error parsing ${file}:`, e);
            }
        }
    }

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
