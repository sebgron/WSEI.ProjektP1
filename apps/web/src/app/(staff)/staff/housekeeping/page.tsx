'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { staffAPI } from '@/lib/staff-api';
import { IServiceTaskResponse, TaskStatus, TaskType } from '@turborepo/shared';
import { translations } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    CheckCircle2,
    Clock,
    Brush,
    Wrench,
    Package,
    Loader2,
    Calendar,
    ArrowRight
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function HousekeepingPage() {
    const [tasks, setTasks] = useState<IServiceTaskResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterType, setFilterType] = useState<string>('all');
    // Using Tabs for status: "active" (pending/progress) vs "completed" (done)
    const [activeTab, setActiveTab] = useState('active');

    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            const data = await staffAPI.getTasks();
            // Sort: High priority/Current first?
            // Actually API usually returns chronological. Let's sort Pending first.
            setTasks(data);
        } catch (error) {
            console.error(error);
            toast.error('Błąd podczas pobierania zadań');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
        try {
            await staffAPI.updateTaskStatus(taskId, newStatus);
            toast.success('Status zadania zaktualizowany');
            // Optimistic update or refetch
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        } catch (error) {
            console.error(error);
            toast.error('Nie udało się zmienić statusu');
        }
    };

    const getTaskIcon = (type: TaskType) => {
        switch (type) {
            case TaskType.CLEANING: return <Brush className="h-5 w-5" />;
            case TaskType.REPAIR: return <Wrench className="h-5 w-5" />;
            case TaskType.AMENITY_REFILL: return <Package className="h-5 w-5" />;
            default: return <Clock className="h-5 w-5" />;
        }
    };

    const getTaskColor = (type: TaskType) => {
        switch (type) {
            case TaskType.CLEANING: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
            case TaskType.REPAIR: return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
            case TaskType.AMENITY_REFILL: return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const filteredTasks = tasks.filter(task => {
        // Filter by type
        if (filterType !== 'all' && task.type !== filterType) return false;

        // Filter by status tab
        if (activeTab === 'active') {
            return task.status === TaskStatus.PENDING || task.status === TaskStatus.IN_PROGRESS;
        } else {
            return task.status === TaskStatus.DONE;
        }
    });

    const TaskCard = ({ task }: { task: IServiceTaskResponse }) => (
        <Card className="mb-4 overflow-hidden border transition-all hover:shadow-md">
            <CardHeader className="pb-3 pt-4 px-4 bg-muted/40 border-b flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border ${getTaskColor(task.type)}`}>
                        {getTaskIcon(task.type)}
                    </div>
                    <div>
                        <CardTitle className="text-base font-bold">
                            Pokój {task.room.number}
                        </CardTitle>
                        <CardDescription className="text-xs font-medium">
                            {translations.taskType[task.type]}
                        </CardDescription>
                    </div>
                </div>
                <Badge variant={
                    task.status === TaskStatus.PENDING ? 'outline' :
                        task.status === TaskStatus.IN_PROGRESS ? 'default' : 'secondary'
                } className="rounded-full">
                    {translations.taskStatus[task.status]}
                </Badge>
            </CardHeader>
            <CardContent className="p-4">
                {task.description && (
                    <div className="mb-4 text-sm bg-muted/50 p-3 rounded-md italic">
                        &quot;{task.description}&quot;
                    </div>
                )}

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                        {new Date(task.createdAt).toLocaleDateString('pl-PL', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </CardContent>

            {task.status !== TaskStatus.DONE && (
                <CardFooter className="px-4 pb-4 pt-0">
                    {task.status === TaskStatus.PENDING && (
                        <Button
                            className="w-full group"
                            onClick={() => handleStatusChange(task.id, TaskStatus.IN_PROGRESS)}
                        >
                            Rozpocznij zadanie
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    )}
                    {task.status === TaskStatus.IN_PROGRESS && (
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm shadow-green-200 dark:shadow-none"
                            onClick={() => handleStatusChange(task.id, TaskStatus.DONE)}
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Oznacz jako gotowe
                        </Button>
                    )}
                </CardFooter>
            )}
        </Card>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">Lista Zadań</h1>
                <p className="text-muted-foreground text-sm">Przeglądaj i zarządzaj zgłoszeniami</p>
            </div>

            <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
                    <TabsList className="grid w-full sm:w-auto grid-cols-2 h-11 p-1">
                        <TabsTrigger value="active" className="text-sm">Do zrobienia</TabsTrigger>
                        <TabsTrigger value="done" className="text-sm">Ukończone</TabsTrigger>
                    </TabsList>

                    <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-full sm:w-[180px] h-11">
                            <SelectValue placeholder="Wszystkie typy" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Wszystkie typy</SelectItem>
                            <SelectItem value={TaskType.CLEANING}>Sprzątanie</SelectItem>
                            <SelectItem value={TaskType.REPAIR}>Naprawy</SelectItem>
                            <SelectItem value={TaskType.AMENITY_REFILL}>Uposażenie</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <TabsContent value="active" className="space-y-4 data-[state=inactive]:hidden focus-visible:outline-none">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p>Ładowanie zadań...</p>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map(task => (
                                    <TaskCard key={task.id} task={task} />
                                ))
                            ) : (
                                <div className="text-center py-16 px-4 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/10">
                                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="w-8 h-8 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-1">Brak aktywnych zadań</h3>
                                    <p className="text-sm max-w-xs mx-auto">Wszystkie zgłoszenia zostały obsłużone. Czas na przerwę!</p>
                                </div>
                            )}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="done" className="space-y-4 data-[state=inactive]:hidden focus-visible:outline-none">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map(task => (
                                    <TaskCard key={task.id} task={task} />
                                ))
                            ) : (
                                <div className="text-center py-16 text-muted-foreground border border-dashed rounded-xl">
                                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>Historia zadań jest pusta</p>
                                </div>
                            )}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
