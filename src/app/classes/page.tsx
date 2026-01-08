import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ClassesClient from '@/components/classes/ClassesClient';

export default async function ClassesPage() {
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
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

    const { data: children } = await supabase
        .from('children')
        .select(`
            *,
            assessments (*)
        `)
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

    const userData = {
        name: profile?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
    };

    return (
        <div className="flex h-screen bg-white overflow-hidden font-sans">
            <ClassesClient
                user={userData}
                initialChildren={children || []}
                initialClasses={classes || []}
            />
        </div>
    );
}
