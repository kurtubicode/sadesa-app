import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    ClipboardList,
    FileCheck,
    FileText,
    LayoutGrid,
    Megaphone,
    Settings,
    ShieldCheck,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import type { Auth } from '@/types/auth';

// ─── Nav items per role ───────────────────────────────────────────────────────

const adminNavItems: NavItem[] = [
    { title: 'Dashboard',       href: dashboard(), icon: LayoutGrid },
    { title: 'Kelola Pengguna', href: '/admin/users',   icon: Users },
    { title: 'Pengajuan Surat', href: '/admin/pengajuan', icon: FileText },
    { title: 'Pengaduan',       href: '/admin/pengaduan', icon: Megaphone },
    { title: 'Konten Desa',     href: '/admin/konten',    icon: BookOpen },
    { title: 'Audit Log',       href: '/admin/audit-log', icon: ClipboardList },
    { title: 'Pengaturan',      href: '/settings',        icon: Settings },
];

const staffNavItems: NavItem[] = [
    { title: 'Dashboard',             href: dashboard(),       icon: LayoutGrid },
    { title: 'Antrian Pengajuan',     href: '/staff/pengajuan', icon: ClipboardList },
    { title: 'Verifikasi Berkas',     href: '/staff/verifikasi', icon: FileCheck },
    { title: 'Pengaduan Masuk',       href: '/staff/pengaduan',  icon: Megaphone },
];

const kepalDesaNavItems: NavItem[] = [
    { title: 'Dashboard',         href: dashboard(),            icon: LayoutGrid },
    { title: 'Pengesahan Surat',  href: '/kepala-desa/pengajuan', icon: ShieldCheck },
    { title: 'Statistik',         href: '/kepala-desa/statistik', icon: BarChart3 },
];

const footerNavItems: NavItem[] = [];

// ─── Component ────────────────────────────────────────────────────────────────

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const role = auth?.user?.role ?? 'staff';

    const navItems =
        role === 'admin'
            ? adminNavItems
            : role === 'kepala_desa'
              ? kepalDesaNavItems
              : staffNavItems;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
