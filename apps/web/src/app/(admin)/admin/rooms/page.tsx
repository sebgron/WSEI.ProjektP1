'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { RoomCondition } from '@turborepo/shared';
import { roomsAPI, roomCategoriesAPI, accessConfigsAPI, Room, RoomCategory, AccessConfiguration, translations } from '@/lib/admin-api';
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

export default function RoomsPage() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [categories, setCategories] = useState<RoomCategory[]>([]);
    const [accessConfigs, setAccessConfigs] = useState<AccessConfiguration[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterCondition, setFilterCondition] = useState<RoomCondition | 'all'>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');

    // Dialog states
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        number: '',
        categoryId: '',
        condition: RoomCondition.CLEAN as RoomCondition,
        accessConfigId: 'none',
    });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [roomsData, categoriesData, configsData] = await Promise.all([
                roomsAPI.findAll(
                    filterCondition === 'all' ? undefined : filterCondition,
                    filterCategory === 'all' ? undefined : parseInt(filterCategory)
                ),
                roomCategoriesAPI.findAll(),
                accessConfigsAPI.findAll(),
            ]);
            setRooms(roomsData);
            setCategories(categoriesData);
            setAccessConfigs(configsData);
        } catch (error) {
            toast.error('Błąd podczas ładowania danych');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [filterCondition, filterCategory]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreate = async () => {
        setIsSubmitting(true);
        try {
            await roomsAPI.create({
                number: formData.number,
                categoryId: parseInt(formData.categoryId),
                condition: formData.condition,
                accessConfigId: formData.accessConfigId && formData.accessConfigId !== 'none' ? parseInt(formData.accessConfigId) : undefined,
            });
            toast.success('Pokój został utworzony');
            setCreateDialogOpen(false);
            resetForm();
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas tworzenia pokoju');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!selectedRoom) return;
        setIsSubmitting(true);
        try {
            await roomsAPI.update(selectedRoom.id, {
                number: formData.number,
                categoryId: parseInt(formData.categoryId),
                condition: formData.condition,
                accessConfigId: formData.accessConfigId && formData.accessConfigId !== 'none' ? parseInt(formData.accessConfigId) : null,
            });
            toast.success('Pokój został zaktualizowany');
            setEditDialogOpen(false);
            resetForm();
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas aktualizacji pokoju');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedRoom) return;
        setIsSubmitting(true);
        try {
            await roomsAPI.delete(selectedRoom.id);
            toast.success('Pokój został usunięty');
            setDeleteDialogOpen(false);
            setSelectedRoom(null);
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas usuwania pokoju');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConditionChange = async (room: Room, condition: RoomCondition) => {
        try {
            await roomsAPI.updateCondition(room.id, condition);
            toast.success('Status pokoju został zaktualizowany');
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas aktualizacji statusu');
        }
    };

    const resetForm = () => {
        setFormData({
            number: '',
            categoryId: categories[0]?.id.toString() || '',
            condition: RoomCondition.CLEAN,
            accessConfigId: 'none',
        });
        setSelectedRoom(null);
    };

    const openEditDialog = (room: Room) => {
        setSelectedRoom(room);
        setFormData({
            number: room.number,
            categoryId: room.category?.id.toString() || '',
            condition: room.condition,
            accessConfigId: room.accessConfig?.id.toString() || 'none',
        });
        setEditDialogOpen(true);
    };

    const openDeleteDialog = (room: Room) => {
        setSelectedRoom(room);
        setDeleteDialogOpen(true);
    };

    const getConditionBadgeVariant = (condition: RoomCondition) => {
        switch (condition) {
            case RoomCondition.CLEAN:
                return 'default';
            case RoomCondition.DIRTY:
                return 'secondary';
            case RoomCondition.IN_MAINTENANCE:
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const columns: Column<Room>[] = [
        {
            key: 'number',
            header: 'Numer pokoju',
        },
        {
            key: 'category',
            header: 'Kategoria',
            render: (room) => room.category?.name || '-',
        },
        {
            key: 'condition',
            header: 'Stan',
            render: (room) => (
                <Badge variant={getConditionBadgeVariant(room.condition)}>
                    {translations.roomCondition[room.condition]}
                </Badge>
            ),
        },
        {
            key: 'accessConfig',
            header: 'Konfiguracja dostępu',
            render: (room) => room.accessConfig?.name || '-',
        },
    ];

    const actions: Action<Room>[] = [
        {
            label: 'Edytuj',
            onClick: openEditDialog,
        },
        {
            label: 'Oznacz jako czysty',
            onClick: (room) => handleConditionChange(room, RoomCondition.CLEAN),
        },
        {
            label: 'Oznacz jako brudny',
            onClick: (room) => handleConditionChange(room, RoomCondition.DIRTY),
        },
        {
            label: 'Oznacz jako w naprawie',
            onClick: (room) => handleConditionChange(room, RoomCondition.IN_MAINTENANCE),
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
                title="Pokoje"
                description="Zarządzaj pokojami hotelowymi"
                onAdd={() => {
                    resetForm();
                    setCreateDialogOpen(true);
                }}
                addLabel="Dodaj pokój"
                onRefresh={fetchData}
                isLoading={isLoading}
            >
                <Select
                    value={filterCondition}
                    onValueChange={(value) => setFilterCondition(value as RoomCondition | 'all')}
                >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Stan" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Wszystkie stany</SelectItem>
                        <SelectItem value={RoomCondition.CLEAN}>Czysty</SelectItem>
                        <SelectItem value={RoomCondition.DIRTY}>Brudny</SelectItem>
                        <SelectItem value={RoomCondition.IN_MAINTENANCE}>W naprawie</SelectItem>
                    </SelectContent>
                </Select>
                <Select
                    value={filterCategory}
                    onValueChange={setFilterCategory}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Kategoria" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Wszystkie kategorie</SelectItem>
                        {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </PageHeader>

            <DataTable
                data={rooms}
                columns={columns}
                actions={actions}
                isLoading={isLoading}
                emptyMessage="Brak pokoi"
                getRowKey={(room) => room.id}
            />

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Dodaj pokój</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="number">Numer pokoju</Label>
                            <Input
                                id="number"
                                value={formData.number}
                                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="categoryId">Kategoria</Label>
                            <Select
                                value={formData.categoryId}
                                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Wybierz kategorię" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="condition">Stan</Label>
                            <Select
                                value={formData.condition}
                                onValueChange={(value) => setFormData({ ...formData, condition: value as RoomCondition })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={RoomCondition.CLEAN}>Czysty</SelectItem>
                                    <SelectItem value={RoomCondition.DIRTY}>Brudny</SelectItem>
                                    <SelectItem value={RoomCondition.IN_MAINTENANCE}>W naprawie</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="accessConfigId">Konfiguracja dostępu (opcjonalnie)</Label>
                            <Select
                                value={formData.accessConfigId}
                                onValueChange={(value) => setFormData({ ...formData, accessConfigId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Wybierz konfigurację" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Brak</SelectItem>
                                    {accessConfigs.map((config) => (
                                        <SelectItem key={config.id} value={config.id.toString()}>
                                            {config.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edytuj pokój</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-number">Numer pokoju</Label>
                            <Input
                                id="edit-number"
                                value={formData.number}
                                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-categoryId">Kategoria</Label>
                            <Select
                                value={formData.categoryId}
                                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id.toString()}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-condition">Stan</Label>
                            <Select
                                value={formData.condition}
                                onValueChange={(value) => setFormData({ ...formData, condition: value as RoomCondition })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={RoomCondition.CLEAN}>Czysty</SelectItem>
                                    <SelectItem value={RoomCondition.DIRTY}>Brudny</SelectItem>
                                    <SelectItem value={RoomCondition.IN_MAINTENANCE}>W naprawie</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-accessConfigId">Konfiguracja dostępu</Label>
                            <Select
                                value={formData.accessConfigId}
                                onValueChange={(value) => setFormData({ ...formData, accessConfigId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Wybierz konfigurację" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Brak</SelectItem>
                                    {accessConfigs.map((config) => (
                                        <SelectItem key={config.id} value={config.id.toString()}>
                                            {config.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
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
                description={`Czy na pewno chcesz usunąć pokój ${selectedRoom?.number}? Ta akcja jest nieodwracalna.`}
            />
        </div>
    );
}
