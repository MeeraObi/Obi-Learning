import Link from 'next/link';
import { Child } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signout } from '@/app/auth/actions';

interface TopBarProps {
    selectedChild: Child | undefined;
    user: {
        name: string;
        email: string;
    };
}

export default function TopBar({ selectedChild, user }: TopBarProps) {
    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8">
            <h1 className="text-lg font-semibold text-gray-900">
                {selectedChild ? `${selectedChild.name}'s Dashboard` : 'Dashboard'}
            </h1>

            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-10 w-10 rounded-full text-black hover:text-black hover:bg-transparent p-0">
                            <Avatar className="h-10 w-10 border border-gray-200">
                                <AvatarFallback className="bg-orange-100 text-orange-700 font-bold">
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'P'}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="#" className="cursor-pointer">Settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <form action={signout} className="w-full">
                                <button type="submit" className="w-full text-left cursor-pointer">
                                    Log out
                                </button>
                            </form>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
