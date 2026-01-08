"use client"

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

const conceptReinforcements = [
    {
        class: "Grade 9 • Math",
        topic: "Linear Equations",
        period: "Period 1",
        students: "Arjun, Meera and 4 others",
        insight: "Class struggled with multi-step equations in yesterday's exit ticket.",
        action: "5-min recap suggestions"
    },
    {
        class: "Grade 8 • Science",
        topic: "Cell Structures",
        period: "Period 2",
        students: "Group B",
        insight: "40% lower score on mitochondrial function MCQ.",
        action: "View quiz breakdown"
    }
];

const ConceptReinforcement = () => {
    return (
        <div className="bg-blue-50/50 rounded-[2.5rem] border border-blue-100 p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500 rounded-xl text-white">
                    <Sparkles size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-black text-gray-900 tracking-tight">Concept Reinforcement Needed</h2>
                    <p className="text-sm text-gray-500 font-medium tracking-tight">AI-flagged groups that may benefit from a quick recap segment.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {conceptReinforcements.map((item, idx) => (
                    <Card key={idx} className="rounded-3xl border-none shadow-sm bg-white p-6 transition-all hover:shadow-md">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{item.class}</p>
                                <p className="text-sm font-black text-gray-900">{item.period}</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 font-medium mb-3 leading-relaxed">
                            {item.students} may need reinforcement on <span className="text-gray-900 font-bold">{item.topic}</span> based on recent data.
                        </p>
                        <Button variant="outline" className="w-full rounded-xl h-10 text-xs font-bold border-gray-100 hover:bg-gray-50 text-primary">
                            {item.action}
                        </Button>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ConceptReinforcement;
