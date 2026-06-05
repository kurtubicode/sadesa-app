import { Head, Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    CheckCircle,
    Download,
    FileBadge,
    MessageCircle,
    TrendingUp,
    Users,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
    menunggu_pengesahan: number;
    disahkan_bulan_ini: number;
    pengaduan_selesai_bulan_ini: number;
    total_warga: number;
    selesai_bulan_ini: number;
    ditolak_bulan_ini: number;
}

interface PengajuanItem {
    id: number;
    no_pengajuan: string;
    status: string;
    created_at: string;
    user?: { id: number; name: string } | null;
    master_surat?: { id: number; nama_surat: string } | null;
}

interface ChartPoint {
    label: string;
    jumlah: number;
}

interface Ringkasan {
    jenis_terbanyak: string;
    tingkat_penyelesaian: number;
    total_bulan_ini: number;
}

interface Props {
    stats: Stats;
    menunggu_pengesahan_list: PengajuanItem[];
    chart_jenis_surat: ChartPoint[];
    ringkasan: Ringkasan;
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

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

function StatCard({ title, value, sub, icon, tone = 'teal' }: {
    title: string; value: number; sub: string;
    icon: React.ReactNode; tone?: StatTone;
}) {
    return (
        <div className="rounded-xl border bg-card p-[18px] shadow-sm">
            <div className="mb-3 flex items-start justify-between">
                <div className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-lg ${TILE_CLS[tone]}`}>
                    {icon}
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE_CLS[tone]}`}>
                    {sub}
                </span>
            </div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-1 text-[28px] font-bold leading-none tabular-nums text-foreground">
                {value.toLocaleString('id-ID')}
            </p>
        </div>
    );
}

// ─── MiniBar Chart ────────────────────────────────────────────────────────────

function MiniBarChart({ data }: { data: ChartPoint[] }) {
    const max = Math.max(...data.map(d => d.jumlah), 1);
    return (
        <div className="flex items-end gap-2" style={{ height: 120 }}>
            {data.map((d, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-xs font-bold text-foreground">{d.jumlah > 0 ? d.jumlah : ''}</span>
                    <div className="relative w-full flex items-end" style={{ height: 80 }}>
                        <div
                            className="w-full rounded-t-lg bg-teal-600 transition-all hover:bg-teal-500"
                            style={{ height: `${Math.max((d.jumlah / max) * 100, d.jumlah > 0 ? 8 : 0)}%` }}
                        />
                    </div>
                    <span className="w-full truncate text-center text-[10px] text-muted-foreground"
                        title={d.label}>
                        {d.label.split(' ').slice(-1)[0]}
                    </span>
                </div>
            ))}
        </div>
    );
}

// ─── Breadcrumbs ──────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: dashboard() }];

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardKepalaDesa({ stats, menunggu_pengesahan_list, chart_jenis_surat, ringkasan }: Props) {
    const { auth } = usePage<{ auth: { user: { name: string } } }>().props;
    const bulanIni = new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    const today    = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Kepala Desa | SADESA" />

            <div className="flex flex-col gap-6 p-4">

                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-black text-foreground">
                            Selamat Datang, {auth.user.name}
                        </h1>
                        <p className="mt-0.5 text-sm text-muted-foreground capitalize">
                            Ringkasan kinerja pelayanan — {today}
                        </p>
                    </div>
                    <a href="/kepala-desa/pengajuan"
                        className="flex items-center gap-2 rounded-xl border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm hover:bg-muted">
                        <Download className="h-4 w-4" /> Cetak Laporan
                    </a>
                </div>

                {/* ── Stat Cards ─────────────────────────────────────────── */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        icon={<FileBadge className="h-[21px] w-[21px]" />}
                        title="Menunggu Pengesahan"
                        value={stats.menunggu_pengesahan}
                        sub={stats.menunggu_pengesahan > 0 ? 'Perlu Tindakan' : 'Semua Selesai'}
                        tone="danger"
                    />
                    <StatCard
                        icon={<CheckCircle className="h-[21px] w-[21px]" />}
                        title={`Disahkan — ${new Date().toLocaleString('id-ID', { month: 'short' })}`}
                        value={stats.disahkan_bulan_ini}
                        sub="Bulan ini"
                        tone="teal"
                    />
                    <StatCard
                        icon={<MessageCircle className="h-[21px] w-[21px]" />}
                        title="Pengaduan Selesai"
                        value={stats.pengaduan_selesai_bulan_ini}
                        sub="Bulan ini"
                        tone="info"
                    />
                    <StatCard
                        icon={<Users className="h-[21px] w-[21px]" />}
                        title="Total Warga Terdaftar"
                        value={stats.total_warga}
                        sub="Akun aktif"
                        tone="teal"
                    />
                </div>

                {/* ── Alert: ada yang menunggu ────────────────────────────── */}
                {stats.menunggu_pengesahan > 0 && (
                    <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/10">
                        <FileBadge className="h-5 w-5 shrink-0 text-red-600" />
                        <p className="text-sm text-red-700 dark:text-red-400">
                            Ada <strong>{stats.menunggu_pengesahan}</strong> pengajuan surat yang menunggu pengesahan Bapak/Ibu.
                        </p>
                        <Link href="/kepala-desa/pengajuan"
                            className="ml-auto shrink-0 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700">
                            Tinjau Sekarang →
                        </Link>
                    </div>
                )}

                {/* ── Tabel pengajuan siap disahkan ──────────────────────── */}
                <div className="rounded-2xl border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b px-6 py-4">
                        <h3 className="font-semibold text-foreground">Pengajuan Siap Disahkan</h3>
                        <Link href="/kepala-desa/pengajuan"
                            className="text-xs font-semibold text-teal-700 hover:underline dark:text-teal-400">
                            Lihat semua →
                        </Link>
                    </div>
                    <div className="p-4">
                        {menunggu_pengesahan_list.length === 0 ? (
                            <div className="py-10 text-center">
                                <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-400" />
                                <p className="text-sm font-medium text-foreground">Tidak ada yang menunggu</p>
                                <p className="text-xs text-muted-foreground">Semua pengajuan sudah ditangani</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            <th className="pb-3 pr-4">Pemohon</th>
                                            <th className="pb-3 pr-4">Jenis Surat</th>
                                            <th className="pb-3 pr-4">Tanggal Masuk</th>
                                            <th className="pb-3">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {menunggu_pengesahan_list.map(item => (
                                            <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                                <td className="py-3 pr-4 font-semibold text-foreground">
                                                    {item.user?.name ?? '—'}
                                                </td>
                                                <td className="py-3 pr-4 text-muted-foreground">
                                                    {item.master_surat?.nama_surat ?? '—'}
                                                </td>
                                                <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">
                                                    {new Date(item.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric', month: 'short', year: 'numeric',
                                                    })}
                                                </td>
                                                <td className="py-3">
                                                    <Link href={`/kepala-desa/pengajuan/${item.id}`}
                                                        className="rounded-xl bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700">
                                                        Tinjau & Sahkan
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Chart + Ringkasan ──────────────────────────────────── */}
                <div className="grid gap-4 xl:grid-cols-5">

                    {/* Bar chart — 3/5 */}
                    <div className="rounded-2xl border bg-card shadow-sm xl:col-span-3">
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-teal-600" />
                                <h3 className="font-semibold text-foreground">Statistik Layanan</h3>
                            </div>
                            <span className="rounded-xl bg-teal-600 px-3 py-1 text-xs font-semibold text-white">
                                {bulanIni}
                            </span>
                        </div>
                        <div className="px-6 pb-6 pt-4">
                            {chart_jenis_surat.length === 0 || chart_jenis_surat.every(d => d.jumlah === 0) ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">Belum ada data bulan ini.</p>
                            ) : (
                                <MiniBarChart data={chart_jenis_surat} />
                            )}
                            <p className="mt-3 text-center text-xs text-muted-foreground">Top 5 jenis surat terbanyak diajukan</p>
                        </div>
                    </div>

                    {/* Ringkasan cepat — 2/5 */}
                    <div className="rounded-2xl border bg-card shadow-sm xl:col-span-2">
                        <div className="border-b px-6 py-4">
                            <h3 className="flex items-center gap-2 font-semibold text-foreground">
                                <TrendingUp className="h-4 w-4 text-teal-600" />
                                Ringkasan Cepat
                            </h3>
                        </div>
                        <div className="space-y-5 p-6">

                            {/* Jenis terbanyak */}
                            <div>
                                <p className="mb-1 text-xs font-medium text-muted-foreground">Jenis Surat Terbanyak</p>
                                <p className="text-sm font-semibold text-foreground">{ringkasan.jenis_terbanyak}</p>
                            </div>

                            {/* Tingkat penyelesaian */}
                            <div>
                                <div className="mb-1.5 flex items-center justify-between">
                                    <p className="text-xs font-medium text-muted-foreground">Tingkat Penyelesaian</p>
                                    <p className="text-xs font-bold text-teal-600">{ringkasan.tingkat_penyelesaian}%</p>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-teal-600 transition-all"
                                        style={{ width: `${ringkasan.tingkat_penyelesaian}%` }}
                                    />
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {stats.selesai_bulan_ini} selesai dari {ringkasan.total_bulan_ini} pengajuan bulan ini
                                </p>
                            </div>

                            {/* Ditolak */}
                            <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
                                <p className="text-xs text-muted-foreground">Ditolak bulan ini</p>
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                    stats.ditolak_bulan_ini > 0
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-green-100 text-green-700'
                                }`}>
                                    {stats.ditolak_bulan_ini}
                                </span>
                            </div>

                            {/* Cetak laporan */}
                            <Link href="/kepala-desa/pengajuan"
                                className="flex w-full items-center justify-center gap-2 rounded-xl border border-teal-200 py-2.5 text-sm font-semibold text-teal-700 hover:bg-teal-50 dark:border-teal-800/40 dark:text-teal-400">
                                <Download className="h-4 w-4" />
                                Cetak Laporan Bulanan
                            </Link>
                        </div>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
