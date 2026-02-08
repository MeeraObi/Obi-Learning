'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { ScheduleItem } from '@/types'

export async function getSchedule() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data } = await supabase
        .from('schedule')
        .select('*')
        .eq('teacher_id', user.id)

    return (data as ScheduleItem[]) || []
}

export async function addScheduleItem(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const day_of_week = formData.get('day_of_week') as string
    const start_time = formData.get('start_time') as string
    const end_time = formData.get('end_time') as string
    const subject = formData.get('subject') as string
    const class_name = formData.get('class_name') as string

    if (!day_of_week || !start_time || !end_time || !class_name) {
        return { error: 'Missing required fields' }
    }

    const { error } = await supabase
        .from('schedule')
        .insert({
            teacher_id: user.id,
            day_of_week,
            start_time,
            end_time,
            subject: subject || 'General',
            class_name
        })

    if (error) {
        console.error('Error adding schedule item:', error)
        return { error: `DB Error: ${error.message} (${error.details || 'no details'})` }
    }

    revalidatePath('/dashboard')
    revalidatePath('/classes')
    revalidatePath('/profile')
    return { success: true }
}

export async function deleteScheduleItem(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('schedule')
        .delete()
        .eq('id', id)
        .eq('teacher_id', user.id)

    if (error) {
        console.error('Error deleting schedule item:', error)
        return { error: 'Failed to delete schedule item' }
    }

    revalidatePath('/dashboard')
    revalidatePath('/classes')
    revalidatePath('/profile')
    return { success: true }
}
