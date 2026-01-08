import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import ProfileClient from '@/components/profile/ProfileClient';
import { getSchedule } from '@/app/dashboard/schedule-actions';

export default async function ProfilePage() {
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

    const schedule = await getSchedule();

    const userData = {
        name: profile?.full_name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        phone: profile?.phone || 'Not provided',
        institution: profile?.institution_name || 'Obi Learning Academy',
        role: profile?.role || 'Lead Teacher'
    };

    return (
        <div className="flex h-screen bg-white overflow-hidden font-sans">
            <ProfileClient
                user={userData}
                initialChildren={children || []}
                initialSchedule={schedule}
            />
        </div>
    );
}
