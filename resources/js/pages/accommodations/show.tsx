import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import GuestLayout from '@/layouts/guest-layout';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Bed, Clock, Globe, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';

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
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="border-b bg-white">
                    <div className="container mx-auto px-4 py-6">
                        <Button variant="ghost" size="sm" asChild className="mb-4">
                            <Link href={route('accommodations.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali ke Daftar Akomodasi
                            </Link>
                        </Button>

                        <div className="mb-2 flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-gray-900">{accommodation.name}</h1>
                            <Badge variant="secondary">
                                <Bed className="mr-1 h-3 w-3" />
                                Akomodasi
                            </Badge>
                        </div>

                        {institution?.address && (
                            <div className="flex items-center text-gray-600">
                                <MapPin className="mr-2 h-4 w-4" />
                                <span>{institution.address}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Left Column - Image and Description */}
                        <div className="space-y-6 lg:col-span-2">
                            {/* Image */}
                            <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-100">
                                <img src={accommodation.image_url} alt={accommodation.name} className="h-full w-full object-cover" />
                            </div>

                            {/* Description */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Deskripsi Akomodasi</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="prose prose-gray max-w-none">
                                        {accommodation.description.split('\n').map(
                                            (paragraph, index) =>
                                                paragraph.trim() && (
                                                    <p key={index} className="mb-4 leading-relaxed text-gray-700">
                                                        {paragraph}
                                                    </p>
                                                ),
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Institution Information */}
                            {institution && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Informasi Pengelola</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                                <Bed className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold">{institution.name}</h3>
                                                <p className="text-sm text-gray-600">Pengelola Akomodasi</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2">
                                            {institution.phone && (
                                                <div className="flex items-center gap-3">
                                                    <Phone className="h-4 w-4 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-medium">Telepon</p>
                                                        <p className="text-sm text-gray-600">{institution.phone}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {institution.email && (
                                                <div className="flex items-center gap-3">
                                                    <Mail className="h-4 w-4 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-medium">Email</p>
                                                        <p className="text-sm text-gray-600">{institution.email}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {institution.website && (
                                                <div className="flex items-center gap-3">
                                                    <Globe className="h-4 w-4 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-medium">Website</p>
                                                        <a
                                                            href={institution.website}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-blue-600 hover:underline"
                                                        >
                                                            {institution.website}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}

                                            {institution.address && (
                                                <div className="flex items-start gap-3 md:col-span-2">
                                                    <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                                                    <div>
                                                        <p className="text-sm font-medium">Alamat</p>
                                                        <p className="text-sm text-gray-600">{institution.address}</p>
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
                            <div className="sticky top-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-center">Detail Pemesanan</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Price */}
                                        <div className="text-center">
                                            <div className="mb-1 text-3xl font-bold text-blue-600">{accommodation.formatted_price}</div>
                                            <p className="text-sm text-gray-600">per malam</p>
                                        </div>

                                        <Separator />

                                        {/* Amenities or Features */}
                                        <div>
                                            <h4 className="mb-3 font-semibold">Informasi Umum</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    <span>Check-in: 14:00</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    <span>Check-out: 12:00</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Bed className="h-4 w-4 text-gray-400" />
                                                    <span>Fasilitas sesuai deskripsi</span>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Booking Actions */}
                                        <div className="space-y-3">
                                            <Button
                                                onClick={handleWhatsAppBooking}
                                                className="w-full bg-green-600 text-white hover:bg-green-700"
                                                size="lg"
                                            >
                                                <MessageCircle className="mr-2 h-4 w-4" />
                                                Pesan via WhatsApp
                                            </Button>

                                            {institution?.phone && (
                                                <Button onClick={handlePhoneCall} variant="outline" className="w-full" size="lg">
                                                    <Phone className="mr-2 h-4 w-4" />
                                                    Hubungi Langsung
                                                </Button>
                                            )}

                                            {institution?.email && (
                                                <Button onClick={handleEmail} variant="outline" className="w-full" size="lg">
                                                    <Mail className="mr-2 h-4 w-4" />
                                                    Kirim Email
                                                </Button>
                                            )}
                                        </div>

                                        {/* Notice */}
                                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                            <p className="text-sm text-blue-800">
                                                <strong>Catatan:</strong> Untuk melakukan pemesanan, silakan hubungi kami melalui WhatsApp atau kontak
                                                yang tersedia. Kami akan membantu Anda dengan informasi ketersediaan dan proses pemesanan.
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
