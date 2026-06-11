import { Head, Link, router, useForm } from '@inertiajs/react';
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

interface KontenItem {
    id: number;
    judul: string;
    slug: string;
    tipe: string;
    status: string;
    created_at: string;
    admin?: { id: number; name: string } | null;
    konten?: string;
}

interface Paginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    konten: Paginator<KontenItem>;
    filters: { tipe?: string; status?: string; search?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
    { title: 'Konten Desa', href: '/admin/konten' },
];

// ─── Form Modal ───────────────────────────────────────────────────────────────

function KontenModal({ editData, onClose }: { editData: KontenItem | null; onClose: () => void }) {
    const isEdit = editData !== null;
    const form = useForm({
        judul:  editData?.judul  ?? '',
        konten: editData?.konten ?? '',
        tipe:   editData?.tipe   ?? 'berita',
        status: editData?.status ?? 'draft',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            form.patch(`/admin/konten/${editData!.id}`, { onSuccess: onClose });
        } else {
            form.post('/admin/konten', { onSuccess: onClose });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-10">
            <div className="w-full max-w-2xl rounded-xl bg-background shadow-xl">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h3 className="font-semibold text-foreground">{isEdit ? 'Edit Konten' : 'Buat Konten Baru'}</h3>
                    <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted"><X className="h-4 w-4" /></button>
                </div>
                <form onSubmit={submit} className="space-y-4 p-6">
                    {/* Judul */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">Judul <span className="text-red-500">*</span></label>
                        <input value={form.data.judul} onChange={e => form.setData('judul', e.target.value)}
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="Judul konten…" required />
                        {form.errors.judul && <p className="mt-1 text-xs text-red-500">{form.errors.judul}</p>}
                    </div>

                    {/* Tipe + Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">Tipe</label>
                            <select value={form.data.tipe} onChange={e => form.setData('tipe', e.target.value)}
                                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                                <option value="berita">📰 Berita</option>
                                <option value="pengumuman">📢 Pengumuman</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">Status</label>
                            <select value={form.data.status} onChange={e => form.setData('status', e.target.value)}
                                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                                <option value="draft">Draft</option>
                                <option value="published">Dipublikasikan</option>
                            </select>
                        </div>
                    </div>

                    {/* Konten */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">Isi Konten <span className="text-red-500">*</span></label>
                        <textarea value={form.data.konten} onChange={e => form.setData('konten', e.target.value)}
                            rows={10} required
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y"
                            placeholder="Tulis isi konten di sini…" />
                        {form.errors.konten && <p className="mt-1 text-xs text-red-500">{form.errors.konten}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">Batal</button>
                        <button type="submit" disabled={form.processing}
                            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60">
                            {form.processing ? 'Menyimpan…' : isEdit ? 'Perbarui' : 'Publikasikan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminKonten({ konten, filters }: Props) {
    const [search, setSearch]   = useState(filters.search ?? '');
    const [modal, setModal]     = useState<'create' | KontenItem | null>(null);

    const applyFilter = (extra: Record<string, string>) =>
        router.get('/admin/konten', { ...filters, ...extra }, { preserveState: true });

    const handleDelete = (item: KontenItem) => {
        if (!confirm(`Hapus konten "${item.judul}"?`)) return;
        router.delete(`/admin/konten/${item.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Konten Desa | SADESA" />
            {modal !== null && (
                <KontenModal
                    editData={modal === 'create' ? null : modal}
                    onClose={() => setModal(null)}
                />
            )}

            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Konten Desa</h1>
                        <p className="text-sm text-muted-foreground">Kelola berita dan pengumuman desa</p>
                    </div>
                    <button onClick={() => setModal('create')}
                        className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
                        <Plus className="h-4 w-4" /> Buat Konten
                    </button>
                </div>

                {/* Filter */}
                <div className="flex flex-wrap gap-3">
                    <form onSubmit={e => { e.preventDefault(); applyFilter({ search }); }} className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                placeholder="Cari judul…"
                                className="w-56 rounded-lg border bg-background py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                        </div>
                        <button type="submit" className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">Cari</button>
                    </form>
                    <select value={filters.tipe ?? ''} onChange={e => applyFilter({ tipe: e.target.value })}
                        className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="">Semua Tipe</option>
                        <option value="berita">Berita</option>
                        <option value="pengumuman">Pengumuman</option>
                    </select>
                    <select value={filters.status ?? ''} onChange={e => applyFilter({ status: e.target.value })}
                        className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <option value="">Semua Status</option>
                        <option value="published">Dipublikasikan</option>
                        <option value="draft">Draft</option>
                    </select>
                    {(filters.tipe || filters.status || filters.search) && (
                        <button onClick={() => router.get('/admin/konten')} className="rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-muted">Reset</button>
                    )}
                </div>

                {/* Table */}
                <div className="rounded-xl border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/30 text-left">
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Judul</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Tipe</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Penulis</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Tanggal</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {konten.data.length === 0 ? (
                                    <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">Belum ada konten.</td></tr>
                                ) : konten.data.map(item => (
                                    <tr key={item.id} className="border-b last:border-0 hover:bg-muted/20">
                                        <td className="max-w-xs px-4 py-3">
                                            <p className="truncate font-medium text-foreground">{item.judul}</p>
                                            <p className="truncate text-xs text-muted-foreground">/informasi/{item.slug}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${item.tipe === 'berita' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {item.tipe === 'berita' ? '📰 Berita' : '📢 Pengumuman'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${item.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {item.status === 'published' ? 'Publik' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{item.admin?.name ?? '—'}</td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {new Date(item.created_at).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button onClick={() => setModal(item)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" title="Edit">
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDelete(item)} className="rounded-md p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20" title="Hapus">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {konten.last_page > 1 && (
                        <div className="flex items-center justify-between border-t px-4 py-3">
                            <p className="text-sm text-muted-foreground">Halaman {konten.current_page} dari {konten.last_page}</p>
                            <div className="flex gap-1">
                                {konten.links.map((link, i) => (
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
