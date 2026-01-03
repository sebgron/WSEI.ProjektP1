'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ClipboardList, LogOut, Megaphone } from 'lucide-react';
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
        toast.success('Wylogowano');
        router.push('/login');
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <header className="sticky top-0 z-10 w-full border-b border-border bg-background/95 backdrop-blur">
                <div className="flex h-16 items-center justify-between px-4 sm:px-6">
                    <div className="flex items-center gap-2 font-bold text-lg text-primary">
                        <ClipboardList className="h-6 w-6" />
                        <span>Staff Panel</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium hidden sm:inline-block">
                            {user?.employeeProfile?.firstName} {user?.employeeProfile?.lastName}
                        </span>
                        <Button variant="ghost" size="icon" onClick={handleLogout}>
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Mobile-friendly navigation tabs */}
                <div className="flex overflow-x-auto border-t border-border bg-muted/20 px-4">
                    <Link
                        href="/staff/housekeeping"
                        className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${pathname === '/staff/housekeeping'
                            ? 'border-primary text-primary bg-primary/5'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <ClipboardList className="h-4 w-4" />
                        Zadania
                    </Link>
                    <Link
                        href="/staff/report"
                        className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap ${pathname === '/staff/report'
                            ? 'border-primary text-primary bg-primary/5'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <Megaphone className="h-4 w-4" />
                        Zgłoś usterkę
                    </Link>
                </div>
            </header>

            <main className="flex-1 p-4 sm:p-6 max-w-lg mx-auto w-full">
                {children}
            </main>
        </div>
    );
}
