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
                    <div className="container mx-auto px-4 py-4 sm:py-6">
                        <Button variant="ghost" size="sm" asChild className="mb-3 h-9 text-sm hover:bg-accent sm:mb-4">
                            <Link href={route('accommodations.index')}>
                                <ArrowLeft className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
                                <span className="xs:inline hidden">Kembali ke Daftar Akomodasi</span>
                                <span className="xs:hidden">Kembali</span>
                            </Link>
                        </Button>

                        <div className="mb-2 flex flex-col gap-2 sm:mb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                            <h1 className="text-xl leading-tight font-bold text-foreground sm:text-2xl md:text-3xl lg:text-4xl">
                                {accommodation.name}
                            </h1>
                            <Badge variant="secondary" className="w-fit text-xs sm:text-sm">
                                <Bed className="mr-1 h-3 w-3" />
                                Akomodasi
                            </Badge>
                        </div>

                        {institution?.address && (
                            <div className="flex items-start text-muted-foreground sm:items-center">
                                <MapPin className="mt-0.5 mr-1.5 h-3.5 w-3.5 flex-shrink-0 sm:mt-0 sm:mr-2 sm:h-4 sm:w-4" />
                                <span className="text-xs leading-relaxed sm:text-sm">{institution.address}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-4 sm:py-8">
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3 lg:gap-8">
                        {/* Left Column - Image and Description */}
                        <div className="space-y-4 sm:space-y-6 lg:col-span-2">
                            {/* Image */}
                            <div className="group relative aspect-[16/10] overflow-hidden rounded-lg bg-muted shadow-md sm:aspect-[16/9] sm:rounded-xl sm:shadow-lg md:aspect-video">
                                <img
                                    src={accommodation.image_url}
                                    alt={accommodation.name}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>

                            {/* Description */}
                            <Card className="shadow-sm sm:shadow-md">
                                <CardHeader className="p-4 sm:p-6">
                                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                        <Bed className="h-4 w-4 flex-shrink-0 text-primary sm:h-5 sm:w-5" />
                                        Deskripsi Akomodasi
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                                    <div className="prose prose-gray max-w-none">
                                        {accommodation.description.split('\n').map(
                                            (paragraph, index) =>
                                                paragraph.trim() && (
                                                    <p
                                                        key={index}
                                                        className="mb-2 text-sm leading-relaxed text-muted-foreground last:mb-0 sm:mb-3 sm:text-base"
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
                                    <CardHeader className="p-4 sm:p-6">
                                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                            <MapPin className="h-4 w-4 flex-shrink-0 text-primary sm:h-5 sm:w-5" />
                                            Informasi Pengelola
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 sm:h-14 sm:w-14">
                                                <Bed className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="truncate text-base font-semibold text-foreground sm:text-lg">{institution.name}</h3>
                                                <p className="text-xs text-muted-foreground sm:text-sm">Pengelola Akomodasi</p>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                                            {institution.phone && (
                                                <div className="flex items-start gap-2 sm:gap-3">
                                                    <div className="flex-shrink-0 rounded-lg bg-muted p-1.5 sm:p-2">
                                                        <Phone className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-medium sm:text-sm">Telepon</p>
                                                        <p className="text-xs break-all text-muted-foreground sm:text-sm">{institution.phone}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {institution.email && (
                                                <div className="flex items-start gap-2 sm:gap-3">
                                                    <div className="flex-shrink-0 rounded-lg bg-muted p-1.5 sm:p-2">
                                                        <Mail className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-medium sm:text-sm">Email</p>
                                                        <p className="text-xs break-all text-muted-foreground sm:text-sm">{institution.email}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {institution.website && (
                                                <div className="flex items-start gap-2 sm:gap-3">
                                                    <div className="flex-shrink-0 rounded-lg bg-muted p-1.5 sm:p-2">
                                                        <Globe className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
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
                                                <div className="flex items-start gap-2 sm:gap-3 md:col-span-2">
                                                    <div className="flex-shrink-0 rounded-lg bg-muted p-1.5 sm:p-2">
                                                        <MapPin className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
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
                                    <CardHeader className="bg-primary/5 p-4 sm:p-6">
                                        <CardTitle className="text-center text-lg sm:text-xl">Detail Pemesanan</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 p-4 sm:space-y-6 sm:p-6">
                                        {/* Price */}
                                        <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-4 text-center sm:rounded-xl sm:p-6">
                                            <p className="mb-1 text-xs font-medium text-muted-foreground sm:mb-2 sm:text-sm">Harga Akomodasi</p>
                                            <div className="text-2xl font-bold break-words text-primary sm:text-3xl md:text-4xl">
                                                {accommodation.formatted_price}
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Booking Actions */}
                                        <div className="space-y-2 sm:space-y-3">
                                            <Button
                                                onClick={handleWhatsAppBooking}
                                                className="h-11 w-full bg-green-600 text-sm text-white shadow-md hover:bg-green-700 hover:shadow-lg sm:h-12 sm:text-base"
                                                size="lg"
                                            >
                                                <MessageCircle className="mr-2 h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                                                <span className="truncate">Pesan via WhatsApp</span>
                                            </Button>

                                            {institution?.phone && (
                                                <Button
                                                    onClick={handlePhoneCall}
                                                    variant="outline"
                                                    className="h-11 w-full text-sm shadow-sm sm:h-12 sm:text-base"
                                                    size="lg"
                                                >
                                                    <Phone className="mr-2 h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                                                    <span className="truncate">Hubungi Langsung</span>
                                                </Button>
                                            )}

                                            {institution?.email && (
                                                <Button
                                                    onClick={handleEmail}
                                                    variant="outline"
                                                    className="h-11 w-full text-sm shadow-sm sm:h-12 sm:text-base"
                                                    size="lg"
                                                >
                                                    <Mail className="mr-2 h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                                                    <span className="truncate">Kirim Email</span>
                                                </Button>
                                            )}
                                        </div>

                                        {/* Notice */}
                                        <div className="rounded-lg border-2 border-primary/20 bg-primary/5 p-3 sm:p-4">
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
