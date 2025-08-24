import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Link } from '@inertiajs/react';
import { Fragment } from 'react';
import { cn } from '@/lib/utils';

interface BreadcrumbsProps {
    breadcrumbs: BreadcrumbItemType[];
    className?: string;
}

export function Breadcrumbs({ breadcrumbs, className }: BreadcrumbsProps) {
    if (breadcrumbs.length === 0) return null;

    return (
        <div className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}>
            <Breadcrumb>
                <BreadcrumbList className="flex items-center space-x-1">
                    {breadcrumbs.map((item, index) => {
                        const isLast = index === breadcrumbs.length - 1;
                        return (
                            <Fragment key={index}>
                                <BreadcrumbItem>
                                    {isLast ? (
                                        <BreadcrumbPage className="font-medium text-foreground">
                                            {item.title}
                                        </BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink asChild>
                                            <Link 
                                                href={item.href}
                                                className="hover:text-foreground transition-colors"
                                            >
                                                {item.title}
                                            </Link>
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                                {!isLast && (
                                    <BreadcrumbSeparator className="text-muted-foreground/50" />
                                )}
                            </Fragment>
                        );
                    })}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    );
}
