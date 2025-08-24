// resources/js/pages/admin/dashboard.tsx

import AdminLayout from '@/layouts/admin-layout';
import { AdminContentWrapper } from '@/components/admin-content-wrapper';
import { AdminSection } from '@/components/admin-section';
import { AdminCard } from '@/components/admin-card';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { OverviewChart } from '@/components/overview-chart';
import { type BreadcrumbItem } from '@/types';
import { Users, BookOpen, CreditCard, TrendingUp } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('admin.dashboard') }
];

export default function AdminDashboard() {
    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <AdminContentWrapper>
                {/* Page Header */}
                <PageHeader 
                    title="Dashboard"
                    description="Overview of your platform's performance and key metrics"
                />

                {/* Stats Overview */}
                <AdminSection title="Overview">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Total Users"
                            value="1,234"
                            description="+12% from last month"
                            icon={Users}
                            trend="up"
                        />
                        <StatCard
                            title="Active Courses"
                            value="56"
                            description="+8% from last month"
                            icon={BookOpen}
                            trend="up"
                        />
                        <StatCard
                            title="Revenue"
                            value="$12,345"
                            description="+23% from last month"
                            icon={CreditCard}
                            trend="up"
                        />
                        <StatCard
                            title="Growth Rate"
                            value="15.2%"
                            description="+2.1% from last month"
                            icon={TrendingUp}
                            trend="up"
                        />
                    </div>
                </AdminSection>

                {/* Charts Section */}
                <AdminSection title="Analytics">
                    <div className="grid gap-6 lg:grid-cols-2">
                        <AdminCard 
                            title="User Growth"
                            description="Monthly user registration trends"
                        >
                            <OverviewChart />
                        </AdminCard>
                        
                        <AdminCard 
                            title="Revenue Overview"
                            description="Monthly revenue and transaction data"
                        >
                            <div className="h-64 flex items-center justify-center text-muted-foreground">
                                Chart placeholder
                            </div>
                        </AdminCard>
                    </div>
                </AdminSection>

                {/* Recent Activity */}
                <AdminSection title="Recent Activity">
                    <AdminCard>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">New user registered</p>
                                    <p className="text-xs text-muted-foreground">John Doe joined the platform</p>
                                </div>
                                <span className="text-xs text-muted-foreground">2 min ago</span>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Course completed</p>
                                    <p className="text-xs text-muted-foreground">Advanced React course finished</p>
                                </div>
                                <span className="text-xs text-muted-foreground">1 hour ago</span>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">System update</p>
                                    <p className="text-xs text-muted-foreground">New features deployed</p>
                                </div>
                                <span className="text-xs text-muted-foreground">3 hours ago</span>
                            </div>
                        </div>
                    </AdminCard>
                </AdminSection>
            </AdminContentWrapper>
        </AdminLayout>
    );
}
