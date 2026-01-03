'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { roomCategoriesAPI, roomFeaturesAPI, RoomCategory, RoomFeature } from '@/lib/admin-api';
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

export default function RoomCategoriesPage() {
    const [categories, setCategories] = useState<RoomCategory[]>([]);
    const [features, setFeatures] = useState<RoomFeature[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Dialog states
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<RoomCategory | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        basePrice: '',
        maxOccupancy: '',
        featureIds: [] as number[],
    });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [categoriesData, featuresData] = await Promise.all([
                roomCategoriesAPI.findAll(),
                roomFeaturesAPI.findAll(true),
            ]);
            setCategories(categoriesData);
            setFeatures(featuresData);
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
            await roomCategoriesAPI.create({
                name: formData.name,
                description: formData.description || undefined,
                basePrice: parseFloat(formData.basePrice),
                maxOccupancy: parseInt(formData.maxOccupancy),
                featureIds: formData.featureIds.length > 0 ? formData.featureIds : undefined,
            });
            toast.success('Kategoria została utworzona');
            setCreateDialogOpen(false);
            resetForm();
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas tworzenia kategorii');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!selectedCategory) return;
        setIsSubmitting(true);
        try {
            await roomCategoriesAPI.update(selectedCategory.id, {
                name: formData.name,
                description: formData.description,
                basePrice: parseFloat(formData.basePrice),
                maxOccupancy: parseInt(formData.maxOccupancy),
                featureIds: formData.featureIds,
            });
            toast.success('Kategoria została zaktualizowana');
            setEditDialogOpen(false);
            resetForm();
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas aktualizacji kategorii');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedCategory) return;
        setIsSubmitting(true);
        try {
            await roomCategoriesAPI.delete(selectedCategory.id);
            toast.success('Kategoria została usunięta');
            setDeleteDialogOpen(false);
            setSelectedCategory(null);
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas usuwania kategorii');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            basePrice: '',
            maxOccupancy: '',
            featureIds: [],
        });
        setSelectedCategory(null);
    };

    const openEditDialog = (category: RoomCategory) => {
        setSelectedCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            basePrice: category.basePrice.toString(),
            maxOccupancy: category.maxOccupancy.toString(),
            featureIds: category.features?.map((f) => f.id) || [],
        });
        setEditDialogOpen(true);
    };

    const openDeleteDialog = (category: RoomCategory) => {
        setSelectedCategory(category);
        setDeleteDialogOpen(true);
    };

    const toggleFeature = (featureId: number) => {
        setFormData((prev) => ({
            ...prev,
            featureIds: prev.featureIds.includes(featureId)
                ? prev.featureIds.filter((id) => id !== featureId)
                : [...prev.featureIds, featureId],
        }));
    };

    const columns: Column<RoomCategory>[] = [
        {
            key: 'name',
            header: 'Nazwa',
        },
        {
            key: 'basePrice',
            header: 'Cena bazowa',
            render: (cat) => `${cat.basePrice.toFixed(2)} zł`,
        },
        {
            key: 'maxOccupancy',
            header: 'Maks. osób',
        },
        {
            key: 'features',
            header: 'Udogodnienia',
            render: (cat) => (
                <div className="flex flex-wrap gap-1">
                    {cat.features?.slice(0, 3).map((f) => (
                        <Badge key={f.id} variant="outline" className="text-xs">
                            {f.name}
                        </Badge>
                    ))}
                    {(cat.features?.length || 0) > 3 && (
                        <Badge variant="outline" className="text-xs">
                            +{(cat.features?.length || 0) - 3}
                        </Badge>
                    )}
                </div>
            ),
        },
    ];

    const actions: Action<RoomCategory>[] = [
        {
            label: 'Edytuj',
            onClick: openEditDialog,
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
                <Label htmlFor="description">Opis</Label>
                <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="basePrice">Cena bazowa (zł)</Label>
                    <Input
                        id="basePrice"
                        type="number"
                        step="0.01"
                        value={formData.basePrice}
                        onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="maxOccupancy">Maks. liczba osób</Label>
                    <Input
                        id="maxOccupancy"
                        type="number"
                        value={formData.maxOccupancy}
                        onChange={(e) => setFormData({ ...formData, maxOccupancy: e.target.value })}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label>Udogodnienia</Label>
                <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[60px]">
                    {features.map((feature) => (
                        <Badge
                            key={feature.id}
                            variant={formData.featureIds.includes(feature.id) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => toggleFeature(feature.id)}
                        >
                            {feature.name}
                        </Badge>
                    ))}
                    {features.length === 0 && (
                        <span className="text-sm text-muted-foreground">Brak dostępnych udogodnień</span>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <PageHeader
                title="Kategorie pokoi"
                description="Zarządzaj kategoriami pokoi hotelowych"
                onAdd={() => {
                    resetForm();
                    setCreateDialogOpen(true);
                }}
                addLabel="Dodaj kategorię"
                onRefresh={fetchData}
                isLoading={isLoading}
            />

            <DataTable
                data={categories}
                columns={columns}
                actions={actions}
                isLoading={isLoading}
                emptyMessage="Brak kategorii"
                getRowKey={(cat) => cat.id}
            />

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Dodaj kategorię</DialogTitle>
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
                        <DialogTitle>Edytuj kategorię</DialogTitle>
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
                description={`Czy na pewno chcesz usunąć kategorię "${selectedCategory?.name}"? Ta akcja jest nieodwracalna.`}
            />
        </div>
    );
}
