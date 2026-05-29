import { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    ArrowLeft, FileText, User, Eye, CheckCircle,
    Clock, Printer, BookOpen,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Dokumen {
    id: number;
    nama_file: string;
    path_file: string;
    jenis_dokumen: string;
    created_at: string;
}

interface Penduduk {
    nik: string;
    nama: string;
    tempat_lahir: string | null;
    tanggal_lahir: string | null;
    jenis_kelamin: 'L' | 'P';
    agama: string | null;
    status_perkawinan: string | null;
    pekerjaan: string | null;
    alamat: string | null;
    no_kk: string | null;
}

interface PengajuanDetail {
    id: number;
    no_pengajuan: string;
    status: string;
    catatan: string | null;
    data_formulir: Record<string, string> | null;
    created_at: string;
    updated_at: string;
    user: { id: number; name: string; nik: string | null; email: string; phone: string | null } | null;
    master_surat: { id: number; nama_surat: string; kode: string; persyaratan: string[] | null } | null;
    dokumen_persyaratan: Dokumen[];
    verifikasi_berkas: { status: string; catatan: string | null; staff: { name: string } | null; created_at: string } | null;
    pengesahan_permohonan: { catatan: string | null; kepala_desa: { name: string } | null; created_at: string } | null;
    surat_output: { id: number; no_surat: string; path_file: string; tanggal_surat: string; created_at: string } | null;
}

interface Props { pengajuan: PengajuanDetail; penduduk: Penduduk | null }

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
    menunggu:            'Menunggu',
    diproses:            'Diproses',
    diverifikasi:        'Diverifikasi',
    ditolak_staff:       'Ditolak',
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
    ditolak_staff:       'bg-red-100 text-red-700',
    menunggu_pengesahan: 'bg-violet-100 text-violet-700',
    disetujui:           'bg-orange-100 text-orange-700',
    ditolak_kepala:      'bg-red-100 text-red-700',
    siap_diambil:        'bg-teal-100 text-teal-700',
    selesai:             'bg-green-100 text-green-700',
    dibatalkan:          'bg-gray-100 text-gray-500',
};

const STATUS_PERKAWINAN: Record<string, string> = {
    belum_kawin: 'Belum Kawin',
    kawin:       'Kawin',
    cerai_hidup: 'Cerai Hidup',
    cerai_mati:  'Cerai Mati',
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
    { title: 'Antrian Pengajuan', href: '/staff/pengajuan' },
    { title: 'Detail', href: '#' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid grid-cols-5 gap-2 border-b py-2 last:border-0">
            <dt className="col-span-2 text-xs text-muted-foreground self-start pt-0.5">{label}</dt>
            <dd className="col-span-3 text-sm font-medium text-foreground">{value ?? '—'}</dd>
        </div>
    );
}

function isPdf(path: string) {
    return path.toLowerCase().endsWith('.pdf');
}

// ─── Panel Kiri: Dokumen Persyaratan + Viewer ─────────────────────────────────

function PanelDokumen({ dokumen }: { dokumen: Dokumen[] }) {
    const [selected, setSelected] = useState<Dokumen | null>(dokumen[0] ?? null);

    if (dokumen.length === 0) {
        return (
            <div className="flex h-full items-center justify-center rounded-xl border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
                <div>
                    <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                    Belum ada dokumen diunggah.
                </div>
            </div>
        );
    }

    const fileUrl = selected ? `/storage/${selected.path_file}` : null;

    return (
        <div className="flex h-full flex-col gap-3">
            {/* Daftar dokumen */}
            <div className="flex gap-2 flex-wrap">
                {dokumen.map(dok => (
                    <button
                        key={dok.id}
                        onClick={() => setSelected(dok)}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                            selected?.id === dok.id
                                ? 'border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                                : 'bg-card text-foreground hover:bg-muted'
                        }`}
                    >
                        <span>{isPdf(dok.path_file) ? '📄' : '🖼️'}</span>
                        <span className="max-w-[140px] truncate">{dok.jenis_dokumen}</span>
                    </button>
                ))}
            </div>

            {/* Viewer */}
            {selected && fileUrl && (
                <div className="flex flex-1 flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
                    <div className="flex items-center justify-between border-b px-4 py-2">
                        <span className="truncate text-xs font-medium text-foreground">{selected.nama_file}</span>
                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener"
                            className="ml-2 shrink-0 rounded-md border px-2.5 py-1 text-xs hover:bg-muted"
                        >
                            Buka ↗
                        </a>
                    </div>
                    {isPdf(selected.path_file) ? (
                        <iframe
                            src={fileUrl}
                            className="w-full flex-1"
                            style={{ minHeight: '420px' }}
                            title={selected.nama_file}
                        />
                    ) : (
                        <div className="flex flex-1 items-center justify-center overflow-auto p-4">
                            <img
                                src={fileUrl}
                                alt={selected.nama_file}
                                className="max-h-[420px] max-w-full rounded-lg object-contain shadow"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Panel Kanan: Identitas Warga ─────────────────────────────────────────────

function PanelIdentitas({
    user,
    penduduk,
    dataFormulir,
    masterSurat,
}: {
    user: PengajuanDetail['user'];
    penduduk: Penduduk | null;
    dataFormulir: Record<string, string> | null;
    masterSurat: PengajuanDetail['master_surat'];
}) {
    return (
        <div className="flex flex-col gap-4 overflow-y-auto">
            {/* Identitas akun */}
            <div className="rounded-xl border bg-card p-4 shadow-sm">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <User className="h-4 w-4" /> Akun Warga
                </h4>
                <dl>
                    <InfoRow label="Nama" value={user?.name} />
                    <InfoRow label="NIK" value={<span className="font-mono text-xs">{user?.nik}</span>} />
                    <InfoRow label="Email" value={user?.email} />
                    <InfoRow label="Telepon" value={user?.phone} />
                </dl>
            </div>

            {/* Data kependudukan */}
            {penduduk ? (
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <BookOpen className="h-4 w-4" /> Data Kependudukan
                    </h4>
                    <dl>
                        <InfoRow label="Tempat Lahir" value={penduduk.tempat_lahir} />
                        <InfoRow
                            label="Tanggal Lahir"
                            value={penduduk.tanggal_lahir
                                ? new Date(penduduk.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                                : null}
                        />
                        <InfoRow label="Jenis Kelamin" value={penduduk.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'} />
                        <InfoRow label="Agama" value={penduduk.agama ? penduduk.agama.charAt(0).toUpperCase() + penduduk.agama.slice(1) : null} />
                        <InfoRow label="Status Kawin" value={penduduk.status_perkawinan ? STATUS_PERKAWINAN[penduduk.status_perkawinan] : null} />
                        <InfoRow label="Pekerjaan" value={penduduk.pekerjaan} />
                        <InfoRow label="No. KK" value={<span className="font-mono text-xs">{penduduk.no_kk}</span>} />
                        <InfoRow label="Alamat" value={penduduk.alamat} />
                    </dl>
                </div>
            ) : (
                <div className="rounded-xl border border-dashed bg-muted/30 p-4 text-center text-xs text-muted-foreground">
                    Data kependudukan belum tersedia
                </div>
            )}

            {/* Data formulir pengajuan */}
            {dataFormulir && Object.keys(dataFormulir).length > 0 && (
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                    <h4 className="mb-3 text-sm font-semibold text-foreground">
                        Jenis: {masterSurat?.kode} — {masterSurat?.nama_surat}
                    </h4>
                    <dl>
                        {Object.entries(dataFormulir).map(([key, val]) => (
                            <InfoRow
                                key={key}
                                label={key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                value={val}
                            />
                        ))}
                    </dl>
                </div>
            )}
        </div>
    );
}

// ─── Preview Surat Iframe ─────────────────────────────────────────────────────

function PreviewSurat({ pengajuanId }: { pengajuanId: number }) {
    const [show, setShow] = useState(false);

    return (
        <div className="rounded-xl border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b px-5 py-3">
                <h3 className="flex items-center gap-2 font-semibold text-foreground">
                    <Eye className="h-4 w-4 text-teal-600" />
                    Preview Draft Surat
                </h3>
                <button
                    onClick={() => setShow(v => !v)}
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                >
                    {show ? 'Tutup' : 'Tampilkan Preview'}
                </button>
            </div>
            {show && (
                <iframe
                    src={`/staff/pengajuan/${pengajuanId}/preview-surat`}
                    className="w-full rounded-b-xl"
                    style={{ height: '700px', border: 'none' }}
                    title="Preview Draft Surat"
                />
            )}
        </div>
    );
}

// ─── Form Verifikasi ──────────────────────────────────────────────────────────

function FormVerifikasi({ pengajuanId }: { pengajuanId: number }) {
    const form = useForm({ action: 'setujui', catatan: '' });

    const submit = (action: 'setujui' | 'tolak') => {
        form.setData('action', action);
        setTimeout(() => form.patch(`/staff/pengajuan/${pengajuanId}/verifikasi`), 0);
    };

    return (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h4 className="mb-4 font-semibold text-foreground">Tindakan Verifikasi</h4>
            <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium">
                    Catatan <span className="text-xs text-muted-foreground">(opsional)</span>
                </label>
                <textarea
                    value={form.data.catatan}
                    onChange={e => form.setData('catatan', e.target.value)}
                    rows={4}
                    placeholder="Catatan untuk pemohon…"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                {form.errors.catatan && <p className="mt-1 text-xs text-red-500">{form.errors.catatan}</p>}
            </div>
            <div className="flex gap-3">
                <button
                    type="button"
                    disabled={form.processing}
                    onClick={() => submit('setujui')}
                    className="flex-1 rounded-lg bg-teal-600 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
                >
                    ✓ Verifikasi & Teruskan ke Kades
                </button>
                <button
                    type="button"
                    disabled={form.processing}
                    onClick={() => submit('tolak')}
                    className="flex-1 rounded-lg border border-red-300 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                    ✕ Tolak
                </button>
            </div>
            {form.errors.action && <p className="mt-2 text-xs text-red-500">{form.errors.action}</p>}
        </div>
    );
}

// ─── Panel Siap Diambil ───────────────────────────────────────────────────────

function PanelSiapDiambil({ pengajuan }: { pengajuan: PengajuanDetail }) {
    const form = useForm<{ status?: string }>({});
    const [konfirmasi, setKonfirmasi] = useState(false);

    return (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-5 dark:border-orange-800 dark:bg-orange-900/20">
            <h4 className="mb-1 flex items-center gap-2 font-semibold text-orange-800 dark:text-orange-300">
                <Printer className="h-4 w-4" />
                Surat Siap Dicetak
            </h4>
            <p className="mb-4 text-xs text-orange-700 dark:text-orange-400">
                Surat sudah disahkan Kepala Desa. Unduh, cetak, dan serahkan untuk ditandatangani.
                Setelah TTD fisik selesai, klik tombol di bawah.
            </p>

            {/* Nomor surat */}
            {pengajuan.surat_output && (
                <div className="mb-4 rounded-lg bg-white/70 p-3 text-sm dark:bg-background/30">
                    <p className="text-xs text-muted-foreground">Nomor Surat</p>
                    <p className="font-mono font-semibold">{pengajuan.surat_output.no_surat}</p>
                </div>
            )}

            {/* Tombol download */}
            <a
                href={`/staff/pengajuan/${pengajuan.id}/download-surat`}
                target="_blank"
                rel="noopener"
                className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-orange-400 py-2 text-sm font-medium text-orange-700 hover:bg-orange-100 dark:text-orange-300"
            >
                ⬇ Unduh / Cetak PDF
            </a>

            {/* Konfirmasi siap diambil */}
            {!konfirmasi ? (
                <button
                    type="button"
                    onClick={() => setKonfirmasi(true)}
                    className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
                >
                    Tandai Siap Diambil Warga
                </button>
            ) : (
                <div className="space-y-2">
                    <p className="text-center text-xs font-medium text-orange-800 dark:text-orange-300">
                        Pastikan TTD fisik sudah selesai sebelum konfirmasi.
                    </p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setKonfirmasi(false)}
                            className="flex-1 rounded-lg border py-2 text-sm text-muted-foreground hover:bg-muted"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            disabled={form.processing}
                            onClick={() => form.patch(`/staff/pengajuan/${pengajuan.id}/siap-diambil`)}
                            className="flex-1 rounded-lg bg-teal-600 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
                        >
                            {form.processing ? 'Menyimpan…' : '✓ Konfirmasi'}
                        </button>
                    </div>
                </div>
            )}

            {form.errors.status && <p className="mt-2 text-xs text-red-500">{form.errors.status}</p>}
        </div>
    );
}

// ─── Panel Selesai ────────────────────────────────────────────────────────────

function PanelSelesai({ pengajuanId }: { pengajuanId: number }) {
    const form  = useForm<{ status?: string }>({});
    const [ok, setOk] = useState(false);

    return (
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-5 dark:border-teal-800 dark:bg-teal-900/20">
            <h4 className="mb-1 flex items-center gap-2 font-semibold text-teal-800 dark:text-teal-300">
                <CheckCircle className="h-4 w-4" />
                Surat Siap Diambil
            </h4>
            <p className="mb-4 text-xs text-teal-700 dark:text-teal-400">
                Warga sudah dinotifikasi. Setelah warga mengambil surat, klik konfirmasi di bawah.
            </p>

            {!ok ? (
                <button
                    type="button"
                    onClick={() => setOk(true)}
                    className="w-full rounded-lg bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
                >
                    Konfirmasi Surat Sudah Diambil
                </button>
            ) : (
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setOk(false)}
                        className="flex-1 rounded-lg border py-2 text-sm text-muted-foreground hover:bg-muted"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        disabled={form.processing}
                        onClick={() => form.patch(`/staff/pengajuan/${pengajuanId}/selesai`)}
                        className="flex-1 rounded-lg bg-teal-600 py-2 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
                    >
                        {form.processing ? 'Menyimpan…' : '✓ Selesai'}
                    </button>
                </div>
            )}
            {form.errors.status && <p className="mt-2 text-xs text-red-500">{form.errors.status}</p>}
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function StaffPengajuanDetail({ pengajuan, penduduk }: Props) {
    const cfg   = STATUS_COLOR[pengajuan.status] ?? 'bg-muted text-muted-foreground';
    const label = STATUS_LABEL[pengajuan.status] ?? pengajuan.status;

    const bisaDiVerifikasi = ['menunggu', 'diproses'].includes(pengajuan.status);
    const bisaCetak        = pengajuan.status === 'disetujui' && !!pengajuan.surat_output;
    const bisaSelesai      = pengajuan.status === 'siap_diambil';
    const sudahSelesai     = pengajuan.status === 'selesai';
    const adaPreview       = ['menunggu_pengesahan', 'disetujui', 'siap_diambil', 'selesai'].includes(pengajuan.status);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Verifikasi ${pengajuan.no_pengajuan} | SADESA`} />

            <div className="flex flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link href="/staff/pengajuan" className="rounded-lg border p-2 hover:bg-muted">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-foreground">{pengajuan.no_pengajuan}</h1>
                        <div className="mt-0.5 flex items-center gap-2">
                            <span className={`inline-flex rounded-full px-3 py-0.5 text-xs font-semibold ${cfg}`}>
                                {label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {pengajuan.master_surat?.kode} — {pengajuan.master_surat?.nama_surat}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Layout utama ── */}
                <div className="grid gap-6 xl:grid-cols-3">

                    {/* Kiri (2/3): Split screen + preview */}
                    <div className="space-y-5 xl:col-span-2">

                        {/* Split screen: Dokumen | Identitas */}
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Panel dokumen */}
                            <div className="flex flex-col gap-2">
                                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                                    <FileText className="h-4 w-4" /> Dokumen Persyaratan
                                </h3>
                                <PanelDokumen dokumen={pengajuan.dokumen_persyaratan ?? []} />
                            </div>

                            {/* Panel identitas */}
                            <div className="flex flex-col gap-2">
                                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                                    <User className="h-4 w-4" /> Identitas Pemohon
                                </h3>
                                <PanelIdentitas
                                    user={pengajuan.user}
                                    penduduk={penduduk}
                                    dataFormulir={pengajuan.data_formulir}
                                    masterSurat={pengajuan.master_surat}
                                />
                            </div>
                        </div>

                        {/* Preview draft surat */}
                        {adaPreview && <PreviewSurat pengajuanId={pengajuan.id} />}
                    </div>

                    {/* Kanan (1/3): Sidebar aksi */}
                    <div className="space-y-4">

                        {/* Verifikasi */}
                        {bisaDiVerifikasi && (
                            <FormVerifikasi pengajuanId={pengajuan.id} />
                        )}

                        {/* Siap diambil — surat sudah digenerate, tinggal cetak */}
                        {bisaCetak && (
                            <PanelSiapDiambil pengajuan={pengajuan} />
                        )}

                        {/* Konfirmasi sudah diambil warga */}
                        {bisaSelesai && (
                            <PanelSelesai pengajuanId={pengajuan.id} />
                        )}

                        {/* Sudah selesai */}
                        {sudahSelesai && (
                            <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-center dark:border-green-800 dark:bg-green-900/20">
                                <CheckCircle className="mx-auto mb-2 h-6 w-6 text-green-600" />
                                <p className="text-sm font-semibold text-green-800 dark:text-green-300">Pengajuan Selesai</p>
                                <p className="mt-1 text-xs text-green-700 dark:text-green-400">
                                    Surat sudah diambil oleh warga.
                                </p>
                            </div>
                        )}

                        {/* Ditolak */}
                        {(pengajuan.status === 'ditolak_staff' || pengajuan.status === 'ditolak_kepala') && (
                            <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-800 dark:bg-red-900/20">
                                <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                                    {pengajuan.status === 'ditolak_staff' ? 'Ditolak oleh Petugas' : 'Ditolak oleh Kepala Desa'}
                                </p>
                                {pengajuan.catatan && (
                                    <p className="mt-1.5 rounded-lg bg-white/60 p-2 text-xs text-red-700 dark:bg-background/30 dark:text-red-300">
                                        {pengajuan.catatan}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Riwayat proses */}
                        <div className="rounded-xl border bg-card p-5 shadow-sm">
                            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                                <Clock className="h-4 w-4" /> Riwayat Proses
                            </h4>
                            <ol className="space-y-3 text-xs">
                                <li className="flex gap-3">
                                    <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-blue-500 ring-2 ring-blue-200" />
                                    <div>
                                        <p className="font-medium text-foreground">Pengajuan masuk</p>
                                        <p className="text-muted-foreground">
                                            {new Date(pengajuan.created_at).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                </li>
                                {pengajuan.verifikasi_berkas && (
                                    <li className="flex gap-3">
                                        <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ring-2 ${
                                            pengajuan.verifikasi_berkas.status === 'disetujui'
                                                ? 'bg-teal-500 ring-teal-200'
                                                : 'bg-red-500 ring-red-200'
                                        }`} />
                                        <div>
                                            <p className="font-medium text-foreground">
                                                Verifikasi — {pengajuan.verifikasi_berkas.status === 'disetujui' ? 'Disetujui' : 'Ditolak'}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {pengajuan.verifikasi_berkas.staff?.name} ·{' '}
                                                {new Date(pengajuan.verifikasi_berkas.created_at).toLocaleString('id-ID')}
                                            </p>
                                            {pengajuan.verifikasi_berkas.catatan && (
                                                <p className="mt-0.5 text-muted-foreground italic">{pengajuan.verifikasi_berkas.catatan}</p>
                                            )}
                                        </div>
                                    </li>
                                )}
                                {pengajuan.pengesahan_permohonan && (
                                    <li className="flex gap-3">
                                        <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-purple-500 ring-2 ring-purple-200" />
                                        <div>
                                            <p className="font-medium text-foreground">Disahkan Kepala Desa</p>
                                            <p className="text-muted-foreground">
                                                {pengajuan.pengesahan_permohonan.kepala_desa?.name} ·{' '}
                                                {new Date(pengajuan.pengesahan_permohonan.created_at).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </li>
                                )}
                                {pengajuan.surat_output && (
                                    <li className="flex gap-3">
                                        <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-orange-500 ring-2 ring-orange-200" />
                                        <div>
                                            <p className="font-medium text-foreground">Surat digenerate</p>
                                            <p className="font-mono text-muted-foreground">{pengajuan.surat_output.no_surat}</p>
                                        </div>
                                    </li>
                                )}
                                {(pengajuan.status === 'siap_diambil' || pengajuan.status === 'selesai') && (
                                    <li className="flex gap-3">
                                        <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-teal-500 ring-2 ring-teal-200" />
                                        <div>
                                            <p className="font-medium text-foreground">
                                                {pengajuan.status === 'selesai' ? 'Diambil oleh warga' : 'Siap diambil'}
                                            </p>
                                        </div>
                                    </li>
                                )}
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
