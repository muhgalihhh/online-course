// resources/js/pages/admin/settings.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { Settings, Globe, Shield, Bell, Mail, Database, Palette, Users, CreditCard, Save, RefreshCw } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: route('admin.dashboard'),
    },
    {
        title: 'Settings',
        href: route('admin.settings'),
    },
];

interface SettingsProps extends PageProps {
    // Add settings data props here
}

export default function Settings({}: SettingsProps) {
    const { patch, processing } = useForm();
    const [activeTab, setActiveTab] = useState('general');

    const handleSaveSettings = (section: string, data: any) => {
        patch(route('admin.settings.update'), {
            section,
            ...data,
        });
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Settings" />

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">
                        Kelola pengaturan sistem dan konfigurasi platform
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset to Default
                    </Button>
                    <Button size="sm" disabled={processing}>
                        <Save className="mr-2 h-4 w-4" />
                        Save All Changes
                    </Button>
                </div>
            </div>

            {/* Settings Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="general" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        General
                    </TabsTrigger>
                    <TabsTrigger value="appearance" className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Appearance
                    </TabsTrigger>
                    <TabsTrigger value="security" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Security
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Notifications
                    </TabsTrigger>
                    <TabsTrigger value="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Advanced
                    </TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Globe className="h-5 w-5" />
                                    Platform Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="platform-name">Platform Name</Label>
                                    <Input id="platform-name" defaultValue="EduPlatform" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="platform-description">Description</Label>
                                    <Textarea 
                                        id="platform-description" 
                                        defaultValue="Platform kursus online terbaik untuk pembelajaran digital"
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contact-email">Contact Email</Label>
                                    <Input id="contact-email" defaultValue="admin@eduplatform.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="support-phone">Support Phone</Label>
                                    <Input id="support-phone" defaultValue="+62 812-3456-7890" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    User Management
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="max-users">Maximum Users</Label>
                                    <Input id="max-users" type="number" defaultValue="10000" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="user-verification">User Verification</Label>
                                    <Select defaultValue="email">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="email">Email Verification</SelectItem>
                                            <SelectItem value="phone">Phone Verification</SelectItem>
                                            <SelectItem value="both">Both</SelectItem>
                                            <SelectItem value="none">None</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Auto-approve Users</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Otomatis menyetujui pendaftaran user baru
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Allow User Registration</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Mengizinkan user baru untuk mendaftar
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Appearance Settings */}
                <TabsContent value="appearance" className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Theme Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Default Theme</Label>
                                    <Select defaultValue="light">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="light">Light</SelectItem>
                                            <SelectItem value="dark">Dark</SelectItem>
                                            <SelectItem value="system">System</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Primary Color</Label>
                                    <div className="flex gap-2">
                                        <div className="w-8 h-8 rounded-full bg-blue-500 cursor-pointer border-2 border-blue-600"></div>
                                        <div className="w-8 h-8 rounded-full bg-green-500 cursor-pointer"></div>
                                        <div className="w-8 h-8 rounded-full bg-purple-500 cursor-pointer"></div>
                                        <div className="w-8 h-8 rounded-full bg-orange-500 cursor-pointer"></div>
                                        <div className="w-8 h-8 rounded-full bg-red-500 cursor-pointer"></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Show Logo</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Menampilkan logo platform
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Layout Settings</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Sidebar Position</Label>
                                    <Select defaultValue="left">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="left">Left</SelectItem>
                                            <SelectItem value="right">Right</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Collapsible Sidebar</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Sidebar dapat di-collapse
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Show Breadcrumbs</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Menampilkan breadcrumb navigation
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security" className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Authentication
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Password Policy</Label>
                                    <Select defaultValue="medium">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Low (6 characters)</SelectItem>
                                            <SelectItem value="medium">Medium (8 characters)</SelectItem>
                                            <SelectItem value="high">High (12 characters)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Two-Factor Authentication</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Wajib untuk admin
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Session Timeout</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Auto logout setelah 30 menit
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="space-y-2">
                                    <Label>Session Timeout (minutes)</Label>
                                    <Input type="number" defaultValue="30" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Access Control</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>IP Whitelist</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Batasi akses berdasarkan IP
                                        </p>
                                    </div>
                                    <Switch />
                                </div>
                                <div className="space-y-2">
                                    <Label>Allowed IP Addresses</Label>
                                    <Textarea 
                                        placeholder="192.168.1.1&#10;10.0.0.1"
                                        rows={3}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Rate Limiting</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Batasi request per menit
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="space-y-2">
                                    <Label>Rate Limit (requests/minute)</Label>
                                    <Input type="number" defaultValue="60" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Notification Settings */}
                <TabsContent value="notifications" className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Bell className="h-5 w-5" />
                                    Email Notifications
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>New User Registration</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Kirim email saat user baru mendaftar
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Course Enrollment</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Kirim email saat user mendaftar kursus
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Payment Confirmation</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Kirim email konfirmasi pembayaran
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>System Updates</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Kirim email update sistem
                                        </p>
                                    </div>
                                    <Switch />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>In-App Notifications</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Push Notifications</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Aktifkan push notifications
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Sound Alerts</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Putar suara saat notifikasi
                                        </p>
                                    </div>
                                    <Switch />
                                </div>
                                <div className="space-y-2">
                                    <Label>Notification Retention (days)</Label>
                                    <Input type="number" defaultValue="30" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Email Settings */}
                <TabsContent value="email" className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5" />
                                    SMTP Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>SMTP Host</Label>
                                    <Input defaultValue="smtp.gmail.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label>SMTP Port</Label>
                                    <Input type="number" defaultValue="587" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Username</Label>
                                    <Input defaultValue="noreply@eduplatform.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Password</Label>
                                    <Input type="password" defaultValue="••••••••" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Use TLS</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Enkripsi koneksi email
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                                <Button variant="outline" size="sm">
                                    Test Connection
                                </Button>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Email Templates</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>From Name</Label>
                                    <Input defaultValue="EduPlatform" />
                                </div>
                                <div className="space-y-2">
                                    <Label>From Email</Label>
                                    <Input defaultValue="noreply@eduplatform.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Reply To Email</Label>
                                    <Input defaultValue="support@eduplatform.com" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email Footer</Label>
                                    <Textarea 
                                        defaultValue="© 2024 EduPlatform. All rights reserved."
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Advanced Settings */}
                <TabsContent value="advanced" className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Database className="h-5 w-5" />
                                    System Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Cache Duration (minutes)</Label>
                                    <Input type="number" defaultValue="60" />
                                </div>
                                <div className="space-y-2">
                                    <Label>File Upload Limit (MB)</Label>
                                    <Input type="number" defaultValue="10" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Debug Mode</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Aktifkan mode debug
                                        </p>
                                    </div>
                                    <Switch />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Maintenance Mode</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Aktifkan mode maintenance
                                        </p>
                                    </div>
                                    <Switch />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Payment Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Default Currency</Label>
                                    <Select defaultValue="IDR">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="IDR">Indonesian Rupiah (IDR)</SelectItem>
                                            <SelectItem value="USD">US Dollar (USD)</SelectItem>
                                            <SelectItem value="EUR">Euro (EUR)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Payment Gateway</Label>
                                    <Select defaultValue="midtrans">
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="midtrans">Midtrans</SelectItem>
                                            <SelectItem value="xendit">Xendit</SelectItem>
                                            <SelectItem value="stripe">Stripe</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label>Auto-refund</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Otomatis refund untuk transaksi gagal
                                        </p>
                                    </div>
                                    <Switch defaultChecked />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </AdminLayout>
    );
}