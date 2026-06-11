import { Head, Link, router } from '@inertiajs/react';
import { Eye, Search } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

interface PengaduanItem {
    id: number;
    judul: string;
    status: string;
    created_at: string;
    user?: { id: number; name: string } | null;
    kategori?: { id: number; nama_kategori: string } | null;
}

interface Paginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    pengaduan: Paginator<PengaduanItem>;
    filters: { status?: string; search?: string };
}

const STATUS_LABEL: Record<string, string> = {
    menunggu: 'Menunggu', diproses: 'Diproses', selesai: 'Selesai', ditolak: 'Ditolak',
};
const STATUS_COLOR: Record<string, string> = {
    menunggu: 'bg-amber-100 text-amber-700', diproses: 'bg-blue-100 text-blue-700',
    selesai: 'bg-green-100 text-green-700', ditolak: 'bg-red-100 text-red-700',
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
    { title: 'Pengaduan', href: '/admin/pengaduan' },
];

export default function AdminPengaduan({ pengaduan, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilter = (extra: Record<string, string>) =>
        router.get('/admin/pengaduan', { ...filters, ...extra }, { preserveState: true });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaduan | SADESA" />

            <div className="flex flex-col gap-6 p-4">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Pengaduan Warga</h1>
                    <p className="text-sm text-muted-foreground">Total {pengaduan.total} pengaduan masuk</p>
                </div>

                {/* Filter */}
                <div className="flex flex-wrap gap-3">
                    <form onSubmit={e => { e.preventDefault(); applyFilter({ search }); }} className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Cari judul atau pelapor…"
                                className="w-64 rounded-lg border bg-background py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                        </div>
                        <button type="submit" className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">Cari</button>
                    </form>

                    <select value={filters.status ?? ''} onChange={e => applyFilter({ status: e.target.value })}
                        className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="">Semua Status</option>
                        {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>

                    {(filters.status || filters.search) && (
                        <button onClick={() => router.get('/admin/pengaduan')} className="rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-muted">Reset</button>
                    )}
                </div>

                {/* Table */}
                <div className="rounded-xl border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/30 text-left">
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Judul</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Pelapor</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Kategori</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Tanggal</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pengaduan.data.length === 0 ? (
                                    <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">Tidak ada pengaduan.</td></tr>
                                ) : pengaduan.data.map(item => (
                                    <tr key={item.id} className="border-b last:border-0 hover:bg-muted/20">
                                        <td className="max-w-xs px-4 py-3">
                                            <p className="truncate font-medium text-foreground">{item.judul}</p>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{item.user?.name ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{item.kategori?.nama_kategori ?? '—'}</span>
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
                                            <Link href={`/admin/pengaduan/${item.id}`} className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs hover:bg-muted">
                                                <Eye className="h-3.5 w-3.5" /> Detail
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {pengaduan.last_page > 1 && (
                        <div className="flex items-center justify-between border-t px-4 py-3">
                            <p className="text-sm text-muted-foreground">Halaman {pengaduan.current_page} dari {pengaduan.last_page}</p>
                            <div className="flex gap-1">
                                {pengaduan.links.map((link, i) => (
                                    <Link key={i} href={link.url ?? '#'} preserveState
                                        className={`rounded-md px-3 py-1.5 text-sm ${link.active ? 'bg-teal-600 text-white' : 'border hover:bg-muted text-muted-foreground'} ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
