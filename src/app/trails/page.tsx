import { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import TrailsClient from '@/components/trails/TrailsClient';
import { redirect } from 'next/navigation';
import fs from 'fs/promises';
import path from 'path';

async function getSyllabus() {
    const syllabus: any = {};
    const baseDir = process.cwd();
    const syllabusDir = path.join(baseDir, 'syllabus');

    // 1. Try loading from 'syllabus' directory (Hierarchical: syllabus/BoardName/ClassX.json)
    try {
        const syllabusExists = await fs.access(syllabusDir).then(() => true).catch(() => false);
        if (syllabusExists) {
            const boards = await fs.readdir(syllabusDir);

            for (const boardName of boards) {
                if (boardName.startsWith('.')) continue; // Skip hidden files

                const boardPath = path.join(syllabusDir, boardName);
                const boardStats = await fs.stat(boardPath);

                if (boardStats.isDirectory()) {
                    syllabus[boardName] = syllabus[boardName] || {};
                    const files = await fs.readdir(boardPath);

                    for (const file of files) {
                        if (file.endsWith('.json')) {
                            try {
                                const fileContent = await fs.readFile(path.join(boardPath, file), 'utf8');
                                const data = JSON.parse(fileContent);

                                // The file might have the board as top-level key or be the class data directly
                                const boardData = data[boardName] || data;

                                for (const className in boardData) {
                                    // Make sure we are looking at class objects, not other board metadata
                                    if (typeof boardData[className] === 'object' && !Array.isArray(boardData[className])) {
                                        syllabus[boardName][className] = {
                                            ...(syllabus[boardName][className] || {}),
                                            ...boardData[className]
                                        };
                                    }
                                }
                            } catch (error) {
                                console.error(`Error parsing ${file} in ${boardName}:`, error);
                            }
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error loading syllabus directory:", error);
    }

    // 2. Load root CBSE files for backward compatibility
    syllabus.CBSE = syllabus.CBSE || {};
    for (let i = 1; i <= 12; i++) {
        try {
            const filePath = path.join(baseDir, `class${i}_full_syllabus.json`);
            const fileContent = await fs.readFile(filePath, 'utf8');
            const data = JSON.parse(fileContent);

            if (data.CBSE) {
                Object.assign(syllabus.CBSE, data.CBSE);
            }
        } catch (error) {
            // Root file might not exist for some classes
        }
    }

    return syllabus;
}

export default async function TrailsPage({
    searchParams,
}: {
    searchParams: { studentId?: string; board?: string; subject?: string; topic?: string };
}) {
    const { studentId, board, subject, topic } = await searchParams;

    if (!studentId) {
        redirect('/home');
    }

    const supabase = await createClient();
    const { data: student, error } = await supabase
        .from('children')
        .select('*, assessments(*)')
        .eq('id', studentId)
        .single();

    if (error || !student) {
        redirect('/home');
    }

    const syllabus = await getSyllabus();

    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
            <TrailsClient
                student={student}
                syllabus={syllabus}
                initialBoard={board}
                initialSubject={subject}
                initialTopic={topic}
            />
        </Suspense>
    );
}
