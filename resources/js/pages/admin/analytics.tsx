// resources/js/pages/admin/analytics.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartCard, LineChartComponent, BarChartComponent, PieChartComponent } from '@/components/ui/charts';
import { DashboardFilters } from '@/components/dashboard-filters';
import { AdminFilter, FilterConfig } from '@/components/admin/AdminFilter';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head } from '@inertiajs/react';
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
    topCourses: { id: number; title: string; enrollments_count?: number; avg_rating?: number }[];
    courseTypeDistribution: { name: string; value: number }[];
    totals: { totalRevenue: number; totalUsers: number; totalCourses: number; totalTransactions: number };
    filters?: Record<string, any>;
}

export default function Analytics({ userStats = [], revenueStats = [], topCourses = [], courseTypeDistribution = [], totals, filters = {} }: AnalyticsProps) {
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
                    <Button variant="outline" size="sm">
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
                    categories={["users", "newUsers", "activeUsers"]}
                    colors={["#3b82f6", "#10b981", "#f59e0b"]}
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
                                    <h4 className="font-medium">{course.title}</h4>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                        <span>{(course.enrollments_count ?? 0).toLocaleString('id-ID')} enrollments</span>
                                        <div className="flex items-center gap-1">
                                            <span>★</span>
                                            <span>{(course.avg_rating ?? 0).toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Additional Analytics Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Top Performing Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Programming</span>
                                <Badge variant="secondary">45%</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Design</span>
                                <Badge variant="secondary">28%</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Business</span>
                                <Badge variant="secondary">18%</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Marketing</span>
                                <Badge variant="secondary">9%</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Device Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Desktop</span>
                                <Badge variant="secondary">58%</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Mobile</span>
                                <Badge variant="secondary">35%</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Tablet</span>
                                <Badge variant="secondary">7%</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Peak Hours</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Morning (8-12)</span>
                                <Badge variant="secondary">25%</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Afternoon (12-17)</span>
                                <Badge variant="secondary">40%</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Evening (17-22)</span>
                                <Badge variant="secondary">30%</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Night (22-8)</span>
                                <Badge variant="secondary">5%</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}