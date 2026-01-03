'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    BedDouble,
    CalendarDays,
    ClipboardList,
    UserCircle,
    Briefcase,
} from 'lucide-react';
import {
    usersAPI,
    roomsAPI,
    bookingsAPI,
    guestsAPI,
    staffAPI,
    serviceTasksAPI,
} from '@/lib/admin-api';
import { RoomCondition, BookingStatus, TaskStatus } from '@turborepo/shared';

interface DashboardStats {
    users: number;
    rooms: { total: number; clean: number; dirty: number; maintenance: number };
    bookings: { total: number; pending: number; confirmed: number; checkedIn: number };
    guests: number;
    staff: number;
    tasks: { total: number; pending: number; inProgress: number };
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [users, rooms, bookings, guests, staff, tasks] = await Promise.all([
                    usersAPI.findAll(),
                    roomsAPI.findAll(),
                    bookingsAPI.findAll(),
                    guestsAPI.findAll(),
                    staffAPI.findAll(),
                    serviceTasksAPI.findAll(),
                ]);

                setStats({
                    users: users.length,
                    rooms: {
                        total: rooms.length,
                        clean: rooms.filter((r) => r.condition === RoomCondition.CLEAN).length,
                        dirty: rooms.filter((r) => r.condition === RoomCondition.DIRTY).length,
                        maintenance: rooms.filter((r) => r.condition === RoomCondition.IN_MAINTENANCE).length,
                    },
                    bookings: {
                        total: bookings.length,
                        pending: bookings.filter((b) => b.status === BookingStatus.PENDING).length,
                        confirmed: bookings.filter((b) => b.status === BookingStatus.CONFIRMED).length,
                        checkedIn: bookings.filter((b) => b.status === BookingStatus.CHECKED_IN).length,
                    },
                    guests: guests.length,
                    staff: staff.length,
                    tasks: {
                        total: tasks.length,
                        pending: tasks.filter((t) => t.status === TaskStatus.PENDING).length,
                        inProgress: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
                    },
                });
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        {
            title: 'Użytkownicy',
            value: stats?.users || 0,
            icon: Users,
            description: 'Wszyscy użytkownicy',
        },
        {
            title: 'Pokoje',
            value: stats?.rooms.total || 0,
            icon: BedDouble,
            description: (
                <div className="flex gap-2 mt-1">
                    <Badge variant="default">{stats?.rooms.clean || 0} czyste</Badge>
                    <Badge variant="secondary">{stats?.rooms.dirty || 0} brudne</Badge>
                    <Badge variant="destructive">{stats?.rooms.maintenance || 0} w naprawie</Badge>
                </div>
            ),
        },
        {
            title: 'Rezerwacje',
            value: stats?.bookings.total || 0,
            icon: CalendarDays,
            description: (
                <div className="flex gap-2 mt-1">
                    <Badge variant="outline">{stats?.bookings.pending || 0} oczekujące</Badge>
                    <Badge variant="default">{stats?.bookings.checkedIn || 0} zameldowane</Badge>
                </div>
            ),
        },
        {
            title: 'Goście',
            value: stats?.guests || 0,
            icon: UserCircle,
            description: 'Zarejestrowani goście',
        },
        {
            title: 'Personel',
            value: stats?.staff || 0,
            icon: Briefcase,
            description: 'Pracownicy hotelu',
        },
        {
            title: 'Zadania serwisowe',
            value: stats?.tasks.total || 0,
            icon: ClipboardList,
            description: (
                <div className="flex gap-2 mt-1">
                    <Badge variant="outline">{stats?.tasks.pending || 0} oczekujące</Badge>
                    <Badge variant="secondary">{stats?.tasks.inProgress || 0} w trakcie</Badge>
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Panel Administratora</h1>
                <p className="text-muted-foreground mt-1">
                    Przegląd statystyk systemu hotelowego
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {statCards.map((card) => (
                    <Card key={card.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                            <card.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="h-9 w-20 bg-muted animate-pulse rounded" />
                            ) : (
                                <>
                                    <div className="text-2xl font-bold">{card.value}</div>
                                    <div className="text-xs text-muted-foreground">
                                        {typeof card.description === 'string' ? (
                                            card.description
                                        ) : (
                                            card.description
                                        )}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
