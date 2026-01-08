import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import MessagesClient from '@/components/messages/MessagesClient';

export default async function MessagesPage() {
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

    const { data: classes } = await supabase
        .from('classes')
        .select('*')
        .order('name');

    const userData = {
        name: profile?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
    };

    return (
        <div className="flex h-screen bg-white overflow-hidden font-sans">
            <MessagesClient
                user={userData}
                initialChildren={children || []}
                initialClasses={classes || []}
            />
        </div>
    );
}
