// resources/js/pages/admin/dashboard.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/stat-card';
import { ActivityItem } from '@/components/activity-item';
import { ChartCard, LineChartComponent, BarChartComponent, PieChartComponent } from '@/components/ui/charts';
import { DashboardFilters } from '@/components/dashboard-filters';
import { StatsSummary } from '@/components/stats-summary';
import { OverviewChart } from '@/components/overview-chart';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem, type PageProps, type User } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, Users, TrendingUp, DollarSign, ArrowRight, Calendar, Mail, BarChart3, Crown, Download, UserCheck, UserX, Building2, RefreshCw, Bell, Eye, Plus, CreditCard, MessageSquare } from 'lucide-react';
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
}

interface DashboardProps extends PageProps {
    stats: Stats;
    recentUsers: User[];
}

export default function Dashboard({ stats, recentUsers }: DashboardProps) {
    const [chartPeriod, setChartPeriod] = useState('30d');
    const { showSuccess, showError, showWarning, showInfo } = useFormToast();

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

    // Data untuk chart pendaftaran
    const registrationData = [
        { month: 'Jan', regular: 45, premium: 12 },
        { month: 'Feb', regular: 52, premium: 18 },
        { month: 'Mar', regular: 38, premium: 15 },
        { month: 'Apr', regular: 67, premium: 25 },
        { month: 'May', regular: 73, premium: 32 },
        { month: 'Jun', regular: 89, premium: 41 },
    ];

    // Data untuk chart bulanan
    const monthlyData = [
        { month: 'Jan', pendaftar: 57 },
        { month: 'Feb', pendaftar: 70 },
        { month: 'Mar', pendaftar: 53 },
        { month: 'Apr', pendaftar: 92 },
        { month: 'May', pendaftar: 105 },
        { month: 'Jun', pendaftar: 130 },
    ];

    // Data untuk pie chart tipe user
    const userTypeData = [
        { name: 'Regular', value: 1250 },
        { name: 'Premium', value: 320 },
        { name: 'Enterprise', value: 85 },
    ];

    // Data untuk overview chart
    const overviewData = [
        { name: 'Jan', users: 1200, courses: 45, revenue: 1800000 },
        { name: 'Feb', users: 1250, courses: 48, revenue: 1900000 },
        { name: 'Mar', users: 1300, courses: 52, revenue: 2100000 },
        { name: 'Apr', users: 1280, courses: 50, revenue: 2000000 },
        { name: 'May', users: 1350, courses: 55, revenue: 2200000 },
        { name: 'Jun', users: 1400, courses: 58, revenue: 2300000 },
        { name: 'Jul', users: 1450, courses: 62, revenue: 2400000 },
        { name: 'Aug', users: 1500, courses: 65, revenue: 2500000 },
    ];

    // Data untuk statistik detail
    const detailedStats = [
        {
            label: 'Pendaftar Baru',
            value: 89,
            change: '+12%',
            isPositive: true,
            icon: UserCheck,
            color: '#10b981'
        },
        {
            label: 'User Aktif',
            value: 1247,
            change: '+8%',
            isPositive: true,
            icon: Users,
            color: '#3b82f6'
        },
        {
            label: 'User Non-Aktif',
            value: 23,
            change: '-3%',
            isPositive: false,
            icon: UserX,
            color: '#ef4444'
        },
        {
            label: 'Conversion Rate',
            value: '15.2%',
            change: '+2.1%',
            isPositive: true,
            icon: TrendingUp,
            color: '#f59e0b'
        }
    ];

    // Data untuk mini charts
    const userTrendData = [
        { value: 1200 }, { value: 1250 }, { value: 1300 }, { value: 1280 }, 
        { value: 1350 }, { value: 1400 }, { value: 1450 }, { value: 1500 }
    ];
    
    const courseTrendData = [
        { value: 45 }, { value: 48 }, { value: 52 }, { value: 50 }, 
        { value: 55 }, { value: 58 }, { value: 62 }, { value: 65 }
    ];
    
    const revenueTrendData = [
        { value: 1800000 }, { value: 1900000 }, { value: 2100000 }, { value: 2000000 }, 
        { value: 2200000 }, { value: 2300000 }, { value: 2400000 }, { value: 2500000 }
    ];
    
    const growthTrendData = [
        { value: 12 }, { value: 13 }, { value: 14 }, { value: 13.5 }, 
        { value: 15 }, { value: 15.5 }, { value: 16 }, { value: 15.2 }
    ];

    const handleExportData = () => {
        // Implement export functionality
        console.log('Exporting dashboard data...');
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
                    <Button variant="outline" size="sm">
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
            <DashboardFilters
                period={chartPeriod}
                onPeriodChange={setChartPeriod}
                onExport={handleExportData}
                showExport={true}
            />

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Pengguna"
                    value={stats.totalUsers}
                    description="dari bulan lalu"
                    icon={Users}
                    trend={{ value: "+12%", isPositive: true }}
                    chartData={userTrendData}
                />
                
                <StatCard
                    title="Total Kursus"
                    value={stats.totalCourses}
                    description="dari bulan lalu"
                    icon={BookOpen}
                    trend={{ value: "+8%", isPositive: true }}
                    chartData={courseTrendData}
                />

                <StatCard
                    title="Pendapatan"
                    value="Rp 2.4M"
                    description="dari bulan lalu"
                    icon={DollarSign}
                    trend={{ value: "+23%", isPositive: true }}
                    chartData={revenueTrendData}
                />

                <StatCard
                    title="Pertumbuhan"
                    value="+15.2%"
                    description="dari bulan lalu"
                    icon={TrendingUp}
                    trend={{ value: "+2.1%", isPositive: true }}
                    chartData={growthTrendData}
                />
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Kelola Users</p>
                                <p className="text-xs text-muted-foreground">Tambah, edit, hapus user</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <BookOpen className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Kelola Kursus</p>
                                <p className="text-xs text-muted-foreground">Tambah, edit, hapus kursus</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <CreditCard className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Transaksi</p>
                                <p className="text-xs text-muted-foreground">Lihat semua transaksi</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
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

            {/* Overview Chart */}
            <OverviewChart
                title="Overview Platform"
                description="Perkembangan users, courses, dan revenue dalam 8 bulan terakhir"
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
                {/* User Registration Trend */}
                <ChartCard
                    title="Trend Pendaftaran"
                    description="Perbandingan pendaftar regular vs premium"
                    trend={{
                        value: "+18%",
                        isPositive: true,
                        label: "vs bulan lalu"
                    }}
                >
                    <LineChartComponent
                        data={registrationData}
                        index="month"
                        categories={["regular", "premium"]}
                        colors={["#3b82f6", "#10b981"]}
                    />
                </ChartCard>

                {/* User Types Distribution */}
                <ChartCard
                    title="Distribusi Tipe User"
                    description="Persentase berdasarkan tipe user"
                    trend={{
                        value: "+5%",
                        isPositive: true,
                        label: "Premium growth"
                    }}
                >
                    <PieChartComponent data={userTypeData} />
                </ChartCard>
            </div>

            {/* Monthly Registration Stats */}
            <ChartCard
                title="Pendaftaran Bulanan"
                description="Total pendaftar per bulan"
            >
                <BarChartComponent
                    data={monthlyData}
                    index="month"
                    categories={["pendaftar"]}
                    colors={["#3b82f6"]}
                />
            </ChartCard>

            {/* Detailed Statistics and Recent Activity */}
            <div className="grid gap-6 lg:grid-cols-2">
                <StatsSummary
                    title="Statistik Detail User"
                    stats={detailedStats}
                />
                
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ActivityItem
                            title="User baru mendaftar"
                            time="2 menit yang lalu"
                            icon={Users}
                            iconBgColor="bg-green-100"
                            iconColor="text-green-600"
                        />
                        
                        <ActivityItem
                            title="Kursus baru ditambahkan"
                            time="1 jam yang lalu"
                            icon={BookOpen}
                            iconBgColor="bg-blue-100"
                            iconColor="text-blue-600"
                        />
                        
                        <ActivityItem
                            title="Transaksi berhasil"
                            time="3 jam yang lalu"
                            icon={DollarSign}
                            iconBgColor="bg-yellow-100"
                            iconColor="text-yellow-600"
                        />
                        
                        <ActivityItem
                            title="Laporan bulanan selesai"
                            time="1 hari yang lalu"
                            icon={TrendingUp}
                            iconBgColor="bg-purple-100"
                            iconColor="text-purple-600"
                        />
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

            {/* Demo Toast Notifications */}
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
