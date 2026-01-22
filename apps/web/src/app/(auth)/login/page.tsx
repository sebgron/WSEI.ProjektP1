'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Hotel, ClipboardList, UserCircle2 } from 'lucide-react';

export default function LoginPage() {
    return (
        <div className="w-full max-w-4xl mx-auto p-4 mt-8 flex flex-col justify-center min-h-[80vh]">
            <div className="text-center mb-12 space-y-4">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-primary/10 rounded-full ring-8 ring-primary/5">
                        <Hotel className="w-16 h-16 text-primary" />
                    </div>
                </div>
                <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">Hotel Management System</h1>
                <p className="text-xl text-muted-foreground">Wybierz odpowiedni panel, aby kontynuować</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto w-full px-4">
                {/* Guest Panel Card */}
                <Link href="/login/guest" className="group">
                    <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer border-2 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardHeader className="text-center pb-2 pt-8">
                            <div className="mx-auto bg-muted group-hover:bg-primary/10 transition-colors p-4 rounded-full mb-4 w-16 h-16 flex items-center justify-center">
                                <UserCircle2 className="w-8 h-8 text-primary" />
                            </div>
                            <CardTitle className="text-2xl">Strefa Gościa</CardTitle>
                            <CardDescription>Dla klientów hotelu</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center text-muted-foreground pb-8 px-6">
                            <p className="mb-6">Zarządzaj swoimi rezerwacjami, sprawdź szczegóły pobytu i kody dostępu.</p>
                            <Button className="w-full group-hover:bg-primary/90" variant="outline">Przejdź do logowania</Button>
                        </CardContent>
                    </Card>
                </Link>

                {/* Staff Panel Card */}
                <Link href="/login/staff" className="group">
                    <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer border-2 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardHeader className="text-center pb-2 pt-8">
                            <div className="mx-auto bg-muted group-hover:bg-primary/10 transition-colors p-4 rounded-full mb-4 w-16 h-16 flex items-center justify-center">
                                <ClipboardList className="w-8 h-8 text-primary" />
                            </div>
                            <CardTitle className="text-2xl">Personel</CardTitle>
                            <CardDescription>Dla pracowników i administracji</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center text-muted-foreground pb-8 px-6">
                            <p className="mb-6">Zarządzaj pokojami, rezerwacjami i zadaniami serwisowymi.</p>
                            <Button className="w-full group-hover:bg-primary/90" variant="outline">Zaloguj się</Button>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <div className="mt-12 text-center text-sm text-muted-foreground">
                <p>&copy; 2026 Hotel Management System. Wszystkie prawa zastrzeżone.</p>
            </div>
        </div>
    );
}
