import { Badge } from '@/components/ui/badge';
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
            <div className="min-h-screen bg-gray-50">
                {/* Header Section */}
                <div className="border-b bg-white">
                    <div className="container mx-auto px-4 py-8">
                        <div className="mb-8 text-center">
                            <h1 className="mb-4 text-4xl font-bold text-gray-900">Akomodasi</h1>
                            <p className="mx-auto max-w-2xl text-lg text-gray-600">
                                Temukan akomodasi nyaman untuk mendukung pengalaman belajar Anda
                            </p>
                        </div>

                        {/* Search and Filter Bar */}
                        <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
                            {/* Search Form */}
                            <form onSubmit={handleSearch} className="max-w-md flex-1">
                                <div className="relative">
                                    <Input
                                        type="text"
                                        placeholder="Cari akomodasi..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pr-4 pl-10"
                                    />
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                    <Button type="submit" variant="ghost" size="sm" className="absolute top-1/2 right-1 -translate-y-1/2 transform">
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </div>
                            </form>

                            {/* Sort and View Controls */}
                            <div className="flex items-center gap-4">
                                <Select value={sortBy} onValueChange={(value) => handleSort(value, sortOrder)}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="name">Nama</SelectItem>
                                        <SelectItem value="price">Harga</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button variant="outline" size="sm" onClick={() => handleSort(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}>
                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                </Button>

                                <div className="flex rounded-md border">
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                        className="rounded-r-none"
                                    >
                                        <Grid className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                        className="rounded-l-none"
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Info */}
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>
                            Menampilkan {accommodations.from || 0} - {accommodations.to || 0} dari {accommodations.total} akomodasi
                        </span>
                    </div>
                </div>

                {/* Accommodations Grid/List */}
                <div className="container mx-auto px-4 pb-8">
                    {accommodations.data.length === 0 ? (
                        <div className="py-16 text-center">
                            <Bed className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                            <h3 className="mb-2 text-xl font-semibold text-gray-900">Tidak ada akomodasi ditemukan</h3>
                            <p className="text-gray-600">Coba ubah kata kunci pencarian atau filter Anda.</p>
                        </div>
                    ) : (
                        <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'space-y-6'}>
                            {accommodations.data.map((accommodation) => (
                                <Card
                                    key={accommodation.id}
                                    className={`group transition-all duration-200 hover:shadow-lg ${viewMode === 'list' ? 'flex flex-row' : ''}`}
                                >
                                    <div className={viewMode === 'list' ? 'w-72 flex-shrink-0' : ''}>
                                        <div className="relative aspect-video overflow-hidden rounded-t-lg">
                                            <img
                                                src={accommodation.image_url}
                                                alt={accommodation.name}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                            <div className="absolute top-3 right-3">
                                                <Badge variant="secondary" className="bg-white/90 text-gray-900">
                                                    <Bed className="mr-1 h-3 w-3" />
                                                    Akomodasi
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={viewMode === 'list' ? 'flex-1' : ''}>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <h3 className="line-clamp-2 text-lg font-semibold transition-colors group-hover:text-blue-600">
                                                    {accommodation.name}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <MapPin className="h-4 w-4" />
                                                <span>{institution?.address || 'Lokasi tidak tersedia'}</span>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="pt-0">
                                            <p className="mb-4 line-clamp-2 text-sm text-gray-600">{accommodation.description}</p>

                                            <div className="flex items-center justify-between">
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-blue-600">{accommodation.formatted_price}</div>
                                                    <div className="text-sm text-gray-500">per malam</div>
                                                </div>

                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={route('accommodations.show', accommodation.id)}>Detail</Link>
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleWhatsAppBooking(accommodation)}
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        <MessageCircle className="mr-1 h-4 w-4" />
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
                        <div className="mt-8 flex justify-center">
                            <div className="flex items-center gap-2">
                                {accommodations.links.map((link, index) => {
                                    if (!link.url) {
                                        return (
                                            <Button key={index} variant="ghost" size="sm" disabled dangerouslySetInnerHTML={{ __html: link.label }} />
                                        );
                                    }

                                    if (link.label.includes('Previous')) {
                                        return (
                                            <Button key={index} variant="outline" size="sm" onClick={() => router.get(link.url!)}>
                                                <ChevronLeft className="h-4 w-4" />
                                                Previous
                                            </Button>
                                        );
                                    }

                                    if (link.label.includes('Next')) {
                                        return (
                                            <Button key={index} variant="outline" size="sm" onClick={() => router.get(link.url!)}>
                                                Next
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        );
                                    }

                                    return (
                                        <Button
                                            key={index}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => router.get(link.url!)}
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
