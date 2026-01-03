'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { roomFeaturesAPI, RoomFeature } from '@/lib/admin-api';
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

const iconOptions = [
    { value: 'wifi', label: 'WiFi' },
    { value: 'tv', label: 'Telewizor' },
    { value: 'air-conditioning', label: 'Klimatyzacja' },
    { value: 'minibar', label: 'Minibar' },
    { value: 'safe', label: 'Sejf' },
    { value: 'balcony', label: 'Balkon' },
    { value: 'view', label: 'Widok' },
    { value: 'bathtub', label: 'Wanna' },
    { value: 'shower', label: 'Prysznic' },
    { value: 'coffee', label: 'Kawa/Herbata' },
    { value: 'iron', label: 'Żelazko' },
    { value: 'hairdryer', label: 'Suszarka' },
];

export default function RoomFeaturesPage() {
    const [features, setFeatures] = useState<RoomFeature[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Dialog states
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState<RoomFeature | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        icon: 'wifi',
        isActive: true,
    });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await roomFeaturesAPI.findAll();
            setFeatures(data);
        } catch (error) {
            toast.error('Błąd podczas ładowania danych');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreate = async () => {
        setIsSubmitting(true);
        try {
            await roomFeaturesAPI.create(formData);
            toast.success('Udogodnienie zostało utworzone');
            setCreateDialogOpen(false);
            resetForm();
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas tworzenia udogodnienia');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!selectedFeature) return;
        setIsSubmitting(true);
        try {
            await roomFeaturesAPI.update(selectedFeature.id, formData);
            toast.success('Udogodnienie zostało zaktualizowane');
            setEditDialogOpen(false);
            resetForm();
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas aktualizacji udogodnienia');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedFeature) return;
        setIsSubmitting(true);
        try {
            await roomFeaturesAPI.delete(selectedFeature.id);
            toast.success('Udogodnienie zostało usunięte');
            setDeleteDialogOpen(false);
            setSelectedFeature(null);
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas usuwania udogodnienia');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleActive = async (feature: RoomFeature) => {
        try {
            await roomFeaturesAPI.update(feature.id, { isActive: !feature.isActive });
            toast.success(`Udogodnienie zostało ${feature.isActive ? 'dezaktywowane' : 'aktywowane'}`);
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas aktualizacji');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            icon: 'wifi',
            isActive: true,
        });
        setSelectedFeature(null);
    };

    const openEditDialog = (feature: RoomFeature) => {
        setSelectedFeature(feature);
        setFormData({
            name: feature.name,
            icon: feature.icon,
            isActive: feature.isActive,
        });
        setEditDialogOpen(true);
    };

    const openDeleteDialog = (feature: RoomFeature) => {
        setSelectedFeature(feature);
        setDeleteDialogOpen(true);
    };

    const columns: Column<RoomFeature>[] = [
        {
            key: 'name',
            header: 'Nazwa',
        },
        {
            key: 'icon',
            header: 'Ikona',
            render: (feature) => (
                <code className="text-sm bg-muted px-2 py-1 rounded">{feature.icon}</code>
            ),
        },
        {
            key: 'isActive',
            header: 'Status',
            render: (feature) => (
                <Badge variant={feature.isActive ? 'default' : 'secondary'}>
                    {feature.isActive ? 'Aktywne' : 'Nieaktywne'}
                </Badge>
            ),
        },
    ];

    const actions: Action<RoomFeature>[] = [
        {
            label: 'Edytuj',
            onClick: openEditDialog,
        },
        {
            label: 'Przełącz status',
            onClick: handleToggleActive,
        },
        {
            label: 'Usuń',
            onClick: openDeleteDialog,
            variant: 'destructive',
            separator: true,
        },
    ];

    const FormContent = () => (
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nazwa</Label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="icon">Ikona</Label>
                <Select
                    value={formData.icon}
                    onValueChange={(value) => setFormData({ ...formData, icon: value })}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {iconOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label} ({opt.value})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="isActive">Status</Label>
                <Select
                    value={formData.isActive ? 'true' : 'false'}
                    onValueChange={(value) => setFormData({ ...formData, isActive: value === 'true' })}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="true">Aktywne</SelectItem>
                        <SelectItem value="false">Nieaktywne</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );

    return (
        <div>
            <PageHeader
                title="Udogodnienia pokoi"
                description="Zarządzaj udogodnieniami dostępnymi w pokojach"
                onAdd={() => {
                    resetForm();
                    setCreateDialogOpen(true);
                }}
                addLabel="Dodaj udogodnienie"
                onRefresh={fetchData}
                isLoading={isLoading}
            />

            <DataTable
                data={features}
                columns={columns}
                actions={actions}
                isLoading={isLoading}
                emptyMessage="Brak udogodnień"
                getRowKey={(feature) => feature.id}
            />

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Dodaj udogodnienie</DialogTitle>
                    </DialogHeader>
                    <FormContent />
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
                        <DialogTitle>Edytuj udogodnienie</DialogTitle>
                    </DialogHeader>
                    <FormContent />
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
                description={`Czy na pewno chcesz usunąć udogodnienie "${selectedFeature?.name}"? Ta akcja jest nieodwracalna.`}
            />
        </div>
    );
}
