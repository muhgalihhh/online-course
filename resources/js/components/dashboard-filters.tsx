import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Filter } from 'lucide-react';

interface DashboardFiltersProps {
    period: string;
    onPeriodChange: (value: string) => void;
    onExport?: () => void;
    showExport?: boolean;
}

export function DashboardFilters({ 
    period, 
    onPeriodChange, 
    onExport, 
    showExport = false 
}: DashboardFiltersProps) {
    return (
        <div className="flex flex-col gap-4 p-4 bg-muted/50 rounded-lg sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filter:</span>
                </div>
                
                <Select value={period} onValueChange={onPeriodChange}>
                    <SelectTrigger className="w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="7d">7 Hari Terakhir</SelectItem>
                        <SelectItem value="30d">30 Hari Terakhir</SelectItem>
                        <SelectItem value="90d">90 Hari Terakhir</SelectItem>
                        <SelectItem value="1y">1 Tahun Terakhir</SelectItem>
                        <SelectItem value="all">Semua Waktu</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            {showExport && onExport && (
                <Button variant="outline" size="sm" onClick={onExport} className="shrink-0">
                    <Calendar className="mr-2 h-4 w-4" />
                    Export Data
                </Button>
            )}
        </div>
    );
}