import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { MiniChart } from './mini-chart';

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    chartData?: { value: number }[];
    className?: string;
}

export function StatCard({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    trend, 
    chartData,
    className = '' 
}: StatCardProps) {
    return (
        <Card className={`hover:shadow-md transition-shadow ${className}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <div className="text-2xl font-bold">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </div>
                        {description && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {trend && (
                                    <span className={trend.isPositive ? 'text-green-600' : 'text-red-600'}>
                                        {trend.value}
                                    </span>
                                )}
                                {trend && ' '}
                                {description}
                            </p>
                        )}
                    </div>
                    {chartData && (
                        <div className="w-20 h-12 shrink-0">
                            <MiniChart 
                                data={chartData} 
                                color={trend?.isPositive ? "#10b981" : "#ef4444"}
                            />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}