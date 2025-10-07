import GuestLayout from '@/layouts/guest-layout';
import { type PaginatedData } from '@/types';
import { Head, router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

// Type definitions for gallery items
interface Gallery {
    id: number;
    title: string;
    description: string;
    file_url: string | null;
    file_type: 'image' | 'video';
    youtube_url?: string;
    video_source?: 'file' | 'youtube';
    youtube_video_id?: string | null;
    youtube_thumbnail?: string | null;
    youtube_embed_url?: string | null;
    is_active: boolean;
    created_at: string;
}

interface PageProps {
    auth?: {
        user?: unknown;
    };
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface GalleryIndexProps extends PageProps {
    galleries: PaginatedData<Gallery>;
    filters: {
        search: string;
        type: string;
    };
}

interface InertiaPageComponent<P = Record<string, unknown>> extends React.FC<P> {
    layout?: (page: React.ReactNode) => React.ReactNode;
}

const GalleryIndex: InertiaPageComponent<GalleryIndexProps> = ({ galleries, filters }) => {
    const [searchQuery, setSearchQuery] = useState(filters.search);
    const [typeFilter, setTypeFilter] = useState(filters.type);
    const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Helper functions
    const isYouTubeVideo = (gallery: Gallery) => {
        return gallery.file_type === 'video' && gallery.video_source === 'youtube';
    };

    const isFileVideo = (gallery: Gallery) => {
        return gallery.file_type === 'video' && gallery.video_source === 'file';
    };

    const isImage = (gallery: Gallery) => {
        return gallery.file_type === 'image';
    };

    const getThumbnailUrl = (gallery: Gallery) => {
        if (isYouTubeVideo(gallery) && gallery.youtube_thumbnail) {
            return gallery.youtube_thumbnail;
        }
        return gallery.file_url;
    };

    const getDisplayUrl = (gallery: Gallery) => {
        if (isYouTubeVideo(gallery) && gallery.youtube_embed_url) {
            return gallery.youtube_embed_url;
        }
        return gallery.file_url;
    };

    const openModal = (gallery: Gallery) => {
        setSelectedGallery(gallery);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedGallery(null);
        setIsModalOpen(false);
    };

    // Handle ESC key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isModalOpen) {
                closeModal();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isModalOpen]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('gallery.index'),
            {
                search: searchQuery,
                type: typeFilter,
            },
            { preserveState: true },
        );
    };

    const handleFilter = (type: string) => {
        setTypeFilter(type);
        router.get(
            route('gallery.index'),
            {
                search: searchQuery,
                type: type,
            },
            { preserveState: true },
        );
    };

    const handleReset = () => {
        setSearchQuery('');
        setTypeFilter('');
        router.get(route('gallery.index'));
    };

    return (
        <>
            <Head title="Galeri" />

            {/* Header */}
            <section className="relative overflow-hidden py-16">
                {/* Gradient Background */}
                <div className="course-section-gradient absolute inset-0"></div>

                <div className="relative z-10 container mx-auto px-4">
                    <div className="text-center">
                        <h1 className="title-gradient mb-4 text-3xl font-bold">Galeri</h1>
                        <p className="text-high-contrast text-lg">Dokumentasi kegiatan dan momen berharga kami</p>
                    </div>
                </div>
            </section>

            {/* Search and Filter */}
            <div className="container mx-auto px-4 py-6">
                <div className="features-card-gradient rounded-lg border-0 p-6 shadow-lg">
                    <form onSubmit={handleSearch} className="space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Cari foto atau video..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-md border border-input bg-background/80 px-3 py-2 text-sm ring-offset-background backdrop-blur-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
                            />
                        </div>
                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={() => handleFilter('')}
                                className={`inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap ring-offset-background transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                                    typeFilter === '' ? 'btn-primary-gradient text-white shadow-md' : 'btn-outline-gradient hover:scale-105'
                                }`}
                            >
                                Semua
                            </button>
                            <button
                                type="button"
                                onClick={() => handleFilter('image')}
                                className={`inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap ring-offset-background transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                                    typeFilter === 'image' ? 'btn-primary-gradient text-white shadow-md' : 'btn-outline-gradient hover:scale-105'
                                }`}
                            >
                                Foto
                            </button>
                            <button
                                type="button"
                                onClick={() => handleFilter('video')}
                                className={`inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap ring-offset-background transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                                    typeFilter === 'video' ? 'btn-primary-gradient text-white shadow-md' : 'btn-outline-gradient hover:scale-105'
                                }`}
                            >
                                Video
                            </button>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                type="submit"
                                className="btn-secondary-gradient inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap text-white shadow-md ring-offset-background transition-all duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                            >
                                Cari
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="hover-gradient-gray inline-flex h-10 items-center justify-center rounded-md border border-input bg-background/80 px-4 py-2 text-sm font-medium whitespace-nowrap ring-offset-background backdrop-blur-sm transition-all duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Gallery Content */}
            <div className="container mx-auto px-4 pb-12">
                {galleries.data.length > 0 ? (
                    <>
                        {/* Gallery Grid */}
                        <div className="columns-1 gap-6 space-y-6 sm:columns-2 md:columns-3 lg:columns-4">
                            {galleries.data.map((gallery, index) => (
                                <div
                                    key={gallery.id}
                                    className={`group relative mb-6 cursor-pointer break-inside-avoid overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
                                        index % 5 === 0 ? 'aspect-[3/4]' : index % 3 === 0 ? 'aspect-[4/5]' : 'aspect-square'
                                    }`}
                                    onClick={() => openModal(gallery)}
                                >
                                    {/* Background Image/Thumbnail */}
                                    {isImage(gallery) ? (
                                        <img
                                            src={gallery.file_url || '/images/placeholder.jpg'}
                                            alt={gallery.title}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                            onError={(e) => {
                                                e.currentTarget.src = '/images/placeholder.jpg';
                                            }}
                                        />
                                    ) : isYouTubeVideo(gallery) ? (
                                        <div className="relative h-full w-full">
                                            <img
                                                src={gallery.youtube_thumbnail || '/images/placeholder.jpg'}
                                                alt={gallery.title}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/images/placeholder.jpg';
                                                }}
                                            />
                                            {/* YouTube Play Icon */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="rounded-full border-2 border-white/20 bg-red-600/90 p-4 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-red-600">
                                                    <svg className="ml-1 h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            {/* YouTube Logo */}
                                            <div className="absolute top-3 left-3 z-10">
                                                <div className="rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">YouTube</div>
                                            </div>
                                        </div>
                                    ) : isFileVideo(gallery) ? (
                                        <div className="relative h-full w-full">
                                            <img
                                                src={gallery.file_url || '/images/placeholder.jpg'}
                                                alt={gallery.title}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/images/placeholder.jpg';
                                                }}
                                            />
                                            {/* Video Play Icon */}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="rounded-full bg-black/50 p-4 backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-black/70">
                                                    <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-muted">
                                            <div className="text-center text-muted-foreground">
                                                <svg className="mx-auto mb-2 h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h3a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h3z"
                                                    />
                                                </svg>
                                                <p className="text-xs">No Preview</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-all duration-300 group-hover:opacity-100" />

                                    {/* Content Overlay */}
                                    <div className="absolute right-0 bottom-0 left-0 translate-y-4 transform p-4 text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                        <h3 className="mb-2 line-clamp-2 text-lg font-semibold drop-shadow-lg">{gallery.title}</h3>
                                        {gallery.description && (
                                            <p className="mb-3 line-clamp-2 text-sm text-white/90 drop-shadow-md">{gallery.description}</p>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-white/80 drop-shadow-md">
                                                {new Date(gallery.created_at).toLocaleDateString('id-ID')}
                                            </span>
                                            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/20 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                                {isImage(gallery) ? '📸' : isYouTubeVideo(gallery) ? '�' : '🎥'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Hover Indicator */}
                                    <div className="absolute top-3 left-3 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                        <div className="rounded-full border border-white/10 bg-white/20 p-2 backdrop-blur-sm">
                                            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {galleries.links && galleries.links.length > 3 && (
                            <div className="mt-8 flex justify-center">
                                <div className="flex space-x-2">
                                    {galleries.links.map((link: PaginationLink, index: number) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                if (link.url) {
                                                    router.get(link.url);
                                                }
                                            }}
                                            disabled={!link.url}
                                            className={`inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap ring-offset-background transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                                                link.active
                                                    ? 'btn-primary-gradient text-white shadow-md'
                                                    : link.url
                                                      ? 'hover-gradient-gray border border-input bg-background/80 backdrop-blur-sm hover:scale-105'
                                                      : 'cursor-not-allowed opacity-50'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="py-12 text-center">
                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                            <svg className="h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="mb-2 text-lg font-medium">Belum ada konten galeri</h3>
                        <p className="mb-6 text-muted-foreground">
                            {filters.search || filters.type
                                ? 'Tidak ada konten yang sesuai dengan pencarian Anda.'
                                : 'Konten galeri akan ditampilkan di sini ketika sudah ditambahkan.'}
                        </p>
                        {(filters.search || filters.type) && (
                            <button
                                onClick={handleReset}
                                className="btn-primary-gradient inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap text-white shadow-md ring-offset-background transition-all duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
                            >
                                Lihat Semua Galeri
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && selectedGallery && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={closeModal}>
                    <div
                        className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-card shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={closeModal}
                            aria-label="Tutup modal"
                            className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="grid h-full grid-cols-1 gap-0 lg:grid-cols-2">
                            {/* Media Section */}
                            <div className="relative flex min-h-[400px] items-center justify-center bg-black lg:min-h-[500px]">
                                {isImage(selectedGallery) ? (
                                    <img
                                        src={selectedGallery.file_url || '/images/placeholder.jpg'}
                                        alt={selectedGallery.title}
                                        className="max-h-full max-w-full object-contain"
                                        onError={(e) => {
                                            e.currentTarget.src = '/images/placeholder.jpg';
                                        }}
                                    />
                                ) : isYouTubeVideo(selectedGallery) ? (
                                    <div className="relative h-full w-full">
                                        {selectedGallery.youtube_embed_url ? (
                                            <iframe
                                                src={selectedGallery.youtube_embed_url + '?autoplay=1&rel=0'}
                                                title={selectedGallery.title}
                                                className="h-full w-full"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        ) : (
                                            <div className="flex h-full flex-col items-center justify-center text-white">
                                                <svg className="mb-4 h-16 w-16" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                                </svg>
                                                <p className="text-lg">YouTube Video</p>
                                                <p className="mt-2 text-sm text-white/70">Unable to load video</p>
                                            </div>
                                        )}
                                    </div>
                                ) : isFileVideo(selectedGallery) ? (
                                    selectedGallery.file_url ? (
                                        <video src={selectedGallery.file_url} controls autoPlay className="max-h-full max-w-full">
                                            <p className="text-white">Browser Anda tidak mendukung pemutaran video.</p>
                                        </video>
                                    ) : (
                                        <div className="flex h-full flex-col items-center justify-center text-white">
                                            <svg className="mb-4 h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                                />
                                            </svg>
                                            <p className="text-lg">Video File</p>
                                            <p className="mt-2 text-sm text-white/70">Unable to load video</p>
                                        </div>
                                    )
                                ) : (
                                    <div className="flex h-full flex-col items-center justify-center text-white">
                                        <svg className="mb-4 h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h3a1 1 0 011 1v1a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h3z"
                                            />
                                        </svg>
                                        <p className="text-lg">Media File</p>
                                        <p className="mt-2 text-sm text-white/70">Preview not available</p>
                                    </div>
                                )}
                            </div>

                            {/* Info Section */}
                            <div className="flex flex-col p-6 lg:p-8">
                                <div className="flex-1">
                                    {/* Header */}
                                    <div className="mb-6">
                                        <div className="mb-4 flex items-center gap-3">
                                            <span
                                                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                                                    isImage(selectedGallery)
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                                        : isYouTubeVideo(selectedGallery)
                                                          ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                                                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                                                }`}
                                            >
                                                {isImage(selectedGallery) ? '📸 Foto' : isYouTubeVideo(selectedGallery) ? '� YouTube' : '🎥 Video'}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {new Date(selectedGallery.created_at).toLocaleDateString('id-ID', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                        <h2 className="mb-4 text-2xl font-bold lg:text-3xl">{selectedGallery.title}</h2>
                                    </div>

                                    {/* Description */}
                                    {selectedGallery.description && (
                                        <div className="mb-8">
                                            <h3 className="mb-3 text-lg font-semibold">Deskripsi</h3>
                                            <p className="leading-relaxed text-muted-foreground">{selectedGallery.description}</p>
                                        </div>
                                    )}

                                    {/* Details */}
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="mb-3 text-lg font-semibold">Detail</h3>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Tipe:</span>
                                                    <p className="font-medium">
                                                        {isImage(selectedGallery)
                                                            ? 'Gambar'
                                                            : isYouTubeVideo(selectedGallery)
                                                              ? 'YouTube Video'
                                                              : 'Video File'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Tanggal Upload:</span>
                                                    <p className="font-medium">{new Date(selectedGallery.created_at).toLocaleDateString('id-ID')}</p>
                                                </div>
                                                {isYouTubeVideo(selectedGallery) && selectedGallery.youtube_video_id && (
                                                    <div className="col-span-2">
                                                        <span className="text-muted-foreground">YouTube ID:</span>
                                                        <p className="font-mono text-xs font-medium">{selectedGallery.youtube_video_id}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-6 border-t pt-6">
                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <button
                                            onClick={() => {
                                                const url = isYouTubeVideo(selectedGallery) ? selectedGallery.youtube_url : selectedGallery.file_url;
                                                if (url) {
                                                    window.open(url, '_blank');
                                                }
                                            }}
                                            disabled={!selectedGallery.file_url && !selectedGallery.youtube_url}
                                            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                />
                                            </svg>
                                            {isYouTubeVideo(selectedGallery) ? 'Lihat di YouTube' : 'Buka Original'}
                                        </button>
                                        <button
                                            onClick={closeModal}
                                            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                                        >
                                            Tutup
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// Apply GuestLayout
GalleryIndex.layout = (page: React.ReactNode) => <GuestLayout>{page}</GuestLayout>;

export default GalleryIndex;
