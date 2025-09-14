import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    onPageChange?: (url: string) => void;
}

export function Pagination({ links, onPageChange }: PaginationProps) {
    if (links.length <= 3) {
        return null;
    }

    const handlePageChange = (url: string) => {
        if (onPageChange) {
            onPageChange(url);
        }
    };

    const currentPage = links.find((link) => link.active)?.label || '1';
    const totalPages = links.length - 2; // Exclude first and last links

    return (
        <div className="flex items-center justify-between px-2">
            <div className="flex w-[100px] justify-start">
                {links[0].url && (
                    <>
                        {onPageChange ? (
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(links[0].url!)}>
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                        ) : (
                            <Link href={links[0].url}>
                                <Button variant="outline" size="sm">
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>
                            </Link>
                        )}
                    </>
                )}
            </div>

            <div className="flex items-center space-x-2">
                {links.slice(1, -1).map((link, index) => {
                    if (link.url === null) {
                        return (
                            <div key={index} className="flex h-8 w-8 items-center justify-center">
                                <MoreHorizontal className="h-4 w-4" />
                            </div>
                        );
                    }

                    return (
                        <>
                            {onPageChange ? (
                                <Button
                                    key={index}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handlePageChange(link.url!)}
                                >
                                    {link.label}
                                </Button>
                            ) : (
                                <Link key={index} href={link.url}>
                                    <Button variant={link.active ? 'default' : 'outline'} size="sm" className="h-8 w-8 p-0">
                                        {link.label}
                                    </Button>
                                </Link>
                            )}
                        </>
                    );
                })}
            </div>

            <div className="flex w-[100px] justify-end">
                {links[links.length - 1].url && (
                    <>
                        {onPageChange ? (
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(links[links.length - 1].url!)}>
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Link href={links[links.length - 1].url}>
                                <Button variant="outline" size="sm">
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </Link>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
