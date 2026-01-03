import Link from 'next/link';

export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="h-14 border-b border-border px-4 flex items-center justify-between">
                <span className="font-semibold text-foreground">Hotel Management System</span>
                <Link
                    href="/login"
                    className="text-sm px-4 py-2 rounded-md bg-muted hover:bg-muted/80 text-foreground transition-colors"
                >
                    Zaloguj się
                </Link>
            </header>
            <main className="flex-1 flex items-center justify-center">
                <h1 className="text-3xl font-bold text-foreground">Strona Główna</h1>
            </main>
        </div>
    );
}
