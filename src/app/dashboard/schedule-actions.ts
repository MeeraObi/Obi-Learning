'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export type ScheduleItem = {
    id: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    subject: string;
    class_name: string;
    room: string | null;
};

export async function getSchedule() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .order('start_time', { ascending: true });

    if (error) {
        console.error('Error fetching schedule:', error.message, error.code, error.details);
        return [];
    }

    return data as ScheduleItem[];
}

export async function addScheduleItem(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Not authenticated');

    const item = {
        user_id: user.id,
        day_of_week: formData.get('day_of_week') as string,
        start_time: formData.get('start_time') as string,
        end_time: formData.get('end_time') as string,
        subject: formData.get('subject') as string,
        class_name: formData.get('class_name') as string,
        room: formData.get('room') as string,
    };

    const { error } = await supabase.from('schedules').insert(item);

    if (error) {
        console.error('Error adding schedule item:', error);
        throw new Error('Failed to add schedule item');
    }

    revalidatePath('/dashboard');
    revalidatePath('/profile');
}

export async function deleteScheduleItem(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting schedule item:', error);
        throw new Error('Failed to delete schedule item');
    }

    revalidatePath('/dashboard');
    revalidatePath('/profile');
}
