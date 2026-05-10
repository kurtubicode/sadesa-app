import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle,
    Clock,
    FileText,
    XCircle,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
    total_pengajuan: number;
    menunggu_pengesahan: number;
    disetujui_bulan_ini: number;
    ditolak_bulan_ini: number;
    selesai_bulan_ini: number;
}

interface PengajuanItem {
    id: number;
    no_pengajuan: string;
    status: string;
    created_at: string;
    user?: { id: number; name: string } | null;
    master_surat?: { id: number; nama: string } | null;
}

interface Props {
    stats: Stats;
    recent_pengajuan: PengajuanItem[];
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, string> = {
    menunggu_pengesahan: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    disetujui:           'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400',
    ditolak_kepala:      'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
    selesai:             'bg-teal-100   text-teal-700   dark:bg-teal-900/30   dark:text-teal-400',
};

const STATUS_LABEL: Record<string, string> = {
    menunggu_pengesahan: 'Menunggu Pengesahan',
    disetujui:           'Disetujui',
    ditolak_kepala:      'Ditolak',
    selesai:             'Selesai',
};

function StatusBadge({ status }: { status: string }) {
    const cls = STATUS_STYLE[status] ?? 'bg-muted text-muted-foreground';
    const label = STATUS_LABEL[status] ?? status;
    return (
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${cls}`}>
            {label}
        </span>
    );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
    title, value, subtitle, icon, color = 'teal',
}: {
    title: string; value: string | number; subtitle?: string;
    icon: React.ReactNode; color?: 'teal' | 'blue' | 'green' | 'amber' | 'red';
}) {
    const iconBg = {
        teal:  'bg-teal-100  text-teal-600  dark:bg-teal-900/20  dark:text-teal-400',
        blue:  'bg-blue-100  text-blue-600  dark:bg-blue-900/20  dark:text-blue-400',
        green: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
        amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
        red:   'bg-red-100   text-red-600   dark:bg-red-900/20   dark:text-red-400',
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

// ─── Main ─────────────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: dashboard() }];

export default function DashboardKepalaDesa({ stats, recent_pengajuan }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Kepala Desa | SADESA" />

            <div className="flex flex-col gap-6 p-4">

                {/* Header */}
                <div>
                    <h1 className="text-xl font-bold text-foreground">Dashboard Kepala Desa</h1>
                    <p className="text-muted-foreground">Selamat datang di Portal Admin Desa Cirangkong</p>
                </div>

                {/* Statistik Utama */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total Pengajuan"
                        value={stats.total_pengajuan}
                        subtitle="Semua pengajuan"
                        icon={<FileText className="h-7 w-7" />}
                        color="teal"
                    />
                    <StatCard
                        title="Menunggu Pengesahan"
                        value={stats.menunggu_pengesahan}
                        subtitle="Perlu tindakan"
                        icon={<Clock className="h-7 w-7" />}
                        color="amber"
                    />
                    <StatCard
                        title="Disetujui Bulan Ini"
                        value={stats.disetujui_bulan_ini}
                        subtitle={`Bulan ${new Date().toLocaleString('id-ID', { month: 'long' })}`}
                        icon={<CheckCircle className="h-7 w-7" />}
                        color="green"
                    />
                    <StatCard
                        title="Ditolak Bulan Ini"
                        value={stats.ditolak_bulan_ini}
                        subtitle={`Bulan ${new Date().toLocaleString('id-ID', { month: 'long' })}`}
                        icon={<XCircle className="h-7 w-7" />}
                        color="red"
                    />
                </div>

                {/* Alert: ada yang menunggu */}
                {stats.menunggu_pengesahan > 0 && (
                    <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-900/10">
                        <Clock className="h-5 w-5 shrink-0 text-amber-600" />
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                            Ada <strong>{stats.menunggu_pengesahan}</strong> pengajuan surat yang menunggu pengesahan Anda.
                        </p>
                        <Link
                            href="/kepala-desa/pengajuan"
                            className="ml-auto shrink-0 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
                        >
                            Tinjau Sekarang
                        </Link>
                    </div>
                )}

                {/* Tabel aktivitas terbaru */}
                <div className="rounded-xl border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b px-6 py-4">
                        <h3 className="font-semibold text-foreground">Pengajuan Terbaru</h3>
                        <Link
                            href="/kepala-desa/pengajuan"
                            className="text-sm font-medium text-teal-600 hover:underline"
                        >
                            Lihat semua →
                        </Link>
                    </div>
                    <div className="p-6">
                        {recent_pengajuan.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">Belum ada pengajuan.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="pb-3 font-medium text-muted-foreground">No. Pengajuan</th>
                                            <th className="pb-3 font-medium text-muted-foreground">Pemohon</th>
                                            <th className="pb-3 font-medium text-muted-foreground">Jenis Surat</th>
                                            <th className="pb-3 font-medium text-muted-foreground">Status</th>
                                            <th className="pb-3 font-medium text-muted-foreground">Tanggal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recent_pengajuan.map((item) => (
                                            <tr key={item.id} className="border-b last:border-0">
                                                <td className="py-3 font-mono text-xs text-muted-foreground">{item.no_pengajuan}</td>
                                                <td className="py-3 font-medium text-foreground">{item.user?.name ?? '—'}</td>
                                                <td className="py-3 text-muted-foreground">{item.master_surat?.nama ?? '—'}</td>
                                                <td className="py-3"><StatusBadge status={item.status} /></td>
                                                <td className="py-3 text-muted-foreground">
                                                    {new Date(item.created_at).toLocaleDateString('id-ID')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
