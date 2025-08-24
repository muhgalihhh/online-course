import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
    Star, 
    MapPin, 
    Phone, 
    Mail, 
    Globe, 
    Users, 
    BookOpen,
    ExternalLink,
    MessageCircle
} from 'lucide-react';
import { Link } from '@inertiajs/react';

interface Institution {
    id: number;
    name: string;
    phone: string;
    email: string;
    address: string;
    website: string;
    rating: number;
    reviews: number;
    students: number;
    courses: number;
    description: string;
    category: string;
    location: string;
}

interface InstitutionCardProps {
    institution: Institution;
    showDetails?: boolean;
}

const InstitutionCard: React.FC<InstitutionCardProps> = ({ institution, showDetails = false }) => {
    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                className={`h-4 w-4 ${
                    i < Math.floor(rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                }`}
            />
        ));
    };

    return (
        <Card className="hover:shadow-lg transition-shadow border-0 shadow-md">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{institution.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mb-2">
                            <MapPin className="h-3 w-3" />
                            {institution.location}
                        </CardDescription>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1">
                                {renderStars(institution.rating)}
                            </div>
                            <Badge variant="secondary" className="text-xs">
                                {institution.rating} ({institution.reviews} ulasan)
                            </Badge>
                        </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                        {institution.category}
                    </Badge>
                </div>
            </CardHeader>
            
            <CardContent>
                <div className="space-y-3">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span>{institution.students.toLocaleString()} siswa</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                            <span>{institution.courses} kursus</span>
                        </div>
                    </div>

                    {/* Description */}
                    {showDetails && (
                        <p className="text-sm text-muted-foreground">
                            {institution.description}
                        </p>
                    )}

                    {/* Contact Information */}
                    {showDetails && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="h-4 w-4" />
                                    <span>{institution.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <span>{institution.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <MapPin className="h-4 w-4" />
                                    <span>{institution.address}</span>
                                </div>
                                {institution.website && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Globe className="h-4 w-4" />
                                        <a 
                                            href={institution.website} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline flex items-center gap-1"
                                        >
                                            <span>Website</span>
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        <Button className="flex-1" size="sm">
                            <Link href={`/lembaga/${institution.id}`}>
                                {showDetails ? 'Lihat Kursus' : 'Lihat Detail'}
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>Chat</span>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default InstitutionCard;