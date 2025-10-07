import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import GuestLayout from '@/layouts/guest-layout';

export default function Register() {
    const { toast } = useToast();
    const [hasShownToast, setHasShownToast] = useState(false);
    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

    return (
        <GuestLayout>
            <Head title="Daftar" />
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight">Buat Akun Baru</h2>
                        <p className="mt-2 text-sm text-muted-foreground">Masukkan detail Anda untuk membuat akun di platform Pare EduHub</p>
                    </div>

                    <div className="mt-8 rounded-lg border bg-card p-6 shadow-sm">
                        <Form
                            method="post"
                            action={route('register')}
                            resetOnSuccess={['password', 'password_confirmation']}
                            disableWhileProcessing
                            className="flex flex-col gap-6"
                        >
                            {({ processing, errors }) => {
                                // Show toast for validation errors
                                useEffect(() => {
                                    if (Object.keys(errors).length > 0 && !hasShownToast) {
                                        const toastTitle = 'Registrasi Gagal';
                                        let toastDescription = 'Terjadi kesalahan saat registrasi.';

                                        // Check for specific error messages
                                        if (errors.name) {
                                            if (errors.name.includes('required') || errors.name.includes('wajib')) {
                                                toastDescription = 'Nama lengkap wajib diisi.';
                                            } else if (errors.name.includes('minimal') || errors.name.includes('minimum')) {
                                                toastDescription = 'Nama lengkap minimal 3 karakter.';
                                            } else {
                                                toastDescription = errors.name;
                                            }
                                        } else if (errors.email) {
                                            if (
                                                errors.email.includes('sudah digunakan') ||
                                                errors.email.includes('sudah terdaftar') ||
                                                errors.email.includes('already been taken') ||
                                                errors.email.includes('has already been taken')
                                            ) {
                                                toastDescription =
                                                    'Email sudah terdaftar. Silakan gunakan email lain atau login dengan email tersebut.';
                                            } else if (errors.email.includes('format') || errors.email.includes('valid')) {
                                                toastDescription = 'Format email tidak valid. Silakan masukkan email yang benar.';
                                            } else if (errors.email.includes('required') || errors.email.includes('wajib')) {
                                                toastDescription = 'Email wajib diisi.';
                                            } else {
                                                toastDescription = errors.email;
                                            }
                                        } else if (errors.password) {
                                            if (errors.password.includes('konfirmasi') || errors.password.includes('confirmation')) {
                                                toastDescription = 'Konfirmasi password tidak cocok. Pastikan password dan konfirmasi password sama.';
                                            } else if (
                                                errors.password.includes('minimal') ||
                                                errors.password.includes('minimum') ||
                                                errors.password.includes('at least')
                                            ) {
                                                toastDescription = 'Password minimal 8 karakter.';
                                            } else if (errors.password.includes('required') || errors.password.includes('wajib')) {
                                                toastDescription = 'Password wajib diisi.';
                                            } else {
                                                toastDescription = errors.password;
                                            }
                                        } else if (errors.password_confirmation) {
                                            if (
                                                errors.password_confirmation.includes('match') ||
                                                errors.password_confirmation.includes('cocok') ||
                                                errors.password_confirmation.includes('sama')
                                            ) {
                                                toastDescription = 'Konfirmasi password tidak cocok dengan password.';
                                            } else if (
                                                errors.password_confirmation.includes('required') ||
                                                errors.password_confirmation.includes('wajib')
                                            ) {
                                                toastDescription = 'Konfirmasi password wajib diisi.';
                                            } else {
                                                toastDescription = errors.password_confirmation;
                                            }
                                        }

                                        toast({
                                            variant: 'destructive',
                                            title: toastTitle,
                                            description: toastDescription,
                                        });
                                        setHasShownToast(true);
                                    }

                                    // Reset the flag when errors are cleared
                                    if (Object.keys(errors).length === 0) {
                                        setHasShownToast(false);
                                    }
                                }, [errors]);

                                return (
                                    <>
                                        <div className="grid gap-6">
                                            <div className="grid gap-2">
                                                <Label htmlFor="name">Nama Lengkap</Label>
                                                <Input
                                                    id="name"
                                                    type="text"
                                                    required
                                                    autoFocus
                                                    tabIndex={1}
                                                    autoComplete="name"
                                                    name="name"
                                                    placeholder="Nama lengkap Anda"
                                                    className={
                                                        errors.name && touchedFields.name
                                                            ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/50'
                                                            : ''
                                                    }
                                                    onBlur={() => setTouchedFields((prev) => ({ ...prev, name: true }))}
                                                />
                                                {errors.name && touchedFields.name && (
                                                    <InputError
                                                        message={
                                                            errors.name.includes('required') || errors.name.includes('wajib')
                                                                ? 'Nama lengkap wajib diisi'
                                                                : errors.name.includes('minimal') || errors.name.includes('minimum')
                                                                  ? 'Nama minimal 3 karakter'
                                                                  : errors.name
                                                        }
                                                        className="mt-2"
                                                    />
                                                )}
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="email">Alamat Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    required
                                                    tabIndex={2}
                                                    autoComplete="email"
                                                    name="email"
                                                    placeholder="email@contoh.com"
                                                    className={
                                                        errors.email && touchedFields.email
                                                            ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/50'
                                                            : ''
                                                    }
                                                    onBlur={() => setTouchedFields((prev) => ({ ...prev, email: true }))}
                                                />
                                                {errors.email && touchedFields.email && (
                                                    <InputError
                                                        message={
                                                            errors.email.includes('sudah digunakan') ||
                                                            errors.email.includes('sudah terdaftar') ||
                                                            errors.email.includes('already been taken') ||
                                                            errors.email.includes('has already been taken')
                                                                ? 'Email sudah terdaftar'
                                                                : errors.email.includes('format') || errors.email.includes('valid')
                                                                  ? 'Format email tidak valid'
                                                                  : errors.email.includes('required') || errors.email.includes('wajib')
                                                                    ? 'Email wajib diisi'
                                                                    : errors.email
                                                        }
                                                    />
                                                )}
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="password">Password</Label>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    required
                                                    tabIndex={3}
                                                    autoComplete="new-password"
                                                    name="password"
                                                    placeholder="Password (minimal 8 karakter)"
                                                    className={
                                                        errors.password && touchedFields.password
                                                            ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/50'
                                                            : ''
                                                    }
                                                    onBlur={() => setTouchedFields((prev) => ({ ...prev, password: true }))}
                                                />
                                                {errors.password && touchedFields.password && (
                                                    <InputError
                                                        message={
                                                            errors.password.includes('minimal') ||
                                                            errors.password.includes('minimum') ||
                                                            errors.password.includes('at least')
                                                                ? 'Password minimal 8 karakter'
                                                                : errors.password.includes('required') || errors.password.includes('wajib')
                                                                  ? 'Password wajib diisi'
                                                                  : errors.password.includes('konfirmasi') || errors.password.includes('confirmation')
                                                                    ? 'Password tidak cocok dengan konfirmasi'
                                                                    : errors.password
                                                        }
                                                    />
                                                )}
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                                                <Input
                                                    id="password_confirmation"
                                                    type="password"
                                                    required
                                                    tabIndex={4}
                                                    autoComplete="new-password"
                                                    name="password_confirmation"
                                                    placeholder="Konfirmasi password"
                                                    className={
                                                        errors.password_confirmation && touchedFields.password_confirmation
                                                            ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/50'
                                                            : ''
                                                    }
                                                    onBlur={() => setTouchedFields((prev) => ({ ...prev, password_confirmation: true }))}
                                                />
                                                {errors.password_confirmation && touchedFields.password_confirmation && (
                                                    <InputError
                                                        message={
                                                            errors.password_confirmation?.includes('match') ||
                                                            errors.password_confirmation?.includes('cocok') ||
                                                            errors.password_confirmation?.includes('sama')
                                                                ? 'Konfirmasi password tidak cocok'
                                                                : errors.password_confirmation?.includes('required') ||
                                                                    errors.password_confirmation?.includes('wajib')
                                                                  ? 'Konfirmasi password wajib diisi'
                                                                  : errors.password_confirmation
                                                        }
                                                    />
                                                )}
                                            </div>

                                            <Button type="submit" className="btn-primary-gradient mt-2 w-full text-white" tabIndex={5}>
                                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                                Buat Akun
                                            </Button>
                                        </div>

                                        <div className="text-center text-sm text-muted-foreground">
                                            Sudah punya akun?{' '}
                                            <TextLink href={route('login')} tabIndex={6}>
                                                Masuk
                                            </TextLink>
                                        </div>
                                    </>
                                );
                            }}
                        </Form>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
