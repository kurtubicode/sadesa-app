import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, MessageSquare, XCircle } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Tanggapan {
    id: number;
    isi_tanggapan: string;
    created_at: string;
    user: { name: string; role: string } | null;
}

interface PengaduanDetail {
    id: number;
    judul: string;
    deskripsi: string;
    status: string;
    created_at: string;
    user?: { id: number; name: string; nik: string | null; phone: string | null } | null;
    kategori?: { id: number; nama_kategori: string } | null;
    bukti?: { id: number; path_file: string }[];
    tanggapan?: Tanggapan[];
}

interface Props { pengaduan: PengaduanDetail }

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
    menunggu: 'bg-amber-100 text-amber-700',
    diproses: 'bg-blue-100 text-blue-700',
    selesai:  'bg-green-100 text-green-700',
    ditolak:  'bg-red-100 text-red-700',
};
const STATUS_LABEL: Record<string, string> = {
    menunggu: 'Menunggu', diproses: 'Diproses', selesai: 'Selesai', ditolak: 'Ditolak',
};
const ROLE_LABEL: Record<string, string> = {
    admin: 'Admin', staff: 'Staff', kepala_desa: 'Kepala Desa', warga: 'Warga',
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
    { title: 'Pengaduan', href: '/staff/pengaduan' },
    { title: 'Detail', href: '#' },
];

// ─── Form Tanggapi ────────────────────────────────────────────────────────────

function FormTanggapi({ pengaduanId }: { pengaduanId: number }) {
    const { data, setData, post, processing, reset, errors } = useForm({ isi_tanggapan: '' });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/staff/pengaduan/${pengaduanId}/tanggapi`, { onSuccess: () => reset() });
    };

    return (
        <form onSubmit={submit} className="space-y-3">
            <textarea
                value={data.isi_tanggapan}
                onChange={e => setData('isi_tanggapan', e.target.value)}
                rows={3}
                placeholder="Tulis tanggapan..."
                className="w-full resize-y rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            {errors.isi_tanggapan && <p className="text-xs text-red-500">{errors.isi_tanggapan}</p>}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={processing || !data.isi_tanggapan.trim()}
                    className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
                >
                    <MessageSquare className="h-4 w-4" />
                    {processing ? 'Mengirim...' : 'Kirim Tanggapan'}
                </button>
            </div>
        </form>
    );
}

// ─── Form Ubah Status ─────────────────────────────────────────────────────────

function FormUbahStatus({ pengaduanId, currentStatus }: { pengaduanId: number; currentStatus: string }) {
    const [open, setOpen] = useState(false);
    const { data, setData, patch, processing, reset } = useForm({
        status: currentStatus,
        catatan: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/staff/pengaduan/${pengaduanId}/status`, {
            onSuccess: () => { reset(); setOpen(false); },
        });
    };

    // Staff hanya bisa ubah ke diproses, selesai, ditolak
    const allowedStatuses: Record<string, string> = {
        diproses: 'Diproses',
        selesai: 'Selesai',
        ditolak: 'Ditolak',
    };

    return (
        <div>
            <button
                onClick={() => setOpen(v => !v)}
                className="w-full rounded-lg border border-dashed px-4 py-2 text-sm text-muted-foreground hover:border-teal-400 hover:text-teal-600"
            >
                {open ? '↑ Tutup' : '↓ Ubah Status Pengaduan'}
            </button>

            {open && (
                <form onSubmit={submit} className="mt-3 space-y-3 rounded-lg border bg-muted/30 p-4">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-foreground">Status Baru</label>
                        <select
                            value={data.status}
                            onChange={e => setData('status', e.target.value)}
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                            {Object.entries(allowedStatuses).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-foreground">
                            Catatan <span className="font-normal text-muted-foreground">(opsional)</span>
                        </label>
                        <textarea
                            value={data.catatan}
                            onChange={e => setData('catatan', e.target.value)}
                            rows={2}
                            placeholder="Alasan perubahan status..."
                            className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setOpen(false)}
                            className="rounded-lg border px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted">
                            Batal
                        </button>
                        <button type="submit" disabled={processing || data.status === currentStatus}
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function StaffPengaduanDetail({ pengaduan }: Props) {
    const cfg = STATUS_COLOR[pengaduan.status] ?? 'bg-muted text-muted-foreground';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tangani Pengaduan | SADESA" />

            <div className="flex flex-col gap-6 p-4">

                {/* Back + Title */}
                <div className="flex items-start gap-3">
                    <Link href="/staff/pengaduan" className="mt-0.5 rounded-lg border p-2 hover:bg-muted">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-foreground">{pengaduan.judul}</h1>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className={`inline-flex rounded-full px-3 py-0.5 text-xs font-medium ${cfg}`}>
                                {STATUS_LABEL[pengaduan.status] ?? pengaduan.status}
                            </span>
                            {pengaduan.kategori && (
                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                    {pengaduan.kategori.nama_kategori}
                                </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                                {new Date(pengaduan.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">

                    {/* Kiri: konten */}
                    <div className="col-span-2 space-y-6">

                        {/* Deskripsi */}
                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <h3 className="mb-3 font-semibold text-foreground">Isi Pengaduan</h3>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                                {pengaduan.deskripsi}
                            </p>
                        </div>

                        {/* Foto Bukti */}
                        {pengaduan.bukti && pengaduan.bukti.length > 0 && (
                            <div className="rounded-xl border bg-card p-6 shadow-sm">
                                <h3 className="mb-3 font-semibold text-foreground">
                                    Foto Bukti ({pengaduan.bukti.length})
                                </h3>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {pengaduan.bukti.map(b => (
                                        <a key={b.id} href={`/storage/${b.path_file}`} target="_blank" rel="noopener">
                                            <img
                                                src={`/storage/${b.path_file}`}
                                                alt="bukti"
                                                className="h-36 w-full rounded-lg border object-cover transition-opacity hover:opacity-90"
                                            />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tanggapan */}
                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                                <MessageSquare className="h-4 w-4" />
                                Tanggapan ({pengaduan.tanggapan?.length ?? 0})
                            </h3>

                            {(!pengaduan.tanggapan || pengaduan.tanggapan.length === 0) ? (
                                <p className="mb-4 text-sm text-muted-foreground">Belum ada tanggapan.</p>
                            ) : (
                                <div className="mb-4 space-y-3">
                                    {pengaduan.tanggapan.map(t => {
                                        const isOfficer = t.user?.role !== 'warga';
                                        const isSystem = t.isi_tanggapan?.startsWith('[Status');
                                        return (
                                            <div key={t.id} className={`rounded-lg p-3 ${
                                                isSystem
                                                    ? 'border border-dashed bg-muted/50'
                                                    : isOfficer
                                                        ? 'bg-teal-50 dark:bg-teal-900/10'
                                                        : 'bg-muted/40'
                                            }`}>
                                                <div className="mb-1 flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-sm font-medium text-foreground">
                                                            {t.user?.name ?? '—'}
                                                        </span>
                                                        {t.user && (
                                                            <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                                                                {ROLE_LABEL[t.user.role] ?? t.user.role}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="shrink-0 text-xs text-muted-foreground">
                                                        {new Date(t.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                                                    </span>
                                                </div>
                                                <p className={`text-sm ${isSystem ? 'italic text-muted-foreground' : 'text-foreground'}`}>
                                                    {t.isi_tanggapan}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="border-t pt-4">
                                <p className="mb-2 text-xs font-medium text-muted-foreground">Kirim Tanggapan</p>
                                <FormTanggapi pengaduanId={pengaduan.id} />
                            </div>
                        </div>
                    </div>

                    {/* Kanan: sidebar */}
                    <div className="space-y-4">

                        {/* Data Pelapor */}
                        <div className="rounded-xl border bg-card p-5 shadow-sm">
                            <h4 className="mb-3 font-semibold text-foreground">Data Pelapor</h4>
                            <dl className="space-y-3">
                                {([
                                    ['Nama', pengaduan.user?.name],
                                    ['NIK', pengaduan.user?.nik],
                                    ['Telepon', pengaduan.user?.phone],
                                ] as [string, string | null | undefined][]).map(([label, value]) => (
                                    <div key={label}>
                                        <dt className="text-xs text-muted-foreground">{label}</dt>
                                        <dd className="mt-0.5 text-sm font-medium text-foreground">{value ?? '—'}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>

                        {/* Status */}
                        <div className="rounded-xl border bg-card p-5 shadow-sm">
                            <h4 className="mb-3 font-semibold text-foreground">Status Pengaduan</h4>
                            <div className="mb-4 flex items-center gap-2">
                                {pengaduan.status === 'selesai' ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : pengaduan.status === 'ditolak' ? (
                                    <XCircle className="h-5 w-5 text-red-500" />
                                ) : null}
                                <span className={`rounded-full px-3 py-1 text-sm font-medium ${cfg}`}>
                                    {STATUS_LABEL[pengaduan.status] ?? pengaduan.status}
                                </span>
                            </div>
                            <FormUbahStatus
                                pengaduanId={pengaduan.id}
                                currentStatus={pengaduan.status}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
