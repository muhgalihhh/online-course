import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import AuthLayout from '@/layouts/auth-layout';
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
}: {
    processing: boolean;
    errors: { email?: string; password?: string; [key: string]: string | undefined };
    canResetPassword: boolean;
}) {
    const { toast } = useToast();
    const [hasShownToast, setHasShownToast] = useState(false);

    useEffect(() => {
        if (errors.email && !hasShownToast) {
            toast({
                variant: 'destructive',
                title: 'Login Gagal',
                description: errors.email || 'Silakan periksa kembali email dan password Anda.',
            });
            setHasShownToast(true);
        }

        // Reset the flag when errors are cleared
        if (!errors.email) {
            setHasShownToast(false);
        }
    }, [errors.email, toast, hasShownToast]);

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Alamat Email</Label>
                    <Input id="email" type="email" name="email" required autoFocus tabIndex={1} autoComplete="email" placeholder="email@contoh.com" />
                    <InputError message={errors.email} />
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
                    />
                    <InputError message={errors.password} />
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox id="remember" name="remember" tabIndex={3} />
                    <Label htmlFor="remember" className="text-sm font-normal">
                        Ingat saya
                    </Label>
                </div>
            </div>

            <Button type="submit" className="w-full" tabIndex={4} disabled={processing}>
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
    return (
        <AuthLayout title="Masuk ke Akun Anda" description="Masukkan email dan password Anda untuk masuk ke platform Pare EduHub">
            <Head title="Masuk" />

            <Form method="post" action={route('login')} resetOnSuccess={['password']} className="space-y-6">
                {({ processing, errors }) => <LoginFormContent processing={processing} errors={errors} canResetPassword={canResetPassword} />}
            </Form>

            {status && (
                <Alert className="border-green-200 bg-green-50 text-green-900">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{status}</AlertDescription>
                </Alert>
            )}
        </AuthLayout>
    );
}
