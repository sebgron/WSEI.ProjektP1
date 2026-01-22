'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Hotel, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function GuestLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { logout, user } = useAuth();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        toast.success('Wylogowano pomyślnie');
        router.push('/login');
    };

    const userName = user?.guestProfile?.firstName || user?.email?.split('@')[0] || 'Gość';

    return (
        <div className="min-h-screen flex flex-col bg-muted/30">
            <header className="sticky top-0 z-50 w-full bg-background border-b">
                <div className="max-w-lg mx-auto px-4">
                    <div className="flex h-14 items-center justify-between">
                        <Link href="/guest/my-bookings" className="flex items-center gap-2 font-semibold text-primary">
                            <Hotel className="h-5 w-5" />
                            <span>Moje Pobyty</span>
                        </Link>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="w-4 h-4 text-primary" />
                                </div>
                                <span className="font-medium hidden sm:inline">{userName}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="ml-2 hidden sm:inline">Wyloguj</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
                {children}
            </main>
        </div>
    );
}
