'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Calendar as CalendarIcon, Users, ArrowRight, Search, BedDouble, Check } from 'lucide-react';
import { guestAPI } from '@/lib/guest-api';
import { IRoomCategoryResponse } from '@turborepo/shared';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { cn, formatPhoneNumber, formatZipCode } from '@/lib/utils';
import { COUNTRIES, DEFAULT_COUNTRY } from '@/lib/countries';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

type Step = 'search' | 'rooms' | 'details' | 'success';

interface AvailabilityResult {
    category: IRoomCategoryResponse;
    availableCount: number;
    maxCapacity: number;
}

export default function BookingPage() {
    const { user } = useAuth();
    const [step, setStep] = useState<Step>('search');
    const [isLoading, setIsLoading] = useState(false);

    // Search State
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>({
        from: new Date(),
        to: addDays(new Date(), 1),
    });
    const [guestCount, setGuestCount] = useState(2);

    // Results State
    const [availableRooms, setAvailableRooms] = useState<AvailabilityResult[]>([]);
    const [selectedRooms, setSelectedRooms] = useState<Record<number, number>>({});
    const [bookingReference, setBookingReference] = useState<string>('');

    // Guest Form
    const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm({
        defaultValues: {
            firstName: user?.guestProfile?.firstName || user?.employeeProfile?.firstName || '',
            lastName: user?.guestProfile?.lastName || user?.employeeProfile?.lastName || '',
            email: user?.email || '',
            phoneNumber: formatPhoneNumber(user?.guestProfile?.phoneNumber || ''),
            addressStreet: user?.guestProfile?.addressStreet || '',
            city: user?.guestProfile?.city || '',
            zipCode: formatZipCode(user?.guestProfile?.zipCode || ''),
            country: user?.guestProfile?.country || COUNTRIES.find(c => c.code === DEFAULT_COUNTRY)?.name || 'Polska',
        }
    });

    // Handle country change to update phone prefix
    const handleCountryChange = (value: string) => {
        setValue('country', value);

        const countryData = COUNTRIES.find(c => c.name === value);
        if (countryData) {
            // Get current phone number
            // We need to use getValues() but it's not destructured. Let's add it.
            // Or use setValue with callback? No, setValue doesn't support callback.
            // We need `getValues` from useForm.
        }
    };

    const handleSearch = async () => {
        if (!dateRange?.from || !dateRange?.to) {
            toast.error('Wybierz daty pobytu');
            return;
        }

        setIsLoading(true);
        try {
            const results = await guestAPI.checkAvailability({
                checkIn: dateRange.from.toISOString(),
                checkOut: dateRange.to.toISOString(),
                guestCount,
            });
            setAvailableRooms(results);
            setStep('rooms');
        } catch (error) {
            console.error(error);
            toast.error('Błąd wyszukiwania pokoi');
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmitBooking = async (data: any) => {
        setIsLoading(true);
        try {
            const estimatedTotal = availableRooms.reduce((acc, r) => {
                const count = selectedRooms[r.category.id] || 0;
                const nights = Math.ceil((dateRange!.to!.getTime() - dateRange!.from!.getTime()) / (1000 * 60 * 60 * 24));
                return acc + (count * r.category.pricePerNight * nights);
            }, 0);

            const payload = {
                guest: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    phoneNumber: data.phoneNumber.replace(/\s/g, ''),
                    addressStreet: data.addressStreet,
                    city: data.city,
                    zipCode: data.zipCode,
                    country: data.country,
                },
                checkInDate: dateRange!.from!.toISOString(),
                checkOutDate: dateRange!.to!.toISOString(),
                guestCount: guestCount,
                totalPrice: estimatedTotal,
                roomSelection: selectedRooms
            };

            const res = await guestAPI.createPublicBooking(payload);
            setBookingReference(res.bookingReference);
            setStep('success');
            toast.success('Rezerwacja została utworzona!');
        } catch (error) {
            console.error(error);
            toast.error('Wystąpił błąd podczas tworzenia rezerwacji.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-2">Rezerwacja pobytu</h1>
                <p className="text-muted-foreground">Zarezerwuj swój wymarzony pobyt w kilku prostych krokach</p>
            </div>

            {step === 'search' && (
                <div className="max-w-xl mx-auto">
                    <Card className="border-2 shadow-lg">
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-2">
                                <Label>Termin pobytu</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal h-12",
                                                !dateRange && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {dateRange?.from ? (
                                                dateRange.to ? (
                                                    <>
                                                        {format(dateRange.from, "eee, dd MMM", { locale: pl })} -{" "}
                                                        {format(dateRange.to, "eee, dd MMM, y", { locale: pl })}
                                                    </>
                                                ) : (
                                                    format(dateRange.from, "eee, dd MMM, y", { locale: pl })
                                                )
                                            ) : (
                                                <span>Wybierz daty</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            initialFocus
                                            mode="range"
                                            defaultMonth={dateRange?.from}
                                            selected={dateRange as any}
                                            onSelect={(range: any) => setDateRange(range)}
                                            numberOfMonths={1}
                                            locale={pl}
                                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <Label>Liczba gości</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        min={1}
                                        value={guestCount}
                                        onChange={(e) => setGuestCount(parseInt(e.target.value))}
                                        className="pl-10 h-12"
                                    />
                                    <Users className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                                </div>
                            </div>

                            <Button
                                size="lg"
                                className="w-full text-lg"
                                onClick={handleSearch}
                                disabled={isLoading || !dateRange?.from || !dateRange?.to}
                            >
                                {isLoading ? (
                                    'Szukanie...'
                                ) : (
                                    <>
                                        Szukaj pokoi <Search className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {step === 'rooms' && (
                <div>
                    <Button variant="ghost" onClick={() => setStep('search')} className="mb-4">
                        &larr; Zmień parametry wyszukiwania
                    </Button>
                    <h2 className="text-xl font-semibold mb-4">Dostępne pokoje</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
                        {availableRooms.map((item) => {
                            const currentCount = selectedRooms[item.category.id] || 0;
                            return (
                                <Card key={item.category.id} className={cn("overflow-hidden flex flex-col transition-all", currentCount > 0 ? 'ring-2 ring-primary' : '')}>
                                    <div className="aspect-video bg-muted relative">
                                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                                            <BedDouble className="w-12 h-12 opacity-20" />
                                        </div>
                                        {currentCount > 0 && (
                                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg animate-in zoom-in">
                                                {currentCount}
                                            </div>
                                        )}
                                    </div>
                                    <CardContent className="p-4 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg">{item.category.name}</h3>
                                            <div className={cn(
                                                "px-2.5 py-0.5 rounded-full text-xs font-bold",
                                                item.availableCount > 5
                                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-900"
                                            )}>
                                                {item.availableCount > 5 ? "5+ dostępnych" : `Tylko ${item.availableCount}!`}
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                                            {item.category.description}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                            <div className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                <span>Max {item.category.capacity} os.</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <BedDouble className="w-4 h-4" />
                                                <span>{item.category.pricePerNight} PLN / noc</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-2 border-t flex items-center justify-between">
                                            <span className="font-bold text-lg">{item.category.pricePerNight} PLN</span>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    disabled={currentCount === 0}
                                                    onClick={() => setSelectedRooms(prev => ({ ...prev, [item.category.id]: Math.max(0, (prev[item.category.id] || 0) - 1) }))}
                                                >
                                                    -
                                                </Button>
                                                <span className="w-6 text-center font-medium">{currentCount}</span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    disabled={currentCount >= item.availableCount}
                                                    onClick={() => setSelectedRooms(prev => ({ ...prev, [item.category.id]: (prev[item.category.id] || 0) + 1 }))}
                                                >
                                                    +
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {availableRooms.length > 0 && (
                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t shadow-lg z-10 animate-in slide-in-from-bottom-5">
                            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="text-center md:text-left">
                                    <p className="text-sm text-muted-foreground">
                                        Wybrano pokoi: <strong className="text-foreground">{Object.values(selectedRooms).reduce((a, b) => a + b, 0)}</strong>
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Pojemność: <strong className={cn(
                                            Object.entries(selectedRooms).reduce((acc, [catId, count]) => {
                                                const cat = availableRooms.find(r => r.category.id === Number(catId));
                                                return acc + (count * (cat?.category.capacity || 0));
                                            }, 0) >= guestCount ? "text-green-600" : "text-red-500"
                                        )}>
                                            {Object.entries(selectedRooms).reduce((acc, [catId, count]) => {
                                                const cat = availableRooms.find(r => r.category.id === Number(catId));
                                                return acc + (count * (cat?.category.capacity || 0));
                                            }, 0)}
                                        </strong> / {guestCount} wymaganych
                                    </p>
                                </div>
                                <Button
                                    size="lg"
                                    disabled={Object.entries(selectedRooms).reduce((acc, [catId, count]) => {
                                        const cat = availableRooms.find(r => r.category.id === Number(catId));
                                        return acc + (count * (cat?.category.capacity || 0));
                                    }, 0) < guestCount}
                                    onClick={() => setStep('details')}
                                >
                                    Dalej <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {availableRooms.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>Brak dostępnych pokoi w wybranym terminie.</p>
                        </div>
                    )}
                </div>
            )}

            {step === 'details' && (
                <div className="max-w-2xl mx-auto">
                    <Button variant="ghost" onClick={() => setStep('rooms')} className="mb-4">
                        &larr; Wróć do wyboru pokoi
                    </Button>

                    {!user && (
                        <Card className="mb-6 bg-primary/5 border-primary/20">
                            <CardContent className="flex items-center justify-between p-4">
                                <div>
                                    <p className="font-semibold">Masz już konto?</p>
                                    <p className="text-sm text-muted-foreground">Zaloguj się, aby przyspieszyć rezerwację</p>
                                </div>
                                <Button variant="outline" onClick={() => window.open('/login/guest', '_blank')}>
                                    Zaloguj się
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit(onSubmitBooking)} className="space-y-6">
                                <h2 className="text-xl font-bold mb-4">Twoje dane</h2>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Imię</Label>
                                        <Input placeholder="Jan" {...register('firstName', { required: true })} />
                                        {errors.firstName && <span className="text-destructive text-xs">Wymagane</span>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Nazwisko</Label>
                                        <Input placeholder="Kowalski" {...register('lastName', { required: true })} />
                                        {errors.lastName && <span className="text-destructive text-xs">Wymagane</span>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input type="email" placeholder="jan@example.com" {...register('email', { required: true })} />
                                    {errors.email && <span className="text-destructive text-xs">Wymagane</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Telefon</Label>
                                    <Input
                                        placeholder="+48 123 456 789"
                                        {...register('phoneNumber', {
                                            onChange: (e) => {
                                                const formatted = formatPhoneNumber(e.target.value);
                                                setValue('phoneNumber', formatted);
                                            }
                                        })}
                                    />
                                </div>
                                <div className="pt-6 border-t mt-6">
                                    <h3 className="font-semibold mb-4 text-lg">Adres</h3>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="col-span-2 space-y-2">
                                            <Label>Ulica</Label>
                                            <Input placeholder="Polna 12/3" {...register('addressStreet', { required: true })} />
                                            {errors.addressStreet && <span className="text-destructive text-xs">Wymagane</span>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Kod pocztowy</Label>
                                            <Input
                                                placeholder="00-000"
                                                {...register('zipCode', {
                                                    required: true,
                                                    onChange: (e) => {
                                                        const formatted = formatZipCode(e.target.value);
                                                        setValue('zipCode', formatted);
                                                    }
                                                })}
                                            />
                                            {errors.zipCode && <span className="text-destructive text-xs">Wymagane</span>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Miasto</Label>
                                            <Input placeholder="Warszawa" {...register('city', { required: true })} />
                                            {errors.city && <span className="text-destructive text-xs">Wymagane</span>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Kraj</Label>
                                            <Select
                                                onValueChange={(value) => {
                                                    setValue('country', value);
                                                    const countryData = COUNTRIES.find(c => c.name === value);
                                                    if (countryData) {
                                                        const currentPhone = getValues('phoneNumber');
                                                        // If empty or just a standard prefix (e.g. "+48 ")
                                                        // or if it doesn't have ANY digits yet
                                                        const hasDigits = /\d/.test(currentPhone.replace(/^\+\d+\s?/, ''));

                                                        if (!currentPhone || !hasDigits) {
                                                            setValue('phoneNumber', `${countryData.phoneCode} `);
                                                        }
                                                    }
                                                }}
                                                defaultValue={user?.guestProfile?.country || 'Polska'}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Wybierz kraj" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {COUNTRIES.map((country) => (
                                                        <SelectItem key={country.code} value={country.name}>
                                                            {country.name} ({country.phoneCode})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <input type="hidden" {...register('country', { required: true })} />
                                            {errors.country && <span className="text-destructive text-xs">Wymagane</span>}
                                        </div>
                                    </div>
                                </div>

                                <Button type="submit" className="w-full text-lg mt-8 h-12" size="lg" disabled={isLoading}>
                                    {isLoading ? 'Przetwarzanie...' : 'Potwierdź i zarezerwuj'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {step === 'success' && (
                <div className="max-w-xl mx-auto text-center">
                    <Card className="border-2 border-green-500/20 bg-green-50/50 dark:bg-green-950/20">
                        <CardContent className="p-8">
                            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Rezerwacja utworzona!</h2>
                            <p className="text-muted-foreground mb-4">
                                Twoja rezerwacja została pomyślnie utworzona. Numer referencyjny:
                            </p>
                            <p className="text-2xl font-mono font-bold text-primary mb-6">{bookingReference}</p>
                            <p className="text-sm text-muted-foreground mb-6">
                                Szczegóły rezerwacji zostały wysłane na Twój adres email.
                            </p>
                            <div className="flex gap-4 justify-center">
                                <Link href={`/booking/status?ref=${bookingReference}`}>
                                    <Button>Sprawdź status rezerwacji</Button>
                                </Link>
                                <Button variant="outline" onClick={() => {
                                    setStep('search');
                                    setSelectedRooms({});
                                    setBookingReference('');
                                }}>
                                    Nowa rezerwacja
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
