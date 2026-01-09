'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function getClasses() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
        .from('classes')
        .select(`
            *,
            children (*)
        `)
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching classes:', error)
        return []
    }

    return data || []
}

export async function createClass(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/')

    const name = formData.get('name') as string
    const standard = formData.get('standard') as string
    const division = formData.get('division') as string

    if (!name) return { error: 'Class name is required' }

    const { data, error } = await supabase
        .from('classes')
        .insert({
            teacher_id: user.id,
            name,
            standard,
            division
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating class:', error)
        return { error: 'Failed to create class' }
    }

    revalidatePath('/students')
    return { success: true, class: data }
}

export async function addStudentToClass(childId: string, classId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('children')
        .update({ class_id: classId })
        .eq('id', childId)
        .eq('teacher_id', user.id)

    if (error) {
        console.error('Error adding student to class:', error)
        return { error: 'Failed to add student to class' }
    }

    revalidatePath('/students')
    return { success: true }
}
