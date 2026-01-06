export interface Child {
    id: string;
    name: string;
    dob: string;
    gender: string;
    age: string;
    trailsGenerated: boolean;
}

export interface AssessmentQuestion {
    id: number;
    question: string;
    options: string[];
}

export const QUESTIONS: AssessmentQuestion[] = [
    {
        id: 1,
        question: "Preferred learning style",
        options: ["Hands-on", "Visual", "Auditory", "Movement-based"],
    },
    {
        id: 2,
        question: "Challenges",
        options: ["None", "Attention", "Math", "Language"],
    },
    {
        id: 3,
        question: "Interests",
        options: ["Math", "Language", "Science", "Art", "Music", "Outdoor"],
    },
    {
        id: 4,
        question: "Motivation",
        options: ["Curiosity", "Praise", "Rewards", "Collaboration"],
    },
    {
        id: 5,
        question: "Parent involvement",
        options: ["Active mentoring", "Regular check-ins", "Dashboard only"],
    },
];

export const BOARDS = [
    "CBSE",
    "ICSE",
    "IB",
    "Cambridge",
    "State Board",
];

export const SUBJECTS = [
    "Mathematics",
    "Science",
    "English",
    "Social Studies",
];

export const LEVELS = [
    "Level 1",
    "Level 2",
    "Level 3",
    "Level 4",
    "Level 5",
];
