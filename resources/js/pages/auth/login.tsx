import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import GuestLayout from '@/layouts/guest-layout';
import { Form, Head } from '@inertiajs/react';
import { CheckCircle, LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

function LoginFormContent({
    processing,
    errors,
    canResetPassword,
    submitCount,
}: {
    processing: boolean;
    errors: { email?: string; password?: string; [key: string]: string | undefined };
    canResetPassword: boolean;
    submitCount: number;
}) {
    const { toast } = useToast();
    const [lastSubmitCount, setLastSubmitCount] = useState(0);

    useEffect(() => {
        // Show toast when there are errors and this is a new submission
        if (Object.keys(errors).length > 0 && submitCount > lastSubmitCount) {
            const toastTitle = 'Login Gagal';
            let toastDescription = 'Terjadi kesalahan saat login.';

            // Check for specific error messages
            if (errors.email) {
                if (errors.email.includes('credentials') || errors.email.includes('tidak cocok') || errors.email.includes('do not match')) {
                    toastDescription = 'Email atau password yang Anda masukkan salah. Silakan coba lagi.';
                } else if (errors.email.includes('tidak ditemukan') || errors.email.includes('not found')) {
                    toastDescription = 'Email tidak terdaftar. Silakan daftar terlebih dahulu.';
                } else if (errors.email.includes('format') || errors.email.includes('valid')) {
                    toastDescription = 'Format email tidak valid. Silakan masukkan email yang benar.';
                } else {
                    toastDescription = errors.email;
                }
            } else if (errors.password) {
                if (errors.password.includes('salah') || errors.password.includes('incorrect') || errors.password.includes('wrong')) {
                    toastDescription = 'Password yang Anda masukkan salah. Silakan coba lagi.';
                } else if (errors.password.includes('required') || errors.password.includes('wajib')) {
                    toastDescription = 'Password wajib diisi.';
                } else {
                    toastDescription = errors.password;
                }
            }

            toast({
                variant: 'destructive',
                title: toastTitle,
                description: toastDescription,
            });

            // Update last submit count
            setLastSubmitCount(submitCount);
        }
    }, [errors, submitCount, toast, lastSubmitCount]);

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Alamat Email</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        required
                        autoFocus
                        tabIndex={1}
                        autoComplete="email"
                        placeholder="email@contoh.com"
                        className={errors.email ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/50' : ''}
                    />
                    {errors.email && (
                        <InputError
                            message={
                                errors.email.includes('credentials') || errors.email.includes('tidak cocok')
                                    ? 'Email atau password salah'
                                    : errors.email.includes('tidak ditemukan')
                                      ? 'Email tidak terdaftar'
                                      : errors.email.includes('format') || errors.email.includes('valid')
                                        ? 'Format email tidak valid'
                                        : errors.email
                            }
                        />
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        {canResetPassword && (
                            <TextLink href={route('password.request')} className="text-sm" tabIndex={5}>
                                Lupa password?
                            </TextLink>
                        )}
                    </div>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        required
                        tabIndex={2}
                        autoComplete="current-password"
                        placeholder="Password"
                        className={errors.password ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/50' : ''}
                    />
                    {errors.password && (
                        <InputError
                            message={
                                errors.password.includes('salah') || errors.password.includes('incorrect') || errors.password.includes('wrong')
                                    ? 'Password salah'
                                    : errors.password.includes('required') || errors.password.includes('wajib')
                                      ? 'Password wajib diisi'
                                      : errors.password.includes('minimum') || errors.password.includes('minimal')
                                        ? 'Password minimal 8 karakter'
                                        : errors.password
                            }
                        />
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox id="remember" name="remember" tabIndex={3} />
                    <Label htmlFor="remember" className="text-sm font-normal">
                        Ingat saya
                    </Label>
                </div>
            </div>

            <Button type="submit" className="btn-primary-gradient w-full text-white" tabIndex={4} disabled={processing}>
                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                Masuk
            </Button>

            <div className="text-center text-sm text-muted-foreground">
                Belum punya akun?{' '}
                <TextLink href={route('register')} tabIndex={5}>
                    Daftar sekarang
                </TextLink>
            </div>
        </div>
    );
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const [submitCount, setSubmitCount] = useState(0);

    return (
        <GuestLayout>
            <Head title="Masuk" />

            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight">Masuk ke Akun Anda</h2>
                        <p className="mt-2 text-sm text-muted-foreground">Masukkan email dan password Anda untuk masuk ke platform Pare EduHub</p>
                    </div>

                    <div className="mt-8 rounded-lg border bg-card p-6 shadow-sm">
                        <Form
                            method="post"
                            action={route('login')}
                            resetOnSuccess={['password']}
                            className="space-y-6"
                            onBefore={() => {
                                // Increment submit count when form is submitted
                                setSubmitCount((prev) => prev + 1);
                                return true;
                            }}
                            onSuccess={() => {
                                // Force a full page reload after successful login
                                // This ensures the user gets redirected properly
                                window.location.reload();
                            }}
                        >
                            {({ processing, errors }) => (
                                <LoginFormContent
                                    processing={processing}
                                    errors={errors}
                                    canResetPassword={canResetPassword}
                                    submitCount={submitCount}
                                />
                            )}
                        </Form>

                        {status && (
                            <Alert className="mt-4 border-green-200 bg-green-50 text-green-900">
                                <CheckCircle className="h-4 w-4" />
                                <AlertDescription>{status}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
