import { Head, router, useForm } from '@inertiajs/react';
import { MapPin, Pencil, Plus, Tag, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type TipeWilayah = 'desa' | 'dusun' | 'rw' | 'rt';

interface WilayahItem {
    id: number;
    nama: string;
    tipe: TipeWilayah;
    parent_id: number | null;
    users_count: number;
    parent?: { id: number; nama: string; tipe: TipeWilayah } | null;
}

interface KategoriItem {
    id: number;
    nama_kategori: string;
    deskripsi: string | null;
    pengaduan_count: number;
}

interface Props {
    wilayah: WilayahItem[];
    semua: { id: number; nama: string; tipe: TipeWilayah }[];
    kategori: KategoriItem[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TIPE_LABEL: Record<TipeWilayah, string> = { desa: 'Desa', dusun: 'Dusun', rw: 'RW', rt: 'RT' };
const TIPE_COLOR: Record<TipeWilayah, string> = {
    desa:  'bg-teal-100 text-teal-700',
    dusun: 'bg-blue-100 text-blue-700',
    rw:    'bg-purple-100 text-purple-700',
    rt:    'bg-orange-100 text-orange-700',
};
const TIPE_INDENT: Record<TipeWilayah, string> = { desa: '', dusun: 'pl-4', rw: 'pl-8', rt: 'pl-12' };

// Parent yang valid per tipe
const PARENT_TIPE: Record<TipeWilayah, TipeWilayah | null> = {
    desa: null, dusun: 'desa', rw: 'dusun', rt: 'rw',
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
    { title: 'Data Master', href: '/admin/data-master' },
];

// ─── Modal Wilayah ────────────────────────────────────────────────────────────

function WilayahModal({
    mode, item, allWilayah, onClose,
}: {
    mode: 'create' | 'edit';
    item?: WilayahItem;
    allWilayah: { id: number; nama: string; tipe: TipeWilayah }[];
    onClose: () => void;
}) {
    const { data, setData, post, patch, processing, errors } = useForm({
        nama:      item?.nama      ?? '',
        tipe:      item?.tipe      ?? 'rt' as TipeWilayah,
        parent_id: item?.parent_id ?? ('' as unknown as number | null),
    });

    const parentTipe = PARENT_TIPE[data.tipe];
    const parentOptions = parentTipe
        ? allWilayah.filter(w => w.tipe === parentTipe)
        : [];

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...data,
            parent_id: data.parent_id || null,
        };
        if (mode === 'create') {
            post('/admin/wilayah', { data: payload, onSuccess: onClose });
        } else {
            patch(`/admin/wilayah/${item!.id}`, { data: payload, onSuccess: onClose });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-background shadow-xl">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h3 className="font-semibold text-foreground">
                        {mode === 'create' ? 'Tambah Wilayah' : 'Edit Wilayah'}
                    </h3>
                    <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={submit} className="space-y-4 p-6">
                    {/* Tipe */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                            Tipe <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={data.tipe}
                            onChange={e => {
                                setData('tipe', e.target.value as TipeWilayah);
                                setData('parent_id', '' as unknown as null);
                            }}
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                            {Object.entries(TIPE_LABEL).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                        {errors.tipe && <p className="mt-1 text-xs text-red-500">{errors.tipe}</p>}
                    </div>

                    {/* Parent */}
                    {parentTipe && (
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-foreground">
                                {TIPE_LABEL[parentTipe]} (Induk) <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={data.parent_id ?? ''}
                                onChange={e => setData('parent_id', e.target.value ? Number(e.target.value) : null)}
                                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            >
                                <option value="">— Pilih {TIPE_LABEL[parentTipe]} —</option>
                                {parentOptions.map(w => (
                                    <option key={w.id} value={w.id}>{w.nama}</option>
                                ))}
                            </select>
                            {errors.parent_id && <p className="mt-1 text-xs text-red-500">{errors.parent_id}</p>}
                            {parentOptions.length === 0 && (
                                <p className="mt-1 text-xs text-amber-600">
                                    ⚠️ Belum ada data {TIPE_LABEL[parentTipe]}. Tambahkan dulu.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Nama */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                            Nama <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.nama}
                            onChange={e => setData('nama', e.target.value)}
                            placeholder={data.tipe === 'desa' ? 'Desa Cirangkong' : data.tipe === 'dusun' ? 'Dusun I' : data.tipe === 'rw' ? 'RW 001' : 'RT 001'}
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        {errors.nama && <p className="mt-1 text-xs text-red-500">{errors.nama}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">
                            Batal
                        </button>
                        <button type="submit" disabled={processing}
                            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60">
                            {processing ? 'Menyimpan...' : mode === 'create' ? 'Simpan' : 'Perbarui'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Modal Kategori ───────────────────────────────────────────────────────────

function KategoriModal({
    mode, item, onClose,
}: {
    mode: 'create' | 'edit';
    item?: KategoriItem;
    onClose: () => void;
}) {
    const { data, setData, post, patch, processing, errors } = useForm({
        nama_kategori: item?.nama_kategori ?? '',
        deskripsi:     item?.deskripsi     ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'create') {
            post('/admin/kategori-aduan', { onSuccess: onClose });
        } else {
            patch(`/admin/kategori-aduan/${item!.id}`, { onSuccess: onClose });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-background shadow-xl">
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h3 className="font-semibold text-foreground">
                        {mode === 'create' ? 'Tambah Kategori' : 'Edit Kategori'}
                    </h3>
                    <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={submit} className="space-y-4 p-6">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                            Nama Kategori <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.nama_kategori}
                            onChange={e => setData('nama_kategori', e.target.value)}
                            placeholder="mis. Infrastruktur"
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        {errors.nama_kategori && <p className="mt-1 text-xs text-red-500">{errors.nama_kategori}</p>}
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-foreground">
                            Deskripsi <span className="font-normal text-muted-foreground">(opsional)</span>
                        </label>
                        <textarea
                            value={data.deskripsi}
                            onChange={e => setData('deskripsi', e.target.value)}
                            rows={3}
                            placeholder="Penjelasan singkat kategori ini..."
                            className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        {errors.deskripsi && <p className="mt-1 text-xs text-red-500">{errors.deskripsi}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">
                            Batal
                        </button>
                        <button type="submit" disabled={processing}
                            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60">
                            {processing ? 'Menyimpan...' : mode === 'create' ? 'Simpan' : 'Perbarui'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({
    label, url, blocked, blockedMsg, onClose,
}: {
    label: string; url: string; blocked?: boolean; blockedMsg?: string; onClose: () => void;
}) {
    const [processing, setProcessing] = useState(false);
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-xl bg-background p-6 shadow-xl">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="mb-1 font-semibold text-foreground">Hapus Data</h3>
                <p className="text-sm text-muted-foreground">
                    Yakin ingin menghapus <strong className="text-foreground">"{label}"</strong>?
                </p>
                {blocked && blockedMsg && (
                    <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                        ⚠️ {blockedMsg}
                    </p>
                )}
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose}
                        className="rounded-lg border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">
                        Batal
                    </button>
                    <button
                        disabled={processing || blocked}
                        onClick={() => {
                            setProcessing(true);
                            router.delete(url, { onFinish: () => { setProcessing(false); onClose(); } });
                        }}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40">
                        {processing ? 'Menghapus...' : 'Hapus'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type ActiveTab = 'wilayah' | 'kategori';

export default function DataMaster({ wilayah, semua, kategori }: Props) {
    const [tab, setTab] = useState<ActiveTab>('wilayah');

    // Wilayah modal state
    const [wilayahModal, setWilayahModal] = useState<{ mode: 'create' | 'edit'; item?: WilayahItem } | null>(null);
    const [wilayahDel, setWilayahDel] = useState<WilayahItem | null>(null);

    // Kategori modal state
    const [kategoriModal, setKategoriModal] = useState<{ mode: 'create' | 'edit'; item?: KategoriItem } | null>(null);
    const [kategoriDel, setKategoriDel] = useState<KategoriItem | null>(null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Master | SADESA" />

            <div className="flex flex-col gap-6 p-4">

                {/* Header */}
                <div>
                    <h1 className="text-xl font-bold text-foreground">Data Master</h1>
                    <p className="text-sm text-muted-foreground">Kelola wilayah desa dan kategori pengaduan</p>
                </div>

                {/* Tab */}
                <div className="flex gap-1 rounded-lg border bg-muted/30 p-1 w-fit">
                    {([['wilayah', 'Wilayah', MapPin], ['kategori', 'Kategori Aduan', Tag]] as const).map(([key, label, Icon]) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                                tab === key
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </button>
                    ))}
                </div>

                {/* ── Tab: Wilayah ───────────────────────────────────────────────── */}
                {tab === 'wilayah' && (
                    <div className="rounded-xl border bg-card shadow-sm">
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <p className="text-sm text-muted-foreground">
                                Total <strong className="text-foreground">{wilayah.length}</strong> wilayah
                            </p>
                            <button
                                onClick={() => setWilayahModal({ mode: 'create' })}
                                className="flex items-center gap-2 rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700"
                            >
                                <Plus className="h-4 w-4" /> Tambah
                            </button>
                        </div>

                        {wilayah.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
                                <MapPin className="h-12 w-12 opacity-30" />
                                <p className="text-sm">Belum ada data wilayah</p>
                                <button onClick={() => setWilayahModal({ mode: 'create' })}
                                    className="text-sm text-teal-600 hover:underline">
                                    Tambah sekarang
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/30 text-left">
                                            <th className="px-6 py-3 font-medium text-muted-foreground">Nama</th>
                                            <th className="px-6 py-3 font-medium text-muted-foreground">Tipe</th>
                                            <th className="px-6 py-3 font-medium text-muted-foreground">Induk</th>
                                            <th className="px-6 py-3 font-medium text-muted-foreground">Pengguna</th>
                                            <th className="px-6 py-3 font-medium text-muted-foreground">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {wilayah.map(w => (
                                            <tr key={w.id} className="border-b last:border-0 hover:bg-muted/20">
                                                <td className={`px-6 py-3 font-medium text-foreground ${TIPE_INDENT[w.tipe]}`}>
                                                    {w.tipe !== 'desa' && (
                                                        <span className="mr-1 text-muted-foreground">└</span>
                                                    )}
                                                    {w.nama}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TIPE_COLOR[w.tipe]}`}>
                                                        {TIPE_LABEL[w.tipe]}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-muted-foreground">
                                                    {w.parent ? (
                                                        <span className="flex items-center gap-1">
                                                            <span className={`rounded px-1.5 py-0.5 text-xs ${TIPE_COLOR[w.parent.tipe]}`}>
                                                                {TIPE_LABEL[w.parent.tipe]}
                                                            </span>
                                                            {w.parent.nama}
                                                        </span>
                                                    ) : '—'}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                        {w.users_count}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => setWilayahModal({ mode: 'edit', item: w })}
                                                            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => setWilayahDel(w)}
                                                            className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600">
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
                    </div>
                )}

                {/* ── Tab: Kategori Aduan ─────────────────────────────────────────── */}
                {tab === 'kategori' && (
                    <div className="rounded-xl border bg-card shadow-sm">
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <p className="text-sm text-muted-foreground">
                                Total <strong className="text-foreground">{kategori.length}</strong> kategori
                            </p>
                            <button
                                onClick={() => setKategoriModal({ mode: 'create' })}
                                className="flex items-center gap-2 rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700"
                            >
                                <Plus className="h-4 w-4" /> Tambah
                            </button>
                        </div>

                        {kategori.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
                                <Tag className="h-12 w-12 opacity-30" />
                                <p className="text-sm">Belum ada kategori</p>
                                <button onClick={() => setKategoriModal({ mode: 'create' })}
                                    className="text-sm text-teal-600 hover:underline">
                                    Tambah sekarang
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/30 text-left">
                                            <th className="px-6 py-3 font-medium text-muted-foreground">Nama Kategori</th>
                                            <th className="px-6 py-3 font-medium text-muted-foreground">Deskripsi</th>
                                            <th className="px-6 py-3 font-medium text-muted-foreground">Pengaduan</th>
                                            <th className="px-6 py-3 font-medium text-muted-foreground">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {kategori.map(k => (
                                            <tr key={k.id} className="border-b last:border-0 hover:bg-muted/20">
                                                <td className="px-6 py-3 font-medium text-foreground">{k.nama_kategori}</td>
                                                <td className="max-w-xs px-6 py-3 text-muted-foreground">
                                                    {k.deskripsi
                                                        ? <span className="line-clamp-2">{k.deskripsi}</span>
                                                        : <span className="italic">—</span>
                                                    }
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                        {k.pengaduan_count}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => setKategoriModal({ mode: 'edit', item: k })}
                                                            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                        <button onClick={() => setKategoriDel(k)}
                                                            className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600">
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
                    </div>
                )}
            </div>

            {/* ── Modals ──────────────────────────────────────────────────────── */}
            {wilayahModal && (
                <WilayahModal
                    mode={wilayahModal.mode}
                    item={wilayahModal.item}
                    allWilayah={semua}
                    onClose={() => setWilayahModal(null)}
                />
            )}
            {wilayahDel && (
                <DeleteConfirm
                    label={wilayahDel.nama}
                    url={`/admin/wilayah/${wilayahDel.id}`}
                    blocked={wilayahDel.users_count > 0}
                    blockedMsg={wilayahDel.users_count > 0
                        ? `Ada ${wilayahDel.users_count} pengguna terdaftar di wilayah ini.`
                        : undefined}
                    onClose={() => setWilayahDel(null)}
                />
            )}
            {kategoriModal && (
                <KategoriModal
                    mode={kategoriModal.mode}
                    item={kategoriModal.item}
                    onClose={() => setKategoriModal(null)}
                />
            )}
            {kategoriDel && (
                <DeleteConfirm
                    label={kategoriDel.nama_kategori}
                    url={`/admin/kategori-aduan/${kategoriDel.id}`}
                    blocked={kategoriDel.pengaduan_count > 0}
                    blockedMsg={kategoriDel.pengaduan_count > 0
                        ? `Ada ${kategoriDel.pengaduan_count} pengaduan menggunakan kategori ini.`
                        : undefined}
                    onClose={() => setKategoriDel(null)}
                />
            )}
        </AppLayout>
    );
}
