import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';
import { Search, Filter, Download } from 'lucide-react';

interface AdminTableProps {
    title?: string;
    description?: string;
    data: any[];
    columns: {
        key: string;
        header: string;
        cell?: (item: any) => ReactNode;
        className?: string;
    }[];
    searchable?: boolean;
    filterable?: boolean;
    exportable?: boolean;
    onSearch?: (value: string) => void;
    onExport?: () => void;
    className?: string;
}

export function AdminTable({
    title,
    description,
    data,
    columns,
    searchable = false,
    filterable = false,
    exportable = false,
    onSearch,
    onExport,
    className
}: AdminTableProps) {
    return (
        <Card className={className}>
            {(title || description || searchable || filterable || exportable) && (
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                            {title && <CardTitle>{title}</CardTitle>}
                            {description && (
                                <p className="text-sm text-muted-foreground">{description}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {searchable && (
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search..."
                                        className="pl-9 w-64"
                                        onChange={(e) => onSearch?.(e.target.value)}
                                    />
                                </div>
                            )}
                            {filterable && (
                                <Button variant="outline" size="sm">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Filter
                                </Button>
                            )}
                            {exportable && (
                                <Button variant="outline" size="sm" onClick={onExport}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Export
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
            )}
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {columns.map((column) => (
                                <TableHead key={column.key} className={column.className}>
                                    {column.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((item, index) => (
                            <TableRow key={index}>
                                {columns.map((column) => (
                                    <TableCell key={column.key} className={column.className}>
                                        {column.cell ? column.cell(item) : item[column.key]}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}