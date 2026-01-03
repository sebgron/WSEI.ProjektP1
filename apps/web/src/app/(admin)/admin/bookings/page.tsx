'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { BookingStatus, PaymentStatus } from '@turborepo/shared';
import { bookingsAPI, guestsAPI, roomsAPI, Booking, GuestProfile, Room, translations } from '@/lib/admin-api';
import { DataTable, Column, Action } from '@/components/admin/data-table';
import { PageHeader } from '@/components/admin/page-header';
import { DeleteDialog } from '@/components/admin/delete-dialog';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [guests, setGuests] = useState<GuestProfile[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<BookingStatus | 'all'>('all');

    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        guestId: '',
        checkInDate: '',
        checkOutDate: '',
        roomIds: [] as number[],
    });
    const [newStatus, setNewStatus] = useState<BookingStatus>(BookingStatus.PENDING);
    const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>(PaymentStatus.UNPAID);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [bookingsData, guestsData, roomsData] = await Promise.all([
                bookingsAPI.findAll(undefined, filterStatus === 'all' ? undefined : filterStatus),
                guestsAPI.findAll(),
                roomsAPI.findAll(),
            ]);
            setBookings(bookingsData);
            setGuests(guestsData);
            setRooms(roomsData);
        } catch (error) {
            toast.error('Błąd podczas ładowania danych');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [filterStatus]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreate = async () => {
        setIsSubmitting(true);
        try {
            await bookingsAPI.create({
                guestId: formData.guestId,
                checkInDate: formData.checkInDate,
                checkOutDate: formData.checkOutDate,
                roomIds: formData.roomIds,
            });
            toast.success('Rezerwacja została utworzona');
            setCreateDialogOpen(false);
            resetForm();
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas tworzenia rezerwacji');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusChange = async () => {
        if (!selectedBooking) return;
        setIsSubmitting(true);
        try {
            await bookingsAPI.updateStatus(selectedBooking.id, newStatus);
            toast.success('Status rezerwacji został zmieniony');
            setStatusDialogOpen(false);
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas zmiany statusu');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePaymentChange = async () => {
        if (!selectedBooking) return;
        setIsSubmitting(true);
        try {
            await bookingsAPI.updatePaymentStatus(selectedBooking.id, newPaymentStatus);
            toast.success('Status płatności został zmieniony');
            setPaymentDialogOpen(false);
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas zmiany statusu płatności');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = async (booking: Booking) => {
        try {
            await bookingsAPI.cancel(booking.id);
            toast.success('Rezerwacja została anulowana');
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas anulowania rezerwacji');
        }
    };

    const handleDelete = async () => {
        if (!selectedBooking) return;
        setIsSubmitting(true);
        try {
            await bookingsAPI.delete(selectedBooking.id);
            toast.success('Rezerwacja została usunięta');
            setDeleteDialogOpen(false);
            setSelectedBooking(null);
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas usuwania rezerwacji');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            guestId: '',
            checkInDate: '',
            checkOutDate: '',
            roomIds: [],
        });
        setSelectedBooking(null);
    };

    const openStatusDialog = (booking: Booking) => {
        setSelectedBooking(booking);
        setNewStatus(booking.status);
        setStatusDialogOpen(true);
    };

    const openPaymentDialog = (booking: Booking) => {
        setSelectedBooking(booking);
        setNewPaymentStatus(booking.paymentStatus);
        setPaymentDialogOpen(true);
    };

    const openDeleteDialog = (booking: Booking) => {
        setSelectedBooking(booking);
        setDeleteDialogOpen(true);
    };

    const toggleRoom = (roomId: number) => {
        setFormData((prev) => ({
            ...prev,
            roomIds: prev.roomIds.includes(roomId)
                ? prev.roomIds.filter((id) => id !== roomId)
                : [...prev.roomIds, roomId],
        }));
    };

    const getStatusBadgeVariant = (status: BookingStatus) => {
        switch (status) {
            case BookingStatus.CONFIRMED:
            case BookingStatus.CHECKED_IN:
                return 'default';
            case BookingStatus.COMPLETED:
                return 'secondary';
            case BookingStatus.CANCELLED:
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const columns: Column<Booking>[] = [
        {
            key: 'reference',
            header: 'Nr rezerwacji',
        },
        {
            key: 'guest',
            header: 'Gość',
            render: (booking) =>
                booking.guest
                    ? `${booking.guest.firstName} ${booking.guest.lastName}`
                    : '-',
        },
        {
            key: 'dates',
            header: 'Daty',
            render: (booking) => (
                <span className="text-sm">
                    {new Date(booking.checkInDate).toLocaleDateString('pl-PL')} -{' '}
                    {new Date(booking.checkOutDate).toLocaleDateString('pl-PL')}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (booking) => (
                <Badge variant={getStatusBadgeVariant(booking.status)}>
                    {translations.bookingStatus[booking.status]}
                </Badge>
            ),
        },
        {
            key: 'paymentStatus',
            header: 'Płatność',
            render: (booking) => (
                <Badge variant={booking.paymentStatus === PaymentStatus.PAID ? 'default' : 'secondary'}>
                    {translations.paymentStatus[booking.paymentStatus]}
                </Badge>
            ),
        },
        {
            key: 'totalPrice',
            header: 'Kwota',
            render: (booking) => `${booking.totalPrice.toFixed(2)} zł`,
        },
    ];

    const actions: Action<Booking>[] = [
        {
            label: 'Zmień status',
            onClick: openStatusDialog,
        },
        {
            label: 'Zmień płatność',
            onClick: openPaymentDialog,
        },
        {
            label: 'Anuluj',
            onClick: handleCancel,
            separator: true,
        },
        {
            label: 'Usuń',
            onClick: openDeleteDialog,
            variant: 'destructive',
        },
    ];

    return (
        <div>
            <PageHeader
                title="Rezerwacje"
                description="Zarządzaj rezerwacjami hotelowymi"
                onAdd={() => {
                    resetForm();
                    setCreateDialogOpen(true);
                }}
                addLabel="Dodaj rezerwację"
                onRefresh={fetchData}
                isLoading={isLoading}
            >
                <Select
                    value={filterStatus}
                    onValueChange={(value) => setFilterStatus(value as BookingStatus | 'all')}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Wszystkie statusy</SelectItem>
                        {Object.values(BookingStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                                {translations.bookingStatus[status]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </PageHeader>

            <DataTable
                data={bookings}
                columns={columns}
                actions={actions}
                isLoading={isLoading}
                emptyMessage="Brak rezerwacji"
                getRowKey={(booking) => booking.id}
            />

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Dodaj rezerwację</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Gość</Label>
                            <Select
                                value={formData.guestId}
                                onValueChange={(value) => setFormData({ ...formData, guestId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Wybierz gościa" />
                                </SelectTrigger>
                                <SelectContent>
                                    {guests.map((guest) => (
                                        <SelectItem key={guest.id} value={guest.id}>
                                            {guest.firstName} {guest.lastName} ({guest.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Data zameldowania</Label>
                                <Input
                                    type="date"
                                    value={formData.checkInDate}
                                    onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Data wymeldowania</Label>
                                <Input
                                    type="date"
                                    value={formData.checkOutDate}
                                    onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Pokoje</Label>
                            <div className="flex flex-wrap gap-2 p-3 border rounded-md max-h-[200px] overflow-y-auto">
                                {rooms.map((room) => (
                                    <Badge
                                        key={room.id}
                                        variant={formData.roomIds.includes(room.id) ? 'default' : 'outline'}
                                        className="cursor-pointer"
                                        onClick={() => toggleRoom(room.id)}
                                    >
                                        {room.number} ({room.category?.name})
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                            Anuluj
                        </Button>
                        <Button onClick={handleCreate} disabled={isSubmitting}>
                            {isSubmitting ? 'Tworzenie...' : 'Utwórz'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Status Dialog */}
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Zmień status rezerwacji</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>Nowy status</Label>
                        <Select
                            value={newStatus}
                            onValueChange={(value) => setNewStatus(value as BookingStatus)}
                        >
                            <SelectTrigger className="mt-2">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(BookingStatus).map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {translations.bookingStatus[status]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                            Anuluj
                        </Button>
                        <Button onClick={handleStatusChange} disabled={isSubmitting}>
                            {isSubmitting ? 'Zapisywanie...' : 'Zapisz'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Payment Dialog */}
            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Zmień status płatności</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>Status płatności</Label>
                        <Select
                            value={newPaymentStatus}
                            onValueChange={(value) => setNewPaymentStatus(value as PaymentStatus)}
                        >
                            <SelectTrigger className="mt-2">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(PaymentStatus).map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {translations.paymentStatus[status]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                            Anuluj
                        </Button>
                        <Button onClick={handlePaymentChange} disabled={isSubmitting}>
                            {isSubmitting ? 'Zapisywanie...' : 'Zapisz'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <DeleteDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDelete}
                isLoading={isSubmitting}
                description={`Czy na pewno chcesz usunąć rezerwację ${selectedBooking?.reference}? Ta akcja jest nieodwracalna.`}
            />
        </div>
    );
}
