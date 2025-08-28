import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { 
    CloudRain, 
    Sun, 
    Cloud, 
    CloudLightning, 
    Wind, 
    MapPin, 
    Thermometer,
    Droplets,
    Eye,
    Clock,
    CloudSnow,
    CloudDrizzle,
    Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface WeatherData {
    location: string;
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    visibility: number;
    feelsLike: number;
    icon: React.ReactNode;
    description: string;
}

const WeatherWidget = () => {
    const [weather, setWeather] = useState<WeatherData>({
        location: "Pare, Kediri",
        temperature: 28,
        condition: "Cerah Berawan",
        humidity: 75,
        windSpeed: 12,
        visibility: 10,
        feelsLike: 30,
        icon: <Cloud className="h-6 w-6" />
    });

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const getWeatherIcon = (condition: string) => {
        switch (condition.toLowerCase()) {
            case 'cerah':
                return <Sun className="h-6 w-6 text-yellow-500" />;
            case 'cerah berawan':
                return <Cloud className="h-6 w-6 text-gray-500" />;
            case 'berawan':
                return <Cloud className="h-6 w-6 text-gray-600" />;
            case 'hujan':
                return <CloudRain className="h-6 w-6 text-blue-500" />;
            case 'hujan petir':
                return <CloudLightning className="h-6 w-6 text-yellow-600" />;
            default:
                return <Sun className="h-6 w-6 text-yellow-500" />;
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <CloudRain className="h-5 w-5" />
                            Informasi Cuaca
                        </CardTitle>
                        <CardDescription>
                            Cuaca real-time untuk perencanaan kegiatan belajar
                        </CardDescription>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(currentTime)}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Current Weather */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Lokasi</span>
                        </div>
                        <span className="font-medium">{weather.location}</span>
                    </div>
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Thermometer className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Suhu</span>
                        </div>
                        <span className="font-medium">{weather.temperature}°C</span>
                    </div>
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {getWeatherIcon(weather.condition)}
                            <span className="text-sm text-muted-foreground">Kondisi</span>
                        </div>
                        <span className="font-medium">{weather.condition}</span>
                    </div>
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Droplets className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Kelembaban</span>
                        </div>
                        <span className="font-medium">{weather.humidity}%</span>
                    </div>
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Wind className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Kecepatan Angin</span>
                        </div>
                        <span className="font-medium">{weather.windSpeed} km/h</span>
                    </div>
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Jarak Pandang</span>
                        </div>
                        <span className="font-medium">{weather.visibility} km</span>
                    </div>
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Thermometer className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Terasa Seperti</span>
                        </div>
                        <span className="font-medium">{weather.feelsLike}°C</span>
                    </div>
                    
                    <div className="pt-2 text-xs text-muted-foreground text-center">
                        {formatDate(currentTime)}
                    </div>
                    
                    <Button variant="outline" size="sm" className="w-full">
                        Perbarui Cuaca
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default WeatherWidget;