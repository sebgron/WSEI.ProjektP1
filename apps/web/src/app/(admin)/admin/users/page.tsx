'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { UserRole } from '@turborepo/shared';
import { usersAPI, User, translations } from '@/lib/admin-api';
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

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');

    // Dialog states
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        role: UserRole.USER as UserRole,
    });

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await usersAPI.findAll(filterRole === 'all' ? undefined : filterRole);
            setUsers(data);
        } catch (error) {
            toast.error('Błąd podczas ładowania użytkowników');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [filterRole]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleCreate = async () => {
        setIsSubmitting(true);
        try {
            await usersAPI.create(formData);
            toast.success('Użytkownik został utworzony');
            setCreateDialogOpen(false);
            resetForm();
            fetchUsers();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas tworzenia użytkownika');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!selectedUser) return;
        setIsSubmitting(true);
        try {
            const updateData: Record<string, unknown> = { ...formData };
            if (!formData.password) delete updateData.password;
            await usersAPI.update(selectedUser.id, updateData);
            toast.success('Użytkownik został zaktualizowany');
            setEditDialogOpen(false);
            resetForm();
            fetchUsers();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas aktualizacji użytkownika');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedUser) return;
        setIsSubmitting(true);
        try {
            await usersAPI.delete(selectedUser.id);
            toast.success('Użytkownik został usunięty');
            setDeleteDialogOpen(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas usuwania użytkownika');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
            role: UserRole.USER,
        });
        setSelectedUser(null);
    };

    const openEditDialog = (user: User) => {
        setSelectedUser(user);
        setFormData({
            email: user.email || '',
            password: '',
            firstName: user.guestProfile?.firstName || user.employeeProfile?.firstName || '',
            lastName: user.guestProfile?.lastName || user.employeeProfile?.lastName || '',
            phoneNumber: user.guestProfile?.phoneNumber || '',
            role: user.role,
        });
        setEditDialogOpen(true);
    };

    const openDeleteDialog = (user: User) => {
        setSelectedUser(user);
        setDeleteDialogOpen(true);
    };

    const getRoleBadgeVariant = (role: UserRole) => {
        switch (role) {
            case UserRole.ADMIN:
                return 'default';
            case UserRole.STAFF:
                return 'secondary';
            case UserRole.USER:
                return 'outline';
            default:
                return 'outline';
        }
    };

    const columns: Column<User>[] = [
        {
            key: 'email',
            header: 'Email / Nazwa użytkownika',
            render: (user) => user.email || user.username || '-',
        },
        {
            key: 'name',
            header: 'Imię i nazwisko',
            render: (user) => {
                const profile = user.guestProfile || user.employeeProfile;
                return profile ? `${profile.firstName} ${profile.lastName}` : '-';
            },
        },
        {
            key: 'role',
            header: 'Rola',
            render: (user) => (
                <Badge variant={getRoleBadgeVariant(user.role)}>
                    {translations.roles[user.role]}
                </Badge>
            ),
        },
        {
            key: 'createdAt',
            header: 'Data utworzenia',
            render: (user) => new Date(user.createdAt).toLocaleDateString('pl-PL'),
        },
    ];

    const actions: Action<User>[] = [
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
                title="Użytkownicy"
                description="Zarządzaj użytkownikami systemu"
                onAdd={() => {
                    resetForm();
                    setCreateDialogOpen(true);
                }}
                addLabel="Dodaj użytkownika"
                onRefresh={fetchUsers}
                isLoading={isLoading}
            >
                <Select
                    value={filterRole}
                    onValueChange={(value) => setFilterRole(value as UserRole | 'all')}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtruj po roli" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Wszystkie role</SelectItem>
                        <SelectItem value={UserRole.ADMIN}>Administrator</SelectItem>
                        <SelectItem value={UserRole.STAFF}>Pracownik</SelectItem>
                        <SelectItem value={UserRole.USER}>Użytkownik</SelectItem>
                    </SelectContent>
                </Select>
            </PageHeader>

            <DataTable
                data={users}
                columns={columns}
                actions={actions}
                isLoading={isLoading}
                emptyMessage="Brak użytkowników"
                getRowKey={(user) => user.id}
            />

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Dodaj użytkownika</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
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
                            <Label htmlFor="password">Hasło</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
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
                            <Label htmlFor="phoneNumber">Numer telefonu</Label>
                            <Input
                                id="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
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
                                    <SelectItem value={UserRole.USER}>Użytkownik</SelectItem>
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
                            {isSubmitting ? 'Tworzenie...' : 'Utwórz'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edytuj użytkownika</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                            <Label htmlFor="edit-role">Rola</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={UserRole.USER}>Użytkownik</SelectItem>
                                    <SelectItem value={UserRole.STAFF}>Pracownik</SelectItem>
                                    <SelectItem value={UserRole.ADMIN}>Administrator</SelectItem>
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
                description={`Czy na pewno chcesz usunąć użytkownika ${selectedUser?.email || selectedUser?.username}? Ta akcja jest nieodwracalna.`}
            />
        </div>
    );
}
