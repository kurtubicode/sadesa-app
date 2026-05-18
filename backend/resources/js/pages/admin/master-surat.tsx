import { Head, router, useForm } from '@inertiajs/react';
import { FileText, Pencil, Plus, Search, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MasterSurat {
    id: number;
    kode: string;
    nama_surat: string;
    persyaratan: string[] | null;
    template: string | null;
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
    filters: { search?: string; status?: string };
}

// ─── Breadcrumbs ──────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
    { title: 'Master Surat', href: '/admin/master-surat' },
];

// ─── Modal Form ───────────────────────────────────────────────────────────────

type ModalMode = 'create' | 'edit';

interface SuratFormData {
    kode: string;
    nama_surat: string;
    persyaratan: string[];
    template: string;
    is_active: boolean;
}

function SuratModal({
    mode,
    surat,
    onClose,
}: {
    mode: ModalMode;
    surat?: MasterSurat;
    onClose: () => void;
}) {
    const { data, setData, post, patch, processing, errors, reset } = useForm<SuratFormData>({
        kode:        surat?.kode        ?? '',
        nama_surat:  surat?.nama_surat  ?? '',
        persyaratan: surat?.persyaratan ?? [''],
        template:    surat?.template    ?? '',
        is_active:   surat?.is_active   ?? true,
    });

    // ── Persyaratan list helpers ──
    const setPersyaratan = (idx: number, val: string) => {
        const arr = [...data.persyaratan];
        arr[idx] = val;
        setData('persyaratan', arr);
    };
    const addPersyaratan = () => setData('persyaratan', [...data.persyaratan, '']);
    const removePersyaratan = (idx: number) =>
        setData('persyaratan', data.persyaratan.filter((_, i) => i !== idx));

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
            <div className="w-full max-w-lg rounded-xl bg-background shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h3 className="font-semibold text-foreground">
                        {mode === 'create' ? 'Tambah Jenis Surat' : 'Edit Jenis Surat'}
                    </h3>
                    <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={submit} className="max-h-[80vh] overflow-y-auto p-6">
                    <div className="space-y-4">
                        {/* Kode */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">
                                    Kode <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.kode}
                                    onChange={e => setData('kode', e.target.value.toUpperCase())}
                                    placeholder="SKTM"
                                    maxLength={20}
                                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                {errors.kode && <p className="mt-1 text-xs text-red-500">{errors.kode}</p>}
                            </div>

                            {/* Status */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-foreground">Status</label>
                                <select
                                    value={data.is_active ? 'aktif' : 'nonaktif'}
                                    onChange={e => setData('is_active', e.target.value === 'aktif')}
                                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                >
                                    <option value="aktif">Aktif</option>
                                    <option value="nonaktif">Nonaktif</option>
                                </select>
                            </div>
                        </div>

                        {/* Nama Surat */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">
                                Nama Surat <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.nama_surat}
                                onChange={e => setData('nama_surat', e.target.value)}
                                placeholder="Surat Keterangan Tidak Mampu"
                                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                            {errors.nama_surat && <p className="mt-1 text-xs text-red-500">{errors.nama_surat}</p>}
                        </div>

                        {/* Persyaratan */}
                        <div>
                            <div className="mb-1.5 flex items-center justify-between">
                                <label className="text-sm font-medium text-foreground">Persyaratan</label>
                                <button
                                    type="button"
                                    onClick={addPersyaratan}
                                    className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700"
                                >
                                    <Plus className="h-3.5 w-3.5" /> Tambah
                                </button>
                            </div>
                            <div className="space-y-2">
                                {data.persyaratan.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span className="w-5 shrink-0 text-center text-xs text-muted-foreground">
                                            {idx + 1}.
                                        </span>
                                        <input
                                            type="text"
                                            value={item}
                                            onChange={e => setPersyaratan(idx, e.target.value)}
                                            placeholder={`Persyaratan ${idx + 1}`}
                                            className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        />
                                        {data.persyaratan.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removePersyaratan(idx)}
                                                className="rounded p-1 text-muted-foreground hover:text-red-500"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Template (opsional) */}
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">
                                Template{' '}
                                <span className="font-normal text-muted-foreground">(opsional)</span>
                            </label>
                            <textarea
                                value={data.template}
                                onChange={e => setData('template', e.target.value)}
                                rows={3}
                                placeholder="Template surat atau catatan tambahan..."
                                className="w-full resize-y rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
                        >
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
        router.delete(`/admin/master-surat/${surat.id}`, {
            onFinish: () => { setProcessing(false); onClose(); },
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-background p-6 shadow-xl">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="mb-1 font-semibold text-foreground">Hapus Jenis Surat</h3>
                <p className="mb-1 text-sm text-muted-foreground">
                    Yakin ingin menghapus <strong className="text-foreground">"{surat.nama_surat}"</strong>?
                </p>
                {surat.pengajuan_surat_count > 0 && (
                    <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                        ⚠️ Ada {surat.pengajuan_surat_count} pengajuan terkait — tidak bisa dihapus. Nonaktifkan saja.
                    </p>
                )}
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={processing || surat.pengajuan_surat_count > 0}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40"
                    >
                        {processing ? 'Menghapus...' : 'Hapus'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MasterSuratPage({ masterSurat, filters }: Props) {
    const [modal, setModal] = useState<{ mode: ModalMode; surat?: MasterSurat } | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<MasterSurat | null>(null);
    const [search, setSearch] = useState(filters.search ?? '');
    const [statusFilter, setStatusFilter] = useState(filters.status ?? '');

    const applyFilter = () => {
        router.get('/admin/master-surat', { search: search || undefined, status: statusFilter || undefined }, {
            preserveState: true, replace: true,
        });
    };

    const handleToggle = (surat: MasterSurat) => {
        router.patch(`/admin/master-surat/${surat.id}/toggle`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Master Surat | SADESA" />

            <div className="flex flex-col gap-6 p-4">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Master Jenis Surat</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola jenis surat yang tersedia untuk pengajuan warga
                        </p>
                    </div>
                    <button
                        onClick={() => setModal({ mode: 'create' })}
                        className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Jenis Surat
                    </button>
                </div>

                {/* Filter */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-48">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyFilter()}
                            placeholder="Cari nama atau kode..."
                            className="w-full rounded-lg border bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); }}
                        className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        <option value="">Semua Status</option>
                        <option value="aktif">Aktif</option>
                        <option value="nonaktif">Nonaktif</option>
                    </select>
                    <button
                        onClick={applyFilter}
                        className="rounded-lg bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80"
                    >
                        Terapkan
                    </button>
                </div>

                {/* Tabel */}
                <div className="rounded-xl border bg-card shadow-sm">
                    <div className="border-b px-6 py-4">
                        <p className="text-sm text-muted-foreground">
                            Total <strong className="text-foreground">{masterSurat.total}</strong> jenis surat
                        </p>
                    </div>

                    {masterSurat.data.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
                            <FileText className="h-12 w-12 opacity-30" />
                            <p className="text-sm">Belum ada jenis surat</p>
                            <button
                                onClick={() => setModal({ mode: 'create' })}
                                className="text-sm text-teal-600 hover:underline"
                            >
                                Tambah sekarang
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/30 text-left">
                                        <th className="px-6 py-3 font-medium text-muted-foreground">Kode</th>
                                        <th className="px-6 py-3 font-medium text-muted-foreground">Nama Surat</th>
                                        <th className="px-6 py-3 font-medium text-muted-foreground">Persyaratan</th>
                                        <th className="px-6 py-3 font-medium text-muted-foreground">Pengajuan</th>
                                        <th className="px-6 py-3 font-medium text-muted-foreground">Status</th>
                                        <th className="px-6 py-3 font-medium text-muted-foreground">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {masterSurat.data.map((surat) => (
                                        <tr key={surat.id} className="border-b last:border-0 hover:bg-muted/20">
                                            {/* Kode */}
                                            <td className="px-6 py-4">
                                                <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs font-semibold">
                                                    {surat.kode}
                                                </span>
                                            </td>

                                            {/* Nama */}
                                            <td className="px-6 py-4">
                                                <p className="font-medium text-foreground">{surat.nama_surat}</p>
                                                {surat.template && (
                                                    <p className="mt-0.5 truncate text-xs text-muted-foreground max-w-xs">
                                                        {surat.template}
                                                    </p>
                                                )}
                                            </td>

                                            {/* Persyaratan */}
                                            <td className="px-6 py-4">
                                                {surat.persyaratan && surat.persyaratan.length > 0 ? (
                                                    <ul className="space-y-0.5">
                                                        {surat.persyaratan.slice(0, 2).map((p, i) => (
                                                            <li key={i} className="flex items-start gap-1 text-xs text-muted-foreground">
                                                                <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
                                                                {p}
                                                            </li>
                                                        ))}
                                                        {surat.persyaratan.length > 2 && (
                                                            <li className="text-xs text-teal-600">
                                                                +{surat.persyaratan.length - 2} lainnya
                                                            </li>
                                                        )}
                                                    </ul>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">—</span>
                                                )}
                                            </td>

                                            {/* Jumlah Pengajuan */}
                                            <td className="px-6 py-4">
                                                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                    {surat.pengajuan_surat_count}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggle(surat)}
                                                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                                                        surat.is_active
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                                    title={surat.is_active ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                                                >
                                                    {surat.is_active
                                                        ? <ToggleRight className="h-3.5 w-3.5" />
                                                        : <ToggleLeft className="h-3.5 w-3.5" />
                                                    }
                                                    {surat.is_active ? 'Aktif' : 'Nonaktif'}
                                                </button>
                                            </td>

                                            {/* Aksi */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setModal({ mode: 'edit', surat })}
                                                        className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(surat)}
                                                        className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                                                        title="Hapus"
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
                                        className={`min-w-[36px] rounded px-3 py-1.5 text-sm ${
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

            {/* Modals */}
            {modal && (
                <SuratModal
                    mode={modal.mode}
                    surat={modal.surat}
                    onClose={() => setModal(null)}
                />
            )}
            {deleteTarget && (
                <DeleteConfirm
                    surat={deleteTarget}
                    onClose={() => setDeleteTarget(null)}
                />
            )}
        </AppLayout>
    );
}
