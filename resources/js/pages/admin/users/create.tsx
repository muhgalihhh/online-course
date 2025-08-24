import AdminLayout from '@/layouts/admin-layout';
import { AdminContentWrapper } from '@/components/admin-content-wrapper';
import { AdminSection } from '@/components/admin-section';
import { AdminForm } from '@/components/admin-form';
import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { type BreadcrumbItem } from '@/types';
import { Link } from '@inertiajs/react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: route('admin.dashboard') },
    { title: 'Users', href: route('admin.users.index') },
    { title: 'Create User', href: route('admin.users.create') }
];

export default function AdminUsersCreate() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        password: '',
        password_confirmation: '',
        is_active: true
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
    };

    const handleCancel = () => {
        // Navigate back to users index
        window.history.back();
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <AdminContentWrapper>
                {/* Page Header */}
                <PageHeader 
                    title="Create User"
                    description="Add a new user to the system"
                    backUrl={route('admin.users.index')}
                />

                {/* Create User Form */}
                <AdminSection>
                    <AdminForm
                        title="User Information"
                        description="Fill in the user details below"
                        onSubmit={handleSubmit}
                        submitLabel="Create User"
                        cancelLabel="Cancel"
                        onCancel={handleCancel}
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Enter full name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter email address"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="moderator">Moderator</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Confirm Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    placeholder="Confirm password"
                                    value={formData.password_confirmation}
                                    onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="is_active">Status</Label>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) => 
                                            setFormData({ ...formData, is_active: checked as boolean })
                                        }
                                    />
                                    <Label htmlFor="is_active" className="text-sm font-normal">
                                        User is active
                                    </Label>
                                </div>
                            </div>
                        </div>
                    </AdminForm>
                </AdminSection>
            </AdminContentWrapper>
        </AdminLayout>
    );
}