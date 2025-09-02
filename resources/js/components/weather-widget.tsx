import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import axios from 'axios';
import {
    Clock,
    Cloud,
    CloudDrizzle,
    CloudLightning,
    CloudRain,
    CloudSnow,
    Droplets,
    Edit2,
    Eye,
    Loader2,
    MapPin,
    Search,
    Sun,
    Thermometer,
    Wind,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

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

interface WeatherWidgetProps {
    defaultLocation?: string;
}

const WeatherWidget = ({ defaultLocation = 'Pare, Kediri' }: WeatherWidgetProps) => {
    const [weather, setWeather] = useState<WeatherData>({
        location: defaultLocation,
        temperature: 28,
        condition: 'Cerah Berawan',
        humidity: 75,
        windSpeed: 12,
        visibility: 10,
        feelsLike: 30,
        icon: <Cloud className="h-6 w-6" />,
        description: 'Cerah dengan sedikit awan',
    });

    const [currentTime, setCurrentTime] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false);
    const [searchLocation, setSearchLocation] = useState(defaultLocation);
    const [isEditingLocation, setIsEditingLocation] = useState(false);
    const [inputLocation, setInputLocation] = useState('');
    const [error, setError] = useState<string | null>(null);

    const API_KEY = 'c652cbba36019afd965ac4cb698ba98f';
    const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        // Fetch weather on component mount
        fetchWeather(searchLocation);

        return () => clearInterval(timer);
    }, []);

    const getWeatherIcon = (weatherCode: string, iconCode?: string) => {
        // Map OpenWeather icon codes to our icons
        if (iconCode) {
            const mainCode = iconCode.slice(0, 2);
            switch (mainCode) {
                case '01': // Clear
                    return <Sun className="h-6 w-6 text-yellow-500" />;
                case '02': // Few clouds
                case '03': // Scattered clouds
                    return <Cloud className="h-6 w-6 text-gray-500" />;
                case '04': // Broken clouds
                    return <Cloud className="h-6 w-6 text-gray-600" />;
                case '09': // Shower rain
                case '10': // Rain
                    return <CloudRain className="h-6 w-6 text-blue-500" />;
                case '11': // Thunderstorm
                    return <CloudLightning className="h-6 w-6 text-yellow-600" />;
                case '13': // Snow
                    return <CloudSnow className="h-6 w-6 text-blue-300" />;
                case '50': // Mist
                    return <CloudDrizzle className="h-6 w-6 text-gray-400" />;
                default:
                    return <Sun className="h-6 w-6 text-yellow-500" />;
            }
        }

        // Fallback to weather condition text
        switch (weatherCode.toLowerCase()) {
            case 'clear':
                return <Sun className="h-6 w-6 text-yellow-500" />;
            case 'clouds':
                return <Cloud className="h-6 w-6 text-gray-500" />;
            case 'rain':
                return <CloudRain className="h-6 w-6 text-blue-500" />;
            case 'thunderstorm':
                return <CloudLightning className="h-6 w-6 text-yellow-600" />;
            case 'snow':
                return <CloudSnow className="h-6 w-6 text-blue-300" />;
            case 'mist':
            case 'fog':
                return <CloudDrizzle className="h-6 w-6 text-gray-400" />;
            default:
                return <Sun className="h-6 w-6 text-yellow-500" />;
        }
    };

    const fetchWeather = async (location: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.get(API_URL, {
                params: {
                    q: location,
                    appid: API_KEY,
                    units: 'metric',
                    lang: 'id',
                },
            });

            const data = response.data;

            setWeather({
                location: `${data.name}, ${data.sys.country}`,
                temperature: Math.round(data.main.temp),
                condition: data.weather[0].main,
                description: data.weather[0].description,
                humidity: data.main.humidity,
                windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
                visibility: Math.round(data.visibility / 1000), // Convert m to km
                feelsLike: Math.round(data.main.feels_like),
                icon: getWeatherIcon(data.weather[0].main, data.weather[0].icon),
            });

            setSearchLocation(location);
        } catch (err: unknown) {
            console.error('Error fetching weather:', err);
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { status?: number } };
                if (axiosError.response?.status === 404) {
                    setError('Lokasi tidak ditemukan. Silakan coba nama kota lain.');
                } else {
                    setError('Gagal memuat data cuaca. Silakan coba lagi.');
                }
            } else {
                setError('Gagal memuat data cuaca. Silakan coba lagi.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleLocationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputLocation.trim()) {
            fetchWeather(inputLocation.trim());
            setIsEditingLocation(false);
            setInputLocation('');
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const popularCities = ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar', 'Yogyakarta', 'Bali'];

    return (
        <Card className="border-0 shadow-lg">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <CloudRain className="h-5 w-5" />
                            Informasi Cuaca
                        </CardTitle>
                        <CardDescription>Cuaca real-time untuk perencanaan kegiatan belajar</CardDescription>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(currentTime)}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Location Search */}
                    <div className="space-y-2">
                        {isEditingLocation ? (
                            <form onSubmit={handleLocationSubmit} className="space-y-2">
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        placeholder="Masukkan nama kota..."
                                        value={inputLocation}
                                        onChange={(e) => setInputLocation(e.target.value)}
                                        className="flex-1"
                                        autoFocus
                                    />
                                    <Button type="submit" size="sm" disabled={isLoading}>
                                        <Search className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setIsEditingLocation(false);
                                            setInputLocation('');
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {popularCities.map((city) => (
                                        <Button
                                            key={city}
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-7 px-2 text-xs"
                                            onClick={() => {
                                                fetchWeather(city);
                                                setIsEditingLocation(false);
                                                setInputLocation('');
                                            }}
                                        >
                                            {city}
                                        </Button>
                                    ))}
                                </div>
                            </form>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Lokasi</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">{weather.location}</span>
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setIsEditingLocation(true)}>
                                        <Edit2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {error && <div className="rounded bg-red-50 p-2 text-sm text-red-500 dark:bg-red-900/20">{error}</div>}

                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <>
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
                                    {weather.icon}
                                    <span className="text-sm text-muted-foreground">Kondisi</span>
                                </div>
                                <div className="text-right">
                                    <span className="block font-medium">{weather.condition}</span>
                                    <span className="text-xs text-muted-foreground capitalize">{weather.description}</span>
                                </div>
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
                        </>
                    )}

                    <div className="pt-2 text-center text-xs text-muted-foreground">{formatDate(currentTime)}</div>

                    <Button variant="outline" size="sm" className="w-full" onClick={() => fetchWeather(searchLocation)} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Memperbarui...
                            </>
                        ) : (
                            'Perbarui Cuaca'
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default WeatherWidget;
