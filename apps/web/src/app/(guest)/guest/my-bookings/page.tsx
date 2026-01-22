'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { pl } from 'date-fns/locale';
import { guestAPI } from '@/lib/guest-api';
import { IBookingResponse, BookingStatus, PaymentStatus, TaskPriority, IBookingAccessCodesResponse } from '@turborepo/shared';
import { translations } from '@/lib/admin-api';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    CalendarDays,
    CreditCard,
    Ban,
    Loader2,
    Clock,
    BedDouble,
    Eye,
    EyeOff,
    Wrench,
    AlertTriangle,
    CheckCircle2,
    Package,
    Sparkles
} from 'lucide-react';
import { TaskType } from '@turborepo/shared';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { formatNights } from '@/lib/utils';

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState<IBookingResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [reportDialogOpen, setReportDialogOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<IBookingResponse | null>(null);
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
    const [issueDescription, setIssueDescription] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isReporting, setIsReporting] = useState(false);

    const [accessCodesMap, setAccessCodesMap] = useState<Record<string, IBookingAccessCodesResponse>>({});
    const [loadingCodes, setLoadingCodes] = useState<Record<string, boolean>>({});
    const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

    const fetchBookings = async () => {
        try {
            const data = await guestAPI.getMyBookings();
            setBookings(data.sort((a, b) => new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime()));
        } catch (error) {
            console.error(error);
            toast.error('Nie udało się pobrać rezerwacji');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
        const interval = setInterval(fetchBookings, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchBookingCodes = async (bookingId: string) => {
        if (accessCodesMap[bookingId]) return;
        setLoadingCodes(prev => ({ ...prev, [bookingId]: true }));
        try {
            const codes = await guestAPI.getAccessCodes(bookingId);
            setAccessCodesMap(prev => ({ ...prev, [bookingId]: codes }));
            toast.success('Pobrano kody dostępu');
        } catch (error) {
            console.error(error);
            toast.error('Nie udało się pobrać kodów');
        } finally {
            setLoadingCodes(prev => ({ ...prev, [bookingId]: false }));
        }
    };

    const handleCancelBooking = async () => {
        if (!selectedBooking) return;
        setIsCancelling(true);
        try {
            await guestAPI.cancelBooking(selectedBooking.id);
            toast.success('Rezerwacja anulowana');
            setCancelDialogOpen(false);
            fetchBookings();
        } catch (error) {
            console.error(error);
            toast.error('Nie udało się anulować');
        } finally {
            setIsCancelling(false);
        }
    };

    const handleReportIssue = async () => {
        if (!selectedBooking || !selectedRoomId || !issueDescription) return;
        setIsReporting(true);
        try {
            await guestAPI.reportIssue(selectedBooking.id, {
                roomId: selectedRoomId,
                description: issueDescription,
                priority: isUrgent ? TaskPriority.URGENT : TaskPriority.NORMAL,
            });
            toast.success('Zgłoszenie wysłane do obsługi');
            setReportDialogOpen(false);
            setIssueDescription('');
            setIsUrgent(false);
        } catch (error) {
            console.error(error);
            toast.error('Nie udało się wysłać zgłoszenia');
        } finally {
            setIsReporting(false);
        }
    };

    const handleRequestService = async (bookingId: string, type: TaskType, description: string) => {
        try {
            await guestAPI.requestService(bookingId, type, description);
            toast.success('Zamówienie usługi przyjęte');
        } catch (error) {
            console.error(error);
            toast.error('Nie udało się zamówić usługi');
        }
    };

    const handleToggleCleaning = async (bookingId: string, value: boolean) => {
        try {
            await guestAPI.toggleDailyCleaning(bookingId, value);
            toast.success(value ? 'Włączono codzienne sprzątanie' : 'Wyłączono codzienne sprzątanie');
        } catch (error) {
            console.error(error);
            toast.error('Nie udało się zmienić ustawień');
        }
    };

    // Current stay logic
    const currentStay = bookings.find(b => {
        if (b.status === BookingStatus.CHECKED_IN) return true;

        // Also show if paid and today is within range
        if (b.paymentStatus === PaymentStatus.PAID && (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PENDING)) {
            const now = new Date();
            const checkIn = startOfDay(new Date(b.checkInDate));
            const checkOut = endOfDay(new Date(b.checkOutDate));
            return isWithinInterval(now, { start: checkIn, end: checkOut });
        }

        return false;
    });

    const upcomingBookings = bookings.filter(b =>
        (b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PENDING) &&
        b.id !== currentStay?.id
    );

    const pastBookings = bookings.filter(b =>
        b.status === BookingStatus.COMPLETED || b.status === BookingStatus.CANCELLED
    );

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm">Ładowanie rezerwacji...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Current Stay Hero */}
            {currentStay ? (
                <div className="relative group overflow-hidden rounded-xl border border-border shadow-2xl">
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                        {currentStay.bookingRooms?.[0]?.room.category?.imagePath ? (
                            <img
                                src={currentStay.bookingRooms[0].room.category.imagePath}
                                alt="Room View"
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full bg-primary/10" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/40" />
                    </div>

                    <div className="relative z-10 p-6 text-white">
                        <div className="flex items-center justify-end mb-6">
                            <div className="flex flex-col items-end">
                                <span className="text-3xl font-bold tracking-tight">#{currentStay.bookingReference}</span>
                                <Badge variant="outline" className="border-white/30 text-white bg-white/10 backdrop-blur-md">
                                    Zameldowany
                                </Badge>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            <div className="bg-black/30 backdrop-blur-md rounded-xl p-5 border border-white/10 shadow-sm">
                                <h3 className="text-lg font-semibold text-white/90 mb-2">Twój pokój</h3>
                                {currentStay.bookingRooms?.map(br => (
                                    <div key={br.id} className="flex items-center gap-2 mb-2">
                                        <BedDouble className="w-5 h-5 text-white/80" />
                                        <span className="text-2xl font-light text-white">{br.room.category?.name || 'Pokój'} {br.room.number}</span>
                                    </div>
                                ))}
                                <p className="text-sm text-white/60 mt-3 flex items-center gap-2">
                                    <CalendarDays className="w-4 h-4" />
                                    Wyjazd: {format(new Date(currentStay.checkOutDate), 'dd MMMM', { locale: pl })}
                                    <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-white/80 border border-white/10">
                                        {formatNights(currentStay.nightsCount)}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Access Codes Panel */}
                        {accessCodesMap[currentStay.id] && (
                            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 mb-4 animate-in slide-in-from-bottom-2">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-white/80">Twoje kody dostępu</span>
                                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 h-8" onClick={() => {
                                        setAccessCodesMap(prev => {
                                            const n = { ...prev };
                                            delete n[currentStay.id];
                                            return n;
                                        });
                                    }}>
                                        <EyeOff className="w-4 h-4 mr-1" />
                                        Ukryj
                                    </Button>
                                </div>
                                <div className="grid gap-4">
                                    {accessCodesMap[currentStay.id].rooms.map((room, i) => (
                                        <div key={i} className="space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                {room.doorCode && (
                                                    <div className="bg-white/10 p-3 rounded-lg border border-white/5">
                                                        <span className="text-[10px] uppercase tracking-wider text-white/50 block mb-1">Drzwi do pokoju</span>
                                                        <p className="font-mono text-2xl font-bold tracking-widest">{room.doorCode}</p>
                                                    </div>
                                                )}
                                                {room.keyBoxCode && (
                                                    <div className="bg-white/10 p-3 rounded-lg border border-white/5">
                                                        <span className="text-[10px] uppercase tracking-wider text-white/50 block mb-1">Sejf na klucze</span>
                                                        <p className="font-mono text-2xl font-bold tracking-widest">{room.keyBoxCode}</p>
                                                    </div>
                                                )}
                                            </div>
                                            {/* Shared Entrance Codes */}
                                            {room.entranceCodes && room.entranceCodes.length > 0 && (
                                                <div className="grid grid-cols-2 gap-2 mt-2">
                                                    {room.entranceCodes.map((ec, idx) => (
                                                        <div key={idx} className="bg-white/5 p-2 rounded flex items-center justify-between border border-white/5">
                                                            <span className="text-xs text-white/60">{ec.label}</span>
                                                            <span className="font-mono font-bold text-sm">{ec.code}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {room.generalInstructions && (
                                                <div className="bg-blue-500/20 border border-blue-500/30 p-3 rounded-lg flex gap-3 text-sm text-blue-100">
                                                    <div className="shrink-0 mt-0.5">ℹ️</div>
                                                    <p className="text-xs leading-relaxed opacity-90">{room.generalInstructions}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                {!accessCodesMap[currentStay.id] && (
                                    <Button
                                        variant="secondary"
                                        className="flex-1 bg-white text-black hover:bg-white/90 shadow-lg border-0 font-semibold"
                                        onClick={() => fetchBookingCodes(currentStay.id)}
                                        disabled={loadingCodes[currentStay.id]}
                                    >
                                        {loadingCodes[currentStay.id] ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
                                        Pokaż kody
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    className="flex-1 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm bg-transparent"
                                    onClick={() => {
                                        setSelectedBooking(currentStay);
                                        setSelectedRoomId(currentStay.bookingRooms?.[0]?.room.id || null);
                                        setReportDialogOpen(true);
                                    }}
                                >
                                    <Wrench className="w-4 h-4 mr-2" />
                                    Zgłoś usterkę
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="outline"
                                    className={`
                                        h-auto py-3 border-white/20 backdrop-blur-md bg-transparent
                                        ${currentStay.nextCleaningRequiresTowels
                                            ? "bg-green-500/20 border-green-500/50 text-green-100 hover:bg-green-500/30"
                                            : "text-white hover:bg-white/10"
                                        }
                                    `}
                                    onClick={async () => {
                                        const newValue = !currentStay.nextCleaningRequiresTowels;
                                        try {
                                            await guestAPI.toggleNextCleaningRequiresTowels(currentStay.id, newValue);
                                            toast.success(newValue ? 'Zamówiono wymianę ręczników' : 'Anulowano wymianę ręczników');
                                            fetchBookings();
                                        } catch (error) {
                                            console.error(error);
                                            toast.error('Błąd podczas zmiany statusu');
                                        }
                                    }}
                                >
                                    <Package className="w-4 h-4 mr-2" />
                                    <div className="flex flex-col items-start leading-tight">
                                        <span className="text-xs font-semibold">Ręczniki</span>
                                        <span className="text-[10px] opacity-70">
                                            {currentStay.nextCleaningRequiresTowels ? 'Zamówione' : 'Zamów wymianę'}
                                        </span>
                                    </div>
                                </Button>

                                <Button
                                    variant="outline"
                                    className={`
                                        h-auto py-3 border-white/20 backdrop-blur-md bg-transparent
                                        ${!currentStay.wantsDailyCleaning
                                            ? "bg-red-500/20 border-red-500/50 text-red-100 hover:bg-red-500/30"
                                            : "text-white hover:bg-white/10"
                                        }
                                    `}
                                    onClick={() => {
                                        handleToggleCleaning(currentStay.id, !currentStay.wantsDailyCleaning);
                                        setTimeout(fetchBookings, 200);
                                    }}
                                >
                                    {!currentStay.wantsDailyCleaning ? <Ban className="w-4 h-4 mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                    <div className="flex flex-col items-start leading-tight">
                                        <span className="text-xs font-semibold">Sprzątanie</span>
                                        <span className="text-[10px] opacity-70">
                                            {!currentStay.wantsDailyCleaning ? 'Pominięto' : 'Zaplanowane'}
                                        </span>
                                    </div>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-10 px-4 rounded-xl bg-muted/30 border-2 border-dashed">
                    <BedDouble className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                    <h3 className="text-lg font-medium">Brak aktualnego pobytu</h3>
                    <p className="text-sm text-muted-foreground">Twoja następna rezerwacja pojawi się tutaj w dniu przyjazdu.</p>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${activeTab === 'upcoming'
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'bg-muted hover:bg-muted/80'
                        }`}
                >
                    Nadchodzące
                    {upcomingBookings.length > 0 && (
                        <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${activeTab === 'upcoming' ? 'bg-primary-foreground/20' : 'bg-primary/10 text-primary'
                            }`}>
                            {upcomingBookings.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${activeTab === 'history'
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'bg-muted hover:bg-muted/80'
                        }`}
                >
                    Historia
                </button>
            </div>

            {/* Booking List */}
            <div className="space-y-4">
                {activeTab === 'upcoming' ? (
                    upcomingBookings.length > 0 ? (
                        upcomingBookings.map(booking => (
                            <Card key={booking.id} className="overflow-hidden group hover:shadow-md transition-shadow">
                                <div className="flex flex-col sm:flex-row h-full">
                                    <div className="sm:w-1/3 min-h-[120px] relative bg-muted">
                                        {booking.bookingRooms?.[0]?.room.category?.imagePath ? (
                                            <img
                                                src={booking.bookingRooms[0].room.category.imagePath}
                                                alt="Room"
                                                className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <BedDouble className="w-8 h-8 text-muted-foreground/30" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent sm:hidden" />
                                        <div className="absolute bottom-2 left-2 sm:hidden text-white font-bold text-lg">
                                            #{booking.bookingReference}
                                        </div>
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <CardContent className="p-4 flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="hidden sm:block">
                                                    <p className="font-bold text-xl">#{booking.bookingReference}</p>
                                                    <p className="text-xs text-muted-foreground">Nr rezerwacji</p>
                                                </div>
                                                <Badge variant={booking.status === BookingStatus.CONFIRMED ? 'default' : 'secondary'}>
                                                    {translations.bookingStatus[booking.status]}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm mb-3">
                                                <CalendarDays className="w-4 h-4 text-primary" />
                                                <span className="font-medium">
                                                    {format(new Date(booking.checkInDate), 'dd MMM', { locale: pl })} - {format(new Date(booking.checkOutDate), 'dd MMM yyyy', { locale: pl })}
                                                </span>
                                                <span className="text-muted-foreground">({formatNights(booking.nightsCount)})</span>
                                            </div>

                                            <div className="flex items-center justify-between text-sm mt-auto">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <BedDouble className="w-4 h-4" />
                                                    {booking.bookingRooms?.map((br, index) => (
                                                        <span key={br.id}>
                                                            {br.room.category?.name || 'Pokój'} {br.room.number}
                                                            {index < (booking.bookingRooms?.length || 0) - 1 && ', '}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>

                                        {booking.status === BookingStatus.PENDING && (
                                            <CardFooter className="p-4 pt-0 border-t bg-muted/20">
                                                <div className="flex justify-between items-center w-full mt-2">
                                                    <div className="flex items-center gap-1.5 text-sm">
                                                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                                                        <span className={`font-medium ${booking.paymentStatus === PaymentStatus.PAID ? 'text-green-600' : 'text-yellow-600'}`}>
                                                            {booking.paymentStatus === PaymentStatus.PAID
                                                                ? 'Opłacone'
                                                                : `Do zapłaty: ${booking.totalPrice} PLN`
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {booking.paymentStatus !== PaymentStatus.PAID && (
                                                            <Button
                                                                size="sm"
                                                                className="h-8"
                                                                onClick={async () => {
                                                                    toast.loading('Przetwarzanie płatności...', { id: 'payment' });
                                                                    try {
                                                                        await guestAPI.payForBooking(booking.id);
                                                                        toast.success('Płatność zakończona sukcesem!', { id: 'payment' });
                                                                        fetchBookings();
                                                                    } catch (error) {
                                                                        console.error(error);
                                                                        toast.error('Błąd płatności', { id: 'payment' });
                                                                    }
                                                                }}
                                                            >
                                                                Zapłać
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
                                                            onClick={() => {
                                                                setSelectedBooking(booking);
                                                                setCancelDialogOpen(true);
                                                            }}
                                                        >
                                                            <Ban className="w-3 h-3 mr-1.5" />
                                                            Anuluj
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardFooter>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p className="font-medium">Brak nadchodzących rezerwacji</p>
                        </div>
                    )
                ) : (
                    pastBookings.length > 0 ? (
                        pastBookings.map(booking => (
                            <Card key={booking.id} className="overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
                                <div className="flex h-24">
                                    <div className="w-24 shrink-0 bg-muted relative grayscale">
                                        {booking.bookingRooms?.[0]?.room.category?.imagePath ? (
                                            <img
                                                src={booking.bookingRooms[0].room.category.imagePath}
                                                alt="Room"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <BedDouble className="w-6 h-6 opacity-30" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 p-3 flex flex-col justify-center">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-sm">#{booking.bookingReference}</span>
                                            <Badge variant="outline" className="text-[10px] h-5">{translations.bookingStatus[booking.status]}</Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-1">
                                            {format(new Date(booking.checkInDate), 'dd MMM yyyy', { locale: pl })}
                                        </p>
                                        <p className="text-xs font-medium">
                                            {booking.bookingRooms?.map(br => br.room.category?.name).join(', ')}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p className="font-medium">Historia jest pusta</p>
                        </div>
                    )
                )}
            </div>

            {/* Cancel Dialog */}
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Anulować rezerwację?</DialogTitle>
                        <DialogDescription>
                            Tej operacji nie można cofnąć.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>Nie</Button>
                        <Button variant="destructive" onClick={handleCancelBooking} disabled={isCancelling}>
                            {isCancelling ? 'Anulowanie...' : 'Tak, anuluj'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Report Issue Dialog */}
            <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Wrench className="w-5 h-5" />
                            Zgłoś usterkę
                        </DialogTitle>
                        <DialogDescription>
                            Opisz problem, a obsługa zajmie się nim jak najszybciej.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Pokój</Label>
                            <div className="flex gap-2 flex-wrap">
                                {selectedBooking?.bookingRooms?.map(br => (
                                    <Button
                                        key={br.room.id}
                                        type="button"
                                        size="sm"
                                        variant={selectedRoomId === br.room.id ? 'default' : 'outline'}
                                        onClick={() => setSelectedRoomId(br.room.id)}
                                    >
                                        Pokój {br.room.number}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="issue">Opis problemu</Label>
                            <Input
                                id="issue"
                                placeholder="Co nie działa?"
                                value={issueDescription}
                                onChange={(e) => setIssueDescription(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                size="sm"
                                variant={isUrgent ? 'destructive' : 'outline'}
                                onClick={() => setIsUrgent(!isUrgent)}
                            >
                                <AlertTriangle className="w-4 h-4 mr-1" />
                                {isUrgent ? 'Pilne!' : 'Oznacz jako pilne'}
                            </Button>
                            {isUrgent && (
                                <span className="text-xs text-muted-foreground">Obsługa zareaguje natychmiast</span>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReportDialogOpen(false)}>Anuluj</Button>
                        <Button onClick={handleReportIssue} disabled={isReporting || !issueDescription}>
                            {isReporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                            Wyślij zgłoszenie
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
