// resources/js/pages/admin/dashboard.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/stat-card';
import { ActivityItem } from '@/components/activity-item';
import { ChartCard, LineChartComponent, BarChartComponent } from '@/components/ui/charts';
import { AdminFilter, FilterConfig } from '@/components/admin/AdminFilter';
import { OverviewChart } from '@/components/overview-chart';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem, type PageProps, type User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { BookOpen, Users, DollarSign, ArrowRight, Calendar, Mail, Download, RefreshCw, Bell, CreditCard, MessageSquare, Layers, FileText } from 'lucide-react';
import { useState } from 'react';
import { useFormToast } from '@/hooks/use-form-toast';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: route('admin.dashboard'),
    },
];

interface Stats {
    totalUsers: number;
    totalCourses: number;
    totalRevenue?: number;
}

interface Activity {
    type: string;
    title: string;
    time: string;
    icon: string;
}

interface DashboardProps extends PageProps {
    stats: Stats;
    recentUsers: User[];
    recentActivities?: Activity[];
    userStats: { year: number; month: number; user_count?: number; users?: number }[];
    courseStats: { year: number; month: number; course_count?: number }[];
    revenueStats: { year: number; month: number; revenue?: number; transactions_count?: number }[];
    filters?: Record<string, any>;
}

export default function Dashboard({ stats, recentUsers, recentActivities = [], userStats = [], courseStats = [], revenueStats = [], filters = {} }: DashboardProps) {
    const [chartPeriod, setChartPeriod] = useState('30d');
    const { showSuccess, showError, showWarning, showInfo } = useFormToast();

    // Filter configuration for dashboard
    const filterConfig: FilterConfig = {
        search: {
            placeholder: "Search users, courses, transactions...",
            enabled: true,
        },
        select: {
            period: {
                label: "Time Period",
                options: [
                    { value: "7d", label: "7 Hari Terakhir" },
                    { value: "30d", label: "30 Hari Terakhir" },
                    { value: "90d", label: "90 Hari Terakhir" },
                    { value: "1y", label: "1 Tahun Terakhir" },
                    { value: "all", label: "Semua Waktu" },
                ],
                placeholder: "Select time period"
            },
            userType: {
                label: "User Type",
                options: [
                    { value: "user", label: "Users" },
                    { value: "admin", label: "Admins" },
                ],
                placeholder: "Select user type"
            }
        },
        dateRange: {
            enabled: true,
            label: "Date Range"
        },
        sort: {
            enabled: true,
            options: [
                { value: "created_at", label: "Date Created" },
                { value: "updated_at", label: "Last Updated" },
            ],
            defaultSort: "created_at",
            defaultOrder: "desc"
        }
    };

    const handleRefreshData = () => {
        showInfo('Memperbarui data dashboard...');
        // Simulasi refresh data
        setTimeout(() => {
            showSuccess('Data dashboard berhasil diperbarui!');
        }, 1000);
    };

    const handleSendNotification = () => {
        showWarning('Mengirim notifikasi ke semua pengguna...');
        // Simulasi kirim notifikasi
        setTimeout(() => {
            showSuccess('Notifikasi berhasil dikirim ke 1,247 pengguna!');
        }, 1500);
    };

    // Helper: format month label
    const monthLabel = (y: number, m: number) => {
        const date = new Date(y, m - 1, 1);
        return date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
    };

    // Merge stats into overview data
    const overviewMap: Record<string, { name: string; users: number; courses: number; revenue: number }> = {};
    userStats.forEach((r) => {
        const key = `${r.year}-${r.month}`;
        overviewMap[key] = overviewMap[key] || { name: monthLabel(r.year, r.month), users: 0, courses: 0, revenue: 0 };
        overviewMap[key].users = (r.user_count ?? (r as any).users) || 0;
    });
    courseStats.forEach((r) => {
        const key = `${r.year}-${r.month}`;
        overviewMap[key] = overviewMap[key] || { name: monthLabel(r.year, r.month), users: 0, courses: 0, revenue: 0 };
        overviewMap[key].courses = r.course_count || 0;
    });
    revenueStats.forEach((r) => {
        const key = `${r.year}-${r.month}`;
        overviewMap[key] = overviewMap[key] || { name: monthLabel(r.year, r.month), users: 0, courses: 0, revenue: 0 };
        overviewMap[key].revenue = (r.revenue || 0);
    });
    const overviewData = Object.values(overviewMap);

    // Helper for Rupiah formatting
    const formatRupiah = (value: number) => {
        return `Rp ${Math.round(value).toLocaleString('id-ID')}`;
    };

    const handleExportData = () => {
        // Download CSV with current filters
        // @ts-ignore
        window.location.href = route('admin.dashboard.export', filters || {});
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            
            {/* Header Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Selamat datang! Pantau perkembangan platform kursus online Anda.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setChartPeriod('1d')}
                    >
                        <Calendar className="mr-2 h-4 w-4" />
                        Today
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportData}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Dashboard Filters */}
            <AdminFilter
                config={filterConfig}
                filters={filters}
                route="admin.dashboard"
            />

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Pengguna"
                    value={stats.totalUsers}
                    description="dari bulan lalu"
                    icon={Users}
                    trend={undefined}
                />
                
                <StatCard
                    title="Total Kursus"
                    value={stats.totalCourses}
                    description="dari bulan lalu"
                    icon={BookOpen}
                    trend={undefined}
                />

                <StatCard
                    title="Pendapatan"
                    value={formatRupiah(stats.totalRevenue || 0)}
                    description="dari bulan lalu"
                    icon={DollarSign}
                    trend={undefined}
                />
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <Card 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.visit(route('admin.users.index'))}
                >
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Users</p>
                                <p className="text-xs text-muted-foreground">Kelola pengguna</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>

                <Card 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.visit(route('admin.courses.index'))}
                >
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <BookOpen className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Courses</p>
                                <p className="text-xs text-muted-foreground">Kelola kursus</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>

                <Card 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.visit(route('admin.chapters.index'))}
                >
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Layers className="h-5 w-5 text-orange-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Chapters</p>
                                <p className="text-xs text-muted-foreground">Kelola bab</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>

                <Card 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.visit(route('admin.materials.index'))}
                >
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <FileText className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Materials</p>
                                <p className="text-xs text-muted-foreground">Kelola materi</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>

                <Card 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.visit(route('admin.transactions.index'))}
                >
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <CreditCard className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Transactions</p>
                                <p className="text-xs text-muted-foreground">Lihat transaksi</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>

                <Card 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.visit(route('admin.reviews'))}
                >
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <MessageSquare className="h-5 w-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Reviews</p>
                                <p className="text-xs text-muted-foreground">Kelola ulasan</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Overview Chart (Users, Courses, Revenue) */}
            <OverviewChart
                title="Overview Platform"
                description="Perkembangan users, courses, dan revenue berdasarkan bulan"
                data={overviewData}
                categories={["users", "courses", "revenue"]}
                colors={["#3b82f6", "#10b981", "#f59e0b"]}
                valueFormatter={(value) => {
                    if (value >= 1000000) {
                        return `Rp ${(value / 1000000).toFixed(1)}M`
                    }
                    return value.toString()
                }}
            />

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* User Growth per Month */}
                <ChartCard
                    title="Pertumbuhan Pengguna"
                    description="Jumlah pengguna per bulan"
                >
                    <LineChartComponent
                        data={userStats.map(r => ({ month: monthLabel(r.year, r.month), users: (r.user_count ?? (r as any).users) || 0 }))}
                        index="month"
                        categories={["users"]}
                        colors={["#3b82f6"]}
                    />
                </ChartCard>

                {/* Course Created per Month */}
                <ChartCard
                    title="Kursus Baru per Bulan"
                    description="Jumlah kursus dibuat per bulan"
                >
                    <BarChartComponent
                        data={courseStats.map(r => ({ month: monthLabel(r.year, r.month), courses: r.course_count || 0 }))}
                        index="month"
                        categories={["courses"]}
                        colors={["#10b981"]}
                    />
                </ChartCard>
            </div>

            {/* Revenue per Month */}
            <ChartCard
                title="Pendapatan Bulanan"
                description="Total pendapatan per bulan"
            >
                <BarChartComponent
                    data={revenueStats.map(r => ({ month: monthLabel(r.year, r.month), revenue: r.revenue || 0 }))}
                    index="month"
                    categories={["revenue"]}
                    colors={["#f59e0b"]}
                    valueFormatter={(value) => formatRupiah(value)}
                />
            </ChartCard>

            {/* Recent Activity and Recent Users */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {recentActivities.length > 0 ? (
                            recentActivities.map((activity, index) => {
                                // Map icon strings to actual icons
                                const iconMap: Record<string, any> = {
                                    'Users': Users,
                                    'BookOpen': BookOpen,
                                    'DollarSign': DollarSign,
                                };
                                const IconComponent = iconMap[activity.icon] || Users;
                                
                                // Map type to colors
                                const colorMap: Record<string, { bg: string; text: string }> = {
                                    'user_registered': { bg: 'bg-green-100', text: 'text-green-600' },
                                    'course_added': { bg: 'bg-blue-100', text: 'text-blue-600' },
                                    'transaction_completed': { bg: 'bg-yellow-100', text: 'text-yellow-600' },
                                };
                                const colors = colorMap[activity.type] || { bg: 'bg-gray-100', text: 'text-gray-600' };
                                
                                // Format time
                                const formatTime = (time: string) => {
                                    const date = new Date(time);
                                    const now = new Date();
                                    const diffMs = now.getTime() - date.getTime();
                                    const diffMins = Math.floor(diffMs / 60000);
                                    const diffHours = Math.floor(diffMs / 3600000);
                                    const diffDays = Math.floor(diffMs / 86400000);
                                    
                                    if (diffMins < 60) return `${diffMins} menit yang lalu`;
                                    if (diffHours < 24) return `${diffHours} jam yang lalu`;
                                    if (diffDays < 7) return `${diffDays} hari yang lalu`;
                                    return date.toLocaleDateString('id-ID');
                                };
                                
                                return (
                                    <ActivityItem
                                        key={index}
                                        title={activity.title}
                                        time={formatTime(activity.time)}
                                        icon={IconComponent}
                                        iconBgColor={colors.bg}
                                        iconColor={colors.text}
                                    />
                                );
                            })
                        ) : (
                            <p className="text-sm text-muted-foreground">Belum ada aktivitas terbaru</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Users */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="text-lg">Pengguna Terbaru</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('admin.users.index')}>
                                Lihat Semua
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentUsers.map((user) => (
                            <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors" key={user.id}>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted shrink-0">
                                    <Users className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium leading-none truncate">{user.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                                        {user.role}
                                    </Badge>
                                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                                        {new Date(user.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Demo Toast Notifications (UI-only) */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Demo Toast Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Klik tombol di bawah untuk melihat berbagai jenis toast notifications
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleRefreshData}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh Data
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleSendNotification}
                            className="flex items-center gap-2"
                        >
                            <Bell className="h-4 w-4" />
                            Kirim Notifikasi
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => showError('Terjadi kesalahan pada sistem!')}
                            className="flex items-center gap-2"
                        >
                            Demo Error
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => showWarning('Perhatian: Sistem akan maintenance dalam 1 jam!')}
                            className="flex items-center gap-2"
                        >
                            Demo Warning
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => showSuccess('Data berhasil disimpan!')}
                            className="flex items-center gap-2"
                        >
                            Demo Success
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </AdminLayout>
    );
}
