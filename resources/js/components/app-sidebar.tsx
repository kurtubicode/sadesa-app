import { Link, usePage } from '@inertiajs/react';
import {
    BarChart2,
    BookOpen,
    ClipboardList,
    FileCheck,
    FileBadge,
    FileText,
    LayoutDashboard,
    MapPin,
    Megaphone,
    Newspaper,
    NotebookPen,
    Settings,
    ShieldCheck,
    UserCheck,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
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
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import type { Auth } from '@/types/auth';

// ─── Nav definitions ──────────────────────────────────────────────────────────

const adminNav: NavItem[] = [
    { title: 'Dashboard',          href: dashboard(),                icon: LayoutDashboard },
    { title: 'Pengajuan Surat',    href: '/admin/pengajuan',         icon: FileText },
    { title: 'Pengaduan',          href: '/admin/pengaduan',         icon: Megaphone },
];
const adminManageNav: NavItem[] = [
    { title: 'Master Surat',       href: '/admin/master-surat',      icon: ClipboardList },
    { title: 'Data Kependudukan',  href: '/admin/verifikasi-warga',  icon: UserCheck },
    { title: 'Pengguna Sistem',    href: '/admin/users',             icon: Users },
    { title: 'Data Master',        href: '/admin/data-master',       icon: MapPin },
];
const adminContentNav: NavItem[] = [
    { title: 'Konten Desa',        href: '/admin/konten',            icon: Newspaper },
    { title: 'Buku Tamu',          href: '/admin/buku-tamu',         icon: NotebookPen },
    { title: 'Audit Log',          href: '/admin/audit-log',         icon: ShieldCheck },
    { title: 'Pengaturan Desa',    href: '/admin/pengaturan',        icon: Settings },
];

const staffNav: NavItem[] = [
    { title: 'Dashboard',          href: dashboard(),                icon: LayoutDashboard },
    { title: 'Verifikasi Pengajuan', href: '/staff/pengajuan',       icon: FileCheck },
    { title: 'Pengaduan',          href: '/staff/pengaduan',         icon: Megaphone },
    { title: 'Buku Tamu',          href: '/staff/buku-tamu',         icon: NotebookPen },
];

const kepalDesaNav: NavItem[] = [
    { title: 'Dashboard',          href: dashboard(),                icon: LayoutDashboard },
    { title: 'Pengesahan Surat',   href: '/kepala-desa/pengajuan',   icon: FileBadge },
    { title: 'Statistik Layanan',  href: '/kepala-desa/pengajuan',   icon: BarChart2 },
];

const wargaNav: NavItem[] = [
    { title: 'Dashboard',          href: dashboard(),                icon: LayoutDashboard },
    { title: 'Data Kependudukan',  href: '/warga/data-diri',         icon: UserCheck },
    { title: 'Informasi Desa',     href: '/informasi',               icon: BookOpen },
];

const settingsNav: NavItem[] = [
    { title: 'Pengaturan Akun',    href: '/settings',                icon: Settings },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const role = auth?.user?.role ?? 'warga';

    return (
        <Sidebar collapsible="icon" variant="inset">
            {/* Logo */}
            <SidebarHeader className="border-b border-sidebar-border pb-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-sidebar-accent">
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Nav items per role */}
            <SidebarContent className="pt-2">
                {role === 'admin' && (
                    <>
                        <NavMain items={adminNav} label="Layanan" />
                        <NavMain items={adminManageNav} label="Kelola" />
                        <NavMain items={adminContentNav} label="Sistem" />
                    </>
                )}
                {role === 'staff' && (
                    <NavMain items={staffNav} label="Menu" />
                )}
                {role === 'kepala_desa' && (
                    <NavMain items={kepalDesaNav} label="Menu" />
                )}
                {role !== 'admin' && role !== 'staff' && role !== 'kepala_desa' && (
                    <NavMain items={wargaNav} label="Menu" />
                )}

                <SidebarSeparator className="mx-3 bg-sidebar-border" />
                <NavMain items={settingsNav} />
            </SidebarContent>

            {/* User footer */}
            <SidebarFooter className="border-t border-sidebar-border pt-2">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
