'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';

interface PageHeaderProps {
    title: string;
    description?: string;
    onAdd?: () => void;
    addLabel?: string;
    onRefresh?: () => void;
    isLoading?: boolean;
    children?: React.ReactNode;
}

export function PageHeader({
    title,
    description,
    onAdd,
    addLabel = 'Dodaj nowy',
    onRefresh,
    isLoading = false,
    children,
}: PageHeaderProps) {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                {description && (
                    <p className="text-muted-foreground mt-1">{description}</p>
                )}
            </div>
            <div className="flex items-center gap-2">
                {children}
                {onRefresh && (
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={onRefresh}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                )}
                {onAdd && (
                    <Button onClick={onAdd}>
                        <Plus className="h-4 w-4 mr-2" />
                        {addLabel}
                    </Button>
                )}
            </div>
        </div>
    );
}
