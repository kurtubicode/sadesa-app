import { Head, Link } from '@inertiajs/react';
import {
    BadgeCheck,
    Clock,
    FileText,
    Megaphone,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stats {
    menunggu_verifikasi: number;
    diproses_hari_ini: number;
    selesai_hari_ini: number;
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

// ─── TaskCard ─────────────────────────────────────────────────────────────────

function TaskCard({
    title, count, icon, color = 'teal',
}: {
    title: string; count: number; icon: React.ReactNode;
    color?: 'teal' | 'blue' | 'amber' | 'green';
}) {
    const borderColor = {
        teal:  'border-l-teal-500  bg-teal-50  dark:bg-teal-900/10',
        blue:  'border-l-blue-500  bg-blue-50  dark:bg-blue-900/10',
        amber: 'border-l-amber-500 bg-amber-50 dark:bg-amber-900/10',
        green: 'border-l-green-500 bg-green-50 dark:bg-green-900/10',
    };

    const iconColor = {
        teal:  'text-teal-600  dark:text-teal-400',
        blue:  'text-blue-600  dark:text-blue-400',
        amber: 'text-amber-600 dark:text-amber-400',
        green: 'text-green-600 dark:text-green-400',
    };

    return (
        <div className={`rounded-xl border border-l-4 ${borderColor[color]} p-6 shadow-sm`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="mb-1 text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="text-3xl font-bold text-foreground">{count}</h3>
                </div>
                <div className={iconColor[color]}>{icon}</div>
            </div>
        </div>
    );
}

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

                {/* Task cards */}
                <div>
                    <h2 className="mb-4 text-base font-semibold text-foreground">Ringkasan Hari Ini</h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                        <TaskCard
                            title="Menunggu Verifikasi"
                            count={stats.menunggu_verifikasi}
                            icon={<Clock className="h-8 w-8" />}
                            color="amber"
                        />
                        <TaskCard
                            title="Sedang Diproses"
                            count={stats.diproses_hari_ini}
                            icon={<FileText className="h-8 w-8" />}
                            color="teal"
                        />
                        <TaskCard
                            title="Selesai Diverifikasi"
                            count={stats.selesai_hari_ini}
                            icon={<BadgeCheck className="h-8 w-8" />}
                            color="green"
                        />
                        <TaskCard
                            title="Pengaduan Baru"
                            count={stats.pengaduan_baru}
                            icon={<Megaphone className="h-8 w-8" />}
                            color="blue"
                        />
                    </div>
                </div>

                {/* Alert pengaduan */}
                {stats.pengaduan_baru > 0 && (
                    <div className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/10">
                        <Megaphone className="h-5 w-5 shrink-0 text-blue-600" />
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                            Ada <strong>{stats.pengaduan_baru}</strong> pengaduan warga yang belum ditindaklanjuti.
                        </p>
                    </div>
                )}

                {/* Tabel antrian */}
                <div className="rounded-xl border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b px-6 py-4">
                        <h3 className="font-semibold text-foreground">Antrian Pengajuan — Menunggu Verifikasi</h3>
                        <Link
                            href="/staff/pengajuan"
                            className="text-sm font-medium text-teal-600 hover:underline"
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
                                            <th className="pb-3 font-medium text-muted-foreground">Waktu Masuk</th>
                                            <th className="pb-3 font-medium text-muted-foreground">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {antrian.map((item) => (
                                            <tr key={item.id} className="border-b last:border-0">
                                                <td className="py-3 font-mono text-xs text-muted-foreground">{item.no_pengajuan}</td>
                                                <td className="py-3 font-medium text-foreground">{item.user?.name ?? '—'}</td>
                                                <td className="py-3 text-muted-foreground">
                                                    <span className="mr-2 rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                                                        {item.master_surat?.kode}
                                                    </span>
                                                    {item.master_surat?.nama}
                                                </td>
                                                <td className="py-3 text-muted-foreground">
                                                    {new Date(item.created_at).toLocaleString('id-ID', {
                                                        dateStyle: 'short', timeStyle: 'short',
                                                    })}
                                                </td>
                                                <td className="py-3">
                                                    <Link
                                                        href={`/staff/pengajuan/${item.id}`}
                                                        className="rounded-md bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-700"
                                                    >
                                                        Proses
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
