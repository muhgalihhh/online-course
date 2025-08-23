import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatItem {
    label: string;
    value: string | number;
    change: string;
    isPositive: boolean;
    icon: LucideIcon;
    color: string;
}

interface StatsSummaryProps {
    title: string;
    stats: StatItem[];
    className?: string;
}

export function StatsSummary({ title, stats, className = '' }: StatsSummaryProps) {
    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {stats.map((stat, index) => (
                        <div key={index} className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div 
                                    className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
                                    style={{ backgroundColor: `${stat.color}20` }}
                                >
                                    <stat.icon 
                                        className="h-4 w-4" 
                                        style={{ color: stat.color }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{stat.label}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {typeof stat.value === 'number' 
                                            ? stat.value.toLocaleString() 
                                            : stat.value
                                        }
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {stat.isPositive ? (
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                ) : (
                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                )}
                                <Badge 
                                    variant={stat.isPositive ? 'default' : 'destructive'}
                                    className="text-xs"
                                >
                                    {stat.change}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}