import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import AuthLayout from '@/layouts/auth-layout';

export default function Register() {
    const { toast } = useToast();
    const [hasShownToast, setHasShownToast] = useState(false);
    
    return (
        <AuthLayout title="Buat Akun Baru" description="Masukkan detail Anda untuk membuat akun di platform Pare EduHub">
            <Head title="Daftar" />
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
                        if (errors.email && (errors.email.includes('sudah digunakan') || errors.email.includes('sudah terdaftar') || errors.email.includes('already been taken')) && !hasShownToast) {
                            toast({
                                variant: 'destructive',
                                title: 'Registrasi Gagal',
                                description: 'Email sudah terdaftar. Silakan gunakan email lain atau login dengan email tersebut.',
                            });
                            setHasShownToast(true);
                        } else if (errors.password && (errors.password.includes('konfirmasi') || errors.password.includes('confirmation')) && !hasShownToast) {
                            toast({
                                variant: 'destructive',
                                title: 'Registrasi Gagal',
                                description: 'Konfirmasi password tidak cocok. Pastikan password dan konfirmasi password sama.',
                            });
                            setHasShownToast(true);
                        } else if (Object.keys(errors).length > 0 && !hasShownToast) {
                            const firstError = Object.values(errors)[0];
                            toast({
                                variant: 'destructive',
                                title: 'Registrasi Gagal',
                                description: firstError || 'Silakan periksa kembali data yang Anda masukkan.',
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
                                />
                                <InputError message={errors.name} className="mt-2" />
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
                                />
                                <InputError message={errors.email} />
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
                                    placeholder="Password"
                                />
                                <InputError message={errors.password} />
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
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <Button type="submit" className="mt-2 w-full" tabIndex={5}>
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
        </AuthLayout>
    );
}
