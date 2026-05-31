import { Head, Link, router, useForm } from '@inertiajs/react';
import { FileText, LayoutTemplate, Pencil, Plus, Search, ToggleLeft, ToggleRight, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MasterSurat {
    id: number;
    kode: string;
    kategori: string | null;
    nomor_prefix: string | null;
    kode_bidang: string | null;
    nama_surat: string;
    deskripsi: string | null;
    persyaratan: string[] | null;
    template: unknown | null;
    is_active: boolean;
    pengajuan_surat_count: number;
}

interface Paginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    masterSurat: Paginator<MasterSurat>;
    filters: { search?: string; status?: string; kategori?: string };
    kategoriList: Record<string, string>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const KATEGORI_COLOR: Record<string, string> = {
    domisili:         'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    ijin:             'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    keterangan:       'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
    keterangan_tanah: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    pengantar_nikah:  'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
    { title: 'Master Surat', href: '/admin/master-surat' },
];

// ─── Modal Form ───────────────────────────────────────────────────────────────

type ModalMode = 'create' | 'edit';

interface SuratFormData {
    kode: string;
    kategori: string;
    nomor_prefix: string;
    kode_bidang: string;
    nama_surat: string;
    deskripsi: string;
    persyaratan: string[];
    is_active: boolean;
}

function SuratModal({
    mode, surat, onClose, kategoriList,
}: {
    mode: ModalMode;
    surat?: MasterSurat;
    onClose: () => void;
    kategoriList: Record<string, string>;
}) {
    const { data, setData, post, patch, processing, errors } = useForm<SuratFormData>({
        kode:         surat?.kode         ?? '',
        kategori:     surat?.kategori     ?? '',
        nomor_prefix: surat?.nomor_prefix ?? '',
        kode_bidang:  surat?.kode_bidang  ?? '',
        nama_surat:   surat?.nama_surat   ?? '',
        deskripsi:    surat?.deskripsi    ?? '',
        persyaratan:  surat?.persyaratan  ?? [''],
        is_active:    surat?.is_active    ?? true,
    });

    const setPersyaratan = (idx: number, val: string) => {
        const arr = [...data.persyaratan]; arr[idx] = val; setData('persyaratan', arr);
    };
    const addPersyaratan  = () => setData('persyaratan', [...data.persyaratan, '']);
    const removePersyaratan = (idx: number) => setData('persyaratan', data.persyaratan.filter((_, i) => i !== idx));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'create') {
            post('/admin/master-surat', { onSuccess: onClose });
        } else {
            patch(`/admin/master-surat/${surat!.id}`, { onSuccess: onClose });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-background shadow-xl">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h3 className="font-semibold">{mode === 'create' ? 'Tambah Jenis Surat' : 'Edit Jenis Surat'}</h3>
                    <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={submit} className="max-h-[80vh] overflow-y-auto p-6 space-y-4">
                    {/* Row: Kode + Status */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Kode <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={data.kode}
                                onChange={e => setData('kode', e.target.value.toUpperCase())}
                                maxLength={20}
                                placeholder="DOM-DLM"
                                className="w-full rounded-xl border bg-background px-3 py-2 text-sm font-mono uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                            {errors.kode && <p className="mt-1 text-xs text-red-500">{errors.kode}</p>}
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Status</label>
                            <select
                                value={data.is_active ? 'aktif' : 'nonaktif'}
                                onChange={e => setData('is_active', e.target.value === 'aktif')}
                                className="w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Nonaktif</option>
                            </select>
                        </div>
                    </div>

                    {/* Row: Kategori + Nomor Prefix */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Kategori</label>
                            <select
                                value={data.kategori}
                                onChange={e => setData('kategori', e.target.value)}
                                className="w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="">— Pilih Kategori —</option>
                                {Object.entries(kategoriList).map(([k, v]) => (
                                    <option key={k} value={k}>{v}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Prefix Nomor Surat</label>
                            <input
                                type="text"
                                value={data.nomor_prefix}
                                onChange={e => setData('nomor_prefix', e.target.value)}
                                placeholder="445"
                                className="w-full rounded-xl border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                    </div>

                    {/* Row: Kode Bidang + Nomor Preview */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">
                                Kode Bidang <span className="font-normal text-muted-foreground">(nomor surat)</span>
                            </label>
                            <input
                                type="text"
                                value={data.kode_bidang}
                                onChange={e => setData('kode_bidang', e.target.value)}
                                placeholder="Ks"
                                maxLength={20}
                                className="w-full rounded-xl border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                            <p className="mt-1 text-[11px] text-muted-foreground">Singkatan bidang (contoh: Ks, Dom, T)</p>
                        </div>
                        <div className="flex flex-col justify-center">
                            <label className="mb-1.5 block text-sm font-medium text-muted-foreground">Contoh Nomor Surat</label>
                            <div className="rounded-xl border bg-muted/30 px-3 py-2 font-mono text-sm">
                                {data.nomor_prefix || '???'}/{'{urut}'}/{data.kode_bidang || '???'}-{new Date().getFullYear()}
                            </div>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                                Contoh nyata: {data.nomor_prefix || '445'}/8/{data.kode_bidang || 'Ks'}-{new Date().getFullYear()}
                            </p>
                        </div>
                    </div>

                    {/* Nama Surat */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium">Nama Surat <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={data.nama_surat}
                            onChange={e => setData('nama_surat', e.target.value)}
                            placeholder="Surat Keterangan Domisili"
                            className="w-full rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        {errors.nama_surat && <p className="mt-1 text-xs text-red-500">{errors.nama_surat}</p>}
                    </div>

                    {/* Deskripsi */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium">Deskripsi <span className="text-muted-foreground font-normal">(opsional)</span></label>
                        <textarea
                            value={data.deskripsi}
                            onChange={e => setData('deskripsi', e.target.value)}
                            rows={2}
                            maxLength={500}
                            placeholder="Penjelasan singkat tentang jenis surat ini..."
                            className="w-full resize-none rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>

                    {/* Dokumen Pendukung */}
                    <div>
                        <div className="mb-1.5 flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium">Dokumen Pendukung</label>
                                <p className="text-xs text-muted-foreground">Dokumen fisik eksternal yang belum ada di sistem (identitas warga sudah otomatis dari database)</p>
                            </div>
                            <button type="button" onClick={addPersyaratan} className="flex shrink-0 items-center gap-1 text-xs text-teal-600 hover:text-teal-700">
                                <Plus className="h-3.5 w-3.5" /> Tambah
                            </button>
                        </div>
                        <div className="space-y-2">
                            {data.persyaratan.length === 0 ? (
                                <p className="rounded-xl border border-dashed px-3 py-3 text-center text-xs text-muted-foreground">
                                    Tidak ada — identitas warga sudah terverifikasi otomatis
                                </p>
                            ) : (
                                data.persyaratan.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span className="w-5 shrink-0 text-center text-xs text-muted-foreground">{idx + 1}.</span>
                                        <input
                                            type="text"
                                            value={item}
                                            onChange={e => setPersyaratan(idx, e.target.value)}
                                            placeholder={`Dokumen pendukung ${idx + 1}`}
                                            className="flex-1 rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        />
                                        <button type="button" onClick={() => removePersyaratan(idx)} className="rounded p-1 text-muted-foreground hover:text-red-500">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="rounded-xl border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted">
                            Batal
                        </button>
                        <button type="submit" disabled={processing} className="rounded-xl bg-teal-600 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60">
                            {processing ? 'Menyimpan...' : mode === 'create' ? 'Simpan' : 'Perbarui'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ surat, onClose }: { surat: MasterSurat; onClose: () => void }) {
    const [processing, setProcessing] = useState(false);
    const handleDelete = () => {
        setProcessing(true);
        router.delete(`/admin/master-surat/${surat.id}`, { onFinish: () => { setProcessing(false); onClose(); } });
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-xl">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="mb-1 font-semibold">Hapus Jenis Surat</h3>
                <p className="text-sm text-muted-foreground">
                    Yakin ingin menghapus <strong className="text-foreground">"{surat.nama_surat}"</strong>?
                </p>
                {surat.pengajuan_surat_count > 0 && (
                    <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
                        ⚠️ Ada {surat.pengajuan_surat_count} pengajuan terkait — tidak bisa dihapus. Nonaktifkan saja.
                    </p>
                )}
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="rounded-xl border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted">Batal</button>
                    <button onClick={handleDelete} disabled={processing || surat.pengajuan_surat_count > 0}
                        className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-40">
                        {processing ? 'Menghapus...' : 'Hapus'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MasterSuratPage({ masterSurat, filters, kategoriList }: Props) {
    const [modal, setModal] = useState<{ mode: ModalMode; surat?: MasterSurat } | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<MasterSurat | null>(null);
    const [search, setSearch] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? '');
    const [kategoriFilter, setKategoriFilter] = useState(filters.kategori ?? '');

    const applyFilter = () => {
        router.get('/admin/master-surat', {
            search: search || undefined,
            status: statusFilter || undefined,
            kategori: kategoriFilter || undefined,
        }, { preserveState: true, replace: true });
    };

    const handleToggle = (surat: MasterSurat) => {
        router.patch(`/admin/master-surat/${surat.id}/toggle`, {}, { preserveScroll: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Master Surat | SADESA" />

            <div className="flex flex-col gap-6 p-4 pb-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold">Master Jenis Surat</h1>
                        <p className="text-sm text-muted-foreground">Kelola jenis surat dan template untuk pengajuan warga</p>
                    </div>
                    <button
                        onClick={() => setModal({ mode: 'create' })}
                        className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-teal-700"
                    >
                        <Plus className="h-4 w-4" /> Tambah Jenis Surat
                    </button>
                </div>

                {/* Filter */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative min-w-56 flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyFilter()}
                            placeholder="Cari nama atau kode..."
                            className="w-full rounded-xl border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>
                    <select
                        value={kategoriFilter}
                        onChange={e => setKategoriFilter(e.target.value)}
                        className="rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        <option value="">Semua Kategori</option>
                        {Object.entries(kategoriList).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                        ))}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                        className="rounded-xl border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        <option value="">Semua Status</option>
                        <option value="aktif">Aktif</option>
                        <option value="nonaktif">Nonaktif</option>
                    </select>
                    <button onClick={applyFilter} className="rounded-xl bg-muted px-4 py-2 text-sm font-semibold hover:bg-muted/80">
                        Terapkan
                    </button>
                </div>

                {/* Table */}
                <div className="rounded-2xl border bg-card shadow-sm">
                    <div className="border-b px-6 py-4">
                        <p className="text-sm text-muted-foreground">
                            Total <strong className="text-foreground">{masterSurat.total}</strong> jenis surat
                        </p>
                    </div>

                    {masterSurat.data.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
                            <FileText className="h-12 w-12 opacity-30" />
                            <p className="text-sm">Belum ada jenis surat</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/30 text-left">
                                        <th className="px-5 py-3 font-medium text-muted-foreground">Kode</th>
                                        <th className="px-5 py-3 font-medium text-muted-foreground">Nama Surat</th>
                                        <th className="px-5 py-3 font-medium text-muted-foreground">Kategori</th>
                                        <th className="px-5 py-3 font-medium text-muted-foreground">Dokumen Pendukung</th>
                                        <th className="px-5 py-3 font-medium text-muted-foreground">Template</th>
                                        <th className="px-5 py-3 font-medium text-muted-foreground">Status</th>
                                        <th className="px-5 py-3 font-medium text-muted-foreground">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {masterSurat.data.map(surat => (
                                        <tr key={surat.id} className="border-b last:border-0 hover:bg-muted/20">
                                            {/* Kode */}
                                            <td className="px-5 py-4">
                                                <div>
                                                    <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs font-semibold">{surat.kode}</span>
                                                    {(surat.nomor_prefix || surat.kode_bidang) && (
                                                        <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                                                            {surat.nomor_prefix || '?'}/{'{n}'}/{surat.kode_bidang || '?'}-{new Date().getFullYear()}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Nama */}
                                            <td className="px-5 py-4 max-w-[200px]">
                                                <p className="font-medium text-foreground leading-snug">{surat.nama_surat}</p>
                                                {surat.deskripsi && (
                                                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{surat.deskripsi}</p>
                                                )}
                                            </td>

                                            {/* Kategori */}
                                            <td className="px-5 py-4">
                                                {surat.kategori ? (
                                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${KATEGORI_COLOR[surat.kategori] ?? 'bg-muted text-muted-foreground'}`}>
                                                        {kategoriList[surat.kategori] ?? surat.kategori}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">—</span>
                                                )}
                                            </td>

                                            {/* Dokumen Pendukung */}
                                            <td className="px-5 py-4">
                                                {surat.persyaratan && surat.persyaratan.length > 0 ? (
                                                    <ul className="space-y-0.5">
                                                        {surat.persyaratan.slice(0, 2).map((p, i) => (
                                                            <li key={i} className="flex items-start gap-1 text-xs text-muted-foreground">
                                                                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
                                                                {p}
                                                            </li>
                                                        ))}
                                                        {surat.persyaratan.length > 2 && (
                                                            <li className="text-xs text-teal-600">+{surat.persyaratan.length - 2} lainnya</li>
                                                        )}
                                                    </ul>
                                                ) : (
                                                    <span className="text-xs italic text-muted-foreground">Tidak ada</span>
                                                )}
                                            </td>

                                            {/* Template status */}
                                            <td className="px-5 py-4">
                                                {surat.template ? (
                                                    <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-semibold text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
                                                        ✓ Ada
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                                                        Belum
                                                    </span>
                                                )}
                                            </td>

                                            {/* Status toggle */}
                                            <td className="px-5 py-4">
                                                <button
                                                    onClick={() => handleToggle(surat)}
                                                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                                                        surat.is_active
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
                                                    }`}
                                                >
                                                    {surat.is_active ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                                                    {surat.is_active ? 'Aktif' : 'Nonaktif'}
                                                </button>
                                            </td>

                                            {/* Aksi */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <Link
                                                        href={`/admin/master-surat/${surat.id}/template`}
                                                        title="Edit Template"
                                                        className="flex items-center gap-1 rounded-lg border border-teal-300 bg-teal-50 px-2 py-1.5 text-xs font-semibold text-teal-700 transition hover:bg-teal-100 dark:border-teal-700 dark:bg-teal-900/30 dark:text-teal-300 dark:hover:bg-teal-900/50"
                                                    >
                                                        <LayoutTemplate className="h-3.5 w-3.5" />
                                                        Template
                                                    </Link>
                                                    <button
                                                        onClick={() => setModal({ mode: 'edit', surat })}
                                                        title="Edit Info"
                                                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(surat)}
                                                        title="Hapus"
                                                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {masterSurat.last_page > 1 && (
                        <div className="flex items-center justify-between border-t px-6 py-4">
                            <p className="text-sm text-muted-foreground">
                                Halaman {masterSurat.current_page} dari {masterSurat.last_page}
                            </p>
                            <div className="flex gap-1">
                                {masterSurat.links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`min-w-[36px] rounded-lg px-3 py-1.5 text-sm ${
                                            link.active
                                                ? 'bg-teal-600 text-white'
                                                : 'border text-muted-foreground hover:bg-muted disabled:opacity-40'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {modal && <SuratModal mode={modal.mode} surat={modal.surat} onClose={() => setModal(null)} kategoriList={kategoriList} />}
            {deleteTarget && <DeleteConfirm surat={deleteTarget} onClose={() => setDeleteTarget(null)} />}
        </AppLayout>
    );
}
