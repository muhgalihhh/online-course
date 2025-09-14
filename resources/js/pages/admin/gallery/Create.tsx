import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Upload, Youtube } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function GalleryCreate() {
    const [preview, setPreview] = useState<string | null>(null);
    const [fileType, setFileType] = useState<'image' | 'video'>('image');
    const [videoSource, setVideoSource] = useState<'file' | 'youtube'>('file');

    const { data, setData, post, processing, errors } = useForm({
        title: '',
        description: '',
        file: null as File | null,
        file_type: 'image' as 'image' | 'video',
        video_source: 'file' as 'file' | 'youtube',
        youtube_url: '',
        is_active: true,
    });

    // Reset video source when file type changes
    useEffect(() => {
        if (data.file_type === 'image') {
            setVideoSource('file');
            setData('video_source', 'file');
            setData('youtube_url', '');
        }
    }, [data.file_type]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('file', file);

            // Determine file type and create preview
            if (file.type.startsWith('image/')) {
                setFileType('image');
                setData('file_type', 'image');

                const reader = new FileReader();
                reader.onload = (e) => {
                    setPreview(e.target?.result as string);
                };
                reader.readAsDataURL(file);
            } else if (file.type.startsWith('video/')) {
                setFileType('video');
                setData('file_type', 'video');

                const videoUrl = URL.createObjectURL(file);
                setPreview(videoUrl);
            }
        }
    };

    const handleVideoSourceChange = (value: string) => {
        const source = value as 'file' | 'youtube';
        setVideoSource(source);
        setData('video_source', source);

        // Reset preview and file when switching
        if (source === 'youtube') {
            setPreview(null);
            setData('file', null);
        } else {
            setData('youtube_url', '');
        }
    };

    const handleYouTubeUrlChange = (url: string) => {
        setData('youtube_url', url);

        // Extract video ID and create thumbnail preview
        if (url) {
            const videoId = extractYouTubeVideoId(url);
            if (videoId) {
                setPreview(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
            }
        } else {
            setPreview(null);
        }
    };

    const extractYouTubeVideoId = (url: string): string | null => {
        const patterns = [
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
            /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/,
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
            if (match && match[2]) {
                return match[2];
            }
        }
        return null;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.galleries.store'));
    };

    return (
        <AdminLayout>
            <Head title="Tambah Item Galeri" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('admin.galleries.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold">Tambah Item Galeri</h1>
                            <p className="text-muted-foreground">Buat item galeri baru untuk website</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle>Informasi Item Galeri</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Judul</Label>
                                    <Input
                                        id="title"
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Masukkan judul item galeri"
                                        required
                                    />
                                    {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Deskripsi</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Masukkan deskripsi item galeri (opsional)"
                                        rows={4}
                                    />
                                    {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="file_type">Tipe File</Label>
                                    <Select value={data.file_type} onValueChange={(value) => setData('file_type', value as 'image' | 'video')}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih tipe file" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="image">Gambar</SelectItem>
                                            <SelectItem value="video">Video</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.file_type && <p className="text-sm text-red-600">{errors.file_type}</p>}
                                </div>

                                {data.file_type === 'video' && (
                                    <div className="space-y-3">
                                        <Label>Sumber Video</Label>
                                        <RadioGroup value={videoSource} onValueChange={handleVideoSourceChange} className="flex flex-col space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="file" id="file" />
                                                <Label htmlFor="file" className="flex cursor-pointer items-center space-x-2">
                                                    <Upload className="h-4 w-4" />
                                                    <span>Upload File Video</span>
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="youtube" id="youtube" />
                                                <Label htmlFor="youtube" className="flex cursor-pointer items-center space-x-2">
                                                    <Youtube className="h-4 w-4" />
                                                    <span>Video YouTube</span>
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                        {errors.video_source && <p className="text-sm text-red-600">{errors.video_source}</p>}
                                    </div>
                                )}

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                    />
                                    <Label htmlFor="is_active">Aktif</Label>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle>
                                    {data.file_type === 'video' && videoSource === 'youtube'
                                        ? 'URL Video YouTube'
                                        : `Upload File ${data.file_type === 'image' ? 'Gambar' : 'Video'}`}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {data.file_type === 'video' && videoSource === 'youtube' ? (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="youtube_url">URL YouTube</Label>
                                            <Input
                                                id="youtube_url"
                                                type="url"
                                                value={data.youtube_url}
                                                onChange={(e) => handleYouTubeUrlChange(e.target.value)}
                                                placeholder="https://www.youtube.com/watch?v=..."
                                                required
                                            />
                                            <p className="text-xs text-gray-500">
                                                Masukkan URL video YouTube (format: youtube.com/watch?v=... atau youtu.be/...)
                                            </p>
                                            {errors.youtube_url && <p className="text-sm text-red-600">{errors.youtube_url}</p>}
                                        </div>

                                        {preview && (
                                            <div className="space-y-2">
                                                <Label>Preview</Label>
                                                <div className="relative">
                                                    <img
                                                        src={preview}
                                                        alt="YouTube Thumbnail"
                                                        className="w-full rounded-lg object-cover"
                                                        onError={() => setPreview(null)}
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <Youtube className="h-12 w-12 text-white drop-shadow-lg" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Label htmlFor="file">File {data.file_type === 'image' ? 'Gambar' : 'Video'}</Label>
                                        <div className="flex w-full items-center justify-center">
                                            <label
                                                htmlFor="file"
                                                className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
                                            >
                                                {preview ? (
                                                    <div className="h-full w-full">
                                                        {fileType === 'image' ? (
                                                            <img src={preview} alt="Preview" className="h-full w-full rounded-lg object-cover" />
                                                        ) : (
                                                            <video src={preview} className="h-full w-full rounded-lg object-cover" controls />
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <Upload className="mb-4 h-8 w-8 text-gray-500" />
                                                        <p className="mb-2 text-sm text-gray-500">
                                                            <span className="font-semibold">Klik untuk upload</span> atau drag and drop
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {data.file_type === 'image' ? 'PNG, JPG, JPEG, GIF, WEBP' : 'MP4, MOV, AVI, WMV'} (MAX.{' '}
                                                            {data.file_type === 'image' ? '10' : '50'}MB)
                                                        </p>
                                                    </div>
                                                )}
                                                <input
                                                    id="file"
                                                    type="file"
                                                    className="hidden"
                                                    accept={
                                                        data.file_type === 'image'
                                                            ? 'image/jpeg,image/png,image/gif,image/webp'
                                                            : 'video/mp4,video/mov,video/avi,video/wmv'
                                                    }
                                                    onChange={handleFileChange}
                                                    required={!(data.file_type === 'video' && videoSource === 'youtube')}
                                                />
                                            </label>
                                        </div>
                                        {errors.file && <p className="text-sm text-red-600">{errors.file}</p>}

                                        {data.file && (
                                            <div className="text-sm text-gray-600">
                                                <p>File dipilih: {data.file.name}</p>
                                                <p>Ukuran: {(data.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="mt-6 flex justify-end space-x-2">
                        <Link href={route('admin.galleries.index')}>
                            <Button variant="outline">Batal</Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan Item Galeri'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
