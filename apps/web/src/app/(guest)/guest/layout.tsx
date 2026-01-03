'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Hotel, LogOut, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

export default function GuestLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { logout, user } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        toast.success('Wylogowano pomyślnie');
        router.push('/login');
    };

    const getInitials = (firstName?: string, lastName?: string) => {
        return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'G';
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="sticky top-0 z-10 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/guest/my-bookings" className="flex items-center gap-2 font-bold text-xl">
                            <Hotel className="w-6 h-6 text-primary" />
                            <span>Hotel Management System</span>
                        </Link>

                        <nav className="hidden md:flex gap-4">
                            <Link
                                href="/guest/my-bookings"
                                className={`text-sm font-medium transition-colors hover:text-primary ${pathname === '/guest/my-bookings' ? 'text-foreground' : 'text-muted-foreground'
                                    }`}
                            >
                                Moje Rezerwacje
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground hidden sm:inline-block">
                            Witaj, {user?.guestProfile?.firstName || 'Gościu'}
                        </span>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback>{getInitials(user?.guestProfile?.firstName, user?.guestProfile?.lastName)}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{user?.guestProfile?.firstName} {user?.guestProfile?.lastName}</p>
                                        <p className="text-xs leading-none text-muted-foreground">
                                            {user?.email}
                                        </p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/guest/my-bookings">
                                        <Calendar className="mr-2 h-4 w-4" />
                                        <span>Moje Rezerwacje</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Wyloguj się</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-6 lg:p-8">
                {children}
            </main>
        </div>
    );
}
