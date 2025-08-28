import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthDemo() {
    return (
        <div className="min-h-screen bg-background p-8">
            <Head title="Auth Layout Demo" />
            
            <div className="mx-auto max-w-4xl space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Auth Layout Demo</h1>
                    <p className="mt-2 text-muted-foreground">
                        Tampilan auth dengan style shadcn/ui yang bersih tanpa warna custom
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Simple Layout</CardTitle>
                            <CardDescription>
                                Layout sederhana tanpa card, cocok untuk halaman minimal
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Link href="/auth/demo/simple">
                                <Button className="w-full" variant="outline">
                                    Lihat Simple Layout
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Card Layout (Default)</CardTitle>
                            <CardDescription>
                                Layout dengan Card component dari shadcn/ui
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Link href="/auth/demo/card">
                                <Button className="w-full" variant="outline">
                                    Lihat Card Layout
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Split Layout</CardTitle>
                            <CardDescription>
                                Layout dengan panel samping untuk branding
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Link href="/auth/demo/split">
                                <Button className="w-full" variant="outline">
                                    Lihat Split Layout
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Live Auth Pages</CardTitle>
                            <CardDescription>
                                Halaman auth yang sudah diperbarui dengan style bersih
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Link href={route('login')} className="block">
                                <Button className="w-full" variant="secondary">
                                    Login Page
                                </Button>
                            </Link>
                            <Link href={route('register')} className="block">
                                <Button className="w-full" variant="secondary">
                                    Register Page
                                </Button>
                            </Link>
                            <Link href={route('password.request')} className="block">
                                <Button className="w-full" variant="secondary">
                                    Forgot Password
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    <p>Semua layout menggunakan komponen shadcn/ui standar</p>
                    <p>Tidak ada warna custom atau gradient yang membuat tampilan berbeda</p>
                </div>
            </div>
        </div>
    );
}