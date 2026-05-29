import { Head, Link, router } from '@inertiajs/react';
import { Eye, Search } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

interface PengajuanItem {
    id: number;
    no_pengajuan: string;
    status: string;
    created_at: string;
    user?: { id: number; name: string; nik: string | null } | null;
    master_surat?: { id: number; nama: string; kode: string } | null;
}

interface Paginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    pengajuan: Paginator<PengajuanItem>;
    filters: { status?: string; search?: string };
}

const STATUS_LABEL: Record<string, string> = {
    menunggu:            'Menunggu',
    diproses:            'Diproses',
    diverifikasi:        'Diverifikasi',
    ditolak_staff:       'Ditolak Petugas',
    menunggu_pengesahan: 'Menunggu Pengesahan',
    disetujui:           'Disetujui — Siap Cetak',
    ditolak_kepala:      'Ditolak Kepala Desa',
    siap_diambil:        'Siap Diambil',
    selesai:             'Selesai',
    dibatalkan:          'Dibatalkan',
};

const STATUS_COLOR: Record<string, string> = {
    menunggu:            'bg-amber-100 text-amber-700',
    diproses:            'bg-blue-100 text-blue-700',
    diverifikasi:        'bg-indigo-100 text-indigo-700',
    ditolak_staff:       'bg-red-100 text-red-700',
    menunggu_pengesahan: 'bg-purple-100 text-purple-700',
    disetujui:           'bg-orange-100 text-orange-700',
    ditolak_kepala:      'bg-red-100 text-red-700',
    siap_diambil:        'bg-teal-100 text-teal-700',
    selesai:             'bg-green-100 text-green-700',
    dibatalkan:          'bg-gray-100 text-gray-600',
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
    { title: 'Antrian Pengajuan', href: '/staff/pengajuan' },
];

export default function StaffPengajuan({ pengajuan, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilter = (extra: Record<string, string>) =>
        router.get('/staff/pengajuan', { ...filters, ...extra }, { preserveState: true });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Antrian Pengajuan | SADESA" />

            <div className="flex flex-col gap-6 p-4">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Antrian Pengajuan Surat</h1>
                    <p className="text-sm text-muted-foreground">Total {pengajuan.total} pengajuan</p>
                </div>

                {/* Filter */}
                <div className="flex flex-wrap gap-3">
                    <form onSubmit={e => { e.preventDefault(); applyFilter({ search }); }} className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="No. pengajuan atau nama pemohon…"
                                className="w-64 rounded-lg border bg-background py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                        <button type="submit" className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
                            Cari
                        </button>
                    </form>

                    <select
                        value={filters.status ?? ''}
                        onChange={e => applyFilter({ status: e.target.value })}
                        className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        <option value="">Perlu Diproses</option>
                        {Object.entries(STATUS_LABEL).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                        ))}
                    </select>

                    {(filters.status || filters.search) && (
                        <button
                            onClick={() => router.get('/staff/pengajuan')}
                            className="rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
                        >
                            Reset
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="rounded-xl border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/30 text-left">
                                    <th className="px-4 py-3 font-medium text-muted-foreground">No. Pengajuan</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Pemohon</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Jenis Surat</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Tanggal</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pengajuan.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-muted-foreground">
                                            Tidak ada pengajuan.
                                        </td>
                                    </tr>
                                ) : pengajuan.data.map(item => (
                                    <tr key={item.id} className="border-b last:border-0 hover:bg-muted/20">
                                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{item.no_pengajuan}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-foreground">{item.user?.name ?? '—'}</div>
                                            <div className="text-xs text-muted-foreground">{item.user?.nik ?? ''}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="mr-1 rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{item.master_surat?.kode}</span>
                                            {item.master_surat?.nama}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[item.status] ?? 'bg-muted text-muted-foreground'}`}>
                                                {STATUS_LABEL[item.status] ?? item.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {new Date(item.created_at).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/staff/pengajuan/${item.id}`}
                                                className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs hover:bg-muted"
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                {item.status === 'menunggu' || item.status === 'diproses' ? 'Proses' : 'Detail'}
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {pengajuan.last_page > 1 && (
                        <div className="flex items-center justify-between border-t px-4 py-3">
                            <p className="text-sm text-muted-foreground">
                                Halaman {pengajuan.current_page} dari {pengajuan.last_page}
                            </p>
                            <div className="flex gap-1">
                                {pengajuan.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url ?? '#'}
                                        preserveState
                                        className={`rounded-md px-3 py-1.5 text-sm ${link.active ? 'bg-teal-600 text-white' : 'border hover:bg-muted text-muted-foreground'} ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
