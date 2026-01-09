import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import StudentsClient from '@/components/students/StudentsClient';
import { getSchedule } from '@/app/dashboard/schedule-actions';

export default async function StudentsPage() {
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
            <StudentsClient
                user={userData}
                initialChildren={children || []}
                initialClasses={classes || []}
                initialSchedule={schedule}
            />
        </div>
    );
}
