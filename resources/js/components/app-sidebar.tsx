import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    ClipboardList,
    FileText,
    LayoutGrid,
    MapPin,
    Megaphone,
    NotebookPen,
    Settings,
    ShieldCheck,
    UserCheck,
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
    { title: 'Dashboard',       href: dashboard(),          icon: LayoutGrid },
    { title: 'Verifikasi Warga', href: '/admin/verifikasi-warga', icon: UserCheck },
    { title: 'Kelola Pengguna', href: '/admin/users',       icon: Users },
    { title: 'Pengajuan Surat', href: '/admin/pengajuan',   icon: FileText },
    { title: 'Pengaduan',       href: '/admin/pengaduan',   icon: Megaphone },
    { title: 'Master Surat',    href: '/admin/master-surat', icon: ClipboardList },
    { title: 'Data Master',     href: '/admin/data-master',  icon: MapPin },
    { title: 'Konten Desa',     href: '/admin/konten',       icon: BookOpen },
    { title: 'Buku Tamu',       href: '/admin/buku-tamu',    icon: NotebookPen },
    { title: 'Audit Log',       href: '/admin/audit-log',    icon: ShieldCheck },
    { title: 'Pengaturan',      href: '/settings',           icon: Settings },
];

const staffNavItems: NavItem[] = [
    { title: 'Dashboard',         href: dashboard(),           icon: LayoutGrid },
    { title: 'Antrian Pengajuan', href: '/staff/pengajuan',   icon: ClipboardList },
    { title: 'Pengaduan',         href: '/staff/pengaduan',   icon: Megaphone },
    { title: 'Pengaturan',        href: '/settings',           icon: Settings },
];

const kepalDesaNavItems: NavItem[] = [
    { title: 'Dashboard',         href: dashboard(),                  icon: LayoutGrid },
    { title: 'Pengajuan Surat',   href: '/kepala-desa/pengajuan',     icon: ShieldCheck },
    { title: 'Pengaturan',        href: '/settings',                  icon: Settings },
];

const wargaNavItems: NavItem[] = [
    { title: 'Dashboard',         href: dashboard(),   icon: LayoutGrid },
    { title: 'Informasi Desa',    href: '/informasi',  icon: BookOpen },
    { title: 'Pengaturan',        href: '/settings',   icon: Settings },
];

const footerNavItems: NavItem[] = [];

// ─── Component ────────────────────────────────────────────────────────────────

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const role = auth?.user?.role ?? 'staff';

    const navItems =
        role === 'admin'       ? adminNavItems      :
        role === 'kepala_desa' ? kepalDesaNavItems   :
        role === 'staff'       ? staffNavItems       :
                                 wargaNavItems;

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
