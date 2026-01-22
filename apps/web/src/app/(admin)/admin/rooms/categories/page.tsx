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

const AVAILABLE_IMAGES = [
    { name: 'Standard', path: '/images/rooms/standard.png' },
    { name: 'Deluxe', path: '/images/rooms/deluxe.png' },
    { name: 'Suite', path: '/images/rooms/suite.png' },
];

interface FormContentProps {
    formData: {
        name: string;
        description: string;
        pricePerNight: string;
        capacity: string;
        imagePath: string;
        featureIds: number[];
    };
    setFormData: (data: any) => void;
    features: RoomFeature[];
    toggleFeature: (id: number) => void;
}

const FormContent = ({ formData, setFormData, features, toggleFeature }: FormContentProps) => (
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
        <div className="space-y-2">
            <Label>Zdjęcie</Label>
            <div className="grid grid-cols-3 gap-4 mt-2">
                {AVAILABLE_IMAGES.map((img) => (
                    <div
                        key={img.path}
                        className={`
                            relative aspect-video cursor-pointer rounded-lg overflow-hidden border-2 transition-all
                            ${formData.imagePath === img.path ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/50'}
                        `}
                        onClick={() => setFormData({ ...formData, imagePath: img.path })}
                    >
                        <img
                            src={img.path}
                            alt={img.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-white font-medium text-sm">{img.name}</span>
                        </div>
                        {formData.imagePath === img.path && (
                            <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1 shadow-lg">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {/* Optional: Allow clearing selection */}
            {formData.imagePath && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({ ...formData, imagePath: '' })}
                    className="h-8 text-xs mt-1 text-muted-foreground"
                >
                    Wyczyść wybór
                </Button>
            )}
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="pricePerNight">Cena bazowa (zł)</Label>
                <Input
                    id="pricePerNight"
                    type="number"
                    step="0.01"
                    value={formData.pricePerNight}
                    onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="capacity">Maks. liczba osób</Label>
                <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
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
        pricePerNight: '',
        capacity: '',
        imagePath: '',
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
                pricePerNight: parseFloat(formData.pricePerNight),
                capacity: parseInt(formData.capacity),
                imagePath: formData.imagePath || undefined,
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
                pricePerNight: parseFloat(formData.pricePerNight),
                capacity: parseInt(formData.capacity),
                imagePath: formData.imagePath,
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
            pricePerNight: '',
            capacity: '',
            imagePath: '',
            featureIds: [],
        });
        setSelectedCategory(null);
    };

    const openEditDialog = (category: RoomCategory) => {
        setSelectedCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            pricePerNight: category.pricePerNight != null ? category.pricePerNight.toString() : '',
            capacity: category.capacity != null ? category.capacity.toString() : '',
            imagePath: category.imagePath || '',
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
            key: 'pricePerNight',
            header: 'Cena bazowa',
            render: (cat) => cat.pricePerNight != null ? `${Number(cat.pricePerNight).toFixed(2)} zł` : '-',
        },
        {
            key: 'capacity',
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
                    <FormContent
                        formData={formData}
                        setFormData={setFormData}
                        features={features}
                        toggleFeature={toggleFeature}
                    />
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
                    <FormContent
                        formData={formData}
                        setFormData={setFormData}
                        features={features}
                        toggleFeature={toggleFeature}
                    />
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
