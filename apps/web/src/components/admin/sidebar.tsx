'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Users,
    BedDouble,
    UserCircle,
    CalendarDays,
    Briefcase,
    ClipboardList,
    KeyRound,
    ChevronDown,
    Layers,
    Sparkles,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    children?: { label: string; href: string; icon: React.ReactNode }[];
}

const navItems: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/admin/dashboard',
        icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
        label: 'Użytkownicy',
        href: '/admin/users',
        icon: <Users className="h-4 w-4" />,
    },
    {
        label: 'Pokoje',
        href: '/admin/rooms',
        icon: <BedDouble className="h-4 w-4" />,
        children: [
            {
                label: 'Wszystkie pokoje',
                href: '/admin/rooms',
                icon: <BedDouble className="h-4 w-4" />,
            },
            {
                label: 'Kategorie',
                href: '/admin/rooms/categories',
                icon: <Layers className="h-4 w-4" />,
            },
            {
                label: 'Udogodnienia',
                href: '/admin/rooms/features',
                icon: <Sparkles className="h-4 w-4" />,
            },
        ],
    },
    {
        label: 'Goście',
        href: '/admin/guests',
        icon: <UserCircle className="h-4 w-4" />,
    },
    {
        label: 'Rezerwacje',
        href: '/admin/bookings',
        icon: <CalendarDays className="h-4 w-4" />,
    },
    {
        label: 'Personel',
        href: '/admin/staff',
        icon: <Briefcase className="h-4 w-4" />,
    },
    {
        label: 'Zadania serwisowe',
        href: '/admin/service-tasks',
        icon: <ClipboardList className="h-4 w-4" />,
    },
    {
        label: 'Konfiguracje dostępu',
        href: '/admin/access-configs',
        icon: <KeyRound className="h-4 w-4" />,
    },
    {
        label: 'Konfiguracja systemu',
        href: '/admin/configuration',
        icon: <Sparkles className="h-4 w-4" />, // Or Settings icon
    },
];

function NavLink({
    item,
    isActive,
    isOpen,
    onToggle,
}: {
    item: NavItem;
    isActive: boolean;
    isOpen?: boolean;
    onToggle?: () => void;
}) {
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
        return (
            <div>
                <button
                    onClick={onToggle}
                    className={cn(
                        'flex items-center justify-between w-full px-3 py-2 rounded-md text-sm transition-colors',
                        isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent text-foreground'
                    )}
                >
                    <span className="flex items-center gap-3">
                        {item.icon}
                        {item.label}
                    </span>
                    <ChevronDown
                        className={cn(
                            'h-4 w-4 transition-transform',
                            isOpen && 'transform rotate-180'
                        )}
                    />
                </button>
                {isOpen && (
                    <div className="ml-4 mt-1 space-y-1">
                        {item.children?.map((child) => (
                            <Link
                                key={child.href}
                                href={child.href}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                                    'hover:bg-accent text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {child.icon}
                                {child.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <Link
            href={item.href}
            className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent text-foreground'
            )}
        >
            {item.icon}
            {item.label}
        </Link>
    );
}

export function AdminSidebar() {
    const pathname = usePathname();
    const [openMenus, setOpenMenus] = useState<string[]>(['/admin/rooms']);

    const toggleMenu = (href: string) => {
        setOpenMenus((prev) =>
            prev.includes(href)
                ? prev.filter((h) => h !== href)
                : [...prev, href]
        );
    };

    return (
        <aside className="w-64 bg-muted border-r border-border p-4 flex flex-col">
            <div className="font-semibold text-foreground mb-6 text-lg">
                Panel Administratora
            </div>
            <nav className="space-y-1 flex-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.children?.some(child => pathname === child.href) ?? false);
                    const isOpen = openMenus.includes(item.href);

                    return (
                        <NavLink
                            key={item.href}
                            item={item}
                            isActive={isActive && !item.children}
                            isOpen={isOpen}
                            onToggle={() => toggleMenu(item.href)}
                        />
                    );
                })}
            </nav>
            <div className="pt-4 border-t border-border">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                    Powrót do strony głównej
                </Link>
            </div>
        </aside>
    );
}
