'use client';

import { useState, useEffect } from 'react';
import { Student } from '@/types';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import AddStudentForm from '@/components/dashboard/AddStudentForm';
import EmptyState from '@/components/dashboard/EmptyState';
import StudentProfile from '@/components/dashboard/StudentProfile';
import AssessmentResults from '@/components/dashboard/AssessmentResults';
import { saveAssessment, deleteChild } from '@/app/dashboard/actions';
import { differenceInYears } from 'date-fns';

interface DashboardClientProps {
    initialChildren: any[];
    user: {
        name: string;
        email: string;
    };
}

export default function DashboardClient({ initialChildren, user }: DashboardClientProps) {
    // Map DB structure to Student type if necessary
    const mapStudents = (data: any[]): Student[] => data.map(c => ({
        id: c.id,
        name: c.name,
        date_of_birth: c.date_of_birth,
        gender: c.gender,
        age: c.date_of_birth ? differenceInYears(new Date(), new Date(c.date_of_birth)).toString() : '0',
        trailsGenerated: c.assessments && c.assessments.length > 0, // Check if assessment exists
        assessments: c.assessments // Keep raw data if needed later
    }));

    const [students, setStudents] = useState<Student[]>(mapStudents(initialChildren));

    // Update state when initialChildren changes (e.g. after server action revalidation)
    useEffect(() => {
        setStudents(mapStudents(initialChildren));
    }, [initialChildren]);

    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(initialChildren.length > 0 ? initialChildren[0].id : null);
    const [showAddStudentForm, setShowAddStudentForm] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleAddStudent = (studentData: any) => {
        setShowAddStudentForm(false);
        setEditingStudent(null);
    };

    const handleDeleteStudent = async (id: string) => {
        if (confirm('Are you sure you want to delete this student record?')) {
            await deleteChild(id);
            if (selectedStudentId === id) {
                setSelectedStudentId(null);
            }
        }
    };

    const handleEditStudent = (student: Student) => {
        setEditingStudent(student);
        setShowAddStudentForm(true);
    };

    const selectedStudent = students.find((s) => s.id === selectedStudentId);



    return (
        <div className="flex h-screen bg-white overflow-hidden font-sans">
            <Sidebar
                studentsList={students}
                user={user}
            />

            <div className="flex-1 flex flex-col min-w-0 bg-[#fbfbfc]">
                <TopBar selectedStudent={selectedStudent} user={user} />

                <main className="flex-1 overflow-y-auto p-10">
                    {showAddStudentForm ? (
                        <AddStudentForm
                            initialData={editingStudent ? {
                                id: editingStudent.id,
                                name: editingStudent.name,
                                date_of_birth: editingStudent.date_of_birth,
                                gender: editingStudent.gender
                            } : undefined}
                            mode={editingStudent ? 'edit' : 'add'}
                            onAddStudent={handleAddStudent}
                            onCancel={() => {
                                setShowAddStudentForm(false);
                                setEditingStudent(null);
                            }}
                        />
                    ) : selectedStudent ? (
                        <StudentProfile
                            student={selectedStudent}
                            onStartAssessment={() => { }} // This will likely navigate to Trails now
                        />
                    ) : (
                        <EmptyState onAddStudentClick={() => {
                            setEditingStudent(null);
                            setShowAddStudentForm(true);
                        }} />
                    )}
                </main>
            </div>
        </div>
    );
}
