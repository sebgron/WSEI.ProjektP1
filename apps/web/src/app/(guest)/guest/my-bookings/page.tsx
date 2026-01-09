'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
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
    Package
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

    // Current stay = CHECKED_IN booking
    const currentStay = bookings.find(b => b.status === BookingStatus.CHECKED_IN);

    const upcomingBookings = bookings.filter(b =>
        b.status === BookingStatus.CONFIRMED || b.status === BookingStatus.PENDING
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
                <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-medium text-primary">
                                <CheckCircle2 className="w-4 h-4" />
                                AKTUALNY POBYT
                            </div>
                            <Badge>Zameldowany</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-2xl font-bold">#{currentStay.bookingReference}</p>
                                <p className="text-sm text-muted-foreground">
                                    Wymeldowanie: {format(new Date(currentStay.checkOutDate), 'dd MMM', { locale: pl })}
                                    <span className="ml-2 px-2 py-0.5 rounded-full bg-background/50 text-xs font-medium">
                                        {formatNights(currentStay.nightsCount)}
                                    </span>
                                </p>
                            </div>
                            <div className="text-right">
                                {currentStay.bookingRooms?.map(br => (
                                    <p key={br.id} className="font-medium">Pokój {br.room.number}</p>
                                ))}
                            </div>
                        </div>

                        {/* Access Codes */}
                        {accessCodesMap[currentStay.id] ? (
                            <div className="bg-background border rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Kody dostępu</span>
                                    <Button size="sm" variant="ghost" onClick={() => {
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
                                {accessCodesMap[currentStay.id].rooms.map((room, i) => (
                                    <div key={i} className="space-y-3">
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            {room.doorCode && (
                                                <div className="bg-muted p-2 rounded">
                                                    <span className="text-xs text-muted-foreground">Drzwi do pokoju:</span>
                                                    <p className="font-mono font-bold text-lg">{room.doorCode}</p>
                                                </div>
                                            )}
                                            {room.keyBoxCode && (
                                                <div className="bg-muted p-2 rounded">
                                                    <span className="text-xs text-muted-foreground">Sejf na klucze:</span>
                                                    <p className="font-mono font-bold text-lg">{room.keyBoxCode}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Shared Access Stuff */}
                                        {room.entranceCodes && room.entranceCodes.length > 0 && (
                                            <div className="space-y-2 pt-2 border-t text-sm">
                                                <span className="text-xs font-medium text-muted-foreground">Kody wejściowe (wspólne):</span>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {room.entranceCodes.map((ec, idx) => (
                                                        <div key={idx} className="bg-muted/50 p-2 rounded flex flex-col">
                                                            <span className="text-xs text-muted-foreground truncate">{ec.label}</span>
                                                            <span className="font-mono font-bold">{ec.code}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {room.generalInstructions && (
                                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex gap-2 text-sm text-blue-700 dark:text-blue-300">
                                                <div className="shrink-0 mt-0.5">ℹ️</div>
                                                <p className="text-xs leading-relaxed">{room.generalInstructions}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3">
                        {/* Service Actions */}
                        <div className="flex gap-2 w-full">
                            {!accessCodesMap[currentStay.id] && (
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => fetchBookingCodes(currentStay.id)}
                                    disabled={loadingCodes[currentStay.id]}
                                >
                                    {loadingCodes[currentStay.id] ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
                                    Kody dostępu
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                className="flex-1"
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

                        <div className="flex gap-2 w-full pt-2 border-t">
                            {/* Towel Request */}
                            <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={() => handleRequestService(currentStay.id, TaskType.AMENITY_REFILL, 'Prośba o wymianę ręczników')}
                            >
                                <Package className="w-4 h-4 mr-2" />
                                Wymiana ręczników
                            </Button>

                            {/* Daily Cleaning Toggle - Mock UI for now as API needs update */}
                            <div className="flex items-center gap-2 px-3 border rounded-md bg-background/50">
                                <Label htmlFor="daily-cleaning" className="text-xs font-medium cursor-pointer">Sprzątanie codzienne</Label>
                                <input
                                    type="checkbox"
                                    id="daily-cleaning"
                                    className="accent-primary w-4 h-4"
                                    defaultChecked={true}
                                    onChange={(e) => handleToggleCleaning(currentStay.id, e.target.checked)}
                                />
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            ) : (
                <div className="text-center py-6 px-4 rounded-xl bg-muted/30 border border-dashed">
                    <BedDouble className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                    <p className="text-sm font-medium">Brak aktualnego pobytu</p>
                    <p className="text-xs text-muted-foreground">Twoja następna rezerwacja pojawi się tutaj</p>
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
            <div className="space-y-3">
                {activeTab === 'upcoming' ? (
                    upcomingBookings.length > 0 ? (
                        upcomingBookings.map(booking => (
                            <Card key={booking.id} className="overflow-hidden">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="font-bold text-lg">#{booking.bookingReference}</p>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                <CalendarDays className="w-3 h-3" />
                                                {format(new Date(booking.checkInDate), 'dd MMM', { locale: pl })} - {format(new Date(booking.checkOutDate), 'dd MMM', { locale: pl })}
                                                <span className="ml-1">({formatNights(booking.nightsCount)})</span>
                                            </p>
                                        </div>
                                        <Badge variant={booking.status === BookingStatus.CONFIRMED ? 'default' : 'secondary'}>
                                            {translations.bookingStatus[booking.status]}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <BedDouble className="w-4 h-4" />
                                            {booking.bookingRooms?.map(br => br.room.number).join(', ')}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <CreditCard className="w-4 h-4 text-muted-foreground" />
                                            <span className={booking.paymentStatus === PaymentStatus.PAID ? 'text-green-600' : 'text-yellow-600'}>
                                                {booking.paymentStatus === PaymentStatus.PAID ? 'Opłacone' : 'Nieopłacone'}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                                {booking.status === BookingStatus.PENDING && (
                                    <CardFooter className="p-4 pt-0">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => {
                                                setSelectedBooking(booking);
                                                setCancelDialogOpen(true);
                                            }}
                                        >
                                            <Ban className="w-4 h-4 mr-2" />
                                            Anuluj rezerwację
                                        </Button>
                                    </CardFooter>
                                )}
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
                            <Card key={booking.id} className="overflow-hidden opacity-75">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-bold">#{booking.bookingReference}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {format(new Date(booking.checkInDate), 'dd MMM yyyy', { locale: pl })}
                                                <span className="ml-1 text-xs">({formatNights(booking.nightsCount)})</span>
                                            </p>
                                        </div>
                                        <Badge variant={booking.status === BookingStatus.COMPLETED ? 'outline' : 'destructive'}>
                                            {translations.bookingStatus[booking.status]}
                                        </Badge>
                                    </div>
                                </CardContent>
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
