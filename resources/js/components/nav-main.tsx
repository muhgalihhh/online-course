import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    
    // Function to check if the current route is active
    const isActiveRoute = (href: string) => {
        // Exact match for dashboard
        if (href === '/dashboard' && page.url === '/dashboard') {
            return true;
        }
        // For other routes, check if the current URL starts with the href
        // but avoid false positives (e.g., /users matching /user)
        if (href !== '/dashboard') {
            return page.url === href || page.url.startsWith(href + '/');
        }
        return false;
    };
    
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const isActive = isActiveRoute(item.href);
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton 
                                asChild 
                                isActive={isActive} 
                                tooltip={{ children: item.title }}
                                className={isActive ? 'bg-accent font-medium' : ''}
                            >
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon className={isActive ? 'text-primary' : ''} />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
