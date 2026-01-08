export interface Student {
    id: string;
    name: string;
    date_of_birth: string;
    gender: string;
    age: string;
    trailsGenerated: boolean;
    assessments?: Assessment[];
}

export interface Assessment {
    id: string;
    student_id: string;
    answers: Record<string, string[]>;
    created_at: string;
}

export const BOARDS = [
    "CBSE",
    "ICSE",
    "IB",
    "IGCSE",
    "State Board",
];

export const SUBJECTS = [
    "Mathematics",
    "Science",
    "English",
    "Social Studies",
];
