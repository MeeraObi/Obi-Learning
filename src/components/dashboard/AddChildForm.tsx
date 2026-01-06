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

interface AddChildFormProps {
    onAddChild: (child: any) => void;
    onCancel: () => void;
    initialData?: {
        id: string;
        name: string;
        dob: string;
        gender: string;
    };
    mode?: 'add' | 'edit';
}

export default function AddChildForm({ onAddChild, onCancel, initialData, mode = 'add' }: AddChildFormProps) {
    const [newChild, setNewChild] = useState({
        name: initialData?.name || '',
        gender: initialData?.gender || '',
        age: initialData?.dob ? differenceInYears(new Date(), new Date(initialData.dob)).toString() : ''
    });

    // Parse initial date string to Date object
    const [date, setDate] = useState<Date | undefined>(
        initialData?.dob ? new Date(initialData.dob) : undefined
    );

    const [loading, setLoading] = useState(false);

    // Recalculate age when date changes
    useEffect(() => {
        if (date) {
            setNewChild(prev => ({ ...prev, age: differenceInYears(new Date(), date).toString() }));
        }
    }, [date]);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        // Append controlled values
        if (date) formData.append('dob', format(date, "yyyy-MM-dd"));
        formData.append('gender', newChild.gender);

        if (mode === 'edit' && initialData) {
            formData.append('id', initialData.id);
            await updateChild(formData);
        } else {
            await addChild(formData);
        }

        setLoading(false);
        onAddChild({}); // Signal completion
    };

    return (
        <Card className="max-w-xl mx-auto shadow-sm">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">
                    {mode === 'edit' ? 'Edit Child Profile' : 'Add Child Profile'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Child's Name</Label>
                        <Input
                            type="text"
                            name="name"
                            required
                            value={newChild.name}
                            onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                            className="text-black focus-visible:ring-orange-500"
                            placeholder="e.g. Ayaan"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Date of Birth</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal border-gray-300 text-black focus:ring-orange-500",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Gender</Label>
                            <Select
                                value={newChild.gender}
                                onValueChange={(value) => setNewChild({ ...newChild, gender: value })}
                                required
                            >
                                <SelectTrigger className="text-black focus:ring-orange-500">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Age (Auto-calculated)</Label>
                            <Input
                                type="number"
                                readOnly
                                value={newChild.age}
                                className="text-black bg-gray-100 focus-visible:ring-orange-500 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                            disabled={!date || loading}
                        >
                            {loading ? 'Saving...' : (mode === 'edit' ? 'Save Changes' : 'Add Profile')}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
