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
import { BookOpen, Users, TrendingUp, DollarSign, ArrowRight, Calendar, Mail, BarChart3, Crown, Download, UserCheck, UserX, Building2 } from 'lucide-react';
import { useState } from 'react';

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
            <div className="flex-1 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground">
                            Selamat datang! Kelola data institusi dan pantau perkembangan platform kursus pribadi Anda.
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
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
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                <div className="grid gap-6 md:grid-cols-2">
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

                {/* Detailed Statistics */}
                <div className="grid gap-6 md:grid-cols-2">
                    <StatsSummary
                        title="Statistik Detail User"
                        stats={detailedStats}
                    />
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Aktivitas Terbaru</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
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
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Institutional Data Management */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Kelola Data Institusi</CardTitle>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={route('admin.institutions.index')}>
                                    Kelola Data
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center p-4 border rounded-lg bg-blue-50">
                                <Building2 className="h-8 w-8 text-blue-600 mr-4" />
                                <div className="flex-1">
                                    <h4 className="font-medium text-blue-900">Data Institusi</h4>
                                    <p className="text-sm text-blue-700">
                                        Kelola informasi institusi yang terkait dengan kursus Anda
                                    </p>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={route('admin.institutions.index')}>
                                        Lihat Data
                                    </Link>
                                </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium">Total Institusi</h4>
                                        <Badge variant="secondary">12</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Institusi yang terdaftar dalam sistem
                                    </p>
                                </div>
                                
                                <div className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium">Data Lengkap</h4>
                                        <Badge variant="default">8</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Institusi dengan informasi lengkap
                                    </p>
                                </div>
                                
                                <div className="p-4 border rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium">Perlu Update</h4>
                                        <Badge variant="destructive">4</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Data yang perlu diperbarui
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Users */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Pengguna Terbaru</CardTitle>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={route('admin.users.index')}>
                                    Lihat Semua
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {recentUsers.map((user) => (
                                <div className="flex items-center" key={user.id}>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                        <Users className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{user.name}</p>
                                        <div className="flex items-center space-x-2">
                                            <Mail className="h-3 w-3 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="ml-auto flex items-center space-x-2">
                                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                            {user.role}
                                        </Badge>
                                        <p className="text-sm text-muted-foreground">
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
            </div>
        </AdminLayout>
    );
}
