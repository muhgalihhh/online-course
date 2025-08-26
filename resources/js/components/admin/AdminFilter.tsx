import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Filter, RotateCcw, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface FilterOption {
    value: string;
    label: string;
}

export interface FilterConfig {
    search?: {
        placeholder?: string;
        enabled?: boolean;
    };
    select?: {
        [key: string]: {
            label: string;
            options: FilterOption[];
            placeholder?: string;
        };
    };
    dateRange?: {
        enabled?: boolean;
        label?: string;
    };
    numberRange?: {
        [key: string]: {
            label: string;
            min?: number;
            max?: number;
            step?: number;
        };
    };
    sort?: {
        enabled?: boolean;
        options: FilterOption[];
        defaultSort?: string;
        defaultOrder?: 'asc' | 'desc';
    };
}

interface AdminFilterProps {
    config: FilterConfig;
    filters: Record<string, any>;
    route: string;
    onFiltersChange?: (filters: Record<string, any>) => void;
    className?: string;
}

export function AdminFilter({ 
    config, 
    filters, 
    route: routeName, 
    onFiltersChange,
    className 
}: AdminFilterProps) {
    const [localFilters, setLocalFilters] = useState(filters);
    const [isOpen, setIsOpen] = useState(false);
    const [dateFrom, setDateFrom] = useState<Date | undefined>(
        filters.date_from ? new Date(filters.date_from) : undefined
    );
    const [dateTo, setDateTo] = useState<Date | undefined>(
        filters.date_to ? new Date(filters.date_to) : undefined
    );

    // Auto-update with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            const cleanFilters = Object.fromEntries(
                Object.entries(localFilters).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
            );

            if (onFiltersChange) {
                onFiltersChange(cleanFilters);
            } else {
                router.get(
                    route(routeName),
                    cleanFilters,
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                    }
                );
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [localFilters, routeName, onFiltersChange]);

    const updateFilter = (key: string, value: any) => {
        setLocalFilters(prev => ({
            ...prev,
            [key]: value === 'all' ? '' : (value || '')
        }));
    };

    const resetFilters = () => {
        const resetFilters = Object.fromEntries(
            Object.keys(localFilters).map(key => [key, ''])
        );
        setLocalFilters(resetFilters);
        setDateFrom(undefined);
        setDateTo(undefined);
    };

    // Update date filters when date picker changes
    useEffect(() => {
        updateFilter('date_from', dateFrom ? format(dateFrom, 'yyyy-MM-dd') : '');
    }, [dateFrom]);

    useEffect(() => {
        updateFilter('date_to', dateTo ? format(dateTo, 'yyyy-MM-dd') : '');
    }, [dateTo]);

    const hasActiveFilters = Object.values(localFilters).some(value => 
        value !== '' && value !== null && value !== undefined
    );

    return (
        <Card className={cn("mb-6", className)}>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Filter className="h-4 w-4" />
                            <CardTitle className="text-lg">Filter & Search</CardTitle>
                            {hasActiveFilters && (
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                    Active
                                </span>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            {hasActiveFilters && (
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={resetFilters}
                                    className="h-8"
                                >
                                    <RotateCcw className="h-3 w-3 mr-1" />
                                    Reset
                                </Button>
                            )}
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <ArrowUpDown className="h-4 w-4" />
                                </Button>
                            </CollapsibleTrigger>
                        </div>
                    </div>
                </CardHeader>
                
                <CollapsibleContent>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {/* Search Input */}
                            {config.search?.enabled !== false && (
                                <div className="space-y-2">
                                    <Label htmlFor="search">Search</Label>
                                    <Input
                                        id="search"
                                        placeholder={config.search?.placeholder || "Search..."}
                                        value={localFilters.search || ''}
                                        onChange={(e) => updateFilter('search', e.target.value)}
                                        className="max-w-sm"
                                    />
                                </div>
                            )}

                            {/* Select Filters */}
                            {config.select && Object.entries(config.select).map(([key, selectConfig]) => (
                                <div key={key} className="space-y-2">
                                    <Label htmlFor={key}>{selectConfig.label}</Label>
                                    <Select 
                                        value={localFilters[key] || 'all'} 
                                        onValueChange={(value) => updateFilter(key, value)}
                                    >
                                        <SelectTrigger id={key}>
                                            <SelectValue placeholder={selectConfig.placeholder || `Select ${selectConfig.label}`} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All {selectConfig.label}</SelectItem>
                                            {selectConfig.options.filter(option => option.value && option.value.toString().trim() !== '').map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}

                            {/* Number Range Filters */}
                            {config.numberRange && Object.entries(config.numberRange).map(([baseKey, rangeConfig]) => (
                                <div key={baseKey} className="space-y-2 md:col-span-2">
                                    <Label>{rangeConfig.label}</Label>
                                    <div className="flex space-x-2">
                                        <Input
                                            type="number"
                                            placeholder="Min"
                                            value={localFilters[`${baseKey}_min`] || ''}
                                            onChange={(e) => updateFilter(`${baseKey}_min`, e.target.value)}
                                            min={rangeConfig.min}
                                            max={rangeConfig.max}
                                            step={rangeConfig.step}
                                        />
                                        <Input
                                            type="number"
                                            placeholder="Max"
                                            value={localFilters[`${baseKey}_max`] || ''}
                                            onChange={(e) => updateFilter(`${baseKey}_max`, e.target.value)}
                                            min={rangeConfig.min}
                                            max={rangeConfig.max}
                                            step={rangeConfig.step}
                                        />
                                    </div>
                                </div>
                            ))}

                            {/* Date Range */}
                            {config.dateRange?.enabled !== false && (
                                <div className="space-y-2 md:col-span-2">
                                    <Label>{config.dateRange?.label || 'Date Range'}</Label>
                                    <div className="flex space-x-2">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "justify-start text-left font-normal",
                                                        !dateFrom && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {dateFrom ? format(dateFrom, "PPP") : "From date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={dateFrom}
                                                    onSelect={setDateFrom}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "justify-start text-left font-normal",
                                                        !dateTo && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {dateTo ? format(dateTo, "PPP") : "To date"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={dateTo}
                                                    onSelect={setDateTo}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            )}

                            {/* Sort Options */}
                            {config.sort?.enabled !== false && config.sort?.options && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="sort_by">Sort By</Label>
                                        <Select 
                                            value={localFilters.sort_by || config.sort.defaultSort || ''} 
                                            onValueChange={(value) => updateFilter('sort_by', value)}
                                        >
                                            <SelectTrigger id="sort_by">
                                                <SelectValue placeholder="Sort by..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {config.sort.options.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="sort_order">Order</Label>
                                        <Select 
                                            value={localFilters.sort_order || config.sort.defaultOrder || 'desc'} 
                                            onValueChange={(value) => updateFilter('sort_order', value)}
                                        >
                                            <SelectTrigger id="sort_order">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="desc">Newest First</SelectItem>
                                                <SelectItem value="asc">Oldest First</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}