import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import {
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
    RefreshCw,
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

interface WeatherCardProps {
    defaultLocation?: string;
}

const WeatherCard = ({ defaultLocation = 'Pare, Kediri' }: WeatherCardProps) => {
    const [weather, setWeather] = useState<WeatherData>({
        location: defaultLocation,
        temperature: 28,
        condition: 'Cerah Berawan',
        humidity: 75,
        windSpeed: 12,
        visibility: 10,
        feelsLike: 30,
        icon: <Cloud className="h-8 w-8" />,
        description: 'Cerah dengan sedikit awan',
    });

    const [currentTime, setCurrentTime] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditingLocation, setIsEditingLocation] = useState(false);
    const [searchLocation, setSearchLocation] = useState('');
    const [currentLocation, setCurrentLocation] = useState(defaultLocation);
    const [showAllCities, setShowAllCities] = useState(false);

    const API_KEY = 'c652cbba36019afd965ac4cb698ba98f';
    const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

    // Daftar kota populer
    const popularCities = [
        'Jakarta',
        'Surabaya',
        'Bandung',
        'Medan',
        'Semarang',
        'Makassar',
        'Yogyakarta',
        'Denpasar',
        'Malang',
        'Kediri',
        'Pare',
        'Bogor',
        'Depok',
        'Tangerang',
        'Bekasi',
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        // Fetch weather on component mount
        fetchWeather(defaultLocation);

        return () => clearInterval(timer);
    }, [defaultLocation]);

    const getWeatherIcon = (weatherCode: string, iconCode?: string) => {
        // Map OpenWeather icon codes to our icons with colors
        if (iconCode) {
            const mainCode = iconCode.slice(0, 2);
            switch (mainCode) {
                case '01': // Clear
                    return <Sun className="h-8 w-8 text-yellow-400" />;
                case '02': // Few clouds
                case '03': // Scattered clouds
                    return <Cloud className="h-8 w-8 text-blue-300" />;
                case '04': // Broken clouds
                    return <Cloud className="h-8 w-8 text-gray-400" />;
                case '09': // Shower rain
                case '10': // Rain
                    return <CloudRain className="h-8 w-8 text-blue-400" />;
                case '11': // Thunderstorm
                    return <CloudLightning className="h-8 w-8 text-yellow-500" />;
                case '13': // Snow
                    return <CloudSnow className="h-8 w-8 text-blue-200" />;
                case '50': // Mist
                    return <CloudDrizzle className="h-8 w-8 text-gray-300" />;
                default:
                    return <Sun className="h-8 w-8 text-yellow-400" />;
            }
        }

        // Fallback to weather condition text
        switch (weatherCode.toLowerCase()) {
            case 'clear':
                return <Sun className="h-8 w-8 text-yellow-400" />;
            case 'clouds':
                return <Cloud className="h-8 w-8 text-blue-300" />;
            case 'rain':
                return <CloudRain className="h-8 w-8 text-blue-400" />;
            case 'thunderstorm':
                return <CloudLightning className="h-8 w-8 text-yellow-500" />;
            case 'snow':
                return <CloudSnow className="h-8 w-8 text-blue-200" />;
            case 'mist':
            case 'fog':
                return <CloudDrizzle className="h-8 w-8 text-gray-300" />;
            default:
                return <Sun className="h-8 w-8 text-yellow-400" />;
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

            setCurrentLocation(location);
        } catch (err: unknown) {
            console.error('Error fetching weather:', err);
            setError('Gagal memuat data cuaca');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLocationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchLocation.trim()) {
            fetchWeather(searchLocation.trim());
            setIsEditingLocation(false);
            setSearchLocation('');
        }
    };

    const handleLocationChange = (location: string) => {
        fetchWeather(location);
        setIsEditingLocation(false);
        setSearchLocation('');
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        });
    };

    if (error) {
        return (
            <Card className="overflow-hidden border-0 bg-white/10 backdrop-blur-md">
                <CardContent className="p-6">
                    <div className="text-center text-white">
                        <p className="mb-4">{error}</p>
                        <Button
                            onClick={() => fetchWeather(defaultLocation)}
                            variant="outline"
                            size="sm"
                            className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Coba Lagi
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden border-0 bg-white/10 shadow-2xl backdrop-blur-md">
            <CardContent className="p-0">
                {/* Header with gradient background */}
                <div className="space-y-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-4">
                    {/* Location display/edit */}
                    {isEditingLocation ? (
                        <form onSubmit={handleLocationSubmit} className="space-y-3">
                            <div className="flex gap-2">
                                <Input
                                    type="text"
                                    placeholder="Masukkan nama kota..."
                                    value={searchLocation}
                                    onChange={(e) => setSearchLocation(e.target.value)}
                                    className="flex-1 border-white/30 bg-white/10 text-white placeholder:text-gray-300 focus:bg-white/20"
                                    autoFocus
                                />
                                <Button type="submit" size="sm" disabled={isLoading} className="bg-white/20 text-white hover:bg-white/30">
                                    <Search className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setIsEditingLocation(false);
                                        setSearchLocation('');
                                    }}
                                    className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            {/* Popular cities */}
                            <div className="space-y-2">
                                <div className="text-xs text-gray-300">Kota Populer:</div>
                                <div className="flex flex-wrap gap-1">
                                    {popularCities.slice(0, 8).map((city) => (
                                        <Button
                                            key={city}
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-7 border-white/30 bg-white/10 px-2 text-xs text-white hover:bg-white/20"
                                            onClick={() => handleLocationChange(city)}
                                        >
                                            {city}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 text-white">
                                    <MapPin className="h-4 w-4" />
                                    <span className="text-sm font-medium">{weather.location}</span>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0 text-white hover:bg-white/20"
                                    onClick={() => setIsEditingLocation(true)}
                                >
                                    <Edit2 className="h-3 w-3" />
                                </Button>
                            </div>
                            <Button
                                onClick={() => fetchWeather(currentLocation)}
                                disabled={isLoading}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-white hover:bg-white/20"
                            >
                                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Main weather display */}
                <div className="p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Temperature and icon */}
                            <div className="flex items-center justify-between">
                                <div className="text-white">
                                    <div className="text-4xl font-bold">{weather.temperature}°C</div>
                                    <div className="text-sm text-gray-200 capitalize">{weather.description}</div>
                                </div>
                                <div className="flex flex-col items-center">
                                    {weather.icon}
                                    <Badge variant="secondary" className="mt-2 bg-white/20 text-white">
                                        {weather.condition}
                                    </Badge>
                                </div>
                            </div>

                            {/* Weather details grid */}
                            <div className="grid grid-cols-2 gap-4 rounded-lg bg-white/5 p-4">
                                <div className="flex items-center gap-2 text-white">
                                    <Thermometer className="h-4 w-4 text-orange-400" />
                                    <div>
                                        <div className="text-xs text-gray-300">Terasa Seperti</div>
                                        <div className="font-semibold">{weather.feelsLike}°C</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-white">
                                    <Droplets className="h-4 w-4 text-blue-400" />
                                    <div>
                                        <div className="text-xs text-gray-300">Kelembaban</div>
                                        <div className="font-semibold">{weather.humidity}%</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-white">
                                    <Wind className="h-4 w-4 text-green-400" />
                                    <div>
                                        <div className="text-xs text-gray-300">Angin</div>
                                        <div className="font-semibold">{weather.windSpeed} km/h</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-white">
                                    <Eye className="h-4 w-4 text-purple-400" />
                                    <div>
                                        <div className="text-xs text-gray-300">Jarak Pandang</div>
                                        <div className="font-semibold">{weather.visibility} km</div>
                                    </div>
                                </div>
                            </div>

                            {/* Time and date */}
                            <div className="rounded-lg bg-white/5 p-3 text-center text-white">
                                <div className="text-lg font-semibold">{formatTime(currentTime)}</div>
                                <div className="text-xs text-gray-300">{formatDate(currentTime)}</div>
                            </div>

                            {/* Quick access cities */}
                            {!isEditingLocation && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-white">
                                        <div className="text-sm font-medium">Kota Lain</div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowAllCities(!showAllCities)}
                                            className="h-6 text-xs text-gray-300 hover:bg-white/10 hover:text-white"
                                        >
                                            {showAllCities ? 'Sembunyikan' : 'Lihat Semua'}
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap gap-2">
                                            {(showAllCities ? popularCities : popularCities.slice(0, 6)).map((city) => (
                                                <Button
                                                    key={city}
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 border-white/30 bg-white/10 px-3 text-xs text-white hover:bg-white/20"
                                                    onClick={() => handleLocationChange(city)}
                                                    disabled={isLoading}
                                                >
                                                    {city}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default WeatherCard;
