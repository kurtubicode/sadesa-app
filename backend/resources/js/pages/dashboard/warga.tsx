import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, BookOpen, FileText, Megaphone } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

interface Stats {
    total_pengajuan: number;
    total_pengaduan: number;
}

interface PengajuanItem {
    id: number;
    no_pengajuan: string;
    status: string;
    created_at: string;
    master_surat?: { id: number; nama: string; kode: string } | null;
}

interface PengaduanItem {
    id: number;
    judul: string;
    status: string;
    created_at: string;
}

interface InformasiItem {
    id: number;
    judul: string;
    slug: string;
    tipe: string;
    created_at: string;
}

interface Props {
    profil_lengkap: boolean;
    stats: Stats;
    recent_pengajuan: PengajuanItem[];
    recent_pengaduan: PengaduanItem[];
    recent_informasi: InformasiItem[];
}

const PENGAJUAN_STATUS_COLOR: Record<string, string> = {
    menunggu:            'bg-amber-100  text-amber-700  dark:bg-amber-900/30  dark:text-amber-400',
    diproses:            'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400',
    diverifikasi:        'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    ditolak_staff:       'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
    menunggu_pengesahan: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    disetujui:           'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    ditolak_kepala:      'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400',
    siap_diambil:        'bg-teal-100   text-teal-700   dark:bg-teal-900/30   dark:text-teal-400',
    selesai:             'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400',
    dibatalkan:          'bg-gray-100   text-gray-600   dark:bg-gray-800/50   dark:text-gray-400',
};
const PENGAJUAN_STATUS_LABEL: Record<string, string> = {
    menunggu:            'Menunggu',
    diproses:            'Diproses',
    diverifikasi:        'Diverifikasi',
    ditolak_staff:       'Ditolak Petugas',
    menunggu_pengesahan: 'Menunggu Pengesahan',
    disetujui:           'Disetujui',
    ditolak_kepala:      'Ditolak',
    siap_diambil:        'Siap Diambil!',
    selesai:             'Selesai',
    dibatalkan:          'Dibatalkan',
};

const PENGADUAN_STATUS_COLOR: Record<string, string> = {
    menunggu: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    diproses: 'bg-blue-100  text-blue-700  dark:bg-blue-900/30  dark:text-blue-400',
    selesai:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    ditolak:  'bg-red-100   text-red-700   dark:bg-red-900/30   dark:text-red-400',
};
const PENGADUAN_STATUS_LABEL: Record<string, string> = {
    menunggu: 'Menunggu', diproses: 'Diproses', selesai: 'Selesai', ditolak: 'Ditolak',
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: dashboard() }];

function StatCard({ label, value, icon, color = 'teal' }: {
    label: string; value: number;
    icon: React.ReactNode; color?: 'teal' | 'blue' | 'green' | 'amber' | 'purple';
}) {
    const iconBg: Record<string, string> = {
        teal:   'bg-teal-600    text-white',
        blue:   'bg-blue-600    text-white',
        green:  'bg-emerald-600 text-white',
        amber:  'bg-amber-500   text-white',
        purple: 'bg-purple-600  text-white',
    };

    return (
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="mb-1 text-sm font-medium text-muted-foreground">{label}</p>
                    <p className="text-3xl font-bold text-foreground">{value}</p>
                </div>
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm ${iconBg[color]}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default function DashboardWarga({ profil_lengkap, stats, recent_pengajuan, recent_pengaduan, recent_informasi }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard | SADESA" />

            <div className="flex flex-col gap-6 p-4">
                {/* Header */}
                <div>
                    <h1 className="text-xl font-bold text-foreground">Selamat Datang</h1>
                    <p className="text-sm text-muted-foreground">Portal Layanan Desa</p>
                </div>

                {/* Banner: data diri belum lengkap */}
                {!profil_lengkap && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/40 dark:bg-amber-900/20">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                                Data kependudukan belum dilengkapi
                            </p>
                            <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
                                Pengajuan surat tidak dapat diproses sebelum data diri diisi dengan lengkap.
                            </p>
                        </div>
                        <Link
                            href="/warga/data-diri"
                            className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
                        >
                            Lengkapi →
                        </Link>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <StatCard
                        label="Total Pengajuan Surat"
                        value={stats.total_pengajuan}
                        icon={<FileText className="h-6 w-6" />}
                        color="teal"
                    />
                    <StatCard
                        label="Total Pengaduan"
                        value={stats.total_pengaduan}
                        icon={<Megaphone className="h-6 w-6" />}
                        color="blue"
                    />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Pengajuan terbaru */}
                    <div className="rounded-2xl border bg-card shadow-sm">
                        <div className="flex items-center justify-between border-b px-5 py-4">
                            <h3 className="font-semibold text-foreground">Pengajuan Surat Terbaru</h3>
                        </div>
                        <div className="p-5">
                            {recent_pengajuan.length === 0 ? (
                                <p className="py-4 text-center text-sm text-muted-foreground">
                                    Belum ada pengajuan.
                                </p>
                            ) : (
                                <ul className="space-y-3">
                                    {recent_pengajuan.map(item => (
                                        <li key={item.id} className="flex items-center justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-foreground">
                                                    {item.master_surat?.nama ?? '—'}
                                                </p>
                                                <p className="font-mono text-xs text-muted-foreground">
                                                    {item.no_pengajuan}
                                                </p>
                                            </div>
                                            <span className={`shrink-0 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PENGAJUAN_STATUS_COLOR[item.status] ?? 'bg-muted text-muted-foreground'}`}>
                                                {PENGAJUAN_STATUS_LABEL[item.status] ?? item.status}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Pengaduan terbaru */}
                    <div className="rounded-2xl border bg-card shadow-sm">
                        <div className="flex items-center justify-between border-b px-5 py-4">
                            <h3 className="font-semibold text-foreground">Pengaduan Terbaru</h3>
                        </div>
                        <div className="p-5">
                            {recent_pengaduan.length === 0 ? (
                                <p className="py-4 text-center text-sm text-muted-foreground">
                                    Belum ada pengaduan.
                                </p>
                            ) : (
                                <ul className="space-y-3">
                                    {recent_pengaduan.map(item => (
                                        <li key={item.id} className="flex items-center justify-between gap-3">
                                            <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                                                {item.judul}
                                            </p>
                                            <span className={`shrink-0 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${PENGADUAN_STATUS_COLOR[item.status] ?? 'bg-muted text-muted-foreground'}`}>
                                                {PENGADUAN_STATUS_LABEL[item.status] ?? item.status}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* Informasi terbaru */}
                {recent_informasi.length > 0 && (
                    <div className="rounded-2xl border bg-card shadow-sm">
                        <div className="flex items-center justify-between border-b px-5 py-4">
                            <h3 className="flex items-center gap-2 font-semibold text-foreground">
                                <BookOpen className="h-4 w-4" /> Informasi Desa Terbaru
                            </h3>
                            <Link href="/informasi" className="text-sm font-semibold text-teal-700 hover:underline dark:text-teal-400">
                                Lihat semua →
                            </Link>
                        </div>
                        <div className="divide-y">
                            {recent_informasi.map(item => (
                                <Link
                                    key={item.id}
                                    href={`/informasi/${item.slug}`}
                                    className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-muted/40"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-foreground">{item.judul}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(item.created_at).toLocaleDateString('id-ID')}
                                        </p>
                                    </div>
                                    <span className={`shrink-0 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${item.tipe === 'berita' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {item.tipe === 'berita' ? '📰 Berita' : '📢 Pengumuman'}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
