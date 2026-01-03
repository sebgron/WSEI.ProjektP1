'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { guestAPI } from '@/lib/guest-api';
import { IBookingResponse, BookingStatus, PaymentStatus, IBookingAccessCodesResponse } from '@turborepo/shared';
import { translations } from '@/lib/admin-api';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    CalendarDays,
    CreditCard,

    Ban,
    Loader2,
    Clock,
    BedDouble,
    Eye,
    EyeOff,
    Info
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState<IBookingResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<IBookingResponse | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    // Store access codes for bookings: { [bookingId]: codes }
    const [accessCodesMap, setAccessCodesMap] = useState<Record<string, IBookingAccessCodesResponse>>({});
    const [loadingCodes, setLoadingCodes] = useState<Record<string, boolean>>({});

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
        // If already loaded, toggle visibility? No, just keep them.
        if (accessCodesMap[bookingId]) return;

        setLoadingCodes(prev => ({ ...prev, [bookingId]: true }));
        try {
            const codes = await guestAPI.getAccessCodes(bookingId);
            setAccessCodesMap(prev => ({ ...prev, [bookingId]: codes }));
            toast.success('Pobrano kody dostępu');
        } catch (error) {
            console.error(error);
            toast.error('Nie udało się pobrać kodów. Sprawdź czy rezerwacja jest opłacona.');
        } finally {
            setLoadingCodes(prev => ({ ...prev, [bookingId]: false }));
        }
    };

    const handleCancelBooking = async () => {
        if (!selectedBooking) return;
        setIsCancelling(true);
        try {
            await guestAPI.cancelBooking(selectedBooking.id);
            toast.success('Rezerwacja została anulowana');
            setCancelDialogOpen(false);
            fetchBookings();
        } catch (error) {
            console.error(error);
            toast.error('Nie udało się anulować rezerwacji');
        } finally {
            setIsCancelling(false);
        }
    };

    const openCancelDialog = (booking: IBookingResponse) => {
        setSelectedBooking(booking);
        setCancelDialogOpen(true);
    };

    const activeBookings = bookings.filter(
        (b) =>
            b.status === BookingStatus.CONFIRMED ||
            b.status === BookingStatus.PENDING ||
            b.status === BookingStatus.CHECKED_IN
    );

    const pastBookings = bookings.filter(
        (b) =>
            b.status === BookingStatus.COMPLETED ||
            b.status === BookingStatus.CANCELLED
    );

    const getStatusColor = (status: BookingStatus) => {
        switch (status) {
            case BookingStatus.CONFIRMED:
            case BookingStatus.CHECKED_IN:
                return 'default';
            case BookingStatus.PENDING:
                return 'secondary';
            case BookingStatus.CANCELLED:
                return 'destructive';
            case BookingStatus.COMPLETED:
                return 'outline';
            default:
                return 'secondary';
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const BookingCard = ({ booking, isPast = false }: { booking: IBookingResponse; isPast?: boolean }) => {
        const codes = accessCodesMap[booking.id];
        const isLoadingCodes = loadingCodes[booking.id];
        const canShowCodes = (booking.status === BookingStatus.CHECKED_IN ||
            (booking.status === BookingStatus.CONFIRMED && booking.paymentStatus === PaymentStatus.PAID));

        return (
            <Card className="mb-4 shadow-sm border-border/60 hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <span className="font-mono text-primary">#{booking.reference}</span>
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1">
                                <CalendarDays className="w-4 h-4" />
                                {format(new Date(booking.checkInDate), 'dd MMM yyyy', { locale: pl })} -{' '}
                                {format(new Date(booking.checkOutDate), 'dd MMM yyyy', { locale: pl })}
                                <span className="text-xs bg-muted px-2 py-0.5 rounded-full ml-2">
                                    {booking.nightsCount} noc{booking.nightsCount > 1 ? 'e' : ''}
                                </span>
                            </CardDescription>
                        </div>
                        <Badge variant={getStatusColor(booking.status)}>
                            {translations.bookingStatus[booking.status]}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pb-3 text-sm space-y-3">
                    {/* Rooms Info */}
                    <div className="flex flex-col gap-2">
                        {booking.bookingRooms?.map((br) => {
                            // Find matching room codes if loaded
                            const roomCodes = codes?.rooms.find(r => r.roomNumber === br.room.number);

                            return (
                                <div key={br.id} className="flex flex-col gap-2 bg-muted/40 p-3 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <BedDouble className="w-5 h-5 text-muted-foreground" />
                                        <div className="flex-1">
                                            <p className="font-medium">Pokój {br.room.number}</p>
                                            <p className="text-xs text-muted-foreground">{br.room.category?.name}</p>
                                        </div>
                                    </div>

                                    {/* Access Codes Section - Only if loaded */}
                                    {roomCodes && (
                                        <div className="mt-2 pt-2 border-t border-border/50 space-y-2 animate-in fade-in duration-300">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {roomCodes.doorCode && (
                                                    <div className="flex items-center justify-between bg-background border px-3 py-2 rounded">
                                                        <span className="text-xs text-muted-foreground">Kod do drzwi:</span>
                                                        <span className="font-mono font-bold text-lg select-all">{roomCodes.doorCode}</span>
                                                    </div>
                                                )}
                                                {roomCodes.keyBoxCode && (
                                                    <div className="flex items-center justify-between bg-background border px-3 py-2 rounded">
                                                        <span className="text-xs text-muted-foreground">Sejf na klucze:</span>
                                                        <span className="font-mono font-bold text-lg select-all">{roomCodes.keyBoxCode}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {roomCodes.entranceCodes && roomCodes.entranceCodes.length > 0 && (
                                                <div className="space-y-1">
                                                    <span className="text-xs font-medium text-muted-foreground">Wejście główne:</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {roomCodes.entranceCodes.map((ec, idx) => (
                                                            <div key={idx} className="flex items-center gap-2 bg-background border px-2 py-1 rounded">
                                                                <span className="text-xs text-muted-foreground">{ec.label}:</span>
                                                                <span className="font-mono font-bold">{ec.code}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {(roomCodes.generalInstructions || roomCodes.additionalInfo) && (
                                                <div className="flex items-start gap-2 bg-blue-50/50 dark:bg-blue-950/20 p-2 rounded text-xs">
                                                    <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                                    <div className="space-y-1">
                                                        {roomCodes.generalInstructions && <p>{roomCodes.generalInstructions}</p>}
                                                        {roomCodes.additionalInfo && <p>{roomCodes.additionalInfo}</p>}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Payment Info */}
                    <div className="flex justify-between items-center pt-2 border-t border-border/50">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <CreditCard className="w-4 h-4" />
                            <span>Status płatności:</span>
                            <span className={booking.paymentStatus === PaymentStatus.PAID ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
                                {translations.paymentStatus[booking.paymentStatus]}
                            </span>
                        </div>
                        <div className="font-bold text-lg">
                            {booking.totalPrice} PLN
                        </div>
                    </div>
                </CardContent>

                {!isPast && booking.status !== BookingStatus.CANCELLED && (
                    <CardFooter className="pt-0 flex flex-col sm:flex-row justify-end gap-2">
                        {/* Show Codes Button */}
                        {canShowCodes && !codes && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto"
                                onClick={() => fetchBookingCodes(booking.id)}
                                disabled={isLoadingCodes}
                            >
                                {isLoadingCodes ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
                                Pokaż kody dostępu
                            </Button>
                        )}

                        {canShowCodes && codes && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full sm:w-auto text-muted-foreground"
                                onClick={() => {
                                    // Optional: Hide codes logic
                                    setAccessCodesMap(prev => {
                                        const newMap = { ...prev };
                                        delete newMap[booking.id];
                                        return newMap;
                                    });
                                }}
                            >
                                <EyeOff className="w-4 h-4 mr-2" />
                                Ukryj kody
                            </Button>
                        )}

                        {booking.status === BookingStatus.PENDING && (
                            <Button variant="destructive" size="sm" className="w-full sm:w-auto" onClick={() => openCancelDialog(booking)}>
                                <Ban className="w-4 h-4 mr-2" />
                                Anuluj
                            </Button>
                        )}
                        {booking.paymentStatus === PaymentStatus.UNPAID && (
                            <Button size="sm" className="w-full sm:w-auto">
                                Opłać teraz
                            </Button>
                        )}
                    </CardFooter>
                )}
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Moje Rezerwacje</h1>
            </div>

            <Tabs defaultValue="active" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="active">Aktualne i Nadchodzące</TabsTrigger>
                    <TabsTrigger value="history">Historia</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-4">
                    {activeBookings.length > 0 ? (
                        activeBookings.map((booking) => (
                            <BookingCard key={booking.id} booking={booking} />
                        ))
                    ) : (
                        <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                            <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="text-lg font-medium">Brak aktywnych rezerwacji</p>
                            <p className="text-sm">Zarezerwuj swój pobyt już dziś!</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    {pastBookings.length > 0 ? (
                        pastBookings.map((booking) => (
                            <BookingCard key={booking.id} booking={booking} isPast />
                        ))
                    ) : (
                        <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                            <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>Historia rezerwacji jest pusta</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Cancel Confirmation Dialog */}
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Anulowanie rezerwacji</DialogTitle>
                        <DialogDescription>
                            Czy na pewno chcesz anulować rezerwację #{selectedBooking?.reference}?
                            Tej operacji nie można cofnąć.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                            Powrót
                        </Button>
                        <Button variant="destructive" onClick={handleCancelBooking} disabled={isCancelling}>
                            {isCancelling ? 'Anulowanie...' : 'Potwierdź anulowanie'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
