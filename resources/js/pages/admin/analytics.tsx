// resources/js/pages/admin/analytics.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartCard, LineChartComponent, BarChartComponent, PieChartComponent } from '@/components/ui/charts';
import { DashboardFilters } from '@/components/dashboard-filters';
import { AdminFilter, FilterConfig } from '@/components/admin/AdminFilter';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Users, DollarSign, Calendar, Download, Eye, Target } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: route('admin.dashboard'),
    },
    {
        title: 'Analytics',
        href: route('admin.analytics'),
    },
];

interface AnalyticsProps extends PageProps {
    userStats: { year: number; month: number; users?: number }[];
    revenueStats: { year: number; month: number; revenue?: number; transactions_count?: number }[];
    topCourses: { id: number; title: string; status?: 'draft' | 'published'; enrollments_count?: number; avg_rating?: number }[];
    courseTypeDistribution: { name: string; value: number }[];
    categoryPerformance?: { name: string; percentage: number; count: number }[];
    totals: { totalRevenue: number; totalUsers: number; totalCourses: number; totalTransactions: number };
    filters?: Record<string, any>;
}

export default function Analytics({ userStats = [], revenueStats = [], topCourses = [], courseTypeDistribution = [], categoryPerformance = [], totals, filters = {} }: AnalyticsProps) {
    const [chartPeriod, setChartPeriod] = useState((filters.period as string) || '30d');

    const monthLabel = (y: number, m: number) => {
        const date = new Date(y, m - 1, 1);
        return date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
    };

    const userGrowthData = userStats.map(r => ({ month: monthLabel(r.year, r.month), users: (r.users ?? 0) }));
    const revenueData = revenueStats.map(r => ({ month: monthLabel(r.year, r.month), revenue: r.revenue ?? 0, transactions: r.transactions_count ?? 0 }));

    const handleExportAnalytics = () => {
        // @ts-ignore
        window.location.href = route('admin.analytics.export', filters || {});
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Analytics" />
            
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                    <p className="text-muted-foreground">
                        Analisis mendalam tentang performa platform dan pengguna
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setChartPeriod('30d')}
                    >
                        <Calendar className="mr-2 h-4 w-4" />
                        Last 30 Days
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportAnalytics}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <AdminFilter
                config={{
                    search: { placeholder: 'Cari kursus', enabled: true },
                    select: {
                        period: {
                            label: 'Time Period',
                            options: [
                                { value: '7d', label: '7 Hari Terakhir' },
                                { value: '30d', label: '30 Hari Terakhir' },
                                { value: '90d', label: '90 Hari Terakhir' },
                                { value: '1y', label: '1 Tahun Terakhir' },
                                { value: 'all', label: 'Semua Waktu' },
                            ],
                        },
                    },
                    dateRange: { enabled: true, label: 'Date Range' },
                }}
                filters={filters}
                route="admin.analytics"
            />

            {/* Key Metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{`Rp ${Math.round(totals.totalRevenue || 0).toLocaleString('id-ID')}`}</div>
                        <p className="text-xs text-muted-foreground">&nbsp;</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totals.totalUsers?.toLocaleString('id-ID')}</div>
                        <p className="text-xs text-muted-foreground">&nbsp;</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totals.totalCourses?.toLocaleString('id-ID')}</div>
                        <p className="text-xs text-muted-foreground">&nbsp;</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totals.totalTransactions?.toLocaleString('id-ID')}</div>
                        <p className="text-xs text-muted-foreground">&nbsp;</p>
                    </CardContent>
                </Card>
            </div>

            {/* User Growth Chart */}
            <ChartCard
                title="User Growth Trends"
                description="Pertumbuhan pengguna dalam 6 bulan terakhir"
                trend={{
                    value: "+18%",
                    isPositive: true,
                    label: "vs bulan lalu"
                }}
            >
                <LineChartComponent
                    data={userGrowthData}
                    index="month"
                    categories={["users"]}
                    colors={["#3b82f6"]}
                />
            </ChartCard>

            {/* Revenue and Transactions */}
            <div className="grid gap-6 lg:grid-cols-2">
                <ChartCard
                    title="Revenue Trends"
                    description="Pendapatan dan transaksi per bulan"
                >
                    <BarChartComponent
                        data={revenueData}
                        index="month"
                        categories={["revenue"]}
                        colors={["#10b981"]}
                        valueFormatter={(value) => `Rp ${Math.round(value).toLocaleString('id-ID')}`}
                    />
                </ChartCard>

                <ChartCard
                    title="Course Type Distribution"
                    description="Perbandingan kursus Pro vs Free"
                >
                    <PieChartComponent data={courseTypeDistribution} />
                </ChartCard>
            </div>

            {/* Course Performance */}
            <Card>
                <CardHeader>
                    <CardTitle>Course Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {topCourses.map((course, index) => (
                            <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium">{course.title}</h4>
                                        {course.status && (
                                            <Badge 
                                                variant={course.status === 'published' ? 'success' : 'warning'} 
                                                className="text-xs"
                                            >
                                                {course.status === 'published' ? 'Published' : 'Draft'}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                        <span>{(course.enrollments_count ?? 0).toLocaleString('id-ID')} enrollments</span>
                                        <div className="flex items-center gap-1">
                                            <span>★</span>
                                            <span>{(course.avg_rating ?? 0).toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => router.visit(route('admin.courses.show', { course: course.id }))}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Additional Analytics Cards */}
            {categoryPerformance && categoryPerformance.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Top Performing Categories</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {categoryPerformance.map((category, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-sm">{category.name}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">({category.count})</span>
                                            <Badge variant="secondary">{category.percentage}%</Badge>
                                        </div>
                                    </div>
                                ))}
                                {categoryPerformance.length === 0 && (
                                    <p className="text-sm text-muted-foreground">Tidak ada data kategori</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Course Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {courseTypeDistribution.map((type, index) => {
                                    const total = courseTypeDistribution.reduce((sum, t) => sum + t.value, 0);
                                    const percentage = total > 0 ? Math.round((type.value / total) * 100) : 0;
                                    return (
                                        <div key={index} className="flex items-center justify-between">
                                            <span className="text-sm">{type.name} Courses</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">({type.value})</span>
                                                <Badge variant={type.name === 'Pro' ? 'default' : 'secondary'}>
                                                    {percentage}%
                                                </Badge>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Platform Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Avg Rating</span>
                                    <Badge variant="secondary">
                                        {topCourses.length > 0 
                                            ? (topCourses.reduce((sum, c) => sum + (c.avg_rating || 0), 0) / topCourses.length).toFixed(1)
                                            : '0.0'
                                        } ⭐
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Total Enrollments</span>
                                    <Badge variant="secondary">
                                        {topCourses.reduce((sum, c) => sum + (c.enrollments_count || 0), 0)}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Avg per Course</span>
                                    <Badge variant="secondary">
                                        {totals.totalCourses > 0 
                                            ? Math.round(topCourses.reduce((sum, c) => sum + (c.enrollments_count || 0), 0) / totals.totalCourses)
                                            : 0
                                        }
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </AdminLayout>
    );
}