import { Head, Link } from '@inertiajs/react';
import {
    BadgeCheck,
    Clock,
    FileText,
    Megaphone,
    PackageCheck,
    Printer,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
    menunggu_verifikasi: number;
    siap_cetak: number;
    siap_diambil: number;
    pengaduan_baru: number;
}

interface AntrianItem {
    id: number;
    no_pengajuan: string;
    status: string;
    created_at: string;
    user?: { id: number; name: string } | null;
    master_surat?: { id: number; nama: string; kode: string } | null;
}

interface Props {
    stats: Stats;
    antrian: AntrianItem[];
}

// ─── StatCard — sama persis dengan admin dashboard ────────────────────────────

function StatCard({
    title, value, subtitle, icon, color = 'teal',
}: {
    title: string; value: string | number; subtitle?: string;
    icon: React.ReactNode; color?: 'teal' | 'blue' | 'amber' | 'green' | 'red' | 'purple';
}) {
    const iconBg: Record<string, string> = {
        teal:   'bg-teal-600    text-white',
        blue:   'bg-blue-600    text-white',
        amber:  'bg-amber-500   text-white',
        green:  'bg-emerald-600 text-white',
        red:    'bg-red-500     text-white',
        purple: 'bg-purple-600  text-white',
    };

    return (
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="mb-1 text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="mb-1 text-2xl font-bold text-foreground">{value}</h3>
                    {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                </div>
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm ${iconBg[color]}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
    menunggu:     'Menunggu',
    disetujui:    'Siap Cetak',
    siap_diambil: 'Siap Diambil',
};
const STATUS_COLOR: Record<string, string> = {
    menunggu:     'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400',
    disetujui:    'bg-teal-100   text-teal-700   dark:bg-teal-900/30   dark:text-teal-400',
    siap_diambil: 'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400',
};

const ACTION_LABEL: Record<string, string> = {
    menunggu:     'Proses',
    disetujui:    'Cetak',
    siap_diambil: 'Detail',
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: dashboard() }];

export default function DashboardStaff({ stats, antrian }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Staff | SADESA" />

            <div className="flex flex-col gap-6 p-4">

                {/* Header */}
                <div>
                    <h1 className="text-xl font-bold text-foreground">Dashboard Staff</h1>
                    <p className="text-muted-foreground">Kelola antrian pengajuan surat hari ini</p>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Menunggu Verifikasi"
                        value={stats.menunggu_verifikasi}
                        subtitle="Perlu diperiksa"
                        icon={<Clock className="h-7 w-7" />}
                        color="amber"
                    />
                    <StatCard
                        title="Siap Dicetak"
                        value={stats.siap_cetak}
                        subtitle="Sudah disahkan kades"
                        icon={<Printer className="h-7 w-7" />}
                        color="teal"
                    />
                    <StatCard
                        title="Siap Diambil Warga"
                        value={stats.siap_diambil}
                        subtitle="Menunggu warga datang"
                        icon={<PackageCheck className="h-7 w-7" />}
                        color="green"
                    />
                    <StatCard
                        title="Pengaduan Baru"
                        value={stats.pengaduan_baru}
                        subtitle="Belum ditindaklanjuti"
                        icon={<Megaphone className="h-7 w-7" />}
                        color="purple"
                    />
                </div>

                {/* Alert — ada pengaduan */}
                {stats.pengaduan_baru > 0 && (
                    <div className="flex items-center gap-3 rounded-2xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-900/50 dark:bg-purple-900/10">
                        <Megaphone className="h-5 w-5 shrink-0 text-purple-600 dark:text-purple-400" />
                        <p className="text-sm text-purple-700 dark:text-purple-400">
                            Ada <strong>{stats.pengaduan_baru}</strong> pengaduan warga yang belum ditindaklanjuti.
                        </p>
                        <Link
                            href="/staff/pengaduan"
                            className="ml-auto shrink-0 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700"
                        >
                            Tinjau →
                        </Link>
                    </div>
                )}

                {/* Alert — ada yang siap cetak */}
                {stats.siap_cetak > 0 && (
                    <div className="flex items-center gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-900/50 dark:bg-teal-900/10">
                        <Printer className="h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400" />
                        <p className="text-sm text-teal-700 dark:text-teal-400">
                            Ada <strong>{stats.siap_cetak}</strong> surat yang sudah disahkan dan perlu dicetak.
                        </p>
                        <Link
                            href="/staff/pengajuan?status=disetujui"
                            className="ml-auto shrink-0 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700"
                        >
                            Cetak Sekarang →
                        </Link>
                    </div>
                )}

                {/* Tabel antrian prioritas */}
                <div className="rounded-2xl border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b px-6 py-4">
                        <h3 className="font-semibold text-foreground">Antrian Prioritas</h3>
                        <Link
                            href="/staff/pengajuan"
                            className="text-sm font-semibold text-teal-700 hover:underline dark:text-teal-400"
                        >
                            Lihat semua →
                        </Link>
                    </div>
                    <div className="p-6">
                        {antrian.length === 0 ? (
                            <div className="py-12 text-center">
                                <BadgeCheck className="mx-auto mb-3 h-10 w-10 text-green-400" />
                                <p className="font-medium text-foreground">Antrian kosong!</p>
                                <p className="text-sm text-muted-foreground">Semua pengajuan sudah ditangani.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="pb-3 font-medium text-muted-foreground">No. Pengajuan</th>
                                            <th className="pb-3 font-medium text-muted-foreground">Pemohon</th>
                                            <th className="pb-3 font-medium text-muted-foreground">Jenis Surat</th>
                                            <th className="pb-3 font-medium text-muted-foreground">Status</th>
                                            <th className="pb-3 font-medium text-muted-foreground">Waktu Masuk</th>
                                            <th className="pb-3 font-medium text-muted-foreground">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {antrian.map((item) => (
                                            <tr key={item.id} className="border-b last:border-0">
                                                <td className="py-3 font-mono text-xs text-muted-foreground">
                                                    {item.no_pengajuan}
                                                </td>
                                                <td className="py-3 font-medium text-foreground">
                                                    {item.user?.name ?? '—'}
                                                </td>
                                                <td className="py-3 text-muted-foreground">
                                                    <span className="mr-1.5 rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
                                                        {item.master_surat?.kode}
                                                    </span>
                                                    {item.master_surat?.nama}
                                                </td>
                                                <td className="py-3">
                                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[item.status] ?? 'bg-muted text-muted-foreground'}`}>
                                                        {STATUS_LABEL[item.status] ?? item.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-muted-foreground">
                                                    {new Date(item.created_at).toLocaleString('id-ID', {
                                                        dateStyle: 'short', timeStyle: 'short',
                                                    })}
                                                </td>
                                                <td className="py-3">
                                                    <Link
                                                        href={`/staff/pengajuan/${item.id}`}
                                                        className="rounded-xl bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700"
                                                    >
                                                        {ACTION_LABEL[item.status] ?? 'Lihat'}
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

            </div>
        </AppLayout>
    );
}
