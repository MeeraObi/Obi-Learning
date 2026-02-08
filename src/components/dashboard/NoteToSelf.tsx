"use client"

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Plus, Trash2 } from 'lucide-react';

export interface Note {
    id: string;
    text: string;
    time: string;
}

const NoteToSelf = () => {
    const [notes, setNotes] = useState<Note[]>([
        {
            id: '1',
            text: "Check in with Arjun's parents regarding his sudden drop in engagement during the Science lab.",
            time: '2h ago'
        }
    ]);
    const [newNote, setNewNote] = useState('');

    const handleAddNote = () => {
        if (!newNote.trim()) return;
        const note = {
            id: Date.now().toString(),
            text: newNote,
            time: 'Just now'
        };
        setNotes([note, ...notes]);
        setNewNote('');
    };

    const removeNote = (id: string) => {
        setNotes(notes.filter(n => n.id !== id));
    };

    return (
        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white p-8">
            <h3 className="text-lg font-black text-gray-900 tracking-tight mb-4">To-do List</h3>

            <div className="space-y-4 mb-6">
                <div className="relative group">
                    <Input
                        placeholder="Write a quick reminder..."
                        className="h-12 rounded-2xl bg-gray-50 border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20 pr-12 transition-all"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    />
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleAddNote}
                        className="absolute right-1 top-1 h-10 w-10 rounded-xl hover:bg-white hover:text-primary hover:shadow-sm"
                    >
                        <Plus size={18} />
                    </Button>
                </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-4 custom-scrollbar pr-2">
                {notes.map(note => (
                    <div key={note.id} className="bg-yellow-50/50 border border-yellow-100 p-4 rounded-2xl animate-in slide-in-from-top-2 duration-300">
                        <p className="text-sm text-gray-700 font-medium leading-relaxed">
                            {note.text}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] font-black text-yellow-600 uppercase tracking-widest">
                                <Clock size={12} />
                                Set {note.time}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-lg text-yellow-600/30 hover:text-red-500 hover:bg-red-50"
                                onClick={() => removeNote(note.id)}
                            >
                                <Trash2 size={12} />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
            {notes.length > 0 && (
                <Button variant="ghost" className="w-full mt-4 text-xs font-black text-primary uppercase tracking-widest hover:bg-primary/5 rounded-xl">
                    See all notes
                </Button>
            )}
        </Card>
    );
};

export default NoteToSelf;
