import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import GuestLayout from '@/layouts/guest-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ExternalLink, Globe, Mail, MapPin, Phone, Search } from 'lucide-react';
import { useState } from 'react';

interface Institution {
    id: number;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    website?: string;
    logo_path?: string;
    logo_url?: string;
}

interface PaginationData {
    current_page: number;
    data: Institution[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface Props {
    institutions: PaginationData;
    filters: {
        search?: string;
    };
}

export default function OtherInstitutionsIndex({ institutions, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = () => {
        router.get(
            '/lembaga-lain',
            { search },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const clearSearch = () => {
        setSearch('');
        router.get(
            '/lembaga-lain',
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <GuestLayout>
            <Head title="Lembaga Lain" />

            <div className="container mx-auto px-4 py-8">
                <PageHeader title="Lembaga Lain" description="Temukan berbagai lembaga pendidikan dan pelatihan lainnya" />

                {/* Search Bar */}
                <div className="mb-8">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                            <Input
                                placeholder="Cari lembaga..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="pl-10"
                            />
                        </div>
                        <Button onClick={handleSearch}>Cari</Button>
                        {filters.search && (
                            <Button variant="outline" onClick={clearSearch}>
                                Reset
                            </Button>
                        )}
                    </div>
                </div>

                {/* Results */}
                <div className="mb-6">
                    <p className="text-sm text-muted-foreground">
                        Menampilkan {institutions.from || 0} - {institutions.to || 0} dari {institutions.total} lembaga
                        {filters.search && <span> untuk pencarian "{filters.search}"</span>}
                    </p>
                </div>

                {/* Institutions Grid */}
                {institutions.data.length > 0 ? (
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {institutions.data.map((institution) => (
                            <Card key={institution.id} className="transition-shadow hover:shadow-lg">
                                <CardHeader className="pb-4">
                                    <div className="flex items-start gap-4">
                                        {institution.logo_url ? (
                                            <img
                                                src={institution.logo_url}
                                                alt={`Logo ${institution.name}`}
                                                className="h-16 w-16 rounded-lg bg-muted object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                                                <span className="text-2xl font-bold text-muted-foreground">{institution.name.charAt(0)}</span>
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <CardTitle className="text-lg leading-tight">{institution.name}</CardTitle>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="space-y-3">
                                        {institution.address && (
                                            <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                                <span className="line-clamp-2">{institution.address}</span>
                                            </div>
                                        )}

                                        {institution.phone && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Phone className="h-4 w-4 flex-shrink-0" />
                                                <span>{institution.phone}</span>
                                            </div>
                                        )}

                                        {institution.email && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Mail className="h-4 w-4 flex-shrink-0" />
                                                <span className="truncate">{institution.email}</span>
                                            </div>
                                        )}

                                        {institution.website && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Globe className="h-4 w-4 flex-shrink-0" />
                                                <a
                                                    href={
                                                        institution.website.startsWith('http')
                                                            ? institution.website
                                                            : `https://${institution.website}`
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="truncate text-primary hover:underline"
                                                >
                                                    {institution.website}
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4">
                                        <Link
                                            href={`/lembaga-lain/${institution.id}`}
                                            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                                        >
                                            Lihat Detail
                                            <ExternalLink className="h-3 w-3" />
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                            <Search className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold">Tidak ada lembaga ditemukan</h3>
                        <p className="mb-4 text-muted-foreground">
                            {filters.search
                                ? `Tidak ada lembaga yang cocok dengan pencarian "${filters.search}"`
                                : 'Belum ada lembaga yang terdaftar'}
                        </p>
                        {filters.search && (
                            <Button variant="outline" onClick={clearSearch}>
                                Lihat Semua Lembaga
                            </Button>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {institutions.last_page > 1 && (
                    <div className="flex justify-center">
                        <div className="flex items-center gap-2">
                            {institutions.links.map((link, index) => {
                                if (!link.url) {
                                    return (
                                        <Button key={index} variant="outline" size="sm" disabled dangerouslySetInnerHTML={{ __html: link.label }} />
                                    );
                                }

                                return (
                                    <Button
                                        key={index}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => router.visit(link.url as string)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </GuestLayout>
    );
}
