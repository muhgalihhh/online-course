// Components
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GuestLayout from '@/layouts/guest-layout';

export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <GuestLayout>
            <Head title="Lupa Password" />
            <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight">Lupa Password</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Masukkan email Anda untuk menerima link reset password
                        </p>
                    </div>

                    <div className="mt-8 bg-card rounded-lg border shadow-sm p-6">
                        {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}

                        <div className="space-y-6">
                <Form method="post" action={route('password.email')}>
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Alamat Email</Label>
                                <Input id="email" type="email" name="email" autoComplete="off" autoFocus placeholder="email@contoh.com" />

                                <InputError message={errors.email} />
                            </div>

                            <div className="my-6 flex items-center justify-start">
                                <Button className="w-full" disabled={processing}>
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Kirim Link Reset Password
                                </Button>
                            </div>
                        </>
                    )}
                </Form>

                <div className="space-x-1 text-center text-sm text-muted-foreground">
                    <span>Atau, kembali ke</span>
                    <TextLink href={route('login')}>halaman masuk</TextLink>
                </div>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
