'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Hotel, KeyRound, Loader2, ArrowLeft } from 'lucide-react';

export default function GuestLoginPage() {
    const router = useRouter();
    const { login, guestLogin } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Guest Email Form
    const guestForm = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
    });

    // Guest Ref Form
    const bookingForm = useForm({
        defaultValues: {
            reference: '',
            email: '',
        },
    });



    return (
        <div className="w-full max-w-md mx-auto p-4 space-y-4">
            <Link href="/login" className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Powrót do wyboru
            </Link>

            <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                        <Hotel className="w-10 h-10 text-primary" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Strefa Gościa</h1>
                <p className="text-muted-foreground mt-2">Zaloguj się, aby zarządzać rezerwacją</p>
            </div>

            <Tabs defaultValue="account" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="account">Konto Gościa</TabsTrigger>
                    <TabsTrigger value="booking">Kod rezerwacji</TabsTrigger>
                </TabsList>

                <TabsContent value="account">
                    <Card>
                        <CardHeader>
                            <CardTitle>Logowanie kontem</CardTitle>
                            <CardDescription>
                                Użyj adresu email i hasła podanego przy rejestracji
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={guestForm.handleSubmit(async (data) => {
                            setIsLoading(true);
                            try {
                                await login({ email: data.email, password: data.password });
                                toast.success('Zalogowano pomyślnie');
                                router.push('/guest/my-bookings');
                            } catch (error) {
                                console.error(error);
                                toast.error('Błąd logowania. Sprawdź dane.');
                            } finally {
                                setIsLoading(false);
                            }
                        })}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Adres email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        {...guestForm.register('email', { required: true })}
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Hasło</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        {...guestForm.register('password', { required: true })}
                                        disabled={isLoading}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="pt-6">
                                <Button className="w-full mt-2" type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Zaloguj się
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                <TabsContent value="booking">
                    <Card>
                        <CardHeader>
                            <CardTitle>Szybki dostęp</CardTitle>
                            <CardDescription>
                                Zaloguj się używając numeru rezerwacji i adresu e-mail
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={bookingForm.handleSubmit(async (data) => {
                            setIsLoading(true);
                            try {
                                await guestLogin({ bookingReference: data.reference, email: data.email });
                                toast.success('Zalogowano pomyślnie');
                                router.push('/guest/my-bookings');
                            } catch (error) {
                                console.error(error);
                                toast.error('Nie znaleziono rezerwacji lub błędne dane.');
                            } finally {
                                setIsLoading(false);
                            }
                        })}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="reference">Numer rezerwacji</Label>
                                    <div className="relative">
                                        <Input
                                            id="reference"
                                            placeholder="np. ABCD123"
                                            className="pl-10 uppercase"
                                            {...bookingForm.register('reference', { required: true })}
                                            disabled={isLoading}
                                        />
                                        <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="booking-email">Adres E-mail</Label>
                                    <Input
                                        id="booking-email"
                                        type="email"
                                        placeholder="kowalski@example.com"
                                        {...bookingForm.register('email', { required: true })}
                                        disabled={isLoading}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="pt-6">
                                <Button className="w-full mt-2" type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Sprawdź rezerwację
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
