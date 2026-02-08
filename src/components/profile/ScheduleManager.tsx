'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Calendar, Clock } from 'lucide-react';
import { addScheduleItem, deleteScheduleItem } from '@/app/dashboard/schedule-actions';
import { ScheduleItem } from '@/types';
import { formatTimeTo12h } from '@/lib/utils';

interface ScheduleManagerProps {
    initialSchedule: ScheduleItem[];
    availableClasses: any[];
}

export default function ScheduleManager({ initialSchedule, availableClasses }: ScheduleManagerProps) {
    const [isAdding, setIsAdding] = useState(false);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Group schedule by day
    const scheduleByDay = days.reduce((acc, day) => {
        acc[day] = initialSchedule.filter(item => item.day_of_week === day)
            .sort((a, b) => a.start_time.localeCompare(b.start_time));
        return acc;
    }, {} as Record<string, ScheduleItem[]>);

    return (
        <Card className="rounded-[2.5rem] border-none shadow-sm bg-white border border-gray-50 overflow-hidden">
            <CardHeader className="p-10 pb-4 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl font-black text-gray-900">Weekly Schedule</CardTitle>
                    <p className="text-sm text-gray-500 font-medium mt-1">Manage your recurring weekly classes.</p>
                </div>
                <Button onClick={() => setIsAdding(!isAdding)} className="rounded-xl font-bold bg-primary text-white hover:bg-primary/90">
                    {isAdding ? 'Cancel' : 'Add Class'}
                </Button>
            </CardHeader>
            <CardContent className="p-10 pt-4 space-y-8">
                {isAdding && (
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6 animate-in slide-in-from-top-2">
                        <form action={async (formData) => {
                            console.log('Submitting schedule item...', Object.fromEntries(formData));
                            const className = formData.get('class_name') as string;
                            const classObj = availableClasses.find(c => `${c.standard}-${c.division}` === className);
                            if (classObj) {
                                formData.append('subject', classObj.name);
                            }

                            try {
                                const result = await addScheduleItem(formData);
                                console.log('addScheduleItem result:', result);

                                if (result && 'error' in result) {
                                    console.error('Failed to add schedule item:', result.error);
                                    alert(`Error: ${result.error}`);
                                    return; // Don't close form on error
                                }

                                setIsAdding(false);
                            } catch (e) {
                                console.error('Exception submitting schedule:', e);
                                alert('An unexpected error occurred');
                            }
                        }} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">Day of Week</Label>
                                    <Select name="day_of_week" required>
                                        <SelectTrigger className="h-12 rounded-xl bg-white border-gray-200">
                                            <SelectValue placeholder="Select day" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {days.map(day => (
                                                <SelectItem key={day} value={day}>{day}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">Class Name</Label>
                                    <Select name="class_name" required>
                                        <SelectTrigger className="h-12 rounded-xl bg-white border-gray-200">
                                            <SelectValue placeholder="Select class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableClasses.map(cls => {
                                                const classId = `${cls.standard}-${cls.division}`;
                                                return (
                                                    <SelectItem key={cls.id} value={classId}>
                                                        {classId}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">Start</Label>
                                        <Input type="time" name="start_time" className="h-12 rounded-xl bg-white border-gray-200" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">End</Label>
                                        <Input type="time" name="end_time" className="h-12 rounded-xl bg-white border-gray-200" required />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button type="submit" className="rounded-xl font-black h-12 px-8 gap-2 bg-gray-900 hover:bg-primary text-white transition-all shadow-lg shadow-gray-200">
                                    <Plus size={18} />
                                    Add to Schedule
                                </Button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="space-y-8">
                    {days.map(day => {
                        const items = scheduleByDay[day];
                        if (items.length === 0) return null;

                        return (
                            <div key={day} className="space-y-3">
                                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Calendar size={12} />
                                    {day}
                                </h3>
                                <div className="grid gap-3">
                                    {items.map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-50 hover:bg-white hover:shadow-sm transition-all group">
                                            <div className="flex items-center gap-6">
                                                <div className="flex flex-col items-center justify-center min-w-[80px] border-r border-gray-100 pr-6 text-center">
                                                    <span className="text-sm font-black text-gray-900 leading-tight">
                                                        {formatTimeTo12h(item.start_time).time}
                                                        <span className="text-[10px] ml-1 opacity-50">{formatTimeTo12h(item.start_time).period}</span>
                                                    </span>
                                                    <span className="text-[10px] font-medium text-gray-400 mt-0.5">
                                                        {formatTimeTo12h(item.end_time).time} {formatTimeTo12h(item.end_time).period}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{item.subject}</h4>
                                                    <p className="text-sm text-gray-500 font-medium">{item.class_name}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                onClick={() => deleteScheduleItem(item.id)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                    {initialSchedule.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-gray-900 font-bold mb-1">No Schedule Added</h3>
                            <p className="text-gray-500 text-sm">Add your weekly classes to see them here and on your dashboard.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
