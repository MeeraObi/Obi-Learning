// Comprehensive Curriculum Plan for Mathematics and Science
// Maps all syllabus topics to specific weeks across the academic year

export interface CurriculumWeek {
    week: number;
    subject: 'Mathematics' | 'Science';
    unit: string;
    topic: string;
    description?: string;
}

export const curriculumPlan: CurriculumWeek[] = [
    // MATHEMATICS - Number Systems (Weeks 1-5)
    { week: 1, subject: 'Mathematics', unit: 'Number Systems', topic: 'Natural Numbers and Whole Numbers', description: 'Introduction to counting numbers and whole number operations' },
    { week: 2, subject: 'Mathematics', unit: 'Number Systems', topic: 'Integers and Rational Numbers', description: 'Positive and negative integers, fractions and rational number operations' },
    { week: 3, subject: 'Mathematics', unit: 'Number Systems', topic: 'Real Numbers and Irrational Numbers', description: 'Understanding irrational numbers, square roots, and real number system' },
    { week: 4, subject: 'Mathematics', unit: 'Number Systems', topic: 'Number Line Representation', description: 'Visualizing numbers on number line, ordering and comparing' },
    { week: 5, subject: 'Mathematics', unit: 'Number Systems', topic: 'Properties of Numbers', description: 'Commutative, associative, distributive properties and number patterns' },

    // MATHEMATICS - Algebra (Weeks 6-10)
    { week: 6, subject: 'Mathematics', unit: 'Algebra', topic: 'Variables and Expressions', description: 'Introduction to algebraic expressions and variables' },
    { week: 7, subject: 'Mathematics', unit: 'Algebra', topic: 'Linear Equations in One Variable', description: 'Setting up and understanding linear equations' },
    { week: 8, subject: 'Mathematics', unit: 'Algebra', topic: 'Solving Linear Equations', description: 'Methods for solving linear equations and applications' },
    { week: 9, subject: 'Mathematics', unit: 'Algebra', topic: 'Polynomials and Factorization', description: 'Polynomial expressions, operations, and factorization techniques' },
    { week: 10, subject: 'Mathematics', unit: 'Algebra', topic: 'Quadratic Equations', description: 'Introduction to quadratic equations and solving methods' },

    // MATHEMATICS - Geometry (Weeks 11-17)
    { week: 11, subject: 'Mathematics', unit: 'Geometry', topic: 'Basic Geometrical Shapes', description: 'Points, lines, rays, line segments, and basic shapes' },
    { week: 12, subject: 'Mathematics', unit: 'Geometry', topic: 'Lines and Angles', description: 'Types of angles, angle relationships, parallel and perpendicular lines' },
    { week: 13, subject: 'Mathematics', unit: 'Geometry', topic: 'Triangles and their Properties', description: 'Types of triangles, angle sum property, congruence theorems' },
    { week: 14, subject: 'Mathematics', unit: 'Geometry', topic: 'Triangles and their Properties', description: 'Continuation: Pythagorean theorem and triangle applications' },
    { week: 15, subject: 'Mathematics', unit: 'Geometry', topic: 'Quadrilaterals', description: 'Properties of parallelograms, rectangles, rhombus, squares, trapezoids' },
    { week: 16, subject: 'Mathematics', unit: 'Geometry', topic: 'Circles and their Properties', description: 'Circle terminology, chord properties, tangents, and circle theorems' },
    { week: 17, subject: 'Mathematics', unit: 'Geometry', topic: 'Area and Perimeter', description: 'Calculating area and perimeter of various shapes' },

    // MATHEMATICS - Trigonometry (Weeks 18-22)
    { week: 18, subject: 'Mathematics', unit: 'Trigonometry', topic: 'Introduction to Trigonometry', description: 'Basic concepts and right-angled triangles' },
    { week: 19, subject: 'Mathematics', unit: 'Trigonometry', topic: 'Trigonometric Ratios', description: 'Sin, cos, tan and their reciprocals' },
    { week: 20, subject: 'Mathematics', unit: 'Trigonometry', topic: 'Trigonometric Identities', description: 'Fundamental identities and their applications' },
    { week: 21, subject: 'Mathematics', unit: 'Trigonometry', topic: 'Heights and Distances', description: 'Applications in measuring heights and distances' },
    { week: 22, subject: 'Mathematics', unit: 'Trigonometry', topic: 'Applications of Trigonometry', description: 'Real-world problems and advanced applications' },

    // MATHEMATICS - Statistics & Probability (Weeks 23-27)
    { week: 23, subject: 'Mathematics', unit: 'Statistics & Probability', topic: 'Data Collection and Organization', description: 'Methods of data collection, tabulation, and frequency distribution' },
    { week: 24, subject: 'Mathematics', unit: 'Statistics & Probability', topic: 'Mean, Median, and Mode', description: 'Measures of central tendency and their applications' },
    { week: 25, subject: 'Mathematics', unit: 'Statistics & Probability', topic: 'Probability Concepts', description: 'Introduction to probability, outcomes, and events' },
    { week: 26, subject: 'Mathematics', unit: 'Statistics & Probability', topic: 'Random Experiments', description: 'Probability in random experiments and sample spaces' },
    { week: 27, subject: 'Mathematics', unit: 'Statistics & Probability', topic: 'Graphical Representation of Data', description: 'Bar graphs, histograms, pie charts, and data visualization' },

    // SCIENCE - Physics (Weeks 1-6)
    { week: 1, subject: 'Science', unit: 'Physics', topic: 'Motion and Measurement', description: 'Types of motion, speed, velocity, and measuring instruments' },
    { week: 2, subject: 'Science', unit: 'Physics', topic: 'Force and Laws of Motion', description: 'Newton\'s laws of motion, balanced and unbalanced forces' },
    { week: 3, subject: 'Science', unit: 'Physics', topic: 'Energy and Work', description: 'Forms of energy, work, power, and energy conservation' },
    { week: 4, subject: 'Science', unit: 'Physics', topic: 'Light - Reflection and Refraction', description: 'Properties of light, mirrors, lenses, and optical phenomena' },
    { week: 5, subject: 'Science', unit: 'Physics', topic: 'Electricity and Magnetism', description: 'Electric circuits, current, voltage, resistance, and magnetic effects' },
    { week: 6, subject: 'Science', unit: 'Physics', topic: 'Sound and Wave Motion', description: 'Sound waves, pitch, loudness, wave properties' },

    // SCIENCE - Chemistry (Weeks 7-12)
    { week: 7, subject: 'Science', unit: 'Chemistry', topic: 'Matter and its Composition', description: 'States of matter, properties, and classification' },
    { week: 8, subject: 'Science', unit: 'Chemistry', topic: 'Atoms and Molecules', description: 'Atomic structure, molecules, and chemical formulas' },
    { week: 9, subject: 'Science', unit: 'Chemistry', topic: 'Chemical Reactions and Equations', description: 'Types of reactions, balancing equations, and conservation of mass' },
    { week: 10, subject: 'Science', unit: 'Chemistry', topic: 'Acids, Bases, and Salts', description: 'Properties, indicators, pH scale, and neutralization reactions' },
    { week: 11, subject: 'Science', unit: 'Chemistry', topic: 'Metals and Non-metals', description: 'Properties, reactivity series, and extraction of metals' },
    { week: 12, subject: 'Science', unit: 'Chemistry', topic: 'Periodic Classification of Elements', description: 'Periodic table, groups, periods, and element properties' },

    // SCIENCE - Biology (Weeks 13-19)
    { week: 13, subject: 'Science', unit: 'Biology', topic: 'Cell Structure and Function', description: 'Cell theory, prokaryotic and eukaryotic cells, organelles' },
    { week: 14, subject: 'Science', unit: 'Biology', topic: 'Tissues and Organs', description: 'Plant and animal tissues, tissue systems, organ formation' },
    { week: 15, subject: 'Science', unit: 'Biology', topic: 'Life Processes', description: 'Nutrition, respiration, transportation, excretion in living organisms' },
    { week: 16, subject: 'Science', unit: 'Biology', topic: 'Diversity in Living Organisms', description: 'Classification of living things, biodiversity, taxonomy' },
    { week: 17, subject: 'Science', unit: 'Biology', topic: 'Human Body Systems', description: 'Digestive, respiratory, circulatory, nervous systems' },
    { week: 18, subject: 'Science', unit: 'Biology', topic: 'Reproduction and Heredity', description: 'Reproduction in plants and animals, genetics, inheritance' },
    { week: 19, subject: 'Science', unit: 'Biology', topic: 'Ecology and Environment', description: 'Ecosystems, food chains, environmental conservation' },
];

// Helper function to get curriculum for a specific week and subject
export function getCurriculumForWeek(week: number, subject: 'Mathematics' | 'Science'): CurriculumWeek | undefined {
    return curriculumPlan.find(item => item.week === week && item.subject === subject);
}

// Helper function to get current week number from a date
export function getAcademicWeek(date: Date = new Date()): number {
    // Academic year starts in June (month 5 in 0-indexed)
    const academicYearStart = new Date(date.getFullYear(), 5, 1); // June 1st

    // If current date is before June, use previous year's start
    if (date.getMonth() < 5) {
        academicYearStart.setFullYear(date.getFullYear() - 1);
    }

    const diffTime = Math.abs(date.getTime() - academicYearStart.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weekNumber = Math.ceil(diffDays / 7);

    // Cycle through 27 weeks for Maths, 19 weeks for Science
    return weekNumber;
}

// Helper function to get topic for a specific class session
export function getTopicForClass(subject: 'Mathematics' | 'Science', weekNumber?: number): string {
    const week = weekNumber || getAcademicWeek();

    // For Maths: cycle through 27 weeks
    // For Science: cycle through 19 weeks
    const maxWeeks = subject === 'Mathematics' ? 27 : 19;
    const effectiveWeek = ((week - 1) % maxWeeks) + 1;

    const curriculum = getCurriculumForWeek(effectiveWeek, subject);
    return curriculum ? curriculum.topic : 'General ' + subject;
}

// Export all topics for each subject
export const mathsTopics = curriculumPlan
    .filter(item => item.subject === 'Mathematics')
    .map(item => item.topic);

export const scienceTopics = curriculumPlan
    .filter(item => item.subject === 'Science')
    .map(item => item.topic);
