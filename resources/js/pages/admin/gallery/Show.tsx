import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download, Edit, Eye, Image, Video } from 'lucide-react';

interface Gallery {
    id: number;
    title: string;
    description: string;
    file_path: string | null;
    file_type: 'image' | 'video';
    video_source?: 'file' | 'youtube';
    file_url: string | null;
    youtube_url?: string | null;
    youtube_video_id?: string | null;
    youtube_thumbnail?: string | null;
    youtube_embed_url?: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface GalleryShowProps extends PageProps {
    gallery: Gallery;
}

export default function GalleryShow({ gallery }: GalleryShowProps) {
    return (
        <AdminLayout>
            <Head title={`Gallery: ${gallery.title}`} />

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
                            <h1 className="text-3xl font-bold">Detail Item Galeri</h1>
                            <p className="text-muted-foreground">Lihat detail item galeri</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Link href={route('admin.galleries.edit', gallery.id)}>
                            <Button>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* File Preview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                {gallery.file_type === 'image' ? (
                                    <>
                                        <Image className="h-5 w-5" />
                                        <span>Preview Gambar</span>
                                    </>
                                ) : (
                                    <>
                                        <Video className="h-5 w-5" />
                                        <span>Preview Video</span>
                                    </>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-hidden rounded-lg bg-gray-100">
                                {gallery.file_type === 'image' && gallery.file_url ? (
                                    <img src={gallery.file_url} alt={gallery.title} className="h-auto w-full object-contain" />
                                ) : gallery.file_type === 'video' && gallery.video_source === 'file' && gallery.file_url ? (
                                    <video src={gallery.file_url} controls className="h-auto w-full">
                                        Your browser does not support the video tag.
                                    </video>
                                ) : gallery.file_type === 'video' && gallery.video_source === 'youtube' && gallery.youtube_embed_url ? (
                                    <div className="aspect-video w-full">
                                        <iframe
                                            src={gallery.youtube_embed_url}
                                            title={gallery.title}
                                            className="h-full w-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                        />
                                    </div>
                                ) : (
                                    <div className="flex h-64 w-full items-center justify-center text-gray-400">Tidak ada preview tersedia</div>
                                )}
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Badge variant={gallery.file_type === 'image' ? 'default' : 'secondary'}>
                                        {gallery.file_type === 'image' ? 'Gambar' : 'Video'}
                                    </Badge>
                                    <Badge variant={gallery.is_active ? 'default' : 'destructive'}>
                                        {gallery.is_active ? 'Aktif' : 'Tidak Aktif'}
                                    </Badge>
                                </div>
                                {gallery.file_type === 'image' && gallery.file_url && (
                                    <div className="flex items-center space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => window.open(gallery.file_url!, '_blank')}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            Lihat Full
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = gallery.file_url!;
                                                link.download = gallery.title;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }}
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* File Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Item</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-600">Judul</Label>
                                <p className="mt-1 text-sm text-gray-900">{gallery.title}</p>
                            </div>

                            {gallery.description && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Deskripsi</Label>
                                    <p className="mt-1 text-sm text-gray-900">{gallery.description}</p>
                                </div>
                            )}

                            <div>
                                <Label className="text-sm font-medium text-gray-600">Tipe File</Label>
                                <p className="mt-1">
                                    <Badge variant={gallery.file_type === 'image' ? 'default' : 'secondary'}>
                                        {gallery.file_type === 'image' ? 'Gambar' : 'Video'}
                                    </Badge>
                                </p>
                            </div>

                            <div>
                                <Label className="text-sm font-medium text-gray-600">Status</Label>
                                <p className="mt-1">
                                    <Badge variant={gallery.is_active ? 'default' : 'destructive'}>
                                        {gallery.is_active ? 'Aktif' : 'Tidak Aktif'}
                                    </Badge>
                                </p>
                            </div>

                            {gallery.file_path && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Path File</Label>
                                    <p className="mt-1 rounded bg-gray-100 p-2 font-mono text-sm text-gray-900">{gallery.file_path}</p>
                                </div>
                            )}

                            {gallery.video_source === 'youtube' && gallery.youtube_url && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">YouTube URL</Label>
                                    <p className="mt-1 text-sm break-all text-blue-700 underline">
                                        <a href={gallery.youtube_url} target="_blank" rel="noopener noreferrer">
                                            {gallery.youtube_url}
                                        </a>
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Dibuat</Label>
                                    <p className="mt-1 text-sm text-gray-900">{new Date(gallery.created_at).toLocaleString('id-ID')}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-600">Diperbarui</Label>
                                    <p className="mt-1 text-sm text-gray-900">{new Date(gallery.updated_at).toLocaleString('id-ID')}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
    return <label className={className}>{children}</label>;
}
