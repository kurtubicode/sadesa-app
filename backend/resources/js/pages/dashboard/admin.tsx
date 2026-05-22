import { Head, router } from '@inertiajs/react';
import {
    BarChart3,
    ClipboardList,
    Copy,
    Megaphone,
    Settings,
    ShieldCheck,
    UserCheck,
    Users,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
    total_users: number;
    total_pengajuan: number;
    pengajuan_hari_ini: number;
    pengaduan_baru: number;
    verifikasi_menunggu: number;
}

interface LogItem {
    id: number;
    action: string;
    created_at: string;
    user?: { id: number; name: string } | null;
}

interface Props {
    stats: Stats;
    recent_logs: LogItem[];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
    title,
    value,
    subtitle,
    icon,
    color = 'teal',
}: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color?: 'teal' | 'blue' | 'green' | 'purple';
}) {
    const iconBg = {
        teal:   'bg-teal-100 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400',
        blue:   'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        green:  'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
        purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    };

    return (
        <div className="rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="mb-1 text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="mb-1 text-2xl font-bold text-foreground">{value}</h3>
                    {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                </div>
                <div className={`flex h-14 w-14 items-center justify-center rounded-full ${iconBg[color]}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function QuickAction({
    title,
    description,
    icon,
    color = 'teal',
    href,
    badge,
}: {
    title: string;
    description: string;
    icon: React.ReactNode;
    color?: 'teal' | 'blue' | 'purple' | 'amber';
    href?: string;
    badge?: number;
}) {
    const btnColor = {
        teal:   'bg-teal-600 hover:bg-teal-700',
        blue:   'bg-blue-600 hover:bg-blue-700',
        purple: 'bg-purple-600 hover:bg-purple-700',
        amber:  'bg-amber-500 hover:bg-amber-600',
    };

    return (
        <button
            type="button"
            onClick={() => href && router.visit(href)}
            className="group w-full rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md text-left cursor-pointer disabled:cursor-default"
        >
            <div className="relative mb-4 inline-flex">
                <div className={`h-12 w-12 items-center flex justify-center rounded-lg ${btnColor[color]} text-white transition-transform group-hover:scale-110`}>
                    {icon}
                </div>
                {badge !== undefined && badge > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                        {badge > 99 ? '99+' : badge}
                    </span>
                )}
            </div>
            <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
        </button>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: dashboard() }];

export default function DashboardAdmin({ stats, recent_logs }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Admin | SADESA" />

            <div className="flex flex-col gap-6 p-4">

                {/* Header */}
                <div>
                    <h1 className="text-xl font-bold text-foreground">Dashboard Administrator</h1>
                    <p className="text-muted-foreground">Panel kontrol sistem dan manajemen pengguna</p>
                </div>

                {/* Statistik */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <StatCard
                        title="Total Pengguna"
                        value={stats.total_users}
                        subtitle="Semua role"
                        icon={<Users className="h-7 w-7" />}
                        color="teal"
                    />
                    <StatCard
                        title="Total Pengajuan"
                        value={stats.total_pengajuan}
                        subtitle="Sepanjang waktu"
                        icon={<Copy className="h-7 w-7" />}
                        color="blue"
                    />
                    <StatCard
                        title="Pengajuan Hari Ini"
                        value={stats.pengajuan_hari_ini}
                        subtitle="Masuk hari ini"
                        icon={<BarChart3 className="h-7 w-7" />}
                        color="green"
                    />
                    <StatCard
                        title="Pengaduan Baru"
                        value={stats.pengaduan_baru}
                        subtitle="Belum ditangani"
                        icon={<ShieldCheck className="h-7 w-7" />}
                        color="purple"
                    />
                    <StatCard
                        title="Verifikasi Warga"
                        value={stats.verifikasi_menunggu}
                        subtitle="Menunggu review"
                        icon={<UserCheck className="h-7 w-7" />}
                        color="teal"
                    />
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="mb-4 text-lg font-semibold text-foreground">Akses Cepat</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <QuickAction
                            title="Kelola Pengguna"
                            description="Tambah, edit, atau nonaktifkan akun"
                            icon={<Users className="h-6 w-6" />}
                            color="teal"
                            href="/admin/users"
                        />
                        <QuickAction
                            title="Verifikasi Warga"
                            description="Tinjau KTP/KK warga yang mendaftar"
                            icon={<UserCheck className="h-6 w-6" />}
                            color="blue"
                            href="/admin/verifikasi-warga"
                            badge={stats.verifikasi_menunggu}
                        />
                        <QuickAction
                            title="Konten Desa"
                            description="Buat berita dan pengumuman"
                            icon={<Copy className="h-6 w-6" />}
                            color="purple"
                            href="/admin/konten"
                        />
                        <QuickAction
                            title="Audit Log"
                            description="Riwayat aktivitas sistem"
                            icon={<ClipboardList className="h-6 w-6" />}
                            color="amber"
                            href="/admin/audit-log"
                        />
                    </div>
                </div>

                {/* Log Aktivitas */}
                <div className="rounded-xl border bg-card shadow-sm">
                    <div className="border-b px-6 py-4">
                        <h3 className="font-semibold text-foreground">Log Aktivitas Sistem</h3>
                    </div>
                    <div className="p-6">
                        {recent_logs.length === 0 ? (
                            <p className="text-center text-sm text-muted-foreground py-8">Belum ada aktivitas tercatat.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="pb-3 font-medium text-muted-foreground">User</th>
                                            <th className="pb-3 font-medium text-muted-foreground">Aktivitas</th>
                                            <th className="pb-3 font-medium text-muted-foreground">Waktu</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recent_logs.map((log) => (
                                            <tr key={log.id} className="border-b last:border-0">
                                                <td className="py-3 font-medium text-foreground">{log.user?.name ?? '—'}</td>
                                                <td className="py-3 text-muted-foreground">{log.action}</td>
                                                <td className="py-3 text-muted-foreground">
                                                    {new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Alert notifikasi */}
                {(stats.pengaduan_baru > 0 || stats.verifikasi_menunggu > 0) && (
                    <div className="flex flex-col gap-2">
                        {stats.pengaduan_baru > 0 && (
                            <button
                                type="button"
                                onClick={() => router.visit('/admin/pengaduan')}
                                className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left transition-colors hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-900/10"
                            >
                                <Megaphone className="h-5 w-5 shrink-0 text-amber-600" />
                                <p className="text-sm text-amber-700 dark:text-amber-400">
                                    Ada <strong>{stats.pengaduan_baru}</strong> pengaduan baru yang belum ditangani. Klik untuk melihat →
                                </p>
                            </button>
                        )}
                        {stats.verifikasi_menunggu > 0 && (
                            <button
                                type="button"
                                onClick={() => router.visit('/admin/verifikasi-warga')}
                                className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-left transition-colors hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-900/10"
                            >
                                <UserCheck className="h-5 w-5 shrink-0 text-blue-600" />
                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                    Ada <strong>{stats.verifikasi_menunggu}</strong> pengajuan verifikasi warga yang perlu ditinjau. Klik untuk melihat →
                                </p>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
