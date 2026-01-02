import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import GuestLayout from '@/layouts/guest-layout';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Bed, Globe, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';

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
    website?: string;
}

interface PageProps {
    accommodation: Accommodation;
    institution?: Institution;
    [key: string]: unknown;
}

export default function AccommodationShow() {
    const { accommodation, institution } = usePage<PageProps>().props;

    const handleWhatsAppBooking = () => {
        window.open(accommodation.whatsapp_booking_url, '_blank');
    };

    const handlePhoneCall = () => {
        if (institution?.phone) {
            window.open(`tel:${institution.phone}`, '_self');
        }
    };

    const handleEmail = () => {
        if (institution?.email) {
            window.open(`mailto:${institution.email}`, '_self');
        }
    };

    return (
        <GuestLayout>
            <div className="min-h-screen bg-background">
                {/* Header */}
                <div className="border-b bg-card shadow-sm">
                    <div className="container mx-auto px-3 py-3 sm:px-4 sm:py-4 md:py-6">
                        <Button variant="ghost" size="sm" asChild className="mb-2 h-8 text-xs hover:bg-accent sm:mb-3 sm:h-9 sm:text-sm">
                            <Link href={route('accommodations.index')}>
                                <ArrowLeft className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-3.5 sm:w-3.5 md:mr-2 md:h-4 md:w-4" />
                                <span className="xs:inline hidden">Kembali ke Daftar Akomodasi</span>
                                <span className="xs:hidden">Kembali</span>
                            </Link>
                        </Button>

                        <div className="mb-1.5 flex flex-col gap-2 sm:mb-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3 md:items-center">
                            <h1 className="text-lg leading-tight font-bold text-foreground sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl">
                                {accommodation.name}
                            </h1>
                            <Badge variant="secondary" className="w-fit text-xs sm:text-sm">
                                <Bed className="mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                Akomodasi
                            </Badge>
                        </div>

                        {institution?.address && (
                            <div className="flex items-start text-muted-foreground">
                                <MapPin className="mt-0.5 mr-1 h-3 w-3 flex-shrink-0 sm:mr-1.5 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                                <span className="text-xs leading-relaxed sm:text-sm">{institution.address}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-3 py-3 sm:px-4 sm:py-4 md:py-6 lg:py-8">
                    <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-5 lg:grid-cols-3 lg:gap-6 xl:gap-8">
                        {/* Left Column - Image and Description */}
                        <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:col-span-2">
                            {/* Image */}
                            <div className="group relative aspect-[16/10] max-h-[300px] overflow-hidden rounded-lg bg-muted shadow-md sm:aspect-[16/9] sm:max-h-[360px] sm:rounded-xl md:aspect-video md:max-h-[400px] lg:max-h-[480px]">
                                <img
                                    src={accommodation.image_url}
                                    alt={accommodation.name}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="pointer-events-none absolute inset-0 bg-black/10" />
                            </div>

                            {/* Description */}
                            <Card className="relative z-20 shadow-sm sm:shadow-md">
                                <CardHeader className="p-3 sm:p-4 md:p-5 lg:p-6">
                                    <CardTitle className="flex items-center gap-1.5 text-sm sm:gap-2 sm:text-base md:text-lg">
                                        <Bed className="h-3.5 w-3.5 flex-shrink-0 text-primary sm:h-4 sm:w-4 md:h-5 md:w-5" />
                                        Deskripsi Akomodasi
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0 md:p-5 md:pt-0 lg:p-6 lg:pt-0">
                                    <div className="prose prose-gray max-w-none">
                                        {accommodation.description.split('\n').map(
                                            (paragraph, index) =>
                                                paragraph.trim() && (
                                                    <p
                                                        key={index}
                                                        className="mb-1.5 text-xs leading-relaxed text-muted-foreground last:mb-0 sm:mb-2 sm:text-sm md:text-base"
                                                    >
                                                        {paragraph}
                                                    </p>
                                                ),
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Institution Information */}
                            {institution && (
                                <Card className="shadow-sm sm:shadow-md">
                                    <CardHeader className="p-3 sm:p-4 md:p-5 lg:p-6">
                                        <CardTitle className="flex items-center gap-1.5 text-sm sm:gap-2 sm:text-base md:text-lg">
                                            <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-primary sm:h-4 sm:w-4 md:h-5 md:w-5" />
                                            Informasi Pengelola
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 p-3 pt-0 sm:space-y-4 sm:p-4 sm:pt-0 md:p-5 md:pt-0 lg:p-6 lg:pt-0">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 sm:h-12 sm:w-12 md:h-14 md:w-14">
                                                <Bed className="h-5 w-5 text-primary sm:h-6 sm:w-6 md:h-7 md:w-7" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="truncate text-sm font-semibold text-foreground sm:text-base md:text-lg">
                                                    {institution.name}
                                                </h3>
                                                <p className="text-xs text-muted-foreground sm:text-sm">Pengelola Akomodasi</p>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-2">
                                            {institution.phone && (
                                                <div className="flex items-start gap-2">
                                                    <div className="flex-shrink-0 rounded-lg bg-muted p-1.5 sm:p-2">
                                                        <Phone className="h-3 w-3 text-primary sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-medium sm:text-sm">Telepon</p>
                                                        <p className="text-xs break-all text-muted-foreground sm:text-sm">{institution.phone}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {institution.email && (
                                                <div className="flex items-start gap-2">
                                                    <div className="flex-shrink-0 rounded-lg bg-muted p-1.5 sm:p-2">
                                                        <Mail className="h-3 w-3 text-primary sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-medium sm:text-sm">Email</p>
                                                        <p className="text-xs break-all text-muted-foreground sm:text-sm">{institution.email}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {institution.website && (
                                                <div className="flex items-start gap-2">
                                                    <div className="flex-shrink-0 rounded-lg bg-muted p-1.5 sm:p-2">
                                                        <Globe className="h-3 w-3 text-primary sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-medium sm:text-sm">Website</p>
                                                        <a
                                                            href={institution.website}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs break-all text-primary hover:underline sm:text-sm"
                                                        >
                                                            {institution.website}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}

                                            {institution.address && (
                                                <div className="flex items-start gap-2 md:col-span-2">
                                                    <div className="flex-shrink-0 rounded-lg bg-muted p-1.5 sm:p-2">
                                                        <MapPin className="h-3 w-3 text-primary sm:h-3.5 sm:w-3.5 md:h-4 md:w-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-medium sm:text-sm">Alamat</p>
                                                        <p className="text-xs text-muted-foreground sm:text-sm">{institution.address}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Right Column - Booking Card */}
                        <div className="lg:col-span-1">
                            <div className="lg:sticky lg:top-6">
                                <Card className="shadow-md sm:shadow-lg">
                                    <CardHeader className="bg-primary/5 p-3 sm:p-4 md:p-5 lg:p-6">
                                        <CardTitle className="text-center text-base sm:text-lg md:text-xl">Detail Pemesanan</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 p-3 sm:space-y-4 sm:p-4 md:space-y-5 md:p-5 lg:p-6">
                                        {/* Price */}
                                        <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-3 text-center sm:rounded-xl sm:p-4 md:p-5 lg:p-6">
                                            <p className="mb-1 text-xs font-medium text-muted-foreground sm:mb-1.5 sm:text-sm">Harga Akomodasi</p>
                                            <div className="text-xl font-bold break-words text-primary sm:text-2xl md:text-3xl lg:text-4xl">
                                                {accommodation.formatted_price}
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Booking Actions */}
                                        <div className="space-y-2 sm:space-y-2.5">
                                            <Button
                                                onClick={handleWhatsAppBooking}
                                                className="h-10 w-full bg-green-600 text-xs text-white shadow-md hover:bg-green-700 hover:shadow-lg sm:h-11 sm:text-sm md:h-12 md:text-base"
                                                size="lg"
                                            >
                                                <MessageCircle className="mr-1.5 h-3.5 w-3.5 flex-shrink-0 sm:mr-2 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                                                <span className="truncate">Pesan via WhatsApp</span>
                                            </Button>

                                            {institution?.phone && (
                                                <Button
                                                    onClick={handlePhoneCall}
                                                    variant="outline"
                                                    className="h-10 w-full text-xs shadow-sm sm:h-11 sm:text-sm md:h-12 md:text-base"
                                                    size="lg"
                                                >
                                                    <Phone className="mr-1.5 h-3.5 w-3.5 flex-shrink-0 sm:mr-2 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                                                    <span className="truncate">Hubungi Langsung</span>
                                                </Button>
                                            )}

                                            {institution?.email && (
                                                <Button
                                                    onClick={handleEmail}
                                                    variant="outline"
                                                    className="h-10 w-full text-xs shadow-sm sm:h-11 sm:text-sm md:h-12 md:text-base"
                                                    size="lg"
                                                >
                                                    <Mail className="mr-1.5 h-3.5 w-3.5 flex-shrink-0 sm:mr-2 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                                                    <span className="truncate">Kirim Email</span>
                                                </Button>
                                            )}
                                        </div>

                                        {/* Notice */}
                                        <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-2.5 sm:p-3 md:p-4">
                                            <p className="text-xs leading-relaxed text-foreground sm:text-sm">
                                                <strong className="text-primary">Catatan:</strong> Untuk melakukan pemesanan, silakan hubungi kami
                                                melalui WhatsApp atau kontak yang tersedia. Kami akan membantu Anda dengan informasi ketersediaan dan
                                                proses pemesanan.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
