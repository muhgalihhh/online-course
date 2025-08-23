import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface PaginationProps {
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

export function Pagination({ links }: PaginationProps) {
    if (links.length <= 3) {
        return null;
    }

    const currentPage = links.find(link => link.active)?.label || '1';
    const totalPages = links.length - 2; // Exclude first and last links

    return (
        <div className="flex items-center justify-between px-2">
            <div className="flex w-[100px] justify-start">
                {links[0].url && (
                    <Link href={links[0].url}>
                        <Button variant="outline" size="sm">
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                    </Link>
                )}
            </div>

            <div className="flex items-center space-x-2">
                {links.slice(1, -1).map((link, index) => {
                    if (link.url === null) {
                        return (
                            <div key={index} className="flex items-center justify-center w-8 h-8">
                                <MoreHorizontal className="h-4 w-4" />
                            </div>
                        );
                    }

                    return (
                        <Link key={index} href={link.url}>
                            <Button
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                className="w-8 h-8 p-0"
                            >
                                {link.label}
                            </Button>
                        </Link>
                    );
                })}
            </div>

            <div className="flex w-[100px] justify-end">
                {links[links.length - 1].url && (
                    <Link href={links[links.length - 1].url}>
                        <Button variant="outline" size="sm">
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </Link>
                )}
            </div>
        </div>
    );
}