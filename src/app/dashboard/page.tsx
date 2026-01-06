import { createClient } from '@/utils/supabase/server';
import DashboardClient from '@/components/dashboard/DashboardClient';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/');
    }

    let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Auto-heal: If profile doesn't exist (e.g. trigger failed), create it now
    if (!profile) {
        const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || '',
            })
            .select()
            .single();

        if (!insertError && newProfile) {
            profile = newProfile;
        } else if (insertError) {
            console.error('Error creating missing profile:', insertError);
        }
    }

    const { data: children, error } = await supabase
        .from('children')
        .select(`
            *,
            assessments (*)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching children:', error);
    }

    const userData = {
        name: profile?.full_name || user.email?.split('@')[0] || 'Parent',
        email: user.email || '',
    };

    return <DashboardClient initialChildren={children || []} user={userData} />;
}
