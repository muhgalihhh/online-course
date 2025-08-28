import GuestLayout from '@/layouts/guest-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Building, 
    BookOpen,
    Users,
    Award,
    MapPin,
    Phone,
    Mail,
    Globe,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Link, router, usePage } from '@inertiajs/react';

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

interface PageProps {
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
}

export default function InstitutionsIndex() {
    const { institutions } = usePage<PageProps>().props;

    const InstitutionCard = ({ institution }: { institution: Institution }) => (
        <Card className="overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg h-full">
            <CardHeader className="pb-4">
                <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0">
                        {institution.photo ? (
                            <img 
                                src={institution.photo} 
                                alt={institution.name}
                                className="h-full w-full rounded-lg object-cover"
                            />
                        ) : (
                            <Building className="h-8 w-8" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg line-clamp-2">{institution.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="gap-1">
                                <BookOpen className="h-3 w-3" />
                                {institution.courses_count} Kursus
                            </Badge>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {institution.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                        {institution.description}
                    </p>
                )}
                
                <div className="space-y-2 text-sm">
                    {institution.address && (
                        <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <span className="text-muted-foreground line-clamp-2">{institution.address}</span>
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
                            <span className="text-muted-foreground truncate">{institution.email}</span>
                        </div>
                    )}
                    {institution.website && (
                        <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <a 
                                href={institution.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline truncate"
                            >
                                {institution.website}
                            </a>
                        </div>
                    )}
                </div>

                <div className="pt-3">
                    <Button size="sm" className="w-full" asChild>
                        <Link href={`/courses?institution=${institution.id}`}>
                            Lihat Kursus
                        </Link>
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
                        <div className="flex items-center justify-center mb-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <Building className="h-8 w-8" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold mb-4">Katalog Lembaga</h1>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Temukan lembaga pendidikan terpercaya yang menyediakan berbagai kursus berkualitas
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-8 border-b">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-primary">{institutions.total}+</div>
                                <p className="text-sm text-muted-foreground">Lembaga Terdaftar</p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-primary">500+</div>
                                <p className="text-sm text-muted-foreground">Total Kursus</p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-primary">50K+</div>
                                <p className="text-sm text-muted-foreground">Siswa Aktif</p>
                            </CardContent>
                        </Card>
                        <Card className="border-0 shadow-sm">
                            <CardContent className="p-4 text-center">
                                <div className="text-2xl font-bold text-primary">4.8</div>
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
                                {institutions.data.map((institution) => (
                                    <InstitutionCard key={institution.id} institution={institution} />
                                ))}
                            </div>

                            {/* Pagination */}
                            {institutions.last_page > 1 && (
                                <div className="mt-8 flex justify-center">
                                    <div className="flex gap-1">
                                        {institutions.links.map((link, index) => {
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
                                                return <span key={index} className="px-3 py-1">...</span>;
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
                                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Tidak ada lembaga ditemukan</h3>
                                <p className="text-muted-foreground">
                                    Lembaga akan segera ditambahkan
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </section>
        </GuestLayout>
    );
}