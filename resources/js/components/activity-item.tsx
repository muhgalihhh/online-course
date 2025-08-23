import { LucideIcon } from 'lucide-react';

interface ActivityItemProps {
    title: string;
    time: string;
    icon: LucideIcon;
    iconBgColor: string;
    iconColor: string;
}

export function ActivityItem({ 
    title, 
    time, 
    icon: Icon, 
    iconBgColor, 
    iconColor 
}: ActivityItemProps) {
    return (
        <div className="flex items-center gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${iconBgColor} shrink-0`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{title}</p>
                <p className="text-xs text-muted-foreground">{time}</p>
            </div>
        </div>
    );
}