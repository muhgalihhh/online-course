import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import GuestLayout from '@/layouts/guest-layout';
import { Link, router, usePage } from '@inertiajs/react';
import { BookOpen, Building, ChevronLeft, ChevronRight, Globe, Mail, MapPin, Phone } from 'lucide-react';

import { PageProps } from '@/types';

interface Institution {
    id: number;
    name: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    photo?: string;
    courses_count: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export default function InstitutionsIndex() {
    const { institutions, stats } = usePage<
        PageProps<{
            institutions: {
                data: Institution[];
                current_page: number;
                last_page: number;
                per_page: number;
                total: number;
                from: number;
                to: number;
                links: Array<{
                    url: string | null;
                    label: string;
                    active: boolean;
                }>;
            };
            stats: {
                total_institutions: number;
                total_courses: number;
                total_students: number;
                average_rating: number;
            };
        }>
    >().props;

    const InstitutionCard = ({ institution }: { institution: Institution }) => (
        <Card className="h-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
            <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {institution.photo ? (
                            <img src={institution.photo} alt={institution.name} className="h-full w-full rounded-lg object-cover" />
                        ) : (
                            <Building className="h-8 w-8" />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <CardTitle className="line-clamp-2 text-lg">{institution.name}</CardTitle>
                        <div className="mt-1 flex items-center gap-2">
                            <Badge variant="secondary" className="gap-1">
                                <BookOpen className="h-3 w-3" />
                                {institution.courses_count} Kursus
                            </Badge>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {institution.description && <p className="line-clamp-3 text-sm text-muted-foreground">{institution.description}</p>}

                <div className="space-y-2 text-sm">
                    {institution.address && (
                        <div className="flex items-start gap-2">
                            <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                            <span className="line-clamp-2 text-muted-foreground">{institution.address}</span>
                        </div>
                    )}
                    {institution.phone && (
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{institution.phone}</span>
                        </div>
                    )}
                    {institution.email && (
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate text-muted-foreground">{institution.email}</span>
                        </div>
                    )}
                    {institution.website && (
                        <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <a href={institution.website} target="_blank" rel="noopener noreferrer" className="truncate text-primary hover:underline">
                                {institution.website}
                            </a>
                        </div>
                    )}
                </div>

                <div className="pt-3">
                    <Button size="sm" className="w-full" asChild>
                        <Link href={`/courses?institution=${institution.id}`}>Lihat Kursus</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <GuestLayout>
            {/* Header Section */}
            <section className="bg-gradient-to-br from-primary/10 via-background to-primary/5 py-12">
                <div className="container mx-auto px-4">
                    <div className="text-center">
                        <div className="mb-4 flex items-center justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Building className="h-8 w-8" />
                            </div>
                        </div>
                        <h1 className="mb-4 text-3xl font-bold">Katalog Lembaga</h1>
                        <p className="mx-auto max-w-2xl text-muted-foreground">
                            Temukan lembaga pendidikan terpercaya yang menyediakan berbagai kursus berkualitas
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="border-b py-8">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-primary">{stats.total_institutions}+</div>
                                <p className="text-sm text-muted-foreground">Lembaga Terdaftar</p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-primary">{stats.total_courses}+</div>
                                <p className="text-sm text-muted-foreground">Total Kursus</p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-primary">{stats.total_students.toLocaleString()}+</div>
                                <p className="text-sm text-muted-foreground">Siswa Aktif</p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-primary">{stats.average_rating}</div>
                                <p className="text-sm text-muted-foreground">Rating Rata-rata</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Institutions Grid */}
            <section className="py-8">
                <div className="container mx-auto px-4">
                    {/* Results Info */}
                    <div className="mb-6 text-sm text-muted-foreground">
                        Menampilkan {institutions.from || 0} - {institutions.to || 0} dari {institutions.total} lembaga
                    </div>

                    {/* Institutions */}
                    {institutions.data.length > 0 ? (
                        <>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {institutions.data.map((institution: Institution) => (
                                    <InstitutionCard key={institution.id} institution={institution} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {institutions.last_page > 1 && (
                                <div className="mt-8 flex justify-center">
                                    <div className="flex gap-1">
                                        {institutions.links.map((link: PaginationLink, index: number) => {
                                            if (link.label === '&laquo; Previous') {
                                                return (
                                                    <Button
                                                        key={index}
                                                        variant={link.url ? 'outline' : 'ghost'}
                                                        size="sm"
                                                        disabled={!link.url}
                                                        onClick={() => link.url && router.visit(link.url)}
                                                    >
                                                        <ChevronLeft className="h-4 w-4" />
                                                    </Button>
                                                );
                                            }
                                            if (link.label === 'Next &raquo;') {
                                                return (
                                                    <Button
                                                        key={index}
                                                        variant={link.url ? 'outline' : 'ghost'}
                                                        size="sm"
                                                        disabled={!link.url}
                                                        onClick={() => link.url && router.visit(link.url)}
                                                    >
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                );
                                            }
                                            if (link.label === '...') {
                                                return (
                                                    <span key={index} className="px-3 py-1">
                                                        ...
                                                    </span>
                                                );
                                            }
                                            return (
                                                <Button
                                                    key={index}
                                                    variant={link.active ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => link.url && router.visit(link.url)}
                                                >
                                                    {link.label}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <Card className="p-12">
                            <CardContent className="text-center">
                                <Building className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-semibold">Tidak ada lembaga ditemukan</h3>
                                <p className="text-muted-foreground">Lembaga akan segera ditambahkan</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </section>
        </GuestLayout>
    );
}
