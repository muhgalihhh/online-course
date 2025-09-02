import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import axios from 'axios';
import { CloudRain, Droplets, MapPin, RefreshCw, Wind } from 'lucide-react';
import { useEffect, useState } from 'react';

interface WeatherDropdownProps {
    defaultLocation?: string;
}

interface SimpleWeatherData {
    location: string;
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number; // km/h
    description: string;
}

const API_KEY = 'c652cbba36019afd965ac4cb698ba98f';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

export default function WeatherDropdown({ defaultLocation = 'Pare, Kediri' }: WeatherDropdownProps) {
    const [data, setData] = useState<SimpleWeatherData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchWeather = async (loc: string) => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get(API_URL, {
                params: { q: loc, appid: API_KEY, units: 'metric', lang: 'id' },
            });
            const w = res.data;
            setData({
                location: `${w.name}, ${w.sys.country}`,
                temperature: Math.round(w.main.temp),
                condition: w.weather[0].main,
                description: w.weather[0].description,
                humidity: w.main.humidity,
                windSpeed: Math.round(w.wind.speed * 3.6),
            });
        } catch (e) {
            setError('Gagal memuat cuaca');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWeather(defaultLocation);
    }, [defaultLocation]);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0" title="Ringkasan Cuaca">
                    <CloudRain className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72" align="end">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span className="text-sm font-medium">Cuaca</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => fetchWeather(data?.location || defaultLocation)}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                        <span className="sr-only">Refresh</span>
                    </Button>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-1 text-xs text-muted-foreground">Ringkasan cuaca lokasi institusi</div>
                <div className="px-3 py-2">
                    {error && <p className="text-xs text-red-500">{error}</p>}
                    {!error && (
                        <div className="space-y-2">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <MapPin className="h-3 w-3" />
                                        <span className="max-w-[140px] truncate">{data?.location || defaultLocation}</span>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-semibold">{data ? data.temperature : '--'}°</span>
                                        <Badge variant="secondary" className="capitalize">
                                            {data?.description || 'Memuat...'}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1 text-right text-[10px] text-muted-foreground">
                                    <span>{data?.condition}</span>
                                    <span>Diperbarui {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                                <div className="flex items-center gap-1">
                                    <Droplets className="h-3 w-3" />
                                    <span>Kelembaban</span>
                                    <span className="ml-auto font-medium">{data ? `${data.humidity}%` : '--'}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Wind className="h-3 w-3" />
                                    <span>Angin</span>
                                    <span className="ml-auto font-medium">{data ? `${data.windSpeed} km/j` : '--'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs text-muted-foreground" onSelect={(e) => e.preventDefault()}>
                    Data oleh OpenWeatherMap
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
