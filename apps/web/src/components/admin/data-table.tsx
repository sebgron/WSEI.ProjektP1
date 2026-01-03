'use client';

import * as React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';

export interface Column<T> {
    key: string;
    header: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
}

export interface Action<T> {
    label: string;
    onClick: (item: T) => void;
    variant?: 'default' | 'destructive';
    separator?: boolean;
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    actions?: Action<T>[];
    isLoading?: boolean;
    emptyMessage?: string;
    getRowKey: (item: T) => string | number;
}

export function DataTable<T>({
    data,
    columns,
    actions,
    isLoading = false,
    emptyMessage = 'Brak danych do wyświetlenia',
    getRowKey,
}: DataTableProps<T>) {
    if (isLoading) {
        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column) => (
                                <TableHead key={column.key} className={column.className}>
                                    {column.header}
                                </TableHead>
                            ))}
                            {actions && actions.length > 0 && (
                                <TableHead className="w-[70px]">Akcje</TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, idx) => (
                            <TableRow key={idx}>
                                {columns.map((column) => (
                                    <TableCell key={column.key}>
                                        <Skeleton className="h-5 w-full" />
                                    </TableCell>
                                ))}
                                {actions && actions.length > 0 && (
                                    <TableCell>
                                        <Skeleton className="h-8 w-8" />
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column) => (
                                <TableHead key={column.key} className={column.className}>
                                    {column.header}
                                </TableHead>
                            ))}
                            {actions && actions.length > 0 && (
                                <TableHead className="w-[70px]">Akcje</TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell
                                colSpan={columns.length + (actions ? 1 : 0)}
                                className="h-24 text-center text-muted-foreground"
                            >
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((column) => (
                            <TableHead key={column.key} className={column.className}>
                                {column.header}
                            </TableHead>
                        ))}
                        {actions && actions.length > 0 && (
                            <TableHead className="w-[70px]">Akcje</TableHead>
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item) => (
                        <TableRow key={getRowKey(item)}>
                            {columns.map((column) => (
                                <TableCell key={column.key} className={column.className}>
                                    {column.render
                                        ? column.render(item)
                                        : (item as Record<string, unknown>)[column.key] as React.ReactNode}
                                </TableCell>
                            ))}
                            {actions && actions.length > 0 && (
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Otwórz menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {actions.map((action, idx) => (
                                                <React.Fragment key={idx}>
                                                    {action.separator && idx > 0 && <DropdownMenuSeparator />}
                                                    <DropdownMenuItem
                                                        onClick={() => action.onClick(item)}
                                                        className={action.variant === 'destructive' ? 'text-destructive' : ''}
                                                    >
                                                        {action.label}
                                                    </DropdownMenuItem>
                                                </React.Fragment>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
