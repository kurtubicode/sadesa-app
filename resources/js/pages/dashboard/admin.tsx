import { Head, router } from '@inertiajs/react';
import {
    BarChart3,
    Eye,
    Megaphone,
    UserCheck,
    Users,
    FileText,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
    total_penduduk: number;
    total_warga: number;
    total_users: number;
    total_pengajuan: number;
    pengajuan_hari_ini: number;
    pengaduan_baru: number;
    verifikasi_menunggu: number;
    pengguna_baru_bulan_ini: number;
}

interface ChartPoint {
    label: string;
    jumlah: number;
}

interface LogItem {
    id: number;
    action: string;
    model: string | null;
    created_at: string;
    user?: { id: number; name: string } | null;
}

interface PengajuanItem {
    id: number;
    status: string;
    created_at: string;
    user?: { id: number; name: string; nik: string | null } | null;
    master_surat?: { id: number; nama_surat: string } | null;
}

interface Props {
    stats: Stats;
    chart_mingguan: ChartPoint[];
    recent_logs: LogItem[];
    recent_pengajuan: PengajuanItem[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
}

const AVATAR_COLORS = [
    'bg-teal-600', 'bg-blue-600', 'bg-violet-600',
    'bg-emerald-600', 'bg-amber-500', 'bg-rose-500',
];

function avatarColor(name: string): string {
    const code = name.charCodeAt(0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[code];
}

// ─── Status labels / colors ───────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
    menunggu:            'Menunggu',
    diverifikasi:        'Diverifikasi',
    menunggu_pengesahan: 'Pengesahan',
    disetujui:           'Siap Cetak',
    ditolak_staff:       'Ditolak',
    ditolak_kepala:      'Ditolak',
    siap_diambil:        'Siap Diambil',
    selesai:             'Selesai',
    dibatalkan:          'Dibatalkan',
};

const STATUS_CLS: Record<string, string> = {
    menunggu:            'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400',
    diverifikasi:        'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
    menunggu_pengesahan: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    disetujui:           'bg-teal-100   text-teal-700   dark:bg-teal-900/30   dark:text-teal-400',
    ditolak_staff:       'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
    ditolak_kepala:      'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
    siap_diambil:        'bg-teal-100   text-teal-700   dark:bg-teal-900/30   dark:text-teal-400',
    selesai:             'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400',
    dibatalkan:          'bg-gray-100   text-gray-600   dark:bg-gray-800/50   dark:text-gray-400',
};

// Warna dot di activity feed berdasarkan isi action
function logDotColor(action: string): string {
    const a = action.toLowerCase();
    if (a.includes('tolak') || a.includes('hapus') || a.includes('batal')) return 'bg-red-500';
    if (a.includes('setuju') || a.includes('selesai') || a.includes('verif')) return 'bg-teal-500';
    if (a.includes('upload') || a.includes('buat') || a.includes('tambah') || a.includes('daftar')) return 'bg-blue-500';
    return 'bg-amber-500';
}

// ─── StatCard — tile 42 px soft-tint, sesuai design system ──────────────────

type StatTone = 'teal' | 'warn' | 'danger' | 'info';

const TILE_CLS: Record<StatTone, string> = {
    teal:   'bg-teal-50   text-teal-600',
    warn:   'bg-yellow-50 text-yellow-600',
    danger: 'bg-red-50    text-red-600',
    info:   'bg-blue-50   text-blue-600',
};
const BADGE_CLS: Record<StatTone, string> = {
    teal:   'bg-teal-50   text-teal-700',
    warn:   'bg-yellow-50 text-yellow-700',
    danger: 'bg-red-50    text-red-700',
    info:   'bg-blue-50   text-blue-700',
};

function StatCard({
    icon, title, value, badge, tone = 'teal',
}: {
    icon: React.ReactNode;
    title: string;
    value: number | string;
    badge?: string | null;
    tone?: StatTone;
}) {
    return (
        <div className="rounded-xl border bg-card p-[18px] shadow-sm">
            <div className="mb-3 flex items-start justify-between">
                <div className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg ${TILE_CLS[tone]}`}>
                    {icon}
                </div>
                {badge && (
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE_CLS[tone]}`}>
                        {badge}
                    </span>
                )}
            </div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-1 text-[28px] font-bold leading-none tabular-nums text-foreground">
                {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
            </p>
        </div>
    );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────

function BarChart({ data }: { data: ChartPoint[] }) {
    const max = Math.max(...data.map(d => d.jumlah), 1);

    return (
        <div className="flex items-end justify-between gap-1.5" style={{ height: '140px' }}>
            {data.map((d, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">
                        {d.jumlah > 0 ? d.jumlah : ''}
                    </span>
                    <div className="relative w-full flex items-end" style={{ height: '100px' }}>
                        {d.jumlah > 0 ? (
                            <div
                                className="w-full rounded-t-lg bg-teal-600 transition-all hover:bg-teal-500"
                                style={{ height: `${Math.max((d.jumlah / max) * 100, 8)}%` }}
                            />
                        ) : (
                            <div className="w-full rounded-t-lg bg-muted" style={{ height: '4px' }} />
                        )}
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground">{d.label}</span>
                </div>
            ))}
        </div>
    );
}

// ─── Activity Feed ────────────────────────────────────────────────────────────

function ActivityFeed({ logs }: { logs: LogItem[] }) {
    return (
        <div className="space-y-4">
            {logs.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">Belum ada aktivitas.</p>
            ) : (
                logs.map(log => (
                    <div key={log.id} className="flex items-start gap-3">
                        <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${logDotColor(log.action)}`} />
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-foreground leading-snug">
                                {log.action}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {log.user?.name ?? 'Sistem'}
                                {log.model ? ` — ${log.model}` : ''}
                            </p>
                            <p className="mt-0.5 text-xs font-medium text-teal-600 dark:text-teal-400">
                                {new Date(log.created_at).toLocaleTimeString('id-ID', {
                                    hour: '2-digit', minute: '2-digit',
                                })} WIB
                            </p>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

// ─── Breadcrumbs ──────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: dashboard() }];

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardAdmin({ stats, chart_mingguan, recent_logs, recent_pengajuan }: Props) {
    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Admin | SADESA" />

            <div className="flex flex-col gap-6 p-4">

                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-black text-foreground">Ringkasan Sistem</h1>
                        <p className="text-sm text-muted-foreground">
                            Laporan performa dan statistik operasional desa hari ini.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl border bg-card px-4 py-2 shadow-sm">
                        <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-teal-600">
                            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-foreground capitalize">{today}</span>
                    </div>
                </div>

                {/* ── Stat Cards ─────────────────────────────────────────── */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        icon={<Users className="h-[21px] w-[21px]" />}
                        title="Total Penduduk"
                        value={stats.total_penduduk}
                        tone="teal"
                        badge={stats.pengguna_baru_bulan_ini > 0 ? `+${stats.pengguna_baru_bulan_ini} baru` : null}
                    />
                    <StatCard
                        icon={<UserCheck className="h-[21px] w-[21px]" />}
                        title="Akun Warga"
                        value={stats.total_warga}
                        tone="info"
                        badge="+1,8%"
                    />
                    <StatCard
                        icon={<FileText className="h-[21px] w-[21px]" />}
                        title="Permohonan Surat"
                        value={stats.total_pengajuan}
                        tone="warn"
                        badge={stats.pengajuan_hari_ini > 0 ? `+${stats.pengajuan_hari_ini} hari ini` : 'Pending'}
                    />
                    <StatCard
                        icon={<Megaphone className="h-[21px] w-[21px]" />}
                        title="Laporan Pengaduan"
                        value={stats.pengaduan_baru}
                        tone="danger"
                        badge={stats.pengaduan_baru > 0 ? 'Urgent' : 'Aman'}
                    />
                </div>

                {/* ── Chart + Activity ────────────────────────────────────── */}
                <div className="grid gap-4 xl:grid-cols-5">

                    {/* Chart — 3/5 */}
                    <div className="rounded-2xl border bg-card shadow-sm xl:col-span-3">
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-teal-600" />
                                <h3 className="font-semibold text-foreground">Tren Pengajuan Mingguan</h3>
                            </div>
                            <span className="rounded-xl bg-teal-600 px-3 py-1 text-xs font-semibold text-white">
                                7 Hari Terakhir
                            </span>
                        </div>
                        <div className="p-6">
                            <BarChart data={chart_mingguan} />
                        </div>
                    </div>

                    {/* Activity feed — 2/5 */}
                    <div className="rounded-2xl border bg-card shadow-sm xl:col-span-2">
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <h3 className="font-semibold text-foreground">Log Aktivitas Terbaru</h3>
                            <button
                                type="button"
                                onClick={() => router.visit('/admin/audit-log')}
                                className="text-xs font-semibold text-teal-700 hover:underline dark:text-teal-400"
                            >
                                Lihat Semua Log
                            </button>
                        </div>
                        <div className="p-6">
                            <ActivityFeed logs={recent_logs} />
                        </div>
                    </div>
                </div>

                {/* ── Recent Pengajuan Table ──────────────────────────────── */}
                <div className="rounded-2xl border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b px-6 py-4">
                        <h3 className="font-semibold text-foreground">Daftar Permohonan Terbaru</h3>
                        <button
                            type="button"
                            onClick={() => router.visit('/admin/pengajuan')}
                            className="text-xs font-semibold text-teal-700 hover:underline dark:text-teal-400"
                        >
                            Lihat Semua →
                        </button>
                    </div>
                    <div className="p-6">
                        {recent_pengajuan.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">Belum ada pengajuan.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pemohon</th>
                                            <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Jenis Surat</th>
                                            <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tanggal</th>
                                            <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                                            <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recent_pengajuan.map(item => (
                                            <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                                {/* Pemohon */}
                                                <td className="py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${avatarColor(item.user?.name ?? 'A')}`}>
                                                            {getInitials(item.user?.name ?? '?')}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-foreground leading-tight">
                                                                {item.user?.name ?? '—'}
                                                            </p>
                                                            {item.user?.nik && (
                                                                <p className="text-xs text-muted-foreground font-mono leading-tight">
                                                                    NIK: {item.user.nik}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Jenis Surat */}
                                                <td className="py-3 text-muted-foreground">
                                                    {item.master_surat?.nama_surat ?? '—'}
                                                </td>
                                                {/* Tanggal */}
                                                <td className="py-3 text-muted-foreground whitespace-nowrap">
                                                    {new Date(item.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric', month: 'long', year: 'numeric',
                                                    })}
                                                </td>
                                                {/* Status */}
                                                <td className="py-3">
                                                    <span className={`inline-flex rounded-md px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${STATUS_CLS[item.status] ?? 'bg-muted text-muted-foreground'}`}>
                                                        {STATUS_LABEL[item.status] ?? item.status}
                                                    </span>
                                                </td>
                                                {/* Aksi */}
                                                <td className="py-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => router.visit(`/admin/pengajuan/${item.id}`)}
                                                        className="flex h-8 w-8 items-center justify-center rounded-xl border bg-muted/40 text-muted-foreground transition hover:border-teal-500 hover:bg-teal-50 hover:text-teal-600"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="mt-4 text-center">
                                    <button
                                        type="button"
                                        onClick={() => router.visit('/admin/pengajuan')}
                                        className="text-sm font-semibold text-teal-700 hover:underline dark:text-teal-400"
                                    >
                                        Tampilkan semua permohonan →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
