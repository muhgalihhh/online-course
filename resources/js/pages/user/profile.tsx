import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import UserDashboardLayout from '@/layouts/user-dashboard-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { AlertCircle, Camera, Trash2, User } from 'lucide-react';
import { FormEvent, useRef, useState } from 'react';
import { toast } from 'sonner';

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    bio?: string;
    birth_date?: string;
    gender?: 'male' | 'female' | 'other';
    city?: string;
    profile_photo_path?: string;
    profile_photo_url: string;
    created_at: string;
}

interface Props {
    user: User;
}

export default function Profile({ user }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { data, setData, processing, errors, reset } = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        birth_date: user.birth_date || '',
        gender: user.gender || '',
        city: user.city || '',
        profile_photo: null as File | null,
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('phone', data.phone);
        formData.append('bio', data.bio);
        formData.append('birth_date', data.birth_date);
        formData.append('gender', data.gender);
        formData.append('city', data.city);
        formData.append('_method', 'PATCH');

        if (data.profile_photo) {
            formData.append('profile_photo', data.profile_photo);
        }

        if (data.current_password) {
            formData.append('current_password', data.current_password);
        }

        if (data.password) {
            formData.append('password', data.password);
            formData.append('password_confirmation', data.password_confirmation);
        }

        router.post(route('user.profile.update'), formData, {
            onSuccess: () => {
                toast.success('Profile berhasil diperbarui');
                reset('current_password', 'password', 'password_confirmation');
                setImagePreview(null);
                setData('profile_photo', null);
            },
            onError: () => {
                toast.error('Terjadi kesalahan saat memperbarui profile');
            },
            forceFormData: true,
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2048 * 1024) {
                // 2MB
                toast.error('Ukuran file tidak boleh lebih dari 2MB');
                return;
            }

            setData('profile_photo', file);

            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeProfilePhoto = () => {
        router.delete(route('user.profile.photo.delete'), {
            onSuccess: () => {
                toast.success('Foto profile berhasil dihapus');
            },
            onError: () => {
                toast.error('Terjadi kesalahan saat menghapus foto profile');
            },
        });
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <UserDashboardLayout>
            <Head title="Profile" />

            <div className="container mx-auto max-w-4xl px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Pengaturan Profile</h1>
                    <p className="mt-2 text-gray-600">Kelola informasi profil dan keamanan akun Anda</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Profile Photo Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Camera className="h-5 w-5" />
                                Foto Profile
                            </CardTitle>
                            <CardDescription>
                                Upload foto profile Anda. File harus berformat JPG, PNG, atau GIF dengan ukuran maksimal 2MB.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <img
                                        src={imagePreview || user.profile_photo_url}
                                        alt="Profile"
                                        className="h-24 w-24 rounded-full border-4 border-gray-200 object-cover"
                                    />
                                    {imagePreview && (
                                        <div className="absolute -top-2 -right-2">
                                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                                Baru
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={triggerFileInput}
                                        className="btn-outline-gradient flex items-center gap-2"
                                    >
                                        <Camera className="h-4 w-4" />
                                        {user.profile_photo_path ? 'Ganti Foto' : 'Upload Foto'}
                                    </Button>

                                    {user.profile_photo_path && (
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            onClick={removeProfilePhoto}
                                            className="flex items-center gap-2"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Hapus
                                        </Button>
                                    )}
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    aria-label="Upload profile photo"
                                />
                            </div>

                            {errors.profile_photo && (
                                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.profile_photo}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Informasi Personal
                            </CardTitle>
                            <CardDescription>Update informasi dasar profil Anda</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama Lengkap</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Masukkan nama lengkap"
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && (
                                        <div className="flex items-center gap-2 text-sm text-red-600">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.name}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Masukkan email"
                                        className={errors.email ? 'border-red-500' : ''}
                                    />
                                    {errors.email && (
                                        <div className="flex items-center gap-2 text-sm text-red-600">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.email}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Nomor Telepon</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="Masukkan nomor telepon"
                                        className={errors.phone ? 'border-red-500' : ''}
                                    />
                                    {errors.phone && (
                                        <div className="flex items-center gap-2 text-sm text-red-600">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.phone}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="city">Kota</Label>
                                    <Input
                                        id="city"
                                        type="text"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        placeholder="Masukkan kota tempat tinggal"
                                        className={errors.city ? 'border-red-500' : ''}
                                    />
                                    {errors.city && (
                                        <div className="flex items-center gap-2 text-sm text-red-600">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.city}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="birth_date">Tanggal Lahir</Label>
                                    <Input
                                        id="birth_date"
                                        type="date"
                                        value={data.birth_date}
                                        onChange={(e) => setData('birth_date', e.target.value)}
                                        className={errors.birth_date ? 'border-red-500' : ''}
                                    />
                                    {errors.birth_date && (
                                        <div className="flex items-center gap-2 text-sm text-red-600">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.birth_date}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="gender">Jenis Kelamin</Label>
                                    <select
                                        id="gender"
                                        value={data.gender}
                                        onChange={(e) => setData('gender', e.target.value as 'male' | 'female' | 'other')}
                                        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${errors.gender ? 'border-red-500' : ''}`}
                                        aria-label="Pilih jenis kelamin"
                                    >
                                        <option value="">Pilih jenis kelamin</option>
                                        <option value="male">Laki-laki</option>
                                        <option value="female">Perempuan</option>
                                        <option value="other">Lainnya</option>
                                    </select>
                                    {errors.gender && (
                                        <div className="flex items-center gap-2 text-sm text-red-600">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.gender}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <textarea
                                    id="bio"
                                    value={data.bio}
                                    onChange={(e) => setData('bio', e.target.value)}
                                    placeholder="Ceritakan sedikit tentang diri Anda..."
                                    rows={4}
                                    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${errors.bio ? 'border-red-500' : ''}`}
                                />
                                {errors.bio && (
                                    <div className="flex items-center gap-2 text-sm text-red-600">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.bio}
                                    </div>
                                )}
                                <p className="text-xs text-gray-500">Maksimal 1000 karakter</p>
                            </div>

                            <div className="pt-2">
                                <p className="text-sm text-gray-600">
                                    <strong>Bergabung sejak:</strong> {formatDate(user.created_at)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Password Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Ubah Password</CardTitle>
                            <CardDescription>Kosongkan jika tidak ingin mengubah password</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current_password">Password Saat Ini</Label>
                                <Input
                                    id="current_password"
                                    type="password"
                                    value={data.current_password}
                                    onChange={(e) => setData('current_password', e.target.value)}
                                    placeholder="Masukkan password saat ini"
                                    className={errors.current_password ? 'border-red-500' : ''}
                                />
                                {errors.current_password && (
                                    <div className="flex items-center gap-2 text-sm text-red-600">
                                        <AlertCircle className="h-4 w-4" />
                                        {errors.current_password}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password Baru</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Masukkan password baru"
                                        className={errors.password ? 'border-red-500' : ''}
                                    />
                                    {errors.password && (
                                        <div className="flex items-center gap-2 text-sm text-red-600">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.password}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Konfirmasi Password Baru</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="Konfirmasi password baru"
                                        className={errors.password_confirmation ? 'border-red-500' : ''}
                                    />
                                    {errors.password_confirmation && (
                                        <div className="flex items-center gap-2 text-sm text-red-600">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.password_confirmation}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing} className="px-8">
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </Button>
                    </div>
                </form>
            </div>
        </UserDashboardLayout>
    );
}
