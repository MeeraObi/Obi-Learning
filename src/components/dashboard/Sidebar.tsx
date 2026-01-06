import { Child } from "@/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
    childrenList: Child[];
    selectedChildId: string | null;
    onSelectChild: (id: string | null) => void;
    onAddChildClick: () => void;
    onEdit: (child: Child) => void;
    onDelete: (id: string) => void;
}

export default function Sidebar({
    childrenList,
    selectedChildId,
    onSelectChild,
    onAddChildClick,
    onEdit,
    onDelete,
}: SidebarProps) {
    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-white font-bold">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                    >
                        <path
                            fillRule="evenodd"
                            d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
                <span className="text-xl font-bold text-gray-900">Obi Learning</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Children
                    </h3>
                </div>

                <div className="space-y-2">
                    {childrenList.map((child) => (
                        <div key={child.id} className="group flex items-center w-full">
                            <Button
                                variant={selectedChildId === child.id ? "secondary" : "ghost"}
                                className={`flex-1 justify-start gap-3 h-auto py-2 ${selectedChildId === child.id ? "bg-orange-50 text-orange-700 hover:bg-orange-100" : ""
                                    }`}
                                onClick={() => onSelectChild(child.id)}
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className={`${selectedChildId === child.id ? "bg-orange-100 text-orange-700" : "bg-gray-200 text-gray-600"
                                        }`}>
                                        {child.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                {child.name}
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" side="bottom" className="w-40 z-50 bg-white">
                                    <DropdownMenuItem onClick={() => onEdit(child)}>
                                        Edit Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onDelete(child.id)} className="text-red-600 focus:text-red-600">
                                        Delete Profile
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ))}

                    <Button
                        variant="outline"
                        onClick={onAddChildClick}
                        className="w-full justify-start gap-2 border-dashed border-gray-300 text-gray-500 hover:text-orange-600 hover:border-orange-300 hover:bg-gray-50 h-auto py-2"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-4 h-4"
                        >
                            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                        </svg>
                        Add Child Profile
                    </Button>
                </div>
            </div>
        </aside>
    );
}
