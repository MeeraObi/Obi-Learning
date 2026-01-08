import { Student } from '@/types';
import { differenceInYears } from 'date-fns';

/**
 * Maps Supabase child data (with assessments) to the frontend Student type.
 */
export const mapStudentData = (data: any[]): Student[] => {
    return data.map(c => ({
        id: c.id,
        name: c.name,
        class_id: c.class_id,
        date_of_birth: c.date_of_birth,
        gender: c.gender,
        age: c.date_of_birth ? differenceInYears(new Date(), new Date(c.date_of_birth)).toString() : '0',
        trailsGenerated: c.assessments && c.assessments.length > 0,
        assessments: c.assessments || []
    }));
};
