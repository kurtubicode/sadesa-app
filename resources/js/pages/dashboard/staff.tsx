import { Head, Link, usePage } from '@inertiajs/react';
import {
    BadgeCheck,
    BookOpen,
    Clock,
    FileCheck,
    Megaphone,
    PackageCheck,
    Printer,
} from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
    menunggu_verifikasi: number;
    siap_cetak: number;
    siap_diambil: number;
    pengaduan_baru: number;
    selesai_hari_ini: number;
}

interface AntrianItem {
    id: number;
    no_pengajuan: string;
    status: string;
    created_at: string;
    user?: { id: number; name: string } | null;
    master_surat?: { id: number; nama: string; kode: string } | null;
}

interface PengaduanItem {
    id: number;
    judul: string;
    status: string;
    created_at: string;
    kategori_aduan_id?: number | null;
}

interface BukuTamuItem {
    id: number;
    nama_pengunjung: string;
    keperluan: string | null;
    instansi: string | null;
    created_at: string;
}

interface Props {
    stats: Stats;
    antrian: AntrianItem[];
    recent_pengaduan: PengaduanItem[];
    buku_tamu_hari_ini: BukuTamuItem[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

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
    menunggu:     'Verifikasi',
    disetujui:    'Cetak',
    siap_diambil: 'Detail',
};

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
    title: string; value: number | string; sub: string;
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
                {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
            </p>
        </div>
    );
}

// ─── Breadcrumbs ──────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: dashboard() }];

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardStaff({ stats, antrian, recent_pengaduan, buku_tamu_hari_ini }: Props) {
    const { auth } = usePage<{ auth: { user: { name: string } } }>().props;
    const today = new Date().toLocaleDateString('id-ID', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });

    // Filter tab antrian
    const [tab, setTab] = useState<'semua' | 'menunggu' | 'diproses'>('semua');
    const filteredAntrian = antrian.filter(item => {
        if (tab === 'menunggu')  return item.status === 'menunggu';
        if (tab === 'diproses')  return item.status === 'disetujui' || item.status === 'siap_diambil';
        return true;
    });

    const tabs: { key: typeof tab; label: string }[] = [
        { key: 'semua',    label: 'Semua' },
        { key: 'menunggu', label: 'Menunggu' },
        { key: 'diproses', label: 'Diproses' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Staff | SADESA" />

            <div className="flex flex-col gap-6 p-4">

                {/* ── Header ─────────────────────────────────────────────── */}
                <div>
                    <h1 className="text-xl font-black text-foreground">
                        Selamat Datang, {auth.user.name.split(' ')[0]}
                    </h1>
                    <p className="mt-0.5 text-sm text-muted-foreground capitalize">
                        Tugas hari ini — {today}
                    </p>
                </div>

                {/* ── Stat Cards ─────────────────────────────────────────── */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <StatCard
                        icon={<Clock className="h-[21px] w-[21px]" />}
                        title="Pengajuan Menunggu"
                        value={stats.menunggu_verifikasi}
                        sub="Perlu Diproses"
                        tone="warn"
                    />
                    <StatCard
                        icon={<Megaphone className="h-[21px] w-[21px]" />}
                        title="Pengaduan Baru"
                        value={stats.pengaduan_baru}
                        sub="Belum Direspons"
                        tone="danger"
                    />
                    <StatCard
                        icon={<PackageCheck className="h-[21px] w-[21px]" />}
                        title="Surat Selesai Hari Ini"
                        value={stats.selesai_hari_ini}
                        sub={`+${stats.siap_diambil} siap ambil`}
                        tone="teal"
                    />
                </div>

                {/* ── Alert banners ──────────────────────────────────────── */}
                {stats.siap_cetak > 0 && (
                    <div className="flex items-center gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-900/50 dark:bg-teal-900/10">
                        <Printer className="h-5 w-5 shrink-0 text-teal-600 dark:text-teal-400" />
                        <p className="text-sm text-teal-700 dark:text-teal-400">
                            <strong>{stats.siap_cetak}</strong> surat sudah disahkan dan perlu dicetak.
                        </p>
                        <Link href="/staff/pengajuan?status=disetujui"
                            className="ml-auto shrink-0 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700">
                            Cetak Sekarang →
                        </Link>
                    </div>
                )}
                {stats.pengaduan_baru > 0 && (
                    <div className="flex items-center gap-3 rounded-2xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-900/50 dark:bg-purple-900/10">
                        <Megaphone className="h-5 w-5 shrink-0 text-purple-600 dark:text-purple-400" />
                        <p className="text-sm text-purple-700 dark:text-purple-400">
                            Ada <strong>{stats.pengaduan_baru}</strong> pengaduan warga yang belum ditindaklanjuti.
                        </p>
                        <Link href="/staff/pengaduan"
                            className="ml-auto shrink-0 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700">
                            Tinjau →
                        </Link>
                    </div>
                )}

                {/* ── 2-column: Antrian + Pengaduan ──────────────────────── */}
                <div className="grid gap-4 xl:grid-cols-5">

                    {/* Antrian pengajuan — 3/5 */}
                    <div className="rounded-2xl border bg-card shadow-sm xl:col-span-3">
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <h3 className="flex items-center gap-2 font-semibold text-foreground">
                                <FileCheck className="h-4 w-4 text-teal-600" />
                                Antrian Pengajuan Surat
                            </h3>
                            <Link href="/staff/pengajuan"
                                className="text-xs font-semibold text-teal-700 hover:underline dark:text-teal-400">
                                Lihat semua →
                            </Link>
                        </div>

                        {/* Filter tabs */}
                        <div className="flex gap-1 border-b px-6 pt-3 pb-0">
                            {tabs.map(t => (
                                <button key={t.key} type="button"
                                    onClick={() => setTab(t.key)}
                                    className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition-colors
                                        ${tab === t.key
                                            ? 'border-b-2 border-teal-600 text-teal-700 dark:text-teal-400'
                                            : 'text-muted-foreground hover:text-foreground'
                                        }`}>
                                    {t.label}
                                    {t.key === 'semua'    && <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-xs">{antrian.length}</span>}
                                    {t.key === 'menunggu' && <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700">{antrian.filter(a => a.status === 'menunggu').length}</span>}
                                    {t.key === 'diproses' && <span className="ml-1.5 rounded-full bg-teal-100 px-1.5 py-0.5 text-xs text-teal-700">{antrian.filter(a => a.status !== 'menunggu').length}</span>}
                                </button>
                            ))}
                        </div>

                        <div className="p-4">
                            {filteredAntrian.length === 0 ? (
                                <div className="py-10 text-center">
                                    <BadgeCheck className="mx-auto mb-2 h-8 w-8 text-green-400" />
                                    <p className="text-sm font-medium text-foreground">Antrian kosong</p>
                                    <p className="text-xs text-muted-foreground">Semua sudah ditangani</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {filteredAntrian.map(item => (
                                        <div key={item.id} className="flex items-center gap-3 py-3">
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-foreground">
                                                    {item.user?.name ?? '—'}
                                                </p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    <span className="mr-1 rounded bg-muted px-1 font-mono text-[10px]">{item.master_surat?.kode}</span>
                                                    {item.master_surat?.nama}
                                                </p>
                                            </div>
                                            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[item.status] ?? 'bg-muted text-muted-foreground'}`}>
                                                {STATUS_LABEL[item.status] ?? item.status}
                                            </span>
                                            <p className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                                                {new Date(item.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                                            </p>
                                            <Link href={`/staff/pengajuan/${item.id}`}
                                                className="shrink-0 rounded-xl bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-700">
                                                {ACTION_LABEL[item.status] ?? 'Lihat'}
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pengaduan masuk — 2/5 */}
                    <div className="rounded-2xl border bg-card shadow-sm xl:col-span-2">
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <h3 className="flex items-center gap-2 font-semibold text-foreground">
                                <Megaphone className="h-4 w-4 text-purple-600" />
                                Pengaduan Masuk
                            </h3>
                            <Link href="/staff/pengaduan"
                                className="text-xs font-semibold text-teal-700 hover:underline dark:text-teal-400">
                                Lihat semua →
                            </Link>
                        </div>
                        <div className="divide-y px-4">
                            {recent_pengaduan.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">Tidak ada pengaduan baru.</p>
                            ) : (
                                recent_pengaduan.map(p => (
                                    <Link key={p.id} href={`/staff/pengaduan/${p.id}`}
                                        className="flex items-start gap-3 py-3 hover:bg-muted/30">
                                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-foreground">{p.judul}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(p.created_at).toLocaleDateString('id-ID')}
                                            </p>
                                        </div>
                                        <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-600">
                                            BARU
                                        </span>
                                    </Link>
                                ))
                            )}
                        </div>
                        {recent_pengaduan.length > 0 && (
                            <div className="px-4 pb-4 pt-2">
                                <Link href="/staff/pengaduan"
                                    className="block w-full rounded-xl border border-purple-200 py-2 text-center text-xs font-semibold text-purple-700 hover:bg-purple-50 dark:border-purple-800/40 dark:text-purple-400">
                                    Respons Pengaduan →
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Buku Tamu Hari Ini ─────────────────────────────────── */}
                <div className="rounded-2xl border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b px-6 py-4">
                        <h3 className="flex items-center gap-2 font-semibold text-foreground">
                            <BookOpen className="h-4 w-4 text-teal-600" />
                            Buku Tamu Hari Ini
                        </h3>
                        <Link href="/staff/buku-tamu"
                            className="text-xs font-semibold text-teal-700 hover:underline dark:text-teal-400">
                            Lihat semua →
                        </Link>
                    </div>
                    <div className="p-4">
                        {buku_tamu_hari_ini.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">Belum ada tamu hari ini.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            <th className="pb-2">Nama Tamu</th>
                                            <th className="pb-2">Instansi</th>
                                            <th className="pb-2">Keperluan</th>
                                            <th className="pb-2">Jam Masuk</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {buku_tamu_hari_ini.map(tamu => (
                                            <tr key={tamu.id} className="border-b last:border-0">
                                                <td className="py-2.5 font-medium text-foreground">{tamu.nama_pengunjung}</td>
                                                <td className="py-2.5 text-muted-foreground">{tamu.instansi ?? '—'}</td>
                                                <td className="py-2.5 text-muted-foreground">{tamu.keperluan ?? '—'}</td>
                                                <td className="py-2.5 text-muted-foreground">
                                                    {new Date(tamu.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
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
