'use client';

import { useState, useEffect } from 'react';
import { Child, QUESTIONS } from '@/types';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import AddChildForm from '@/components/dashboard/AddChildForm';
import EmptyState from '@/components/dashboard/EmptyState';
import ChildProfile from '@/components/dashboard/ChildProfile';
import AssessmentFlow from '@/components/dashboard/AssessmentFlow';
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
    // Map DB structure to Child type if necessary
    const mapChildren = (data: any[]) => data.map(c => ({
        id: c.id,
        name: c.name,
        dob: c.date_of_birth,
        gender: c.gender,
        age: c.date_of_birth ? differenceInYears(new Date(), new Date(c.date_of_birth)).toString() : '0',
        trailsGenerated: c.assessments && c.assessments.length > 0, // Check if assessment exists
        assessments: c.assessments // Keep raw data if needed later
    }));

    const [children, setChildren] = useState<Child[]>(mapChildren(initialChildren));

    // Update state when initialChildren changes (e.g. after server action revalidation)
    useEffect(() => {
        setChildren(mapChildren(initialChildren));
    }, [initialChildren]);

    const [selectedChildId, setSelectedChildId] = useState<string | null>(initialChildren.length > 0 ? initialChildren[0].id : null);
    const [showAddChildForm, setShowAddChildForm] = useState(false);
    const [editingChild, setEditingChild] = useState<Child | null>(null);
    const [assessmentStep, setAssessmentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string[]>>({});
    const [isSaving, setIsSaving] = useState(false);

    // This handles the immediate UI update, but the server action will refresh the data
    const handleAddChild = (childData: { name: string; dob: string; gender: string; age: string }) => {
        setShowAddChildForm(false);
        setEditingChild(null);
    };

    const handleDeleteChild = async (id: string) => {
        if (confirm('Are you sure you want to delete this profile?')) {
            await deleteChild(id);
            if (selectedChildId === id) {
                setSelectedChildId(null);
            }
        }
    };

    const handleEditChild = (child: Child) => {
        setEditingChild(child);
        setShowAddChildForm(true);
    };

    const selectedChild = children.find((c) => c.id === selectedChildId);

    // Load existing answers if available (optional, for viewing results)
    useEffect(() => {
        if (selectedChildId) {
            const childRaw = initialChildren.find(c => c.id === selectedChildId);
            if (childRaw && childRaw.assessments && childRaw.assessments.length > 0) {
                setAnswers(childRaw.assessments[0].answers);
            } else {
                setAnswers({});
                setAssessmentStep(0);
            }
        }
    }, [selectedChildId, initialChildren]);


    const handleAnswerSubmit = async (answer: string[]) => {
        const newAnswers = { ...answers, [assessmentStep]: answer };
        setAnswers(newAnswers);

        if (assessmentStep < QUESTIONS.length) {
            setAssessmentStep(assessmentStep + 1);
        } else {
            // Assessment Complete
            if (selectedChildId) {
                setIsSaving(true);
                await saveAssessment(selectedChildId, newAnswers);
                setIsSaving(false);

                // Optimistic update
                const updatedChildren = children.map((c) =>
                    c.id === selectedChildId ? { ...c, trailsGenerated: true } : c
                );
                setChildren(updatedChildren);
            }
            setAssessmentStep(6);
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar
                childrenList={children}
                selectedChildId={selectedChildId}
                onSelectChild={(id) => {
                    setSelectedChildId(id);
                    setAssessmentStep(0);
                    setShowAddChildForm(false);
                    setEditingChild(null);
                }}
                onAddChildClick={() => {
                    setEditingChild(null);
                    setShowAddChildForm(true);
                    setSelectedChildId(null);
                }}
                onDelete={handleDeleteChild}
                onEdit={handleEditChild}
            />

            <div className="flex-1 flex flex-col min-w-0">
                <TopBar selectedChild={selectedChild} user={user} />

                <main className="flex-1 overflow-y-auto p-8">
                    {showAddChildForm ? (
                        <AddChildForm
                            initialData={editingChild ? {
                                id: editingChild.id,
                                name: editingChild.name,
                                dob: editingChild.dob,
                                gender: editingChild.gender
                            } : undefined}
                            mode={editingChild ? 'edit' : 'add'}
                            onAddChild={handleAddChild}
                            onCancel={() => {
                                setShowAddChildForm(false);
                                setEditingChild(null);
                            }}
                        />
                    ) : selectedChild ? (
                        // If trails/assessment exists, show results directly
                        selectedChild.trailsGenerated ? (
                            <AssessmentResults child={selectedChild} answers={answers} />
                        ) : assessmentStep === 0 ? (
                            <ChildProfile
                                child={selectedChild}
                                onStartAssessment={() => setAssessmentStep(1)}
                            />
                        ) : assessmentStep > 0 && assessmentStep <= QUESTIONS.length ? (
                            <AssessmentFlow
                                step={assessmentStep}
                                onSubmitAnswer={handleAnswerSubmit}
                            />
                        ) : (
                            // Fallback for step 6 (Completed state just before potential re-render)
                            <AssessmentResults
                                child={selectedChild}
                                answers={answers}
                            />
                        )
                    ) : (
                        <EmptyState onAddChildClick={() => {
                            setEditingChild(null);
                            setShowAddChildForm(true);
                        }} />
                    )}
                </main>
            </div>
        </div>
    );
}
