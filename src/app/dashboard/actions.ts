'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function addChild(formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        redirect('/')
    }

    const name = formData.get('name') as string
    const dob = formData.get('dob') as string // YYYY-MM-DD
    const gender = formData.get('gender') as string

    if (!name || !dob) {
        // Basic validation
        return { error: 'Name and Date of Birth are required' }
    }

    const { error } = await supabase.from('children').insert({
        parent_id: user.id,
        name,
        date_of_birth: dob,
        gender: gender,
    })

    if (error) {
        console.error('Error adding child:', error)
        return { error: 'Failed to add child profile.' }
    }

    revalidatePath('/dashboard')
    // We can return success or redirect.
    // For now, let's just revalidate.
    return { success: true }
}

export async function saveAssessment(childId: string, answers: any) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { error } = await supabase.from('assessments').insert({
        child_id: childId,
        answers: answers,
    })

    if (error) {
        console.error('Error saving assessment:', error)
        return { error: 'Failed to save assessment.' }
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function updateChild(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const dob = formData.get('dob') as string
    const gender = formData.get('gender') as string

    if (!id || !name || !dob) {
        return { error: 'Missing required fields' }
    }

    const { error } = await supabase
        .from('children')
        .update({ name, date_of_birth: dob, gender })
        .eq('id', id)
        .eq('parent_id', user.id)

    if (error) {
        console.error('Error updating child:', error)
        return { error: 'Failed to update child.' }
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function deleteChild(childId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    // assessments will cascade delete due to foreign key constraints, 
    // but we can explicitly check if needed. Supabase usually handles cascade if configured.
    // Our schema used 'on delete cascade' for assessments.

    const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', childId)
        .eq('parent_id', user.id)

    if (error) {
        console.error('Error deleting child:', error)
        return { error: 'Failed to delete child.' }
    }

    revalidatePath('/dashboard')
    return { success: true }
}
