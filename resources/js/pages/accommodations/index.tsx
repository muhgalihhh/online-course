import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GuestLayout from '@/layouts/guest-layout';
import { Link, router, usePage } from '@inertiajs/react';
import { Bed, ChevronLeft, ChevronRight, Grid, List, MapPin, MessageCircle, Search } from 'lucide-react';
import { useState } from 'react';

interface Accommodation {
    id: number;
    name: string;
    description: string;
    price_per_night: number;
    formatted_price: string;
    image_url: string;
    whatsapp_booking_url: string;
    is_active: boolean;
}

interface Institution {
    id: number;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
}

interface PageProps {
    accommodations: {
        data: Accommodation[];
        links: Array<{ url?: string; label: string; active: boolean }>;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from?: number;
        to?: number;
    };
    institution?: Institution;
    filters: {
        search?: string;
        sort?: string;
        order?: string;
    };
    [key: string]: unknown;
}

export default function AccommodationsIndex() {
    const { accommodations, institution, filters } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState(filters.sort || 'name');
    const [sortOrder, setSortOrder] = useState(filters.order || 'asc');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('accommodations.index'),
            {
                search,
                sort: sortBy,
                order: sortOrder,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleSort = (sort: string, order: string) => {
        setSortBy(sort);
        setSortOrder(order);
        router.get(
            route('accommodations.index'),
            {
                search,
                sort,
                order,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleWhatsAppBooking = (accommodation: Accommodation) => {
        window.open(accommodation.whatsapp_booking_url, '_blank');
    };

    return (
        <GuestLayout>
            <div className="min-h-screen bg-background">
                {/* Header Section */}
                <div className="border-b bg-card">
                    <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
                        <div className="mb-4 text-center sm:mb-6 md:mb-8">
                            <h1 className="mb-2 text-2xl font-bold text-foreground sm:mb-3 sm:text-3xl md:mb-4 md:text-4xl">Akomodasi</h1>
                            <p className="mx-auto max-w-2xl px-4 text-sm text-muted-foreground sm:text-base md:text-lg">
                                Temukan akomodasi nyaman untuk mendukung pengalaman belajar Anda
                            </p>
                        </div>

                        {/* Search and Filter Bar */}
                        <div className="flex flex-col items-stretch gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
                            {/* Search Form */}
                            <form onSubmit={handleSearch} className="w-full lg:max-w-md lg:flex-1">
                                <div className="relative">
                                    <Input
                                        type="text"
                                        placeholder="Cari akomodasi..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="h-10 pr-4 pl-9 text-sm sm:h-11 sm:pl-10 sm:text-base"
                                    />
                                    <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 transform text-muted-foreground sm:left-3" />
                                    <Button
                                        type="submit"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute top-1/2 right-1 h-8 -translate-y-1/2 transform"
                                    >
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </div>
                            </form>

                            {/* Sort and View Controls */}
                            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                                <Select value={sortBy} onValueChange={(value) => handleSort(value, sortOrder)}>
                                    <SelectTrigger className="h-10 w-28 text-sm sm:h-11 sm:w-32 sm:text-base md:w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="name">Nama</SelectItem>
                                        <SelectItem value="price">Harga</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSort(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
                                    className="h-10 w-10 p-0 sm:h-11 sm:w-11"
                                >
                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                </Button>

                                <div className="flex rounded-md border">
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                        className="h-9 rounded-r-none sm:h-10"
                                    >
                                        <Grid className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                        className="h-9 rounded-l-none sm:h-10"
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Info */}
                <div className="container mx-auto px-4 py-3 sm:py-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground sm:text-sm">
                        <span>
                            Menampilkan {accommodations.from || 0} - {accommodations.to || 0} dari {accommodations.total} akomodasi
                        </span>
                    </div>
                </div>

                {/* Accommodations Grid/List */}
                <div className="container mx-auto px-4 pb-6 sm:pb-8">
                    {accommodations.data.length === 0 ? (
                        <div className="py-12 text-center sm:py-16">
                            <Bed className="mx-auto mb-3 h-12 w-12 text-muted-foreground sm:mb-4 sm:h-16 sm:w-16" />
                            <h3 className="mb-1 text-lg font-semibold text-foreground sm:mb-2 sm:text-xl">Tidak ada akomodasi ditemukan</h3>
                            <p className="text-sm text-muted-foreground sm:text-base">Coba ubah kata kunci pencarian atau filter Anda.</p>
                        </div>
                    ) : (
                        <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
                            {accommodations.data.map((accommodation) => (
                                <Card
                                    key={accommodation.id}
                                    className={`group overflow-hidden border-0 shadow-md transition-all duration-300 hover:shadow-xl ${viewMode === 'list' ? 'flex flex-col sm:flex-row' : 'flex flex-col'}`}
                                >
                                    <div className={viewMode === 'list' ? 'w-full sm:w-56 sm:flex-shrink-0 md:w-64 lg:w-80' : 'w-full'}>
                                        <div
                                            className={`relative overflow-hidden ${viewMode === 'list' ? 'aspect-video sm:h-full sm:min-h-[180px] md:min-h-[200px]' : 'aspect-[16/10] sm:aspect-video'}`}
                                        >
                                            <img
                                                src={accommodation.image_url}
                                                alt={accommodation.name}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                        </div>
                                    </div>

                                    <div className="flex flex-1 flex-col">
                                        <CardHeader className="p-3 pb-2 sm:p-4 md:p-5 md:pb-3">
                                            <h3 className="line-clamp-2 text-base font-bold transition-colors group-hover:text-primary sm:text-lg md:text-xl">
                                                {accommodation.name}
                                            </h3>
                                            <div className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground sm:mt-1.5 sm:gap-2 sm:text-sm">
                                                <MapPin className="mt-0.5 h-3 w-3 flex-shrink-0 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                                                <span className="line-clamp-1">{institution?.address || 'Lokasi tidak tersedia'}</span>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="flex flex-1 flex-col justify-between p-3 pt-0 sm:p-4 md:p-5 md:pt-0">
                                            <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:mb-3 sm:line-clamp-3 sm:text-sm">
                                                {accommodation.description}
                                            </p>

                                            <div className="mt-auto space-y-2 sm:space-y-2.5">
                                                <div className="rounded-lg bg-primary/5 px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2.5">
                                                    <div className="text-lg font-bold break-words text-primary sm:text-xl md:text-2xl lg:text-3xl">
                                                        {accommodation.formatted_price}
                                                    </div>
                                                </div>

                                                <div className={`grid gap-2 ${viewMode === 'list' ? 'grid-cols-2 sm:grid-cols-2' : 'grid-cols-2'}`}>
                                                    <Button variant="outline" size="default" asChild className="h-8 w-full text-xs sm:h-9 sm:text-sm">
                                                        <Link href={route('accommodations.show', accommodation.id)}>
                                                            <Bed className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-3.5 sm:w-3.5" />
                                                            <span className="xs:inline hidden">Detail</span>
                                                            <span className="xs:hidden">Info</span>
                                                        </Link>
                                                    </Button>

                                                    <Button
                                                        size="default"
                                                        onClick={() => handleWhatsAppBooking(accommodation)}
                                                        className="h-8 w-full bg-green-600 text-xs hover:bg-green-700 sm:h-9 sm:text-sm"
                                                    >
                                                        <MessageCircle className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-3.5 sm:w-3.5" />
                                                        Pesan
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {accommodations.last_page > 1 && (
                        <div className="mt-6 flex justify-center px-2 sm:mt-8">
                            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
                                {accommodations.links.map((link, index) => {
                                    if (!link.url) {
                                        return (
                                            <Button
                                                key={index}
                                                variant="ghost"
                                                size="sm"
                                                disabled
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className="h-8 min-w-[2rem] text-xs sm:h-9 sm:min-w-[2.25rem] sm:text-sm"
                                            />
                                        );
                                    }

                                    if (link.label.includes('Previous')) {
                                        return (
                                            <Button
                                                key={index}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.get(link.url!)}
                                                className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
                                            >
                                                <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                <span className="xs:inline ml-1 hidden">Previous</span>
                                            </Button>
                                        );
                                    }

                                    if (link.label.includes('Next')) {
                                        return (
                                            <Button
                                                key={index}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => router.get(link.url!)}
                                                className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm"
                                            >
                                                <span className="xs:inline mr-1 hidden">Next</span>
                                                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            </Button>
                                        );
                                    }

                                    return (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => router.get(link.url!)}
                                            className="h-8 min-w-[2rem] px-2 text-xs sm:h-9 sm:min-w-[2.25rem] sm:px-3 sm:text-sm"
                                        >
                                            {link.label}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </GuestLayout>
    );
}
