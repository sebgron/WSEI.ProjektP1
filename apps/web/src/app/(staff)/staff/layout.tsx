'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ClipboardList, LogOut, Wrench, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StaffLayout({
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

    const userName = user?.employeeProfile?.firstName || user?.email?.split('@')[0] || 'Użytkownik';

    return (
        <div className="min-h-screen flex flex-col bg-muted/30">
            <header className="sticky top-0 z-10 w-full bg-background border-b">
                <div className="max-w-lg mx-auto px-4">
                    <div className="flex h-14 items-center justify-between">
                        <div className="flex items-center gap-2 font-semibold text-primary">
                            <ClipboardList className="h-5 w-5" />
                            <span>Staff</span>
                        </div>

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

            <nav className="sticky top-14 z-10 bg-background border-b">
                <div className="max-w-lg mx-auto px-4">
                    <div className="flex">
                        <Link
                            href="/staff/housekeeping"
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${pathname === '/staff/housekeeping'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <ClipboardList className="h-4 w-4" />
                            Zadania
                        </Link>
                        <Link
                            href="/staff/report"
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${pathname === '/staff/report'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Wrench className="h-4 w-4" />
                            Zgłoś usterkę
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
                {children}
            </main>
        </div>
    );
}
