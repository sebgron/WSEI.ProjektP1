'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    SystemConfigDto,
    SystemConfigKey,
    UpdateSystemConfigDto,
    SystemConfigType
} from '@turborepo/shared';
import { systemConfigsAPI } from '@/lib/admin-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Loader2, Save, Clock, Settings2 } from 'lucide-react';

export default function ConfigurationPage() {
    const [configs, setConfigs] = useState<SystemConfigDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<Record<string, boolean>>({});

    // Local state for edits
    const [edits, setEdits] = useState<Record<string, string>>({});

    const fetchConfigs = async () => {
        try {
            const data = await systemConfigsAPI.findAll();
            setConfigs(data);
            // Initialize edits with current values
            const initialEdits: Record<string, string> = {};
            data.forEach(c => {
                initialEdits[c.key] = c.value;
            });
            setEdits(initialEdits);
        } catch (error) {
            console.error(error);
            toast.error('Nie udało się pobrać konfiguracji');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfigs();
    }, []);

    const handleSave = async (key: SystemConfigKey) => {
        const newValue = edits[key];
        if (!newValue) return;

        setSaving(prev => ({ ...prev, [key]: true }));
        try {
            await systemConfigsAPI.update(key, { value: newValue });
            toast.success('Zapisano zmiany');
            // Update local config list to reflect saved state as "current"
            setConfigs(prev => prev.map(c => c.key === key ? { ...c, value: newValue } : c));
        } catch (error) {
            console.error(error);
            toast.error('Błąd podczas zapisywania');
        } finally {
            setSaving(prev => ({ ...prev, [key]: false }));
        }
    };

    const handleReset = (key: SystemConfigKey) => {
        const original = configs.find(c => c.key === key);
        if (original) {
            setEdits(prev => ({ ...prev, [key]: original.value }));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // Group configs if needed, for now just list them
    // Sort specific keys first
    const sortedConfigs = [...configs].sort((a, b) => {
        const priority = [
            SystemConfigKey.CHECK_IN_TIME,
            SystemConfigKey.CHECK_OUT_TIME,
            SystemConfigKey.TASK_GENERATION_TIME
        ];
        const idxA = priority.indexOf(a.key);
        const idxB = priority.indexOf(b.key);

        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.key.localeCompare(b.key);
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Settings2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Konfiguracja Systemu</h1>
                    <p className="text-muted-foreground">
                        Zarządzaj globalnymi ustawieniami hotelu
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sortedConfigs.map((config) => (
                    <Card key={config.key}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                {config.type === SystemConfigType.TIME && <Clock className="w-4 h-4 text-muted-foreground" />}
                                {config.key === SystemConfigKey.CHECK_IN_TIME && 'Godzina Zameldowania'}
                                {config.key === SystemConfigKey.CHECK_OUT_TIME && 'Godzina Wymeldowania'}
                                {config.key === SystemConfigKey.TASK_GENERATION_TIME && 'Generowanie Zadań'}
                                {config.key === SystemConfigKey.ACCESS_CODE_GRACE_PERIOD_MINUTES && 'Karencja Kodów Dostępu'}
                                {!Object.values(SystemConfigKey).includes(config.key as SystemConfigKey) && config.key}
                            </CardTitle>
                            <CardDescription>
                                {config.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor={config.key}>Wartość {config.type === SystemConfigType.NUMBER && '(minuty)'}</Label>
                                <Input
                                    id={config.key}
                                    type={config.type === SystemConfigType.TIME ? "time" : config.type === SystemConfigType.NUMBER ? "number" : "text"}
                                    value={edits[config.key] || ''}
                                    onChange={(e) => setEdits(prev => ({ ...prev, [config.key]: e.target.value }))}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t p-4 bg-muted/20">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReset(config.key)}
                                disabled={edits[config.key] === config.value}
                            >
                                Anuluj
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => handleSave(config.key)}
                                disabled={saving[config.key] || edits[config.key] === config.value}
                            >
                                {saving[config.key] ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <Save className="w-4 h-4 mr-2" />
                                )}
                                Zapisz
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
