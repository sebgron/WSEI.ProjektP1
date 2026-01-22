'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { guestsAPI, GuestProfile } from '@/lib/admin-api';
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
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { formatNights, formatPhoneNumber, formatZipCode } from '@/lib/utils';

interface FormContentProps {
    formData: {
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
    };
    setFormData: (data: any) => void;
}

const FormContent = ({ formData, setFormData }: FormContentProps) => (
    <div className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="firstName">Imię</Label>
                <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="lastName">Nazwisko</Label>
                <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="phoneNumber">Numer telefonu</Label>
            <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: formatPhoneNumber(e.target.value) })}
            />
        </div>
    </div>
);

export default function GuestsPage() {
    const [guests, setGuests] = useState<GuestProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Dialog states
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
    const [selectedGuest, setSelectedGuest] = useState<GuestProfile | null>(null);
    const [guestDetails, setGuestDetails] = useState<GuestProfile | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
    });

    const fetchGuests = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await guestsAPI.findAll(searchQuery || undefined);
            setGuests(data);
        } catch (error) {
            toast.error('Błąd podczas ładowania gości');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchGuests();
        }, 300);
        return () => clearTimeout(timeout);
    }, [fetchGuests]);

    const handleCreate = async () => {
        setIsSubmitting(true);
        try {
            await guestsAPI.create({
                ...formData,
                phoneNumber: formData.phoneNumber.replace(/\s/g, ''),
            });
            toast.success('Gość został utworzony');
            setCreateDialogOpen(false);
            resetForm();
            fetchGuests();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas tworzenia gościa');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!selectedGuest) return;
        setIsSubmitting(true);
        try {
            await guestsAPI.update(selectedGuest.id, {
                ...formData,
                phoneNumber: formData.phoneNumber.replace(/\s/g, ''),
            });
            toast.success('Gość został zaktualizowany');
            setEditDialogOpen(false);
            resetForm();
            fetchGuests();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas aktualizacji gościa');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedGuest) return;
        setIsSubmitting(true);
        try {
            await guestsAPI.delete(selectedGuest.id);
            toast.success('Gość został usunięty');
            setDeleteDialogOpen(false);
            setSelectedGuest(null);
            fetchGuests();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas usuwania gościa');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleViewBookings = async (guest: GuestProfile) => {
        try {
            const details = await guestsAPI.getBookingHistory(guest.id);
            setGuestDetails(details);
            setDetailsSheetOpen(true);
        } catch (error) {
            toast.error('Błąd podczas ładowania historii rezerwacji');
            console.error(error);
        }
    };

    const handleViewDetails = (guest: GuestProfile) => {
        setSelectedGuest(guest);
        setDetailsDialogOpen(true);
    };

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
        });
        setSelectedGuest(null);
    };

    const openEditDialog = (guest: GuestProfile) => {
        setSelectedGuest(guest);
        setFormData({
            firstName: guest.firstName,
            lastName: guest.lastName,
            email: guest.email,
            phoneNumber: guest.phoneNumber || '',
        });
        setEditDialogOpen(true);
    };

    const openDeleteDialog = (guest: GuestProfile) => {
        setSelectedGuest(guest);
        setDeleteDialogOpen(true);
    };

    const columns: Column<GuestProfile>[] = [
        {
            key: 'name',
            header: 'Imię i nazwisko',
            render: (guest) => `${guest.firstName} ${guest.lastName}`,
        },
        {
            key: 'email',
            header: 'Email',
        },
        {
            key: 'phoneNumber',
            header: 'Telefon',
            render: (guest) => guest.phoneNumber ? formatPhoneNumber(guest.phoneNumber) : '-',
        },
        {
            key: 'bookings',
            header: 'Rezerwacje',
            render: (guest) => (
                <Badge variant="outline">
                    {guest.bookings?.length || 0}
                </Badge>
            ),
        },
        {
            key: 'details',
            header: 'Szczegóły',
            render: (guest) => (
                <Button size="sm" onClick={() => handleViewDetails(guest)}>
                    Pokaż
                </Button>
            ),
        },
    ];

    const actions: Action<GuestProfile>[] = [
        {
            label: 'Edytuj',
            onClick: openEditDialog,
        },
        {
            label: 'Zobacz rezerwacje',
            onClick: handleViewBookings,
        },
        {
            label: 'Usuń',
            onClick: openDeleteDialog,
            variant: 'destructive',
            separator: true,
        },
    ];

    return (
        <div>
            <PageHeader
                title="Goście"
                description="Zarządzaj gośćmi hotelowymi"
                onAdd={() => {
                    resetForm();
                    setCreateDialogOpen(true);
                }}
                addLabel="Dodaj gościa"
                onRefresh={fetchGuests}
                isLoading={isLoading}
            >
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Szukaj..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-[200px]"
                    />
                </div>
            </PageHeader>

            <DataTable
                data={guests}
                columns={columns}
                actions={actions}
                isLoading={isLoading}
                emptyMessage="Brak gości"
                getRowKey={(guest) => guest.id}
            />

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Dodaj gościa</DialogTitle>
                    </DialogHeader>
                    <FormContent formData={formData} setFormData={setFormData} />
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

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edytuj gościa</DialogTitle>
                    </DialogHeader>
                    <FormContent formData={formData} setFormData={setFormData} />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                            Anuluj
                        </Button>
                        <Button onClick={handleUpdate} disabled={isSubmitting}>
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
                description={`Czy na pewno chcesz usunąć gościa ${selectedGuest?.firstName} ${selectedGuest?.lastName}? Ta akcja jest nieodwracalna.`}
            />

            {/* Details Dialog */}
            <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Szczegóły gościa</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-muted-foreground">Imię i nazwisko</Label>
                                <p className="font-medium">{selectedGuest?.firstName} {selectedGuest?.lastName}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Adres email</Label>
                                <p className="font-medium">{selectedGuest?.email}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Telefon</Label>
                                <p className="font-medium">{selectedGuest?.phoneNumber ? formatPhoneNumber(selectedGuest.phoneNumber) : '-'}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Data rejestracji</Label>
                                <p className="font-medium">
                                    {selectedGuest?.createdAt ? new Date(selectedGuest.createdAt).toLocaleDateString('pl-PL') : '-'}
                                </p>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="font-medium mb-3">Adres zamieszkania</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Label className="text-muted-foreground">Ulica i numer</Label>
                                    <p className="font-medium">{selectedGuest?.addressStreet || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Kod pocztowy</Label>
                                    <p className="font-medium">{selectedGuest?.zipCode || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Miasto</Label>
                                    <p className="font-medium">{selectedGuest?.city || '-'}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Kraj</Label>
                                    <p className="font-medium">{selectedGuest?.country || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Bookings Sheet */}
            <Sheet open={detailsSheetOpen} onOpenChange={setDetailsSheetOpen}>
                <SheetContent className="sm:max-w-lg">
                    <SheetHeader>
                        <SheetTitle>
                            Historia rezerwacji: {guestDetails?.firstName} {guestDetails?.lastName}
                        </SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                        {guestDetails?.bookings?.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">
                                Brak rezerwacji
                            </p>
                        ) : (
                            guestDetails?.bookings?.map((booking) => (
                                <div
                                    key={booking.id}
                                    className="p-4 border rounded-lg space-y-2"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{booking.bookingReference}</span>
                                        <Badge variant="outline">{booking.status}</Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {new Date(booking.checkInDate).toLocaleDateString('pl-PL')} -{' '}
                                        {new Date(booking.checkOutDate).toLocaleDateString('pl-PL')}
                                        <span className="ml-1">({formatNights(booking.nightsCount)})</span>
                                    </div>
                                    <div className="text-sm">
                                        Pokoje:{' '}
                                        {booking.bookingRooms
                                            ?.map((br) => br.room?.number)
                                            .filter(Boolean)
                                            .join(', ') || '-'}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
