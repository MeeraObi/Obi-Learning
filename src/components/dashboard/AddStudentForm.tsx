import { useState, useEffect } from 'react';
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { addChild, updateChild } from "@/app/dashboard/actions";
import { differenceInYears } from 'date-fns';

interface AddStudentFormProps {
    onAddStudent: (student: any) => void;
    onCancel: () => void;
    initialData?: {
        id: string;
        name: string;
        date_of_birth: string;
        gender: string;
    };
    mode?: 'add' | 'edit';
    classId?: string;
}

export default function AddStudentForm({ onAddStudent, onCancel, initialData, mode = 'add', classId }: AddStudentFormProps) {
    const [newStudent, setNewStudent] = useState({
        name: initialData?.name || '',
        gender: initialData?.gender || '',
        age: initialData?.date_of_birth ? differenceInYears(new Date(), new Date(initialData.date_of_birth)).toString() : ''
    });

    // Parse initial date string to Date object
    const [date, setDate] = useState<Date | undefined>(
        initialData?.date_of_birth ? new Date(initialData.date_of_birth) : undefined
    );

    const [loading, setLoading] = useState(false);

    // Recalculate age when date changes
    useEffect(() => {
        if (date) {
            setNewStudent(prev => ({ ...prev, age: differenceInYears(new Date(), date).toString() }));
        }
    }, [date]);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        // Append controlled values
        if (date) formData.append('dob', format(date, "yyyy-MM-dd"));
        formData.append('gender', newStudent.gender);
        if (classId) formData.append('class_id', classId);

        let result;
        if (mode === 'edit' && initialData) {
            formData.append('id', initialData.id);
            result = await updateChild(formData);
        } else {
            result = await addChild(formData);
        }

        if (result?.error) {
            alert(result.error);
        } else {
            onAddStudent({}); // Signal completion
        }
    };

    return (
        <Card className="max-w-xl mx-auto shadow-sm border-none bg-white">
            <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-black text-gray-900 tracking-tight">
                    {mode === 'edit' ? 'Update Student Record' : 'Register New Student'}
                </CardTitle>
                <p className="text-sm text-gray-500 font-medium">Please provide the student's primary identification details.</p>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">Student Full Name</Label>
                        <Input
                            type="text"
                            name="name"
                            required
                            value={newStudent.name}
                            onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                            className="h-12 bg-gray-50/50 border-gray-200 rounded-xl text-black focus-visible:ring-primary focus-visible:bg-white transition-all px-4"
                            placeholder="e.g. Ayaan Sharma"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">Date of Birth</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full h-12 justify-start text-left font-medium border-gray-200 bg-gray-50/50 rounded-xl text-black focus:ring-primary hover:bg-white transition-all px-4",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-400" />
                                    {date ? format(date, "PPP") : <span>Select date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 rounded-2xl overflow-hidden border-none shadow-2xl" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    captionLayout="dropdown"
                                    fromYear={2010}
                                    toYear={new Date().getFullYear()}
                                    initialFocus
                                    className="bg-white"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">Gender</Label>
                            <Select
                                value={newStudent.gender}
                                onValueChange={(value) => setNewStudent({ ...newStudent, gender: value })}
                                required
                            >
                                <SelectTrigger className="h-12 bg-gray-50/50 border-gray-200 rounded-xl text-black focus:ring-primary hover:bg-white transition-all px-4">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold text-gray-700 uppercase tracking-widest ml-1">Age</Label>
                            <Input
                                type="number"
                                readOnly
                                value={newStudent.age}
                                className="h-12 bg-gray-100 border-gray-100 rounded-xl text-gray-500 font-bold cursor-not-allowed px-4"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onCancel}
                            disabled={loading}
                            className="rounded-xl font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-primary hover:bg-primary/90 text-white font-bold px-8 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
                            disabled={!date || loading}
                        >
                            {loading ? 'Saving...' : (mode === 'edit' ? 'Update Profile' : 'Register Student')}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
