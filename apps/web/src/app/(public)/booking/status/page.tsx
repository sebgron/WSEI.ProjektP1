'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, KeyRound, Check } from 'lucide-react';
import Link from 'next/link';

export default function BookingStatusPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { guestLogin } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const reference = searchParams.get('ref') || '';

    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            reference: reference,
            email: '',
        }
    });

    const onSubmit = async (data: { reference: string; email: string }) => {
        setIsLoading(true);
        try {
            await guestLogin({ bookingReference: data.reference, email: data.email });
            toast.success('Zalogowano pomyślnie!');
            router.push('/guest/my-bookings');
        } catch (error) {
            console.error(error);
            toast.error('Nie znaleziono rezerwacji lub błędny adres email.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-md">
            <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <KeyRound className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold">Sprawdź swoją rezerwację</h1>
                <p className="text-muted-foreground mt-2">
                    Podaj numer rezerwacji i adres email, aby zobaczyć szczegóły
                </p>
            </div>

            <Card>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardHeader>
                        <CardTitle>Dostęp do rezerwacji</CardTitle>
                        <CardDescription>
                            Wpisz dane użyte podczas rezerwacji
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="reference">Numer rezerwacji</Label>
                            <div className="relative">
                                <Input
                                    id="reference"
                                    placeholder="np. ABCD1234"
                                    className="pl-10 uppercase"
                                    {...register('reference', { required: true })}
                                    disabled={isLoading}
                                />
                                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            </div>
                            {errors.reference && <span className="text-destructive text-xs">Wymagane</span>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Adres email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="jan@example.com"
                                {...register('email', { required: true })}
                                disabled={isLoading}
                            />
                            {errors.email && <span className="text-destructive text-xs">Wymagane</span>}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sprawdź rezerwację
                        </Button>
                        <p className="text-sm text-muted-foreground text-center">
                            Nie masz numeru rezerwacji?{' '}
                            <Link href="/booking" className="text-primary hover:underline">
                                Zarezerwuj pobyt
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
