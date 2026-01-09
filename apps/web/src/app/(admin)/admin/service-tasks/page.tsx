'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { TaskStatus, TaskType } from '@turborepo/shared';
import { serviceTasksAPI, roomsAPI, staffAPI, ServiceTask, Room, EmployeeProfile, translations } from '@/lib/admin-api';
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

export default function ServiceTasksPage() {
    const [tasks, setTasks] = useState<ServiceTask[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [staff, setStaff] = useState<EmployeeProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
    const [filterType, setFilterType] = useState<TaskType | 'all'>('all');

    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

    const [selectedTask, setSelectedTask] = useState<ServiceTask | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        roomId: '',
        type: TaskType.CLEANING as TaskType,
        description: '',
        status: TaskStatus.PENDING as TaskStatus,
    });
    const [newStatus, setNewStatus] = useState<TaskStatus>(TaskStatus.PENDING);
    const [assignToId, setAssignToId] = useState('');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [tasksData, roomsData, staffData] = await Promise.all([
                serviceTasksAPI.findAll({
                    status: filterStatus === 'all' ? undefined : filterStatus,
                    type: filterType === 'all' ? undefined : filterType,
                }),
                roomsAPI.findAll(),
                staffAPI.findAll(),
            ]);
            setTasks(tasksData);
            setRooms(roomsData);
            setStaff(staffData);
        } catch (error) {
            toast.error('Błąd podczas ładowania danych');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [filterStatus, filterType]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreate = async () => {
        setIsSubmitting(true);
        try {
            await serviceTasksAPI.create({
                roomId: parseInt(formData.roomId),
                type: formData.type,
                description: formData.description || undefined,
                status: formData.status,
            });
            toast.success('Zadanie zostało utworzone');
            setCreateDialogOpen(false);
            resetForm();
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas tworzenia zadania');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdate = async () => {
        if (!selectedTask) return;
        setIsSubmitting(true);
        try {
            await serviceTasksAPI.update(selectedTask.id, {
                type: formData.type,
                description: formData.description,
                status: formData.status,
            });
            toast.success('Zadanie zostało zaktualizowane');
            setEditDialogOpen(false);
            resetForm();
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas aktualizacji zadania');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusChange = async () => {
        if (!selectedTask) return;
        setIsSubmitting(true);
        try {
            await serviceTasksAPI.updateStatus(selectedTask.id, newStatus);
            toast.success('Status zadania został zmieniony');
            setStatusDialogOpen(false);
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas zmiany statusu');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedTask || !assignToId) return;
        setIsSubmitting(true);
        try {
            // Get user id from employee profile
            const employee = staff.find(e => e.id === assignToId);
            if (!employee?.user) {
                toast.error('Nie można znaleźć użytkownika');
                return;
            }
            await serviceTasksAPI.assignWorker(selectedTask.id, employee.user.id);
            toast.success('Zadanie zostało przypisane');
            setAssignDialogOpen(false);
            setAssignToId('');
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas przypisywania zadania');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedTask) return;
        setIsSubmitting(true);
        try {
            await serviceTasksAPI.delete(selectedTask.id);
            toast.success('Zadanie zostało usunięte');
            setDeleteDialogOpen(false);
            setSelectedTask(null);
            fetchData();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Błąd podczas usuwania zadania');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            roomId: '',
            type: TaskType.CLEANING,
            description: '',
            status: TaskStatus.PENDING,
        });
        setSelectedTask(null);
    };

    const openDetailsDialog = (task: ServiceTask) => {
        setSelectedTask(task);
        setDetailsDialogOpen(true);
    };

    const openEditDialog = (task: ServiceTask) => {
        setSelectedTask(task);
        setFormData({
            roomId: task.room.id.toString(),
            type: task.type,
            description: task.description || '',
            status: task.status,
        });
        setEditDialogOpen(true);
    };

    const openStatusDialog = (task: ServiceTask) => {
        setSelectedTask(task);
        setNewStatus(task.status);
        setStatusDialogOpen(true);
    };

    const openAssignDialog = (task: ServiceTask) => {
        setSelectedTask(task);
        setAssignToId(task.assignedTo?.id || '');
        setAssignDialogOpen(true);
    };

    const openDeleteDialog = (task: ServiceTask) => {
        setSelectedTask(task);
        setDeleteDialogOpen(true);
    };

    const getStatusBadgeVariant = (status: TaskStatus) => {
        switch (status) {
            case TaskStatus.DONE:
                return 'default';
            case TaskStatus.IN_PROGRESS:
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const columns: Column<ServiceTask>[] = [
        {
            key: 'id',
            header: 'ID',
        },
        {
            key: 'type',
            header: 'Typ',
            render: (task) => (
                <Badge variant="outline">{translations.taskType[task.type]}</Badge>
            ),
        },
        {
            key: 'room',
            header: 'Pokój',
            render: (task) => task.room.number,
        },
        {
            key: 'assignedTo',
            header: 'Pracownik', // REPLACED/RENAMED
            render: (task) => {
                if (task.status === TaskStatus.DONE && task.completedBy) {
                    return (
                        <div className="flex flex-col">
                            <span className="font-medium text-green-600">Zrealizował:</span>
                            <span>{task.completedBy.firstName} {task.completedBy.lastName}</span>
                        </div>
                    );
                }
                return task.assignedTo
                    ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                    : <span className="text-muted-foreground italic">Nieprzypisany</span>;
            },
        },
        {
            key: 'status',
            header: 'Status',
            render: (task) => (
                <Badge variant={getStatusBadgeVariant(task.status)}>
                    {translations.taskStatus[task.status]}
                </Badge>
            ),
        },
        {
            key: 'createdAt',
            header: 'Utworzono',
            render: (task) => new Date(task.createdAt).toLocaleDateString('pl-PL'),
        },
    ];

    const actions: Action<ServiceTask>[] = [
        {
            label: 'Szczegóły',
            onClick: openDetailsDialog,
        },
        {
            label: 'Edytuj',
            onClick: openEditDialog,
            separator: true,
        },
        {
            label: 'Zmień status',
            onClick: openStatusDialog,
        },
        {
            label: 'Przypisz',
            onClick: openAssignDialog,
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
                title="Zadania serwisowe"
                description="Zarządzaj zadaniami serwisowymi"
                onAdd={() => {
                    resetForm();
                    setCreateDialogOpen(true);
                }}
                addLabel="Dodaj zadanie"
                onRefresh={fetchData}
                isLoading={isLoading}
            >
                <Select
                    value={filterStatus}
                    onValueChange={(value) => setFilterStatus(value as TaskStatus | 'all')}
                >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Wszystkie</SelectItem>
                        {Object.values(TaskStatus).map((status) => (
                            <SelectItem key={status} value={status}>
                                {translations.taskStatus[status]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={filterType}
                    onValueChange={(value) => setFilterType(value as TaskType | 'all')}
                >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Typ" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Wszystkie</SelectItem>
                        {Object.values(TaskType).map((type) => (
                            <SelectItem key={type} value={type}>
                                {translations.taskType[type]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </PageHeader>

            <DataTable
                data={tasks}
                columns={columns}
                actions={actions}
                isLoading={isLoading}
                emptyMessage="Brak zadań"
                getRowKey={(task) => task.id}
            />

            {/* Details Dialog - NEW */}
            <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Szczegóły zadania #{selectedTask?.id}</DialogTitle>
                    </DialogHeader>
                    {selectedTask && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Typ zadania</Label>
                                    <div className="mt-1 font-medium">{translations.taskType[selectedTask.type]}</div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Status</Label>
                                    <div className="mt-1">
                                        <Badge variant={getStatusBadgeVariant(selectedTask.status)}>
                                            {translations.taskStatus[selectedTask.status]}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Pokój</Label>
                                    <div className="mt-1 font-medium">Nr {selectedTask.room.number}</div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Data zgłoszenia</Label>
                                    <div className="mt-1">{new Date(selectedTask.createdAt).toLocaleString('pl-PL')}</div>
                                </div>
                            </div>

                            <div>
                                <Label className="text-muted-foreground">Opis</Label>
                                <div className="mt-1 p-3 bg-muted/50 rounded-md text-sm">
                                    {selectedTask.description || <span className="italic text-muted-foreground">Brak opisu</span>}
                                </div>
                            </div>

                            <div className="border-t pt-4 grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Przypisano do</Label>
                                    <div className="mt-1">
                                        {selectedTask.assignedTo
                                            ? `${selectedTask.assignedTo.firstName} ${selectedTask.assignedTo.lastName}`
                                            : '-'}
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Zrealizowane przez</Label>
                                    <div className="mt-1 font-medium">
                                        {selectedTask.completedBy
                                            ? `${selectedTask.completedBy.firstName} ${selectedTask.completedBy.lastName}`
                                            : '-'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setDetailsDialogOpen(false)}>Zamknij</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Dodaj zadanie</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Pokój</Label>
                            <Select
                                value={formData.roomId}
                                onValueChange={(value) => setFormData({ ...formData, roomId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Wybierz pokój" />
                                </SelectTrigger>
                                <SelectContent>
                                    {rooms.map((room) => (
                                        <SelectItem key={room.id} value={room.id.toString()}>
                                            {room.number}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Typ</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setFormData({ ...formData, type: value as TaskType })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(TaskType).map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {translations.taskType[type]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Opis (opcjonalnie)</Label>
                            <Input
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
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
                        <DialogTitle>Edytuj zadanie</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Typ</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setFormData({ ...formData, type: value as TaskType })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(TaskType).map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {translations.taskType[type]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Opis</Label>
                            <Input
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value as TaskStatus })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(TaskStatus).map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {translations.taskStatus[status]}
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

            {/* Status Dialog */}
            <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Zmień status zadania</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>Nowy status</Label>
                        <Select
                            value={newStatus}
                            onValueChange={(value) => setNewStatus(value as TaskStatus)}
                        >
                            <SelectTrigger className="mt-2">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(TaskStatus).map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {translations.taskStatus[status]}
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

            {/* Assign Dialog */}
            <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Przypisz zadanie</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Label>Pracownik</Label>
                        <Select value={assignToId} onValueChange={setAssignToId}>
                            <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Wybierz pracownika" />
                            </SelectTrigger>
                            <SelectContent>
                                {staff.map((emp) => (
                                    <SelectItem key={emp.id} value={emp.id}>
                                        {emp.firstName} {emp.lastName} ({emp.position})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                            Anuluj
                        </Button>
                        <Button onClick={handleAssign} disabled={isSubmitting || !assignToId}>
                            {isSubmitting ? 'Przypisywanie...' : 'Przypisz'}
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
                description={`Czy na pewno chcesz usunąć zadanie #${selectedTask?.id}? Ta akcja jest nieodwracalna.`}
            />
        </div>
    );
}
