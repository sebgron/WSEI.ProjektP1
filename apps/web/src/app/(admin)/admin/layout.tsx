import { AdminSidebar } from '@/components/admin/sidebar';
import { Toaster } from '@/components/ui/sonner';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            <AdminSidebar />
            <main className="flex-1 bg-background p-6 overflow-auto">
                {children}
            </main>
            <Toaster position="top-right" richColors />
        </div>
    );
}
