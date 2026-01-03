'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { UserRole } from '@turborepo/shared';
import { staffAPI, EmployeeProfile, translations } from '@/lib/admin-api';
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

export default function StaffPage() {
    const [staff, setStaff] = useState<EmployeeProfile[]>([]);
    const [positions, setPositions] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterPosition, setFilterPosition] = useState<string>('all');

    // Dialog states
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeProfile | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        position: '',
        username: '',
        password: '',
        role: UserRole.STAFF as UserRole,
    });

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [staffData, positionsData] = await Promise.all([
                staffAPI.findAll(filterPosition === 'all' ? undefined : filterPosition),
                staffAPI.getPositions(),
            ]);
            setStaff(staffData);
            setPositions(positionsData);
        } catch (error) {
            toast.error('Błąd podczas ładowania danych');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [filterPosition]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreate = async () => {
        setIsSubmitting(true);
        try {
            await staffAPI.create(formData);
            toast.success('Pracownik został dodany');
            setCreateDialogOpen(false);
            resetForm();
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas dodawania pracownika');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!selectedEmployee) return;
        setIsSubmitting(true);
        try {
            const updateData: Record<string, unknown> = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                position: formData.position,
            };
            if (formData.password) {
                updateData.password = formData.password;
            }
            await staffAPI.update(selectedEmployee.id, updateData);
            toast.success('Pracownik został zaktualizowany');
            setEditDialogOpen(false);
            resetForm();
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas aktualizacji pracownika');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedEmployee) return;
        setIsSubmitting(true);
        try {
            await staffAPI.delete(selectedEmployee.id);
            toast.success('Pracownik został usunięty');
            setDeleteDialogOpen(false);
            setSelectedEmployee(null);
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas usuwania pracownika');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            position: '',
            username: '',
            password: '',
            role: UserRole.STAFF,
        });
        setSelectedEmployee(null);
    };

    const openEditDialog = (employee: EmployeeProfile) => {
        setSelectedEmployee(employee);
        setFormData({
            firstName: employee.firstName,
            lastName: employee.lastName,
            position: employee.position,
            username: '',
            password: '',
            role: employee.user?.role || UserRole.STAFF,
        });
        setEditDialogOpen(true);
    };

    const openDeleteDialog = (employee: EmployeeProfile) => {
        setSelectedEmployee(employee);
        setDeleteDialogOpen(true);
    };

    const columns: Column<EmployeeProfile>[] = [
        {
            key: 'name',
            header: 'Imię i nazwisko',
            render: (emp) => `${emp.firstName} ${emp.lastName}`,
        },
        {
            key: 'position',
            header: 'Stanowisko',
        },
        {
            key: 'username',
            header: 'Nazwa użytkownika',
            render: (emp) => emp.user?.username || '-',
        },
        {
            key: 'role',
            header: 'Rola',
            render: (emp) => (
                <Badge variant={emp.user?.role === UserRole.ADMIN ? 'default' : 'secondary'}>
                    {emp.user?.role ? translations.roles[emp.user.role] : '-'}
                </Badge>
            ),
        },
    ];

    const actions: Action<EmployeeProfile>[] = [
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
                title="Personel"
                description="Zarządzaj pracownikami hotelu"
                onAdd={() => {
                    resetForm();
                    setCreateDialogOpen(true);
                }}
                addLabel="Dodaj pracownika"
                onRefresh={fetchData}
                isLoading={isLoading}
            >
                <Select
                    value={filterPosition}
                    onValueChange={setFilterPosition}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Stanowisko" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Wszystkie stanowiska</SelectItem>
                        {positions.map((pos) => (
                            <SelectItem key={pos} value={pos}>
                                {pos}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </PageHeader>

            <DataTable
                data={staff}
                columns={columns}
                actions={actions}
                isLoading={isLoading}
                emptyMessage="Brak pracowników"
                getRowKey={(emp) => emp.id}
            />

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Dodaj pracownika</DialogTitle>
                    </DialogHeader>
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
                            <Label htmlFor="position">Stanowisko</Label>
                            <Input
                                id="position"
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                placeholder="np. Recepcjonista, Sprzątaczka"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Nazwa użytkownika</Label>
                            <Input
                                id="username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Hasło</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="role">Rola</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={UserRole.STAFF}>Pracownik</SelectItem>
                                    <SelectItem value={UserRole.ADMIN}>Administrator</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                            Anuluj
                        </Button>
                        <Button onClick={handleCreate} disabled={isSubmitting}>
                            {isSubmitting ? 'Dodawanie...' : 'Dodaj'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edytuj pracownika</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-firstName">Imię</Label>
                                <Input
                                    id="edit-firstName"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-lastName">Nazwisko</Label>
                                <Input
                                    id="edit-lastName"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-position">Stanowisko</Label>
                            <Input
                                id="edit-position"
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-password">Nowe hasło (pozostaw puste aby nie zmieniać)</Label>
                            <Input
                                id="edit-password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
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
                description={`Czy na pewno chcesz usunąć pracownika ${selectedEmployee?.firstName} ${selectedEmployee?.lastName}? Ta akcja jest nieodwracalna.`}
            />
        </div>
    );
}
