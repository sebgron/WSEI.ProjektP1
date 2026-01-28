'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { staffAPI } from '@/lib/staff-api';
import { IServiceTaskResponse, TaskStatus, TaskType, IRoomAccessCodesResponse } from '@turborepo/shared';
import { translations } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';

import { useInterval } from '@/hooks/use-interval';
import {
    Card,
    CardContent
} from '@/components/ui/card';
import {
    CheckCircle2,
    Clock,
    Brush,
    Wrench,
    Package,
    Loader2,
    Play,
    CalendarDays,
    CalendarClock,
    Calendar,
    KeyRound
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';

export default function HousekeepingPage() {
    const [tasks, setTasks] = useState<IServiceTaskResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dateFilter, setDateFilter] = useState<'today' | 'tomorrow' | 'later'>('today');

    const fetchTasks = async (showLoading = true) => {
        if (showLoading) setIsLoading(true);
        try {
            const data = await staffAPI.getTasks();
            setTasks(data);
        } catch (error) {
            console.error(error);
            // Don't show toast on background refresh failure to avoid spamming
            if (showLoading) toast.error('Błąd podczas pobierania zadań');
        } finally {
            if (showLoading) setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    // Poll for updates every 5 seconds
    useInterval(() => {
        fetchTasks(false);
    }, 5000);

    const [showDoorCodeDialog, setShowDoorCodeDialog] = useState(false);
    const [accessCodes, setAccessCodes] = useState<IRoomAccessCodesResponse | null>(null);
    const [showAccessCodesDialog, setShowAccessCodesDialog] = useState(false);
    const [loadingCodes, setLoadingCodes] = useState(false);

    const [completingTask, setCompletingTask] = useState<IServiceTaskResponse | null>(null);
    const [newDoorCode, setNewDoorCode] = useState('');

    const generateDoorCode = () => {
        // Generate random 4 digit code
        return Math.floor(1000 + Math.random() * 9000).toString() + '#';
    };

    const fetchAccessCodes = async (roomId: number) => {
        setLoadingCodes(true);
        try {
            const data = await staffAPI.getRoomAccessCodes(roomId);
            setAccessCodes(data);
            setShowAccessCodesDialog(true);
        } catch (error) {
            console.error(error);
            // toast.error('Nie udało się pobrać kodów');
        } finally {
            setLoadingCodes(false);
        }
    };

    const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        // If CHECKOUT cleaning task is being completed, show dialog for new code
        if (newStatus === TaskStatus.DONE && task.type === TaskType.CHECKOUT) {
            setCompletingTask(task);
            setNewDoorCode(generateDoorCode());
            setShowDoorCodeDialog(true);
            return;
        }

        await updateTaskStatus(taskId, newStatus);
    };

    const confirmCompletion = async () => {
        if (!completingTask) return;

        try {
            await staffAPI.updateTask(completingTask.id, {
                status: TaskStatus.DONE,
                newDoorCode,
                type: completingTask.type,
                description: completingTask.description || '',
            });

            toast.success('Zadanie ukończone i kod do drzwi zaktualizowany!');
            setTasks(prev => prev.map(t => t.id === completingTask.id ? { ...t, status: TaskStatus.DONE } : t));
            setShowDoorCodeDialog(false);
            setCompletingTask(null);
        } catch (error) {
            console.error(error);
            toast.error('Nie udało się zakończyć zadania');
        }
    };

    const updateTaskStatus = async (taskId: number, newStatus: TaskStatus) => {
        try {
            await staffAPI.updateTaskStatus(taskId, newStatus);
            toast.success(newStatus === TaskStatus.DONE ? 'Zadanie ukończone!' : 'Rozpoczęto zadanie');
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        } catch (error) {
            console.error(error);
            toast.error('Nie udało się zmienić statusu');
        }
    };

    const getTaskDate = (task: IServiceTaskResponse): string => {
        return task.scheduledDate || task.createdAt;
    };

    const isToday = (date: string) => {
        const d = new Date(date);
        const today = new Date();
        return d.toDateString() === today.toDateString();
    };

    const isTomorrow = (date: string) => {
        const d = new Date(date);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return d.toDateString() === tomorrow.toDateString();
    };

    const currentTask = tasks.find(t => t.status === TaskStatus.IN_PROGRESS);
    const pendingTasks = tasks.filter(t => t.status === TaskStatus.PENDING);

    const filteredTasks = pendingTasks.filter(task => {
        const taskDate = getTaskDate(task);
        if (dateFilter === 'today') return isToday(taskDate);
        if (dateFilter === 'tomorrow') return isTomorrow(taskDate);
        return !isToday(taskDate) && !isTomorrow(taskDate);
    });

    const getTaskIcon = (type: TaskType) => {
        switch (type) {
            case TaskType.CLEANING: return <Brush className="h-4 w-4" />;
            case TaskType.CHECKOUT: return <CheckCircle2 className="h-4 w-4" />;
            case TaskType.REPAIR: return <Wrench className="h-4 w-4" />;
            case TaskType.AMENITY_REFILL: return <Package className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    const getTaskBg = (type: TaskType) => {
        switch (type) {
            case TaskType.CLEANING: return 'bg-blue-500';
            case TaskType.CHECKOUT: return 'bg-purple-600';
            case TaskType.REPAIR: return 'bg-orange-500';
            case TaskType.AMENITY_REFILL: return 'bg-emerald-500';
            default: return 'bg-gray-500';
        }
    };

    const todayCount = pendingTasks.filter(t => isToday(t.createdAt)).length;
    const tomorrowCount = pendingTasks.filter(t => isTomorrow(t.createdAt)).length;
    const laterCount = pendingTasks.filter(t => !isToday(t.createdAt) && !isTomorrow(t.createdAt)).length;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm">Ładowanie zadań...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Current Task - Hero Section */}
            {currentTask ? (
                <Card className="border-2 border-primary bg-primary/5">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-xs font-medium text-primary mb-3">
                            <Play className="w-3 h-3 fill-current" />
                            AKTUALNIE WYKONUJESZ
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl ${getTaskBg(currentTask.type)} text-white flex items-center justify-center`}>
                                    {getTaskIcon(currentTask.type)}
                                </div>
                                <div>
                                    <p className="font-bold text-lg">Pokój {currentTask.room.number}</p>
                                    <p className="text-sm text-muted-foreground">{translations.taskType[currentTask.type]}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => fetchAccessCodes(currentTask.room.id)}
                                disabled={loadingCodes}
                            >
                                {loadingCodes ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <KeyRound className="w-4 h-4 mr-2" />}
                                Kody
                            </Button>
                            <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleStatusChange(currentTask.id, TaskStatus.DONE)}
                            >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Gotowe
                            </Button>
                        </div>
                        {currentTask.description && (
                            <p className="mt-3 text-sm text-muted-foreground bg-background/50 p-2 rounded">
                                {currentTask.description}
                            </p>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="text-center py-6 px-4 rounded-xl bg-muted/30 border border-dashed">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p className="text-sm font-medium">Brak aktywnego zadania</p>
                    <p className="text-xs text-muted-foreground">Wybierz zadanie z listy poniżej</p>
                </div>
            )}

            {/* Date Filter Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setDateFilter('today')}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${dateFilter === 'today'
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'bg-muted hover:bg-muted/80'
                        }`}
                >
                    <CalendarDays className="w-4 h-4" />
                    Dziś
                    {todayCount > 0 && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${dateFilter === 'today' ? 'bg-primary-foreground/20' : 'bg-primary/10 text-primary'
                            }`}>
                            {todayCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setDateFilter('tomorrow')}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${dateFilter === 'tomorrow'
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'bg-muted hover:bg-muted/80'
                        }`}
                >
                    <CalendarClock className="w-4 h-4" />
                    Jutro
                    {tomorrowCount > 0 && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${dateFilter === 'tomorrow' ? 'bg-primary-foreground/20' : 'bg-primary/10 text-primary'
                            }`}>
                            {tomorrowCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setDateFilter('later')}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${dateFilter === 'later'
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'bg-muted hover:bg-muted/80'
                        }`}
                >
                    <Calendar className="w-4 h-4" />
                    Później
                    {laterCount > 0 && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${dateFilter === 'later' ? 'bg-primary-foreground/20' : 'bg-primary/10 text-primary'
                            }`}>
                            {laterCount}
                        </span>
                    )}
                </button>
            </div>

            <div className="space-y-3">
                {filteredTasks.length > 0 ? (
                    filteredTasks.map(task => (
                        <Card key={task.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardContent className="p-0">
                                <div className="flex items-center">
                                    {/* Color bar */}
                                    <div className={`w-1.5 self-stretch ${getTaskBg(task.type)}`} />

                                    <div className="flex-1 p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="text-center">
                                                <p className="text-2xl font-bold">{task.room.number}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Pokój</p>
                                            </div>
                                            <div className="h-8 w-px bg-border" />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    {getTaskIcon(task.type)}
                                                    <span className="text-sm font-medium">{translations.taskType[task.type]}</span>
                                                </div>
                                                {task.description && (
                                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-[180px]">
                                                        {task.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleStatusChange(task.id, TaskStatus.IN_PROGRESS)}
                                            disabled={!!currentTask}
                                        >
                                            <Play className="w-3 h-3 mr-1" />
                                            Start
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" />
                        <p className="font-medium">Brak zadań {dateFilter === 'today' ? 'na dziś' : dateFilter === 'tomorrow' ? 'na jutro' : 'zaplanowanych'}</p>
                        <p className="text-sm mt-1">Sprawdź inne dni</p>
                    </div>
                )}
            </div>

            {/* Completed Today Summary */}
            {tasks.filter(t => t.status === TaskStatus.DONE && isToday(t.createdAt)).length > 0 && (
                <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Ukończone dziś: {tasks.filter(t => t.status === TaskStatus.DONE && isToday(t.createdAt)).length}
                    </p>
                </div>
            )}

            {/* Door Code Rotation Dialog */}
            {showDoorCodeDialog && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md shadow-2xl">
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-3 text-green-600">
                                <CheckCircle2 className="w-6 h-6" />
                                <h3 className="font-semibold text-lg text-foreground">Sprzątanie zakończone</h3>
                            </div>

                            <p className="text-sm text-muted-foreground">
                                Ponieważ pokój był zajęty, zalecana jest zmiana kodu do drzwi dla bezpieczeństwa.
                            </p>

                            <div className="bg-muted p-4 rounded-lg space-y-2">
                                <label className="text-xs font-medium text-muted-foreground block">
                                    Nowy kod dostępu (wygenerowany losowo)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newDoorCode}
                                        onChange={(e) => setNewDoorCode(e.target.value)}
                                        className="flex-1 min-w-0 text-xl font-mono font-bold bg-background border rounded px-3 py-2 text-center tracking-wider"
                                    />
                                    <Button variant="outline" size="icon" onClick={() => setNewDoorCode(generateDoorCode())}>
                                        <Clock className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button className="flex-1" onClick={confirmCompletion}>
                                    Zatwierdź i zakończ
                                </Button>
                                <Button variant="outline" onClick={() => {
                                    setShowDoorCodeDialog(false);
                                    setCompletingTask(null);
                                }}>
                                    Anuluj
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Access Codes Info Dialog */}
            <Dialog open={showAccessCodesDialog} onOpenChange={setShowAccessCodesDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <KeyRound className="w-5 h-5" />
                            Kody dostępu - Pokój {currentTask?.room.number}
                        </DialogTitle>
                    </DialogHeader>

                    {accessCodes && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                {accessCodes.doorCode && (
                                    <div className="bg-muted p-3 rounded-lg text-center space-y-1">
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Drzwi</span>
                                        <p className="font-mono font-bold text-2xl">{accessCodes.doorCode}</p>
                                    </div>
                                )}
                                {accessCodes.keyBoxCode && (
                                    <div className="bg-muted p-3 rounded-lg text-center space-y-1">
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Sejf</span>
                                        <p className="font-mono font-bold text-2xl">{accessCodes.keyBoxCode}</p>
                                    </div>
                                )}
                            </div>

                            {/* Entrance Codes */}
                            {accessCodes.entranceCodes && accessCodes.entranceCodes.length > 0 && (
                                <div className="space-y-2 pt-2 border-t">
                                    <span className="text-sm font-medium">Wejście główne / Inne</span>
                                    <div className="grid grid-cols-2 gap-2">
                                        {accessCodes.entranceCodes.map((ec: any, idx: number) => (
                                            <div key={idx} className="bg-muted/50 p-2 rounded flex flex-col">
                                                <span className="text-xs text-muted-foreground truncate">{ec.label}</span>
                                                <span className="font-mono font-bold">{ec.code}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {accessCodes.generalInstructions && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex gap-2 text-sm text-blue-700 dark:text-blue-300">
                                    <div className="shrink-0 mt-0.5">ℹ️</div>
                                    <p className="text-xs leading-relaxed">{accessCodes.generalInstructions}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button onClick={() => setShowAccessCodesDialog(false)}>Zamknij</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
