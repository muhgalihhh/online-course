import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import WeatherWidget from '@/components/weather-widget';
import axios from 'axios';
import { CloudRain } from 'lucide-react';
import { useEffect, useState } from 'react';

interface WeatherButtonProps {
    defaultLocation?: string;
}

export default function WeatherButton({ defaultLocation }: WeatherButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [institutionLocation, setInstitutionLocation] = useState<string>(defaultLocation || 'Pare, Kediri');

    useEffect(() => {
        // If no defaultLocation is provided, fetch from API
        if (!defaultLocation) {
            const fetchInstitutionLocation = async () => {
                try {
                    const response = await axios.get('/api/institution/location');
                    setInstitutionLocation(response.data.address || 'Pare, Kediri');
                } catch (error) {
                    console.error('Failed to fetch institution location:', error);
                    setInstitutionLocation('Pare, Kediri');
                }
            };

            fetchInstitutionLocation();
        }
    }, [defaultLocation]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0" title="Informasi Cuaca">
                    <CloudRain className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CloudRain className="h-5 w-5" />
                        Informasi Cuaca Hari Ini
                    </DialogTitle>
                    <DialogDescription>Lihat kondisi cuaca terkini untuk perencanaan aktivitas belajar yang optimal</DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                    <WeatherWidget defaultLocation={institutionLocation} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
