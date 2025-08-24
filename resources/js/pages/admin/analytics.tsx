// resources/js/pages/admin/analytics.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChartCard, LineChartComponent, BarChartComponent, PieChartComponent } from '@/components/ui/charts';
import { DashboardFilters } from '@/components/dashboard-filters';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem, type PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { Users, BookOpen, DollarSign, TrendingUp, Calendar, Download, Filter, BarChart3, Eye, Target, Activity } from 'lucide-react';
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
    // Add analytics data props here
}

export default function Analytics({}: AnalyticsProps) {
    const [chartPeriod, setChartPeriod] = useState('30d');

    // Sample data for analytics
    const userGrowthData = [
        { month: 'Jan', users: 1200, newUsers: 150, activeUsers: 980 },
        { month: 'Feb', users: 1350, newUsers: 180, activeUsers: 1120 },
        { month: 'Mar', users: 1480, newUsers: 165, activeUsers: 1250 },
        { month: 'Apr', users: 1620, newUsers: 190, activeUsers: 1380 },
        { month: 'May', users: 1780, newUsers: 210, activeUsers: 1520 },
        { month: 'Jun', users: 1950, newUsers: 225, activeUsers: 1680 },
    ];

    const revenueData = [
        { month: 'Jan', revenue: 1800000, transactions: 45, avgOrder: 40000 },
        { month: 'Feb', revenue: 2100000, transactions: 52, avgOrder: 40385 },
        { month: 'Mar', revenue: 1950000, transactions: 48, avgOrder: 40625 },
        { month: 'Apr', revenue: 2300000, transactions: 58, avgOrder: 39655 },
        { month: 'May', revenue: 2500000, transactions: 62, avgOrder: 40323 },
        { month: 'Jun', revenue: 2800000, transactions: 68, avgOrder: 41176 },
    ];

    const coursePerformanceData = [
        { course: 'React Fundamentals', enrollments: 245, completion: 78, rating: 4.5 },
        { course: 'Advanced JavaScript', enrollments: 189, completion: 82, rating: 4.7 },
        { course: 'Node.js Backend', enrollments: 156, completion: 75, rating: 4.3 },
        { course: 'Python Data Science', enrollments: 203, completion: 85, rating: 4.6 },
        { course: 'UI/UX Design', enrollments: 178, completion: 79, rating: 4.4 },
    ];

    const userDemographicsData = [
        { age: '18-24', users: 450, percentage: 23 },
        { age: '25-34', users: 680, percentage: 35 },
        { age: '35-44', users: 420, percentage: 22 },
        { age: '45-54', users: 280, percentage: 14 },
        { age: '55+', users: 120, percentage: 6 },
    ];

    const conversionData = [
        { stage: 'Visit', count: 10000, conversion: 100 },
        { stage: 'Browse', count: 6500, conversion: 65 },
        { stage: 'Register', count: 3200, conversion: 32 },
        { stage: 'Enroll', count: 1800, conversion: 18 },
        { stage: 'Complete', count: 1200, conversion: 12 },
    ];

    const handleExportAnalytics = () => {
        // Implement export functionality
        console.log('Exporting analytics data...');
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
            <DashboardFilters
                period={chartPeriod}
                onPeriodChange={setChartPeriod}
                onExport={handleExportAnalytics}
                showExport={true}
            />

            {/* Key Metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Rp 2.8M</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+12%</span> from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,680</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+8%</span> from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Course Completions</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,200</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+15%</span> from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12.5%</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+2.1%</span> from last month
                        </p>
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
                        valueFormatter={(value) => `Rp ${(value / 1000000).toFixed(1)}M`}
                    />
                </ChartCard>

                <ChartCard
                    title="User Demographics"
                    description="Distribusi usia pengguna"
                >
                    <PieChartComponent 
                        data={userDemographicsData.map(item => ({
                            name: item.age,
                            value: item.users
                        }))} 
                    />
                </ChartCard>
            </div>

            {/* Course Performance */}
            <Card>
                <CardHeader>
                    <CardTitle>Course Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {coursePerformanceData.map((course, index) => (
                            <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex-1">
                                    <h4 className="font-medium">{course.course}</h4>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                        <span>{course.enrollments} enrollments</span>
                                        <span>{course.completion}% completion</span>
                                        <div className="flex items-center gap-1">
                                            <span>★</span>
                                            <span>{course.rating}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">{course.completion}%</Badge>
                                    <Button variant="outline" size="sm">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Conversion Funnel */}
            <div className="grid gap-6 lg:grid-cols-2">
                <ChartCard
                    title="Conversion Funnel"
                    description="Tingkat konversi dari kunjungan hingga penyelesaian"
                >
                    <BarChartComponent
                        data={conversionData}
                        index="stage"
                        categories={["conversion"]}
                        colors={["#8b5cf6"]}
                        valueFormatter={(value) => `${value}%`}
                    />
                </ChartCard>

                <Card>
                    <CardHeader>
                        <CardTitle>Funnel Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {conversionData.map((stage, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium">{stage.stage}</p>
                                            <p className="text-sm text-muted-foreground">{stage.count.toLocaleString()} users</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline">{stage.conversion}%</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

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