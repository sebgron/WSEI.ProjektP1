'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { accessConfigsAPI, AccessConfiguration } from '@/lib/admin-api';
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
import { Plus, Trash2 } from 'lucide-react';

export default function AccessConfigsPage() {
    const [configs, setConfigs] = useState<AccessConfiguration[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Dialog states
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedConfig, setSelectedConfig] = useState<AccessConfiguration | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        generalInstructions: '',
        entranceCodes: [] as { label: string; code: string }[],
    });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await accessConfigsAPI.findAll();
            setConfigs(data);
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
            await accessConfigsAPI.create({
                name: formData.name,
                generalInstructions: formData.generalInstructions || undefined,
                entranceCodes: formData.entranceCodes.length > 0 ? formData.entranceCodes : undefined,
            });
            toast.success('Konfiguracja została utworzona');
            setCreateDialogOpen(false);
            resetForm();
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas tworzenia konfiguracji');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!selectedConfig) return;
        setIsSubmitting(true);
        try {
            await accessConfigsAPI.update(selectedConfig.id, {
                name: formData.name,
                generalInstructions: formData.generalInstructions,
                entranceCodes: formData.entranceCodes,
            });
            toast.success('Konfiguracja została zaktualizowana');
            setEditDialogOpen(false);
            resetForm();
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas aktualizacji konfiguracji');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedConfig) return;
        setIsSubmitting(true);
        try {
            await accessConfigsAPI.delete(selectedConfig.id);
            toast.success('Konfiguracja została usunięta');
            setDeleteDialogOpen(false);
            setSelectedConfig(null);
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas usuwania konfiguracji');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            generalInstructions: '',
            entranceCodes: [],
        });
        setSelectedConfig(null);
    };

    const openEditDialog = (config: AccessConfiguration) => {
        setSelectedConfig(config);
        setFormData({
            name: config.name,
            generalInstructions: config.generalInstructions || '',
            entranceCodes: config.entranceCodes || [],
        });
        setEditDialogOpen(true);
    };

    const openDeleteDialog = (config: AccessConfiguration) => {
        setSelectedConfig(config);
        setDeleteDialogOpen(true);
    };

    const addCode = () => {
        setFormData((prev) => ({
            ...prev,
            entranceCodes: [...prev.entranceCodes, { label: '', code: '' }],
        }));
    };

    const removeCode = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            entranceCodes: prev.entranceCodes.filter((_, i) => i !== index),
        }));
    };

    const updateCode = (index: number, field: 'label' | 'code', value: string) => {
        setFormData((prev) => ({
            ...prev,
            entranceCodes: prev.entranceCodes.map((c, i) =>
                i === index ? { ...c, [field]: value } : c
            ),
        }));
    };

    const columns: Column<AccessConfiguration>[] = [
        {
            key: 'name',
            header: 'Nazwa',
        },
        {
            key: 'codes',
            header: 'Liczba kodów',
            render: (config) => (
                <Badge variant="outline">{config.entranceCodes?.length || 0}</Badge>
            ),
        },
        {
            key: 'generalInstructions',
            header: 'Instrukcje',
            render: (config) =>
                config.generalInstructions
                    ? config.generalInstructions.substring(0, 50) + (config.generalInstructions.length > 50 ? '...' : '')
                    : '-',
        },
    ];

    const actions: Action<AccessConfiguration>[] = [
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
                <Label htmlFor="generalInstructions">Instrukcje ogólne</Label>
                <Input
                    id="generalInstructions"
                    value={formData.generalInstructions}
                    onChange={(e) => setFormData({ ...formData, generalInstructions: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label>Kody dostępu</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addCode}>
                        <Plus className="h-4 w-4 mr-1" />
                        Dodaj kod
                    </Button>
                </div>
                <div className="space-y-2">
                    {formData.entranceCodes.map((code, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Input
                                placeholder="Etykieta"
                                value={code.label}
                                onChange={(e) => updateCode(index, 'label', e.target.value)}
                                className="flex-1"
                            />
                            <Input
                                placeholder="Kod"
                                value={code.code}
                                onChange={(e) => updateCode(index, 'code', e.target.value)}
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeCode(index)}
                            >
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                    {formData.entranceCodes.length === 0 && (
                        <p className="text-sm text-muted-foreground">Brak kodów dostępu</p>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <PageHeader
                title="Konfiguracje dostępu"
                description="Zarządzaj konfiguracjami dostępu do pokoi"
                onAdd={() => {
                    resetForm();
                    setCreateDialogOpen(true);
                }}
                addLabel="Dodaj konfigurację"
                onRefresh={fetchData}
                isLoading={isLoading}
            />

            <DataTable
                data={configs}
                columns={columns}
                actions={actions}
                isLoading={isLoading}
                emptyMessage="Brak konfiguracji"
                getRowKey={(config) => config.id}
            />

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Dodaj konfigurację</DialogTitle>
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
                        <DialogTitle>Edytuj konfigurację</DialogTitle>
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
                description={`Czy na pewno chcesz usunąć konfigurację "${selectedConfig?.name}"? Ta akcja jest nieodwracalna.`}
            />
        </div>
    );
}
