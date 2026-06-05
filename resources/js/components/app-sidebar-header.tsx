import { usePage } from '@inertiajs/react';
import { Bell, HelpCircle, Search } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';
import type { Auth } from '@/types/auth';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_LABEL: Record<string, string> = {
    admin:       'Administrator',
    staff:       'Staff Pelayanan',
    kepala_desa: 'Kepala Desa',
    warga:       'Warga',
};

const AVATAR_COLORS = [
    ['#ccfbf1','#0f766e'], ['#dbeafe','#1d4ed8'], ['#fef9c3','#a16207'],
    ['#fce7f3','#9d174d'], ['#ede9fe','#6d28d9'], ['#dcfce7','#15803d'],
];

function avatarStyle(name: string) {
    const idx = (name.charCodeAt(0) + (name.charCodeAt(1) || 0)) % AVATAR_COLORS.length;
    return AVATAR_COLORS[idx];
}

function getInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const user      = auth?.user;
    const name      = user?.name ?? '';
    const role      = user?.role ?? 'warga';
    const initials  = name ? getInitials(name) : '?';
    const [avBg, avFg] = avatarStyle(name);

    return (
        <header
            className="flex shrink-0 items-center gap-4 border-b bg-card px-7"
            style={{ height: 68 }}
        >
            {/* Left: sidebar trigger + breadcrumbs */}
            <div className="flex min-w-0 flex-1 items-center gap-2">
                <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
                <div className="hidden min-w-0 sm:block">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
            </div>

            {/* Search */}
            <div className="hidden flex-1 items-center gap-2 rounded-lg border bg-muted/60 px-3 py-2 text-sm text-muted-foreground md:flex"
                style={{ maxWidth: 400 }}>
                <Search className="h-4 w-4 shrink-0" />
                <span className="flex-1 select-none text-[14px]">
                    Cari data warga, surat, atau laporan...
                </span>
            </div>

            {/* Right actions */}
            <div className="flex shrink-0 items-center gap-3">

                {/* Bell */}
                <div className="relative">
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg border bg-card text-muted-foreground transition-colors hover:bg-muted">
                        <Bell className="h-4 w-4" />
                    </button>
                    {/* Uncomment when notification count is wired up:
                    <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-[0_0_0_2px_white]">5</span>
                    */}
                </div>

                {/* Help */}
                <button className="flex h-8 w-8 items-center justify-center rounded-lg border bg-card text-muted-foreground transition-colors hover:bg-muted">
                    <HelpCircle className="h-4 w-4" />
                </button>

                {/* Divider */}
                <div className="h-7 w-px bg-border" />

                {/* User */}
                <div className="flex items-center gap-2.5">
                    <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                        style={{ background: avBg, color: avFg }}
                    >
                        {initials}
                    </div>
                    <div className="hidden sm:block">
                        <p className="max-w-[130px] truncate text-sm font-semibold text-foreground">
                            {name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {ROLE_LABEL[role] ?? role}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
}
