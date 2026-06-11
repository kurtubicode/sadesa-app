import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, ChevronDown, ChevronUp, Eye, FileText, User } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Dokumen {
    id: number;
    nama_file: string;
    path_file: string;
    jenis_dokumen: string;
    created_at: string;
}

interface Penduduk {
    id: number;
    nik: string;
    nama: string;
    tempat_lahir: string | null;
    tanggal_lahir: string | null;
    jenis_kelamin: 'L' | 'P' | null;
    agama: string | null;
    status_perkawinan: string | null;
    pekerjaan: string | null;
    alamat: string | null;
    no_kk: string | null;
    jenis_kelamin_label: string;
    status_perkawinan_label: string;
    agama_label: string;
}

interface PengajuanDetail {
    id: number;
    no_pengajuan: string;
    status: string;
    catatan: string | null;
    data_formulir: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
        nik: string | null;
        email: string;
        phone: string | null;
    } | null;
    master_surat?: {
        id: number;
        nama_surat: string;
        kode: string;
        persyaratan: string | null;
    } | null;
    dokumen_persyaratan?: Dokumen[];
    verifikasi_berkas?: {
        catatan: string | null;
        staff: { name: string } | null;
        created_at: string;
    } | null;
    pengesahan_permohonan?: {
        catatan: string | null;
        kepala_desa: { name: string } | null;
        created_at: string;
    } | null;
    surat_output?: {
        id: number;
        no_surat: string;
        path_file: string;
        tanggal_surat: string;
        created_at: string;
    } | null;
}

interface Props {
    pengajuan: PengajuanDetail;
    penduduk: Penduduk | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
    menunggu:            'Menunggu',
    diproses:            'Sedang Diproses',
    diverifikasi:        'Diverifikasi',
    menunggu_pengesahan: 'Menunggu Pengesahan',
    disetujui:           'Disetujui — Siap Dicetak',
    ditolak_kepala:      'Ditolak Kepala Desa',
    ditolak_staff:       'Ditolak Petugas',
    siap_diambil:        'Siap Diambil',
    selesai:             'Selesai',
    dibatalkan:          'Dibatalkan',
};

const STATUS_COLOR: Record<string, string> = {
    menunggu:            'bg-yellow-100 text-yellow-700',
    diproses:            'bg-blue-100 text-blue-700',
    diverifikasi:        'bg-purple-100 text-purple-700',
    menunggu_pengesahan: 'bg-violet-100 text-violet-700',
    disetujui:           'bg-amber-100 text-amber-700',
    ditolak_kepala:      'bg-red-100 text-red-700',
    ditolak_staff:       'bg-red-100 text-red-700',
    siap_diambil:        'bg-teal-100 text-teal-700',
    selesai:             'bg-green-100 text-green-700',
    dibatalkan:          'bg-gray-100 text-gray-600',
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
    { title: 'Pengajuan Surat', href: '/kepala-desa/pengajuan' },
    { title: 'Detail', href: '#' },
];

// ─── InfoRow ──────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid grid-cols-3 gap-2 border-b py-2.5 last:border-0">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="col-span-2 text-sm font-medium text-foreground">{value ?? '—'}</dd>
        </div>
    );
}

// ─── PanelDokumen ─────────────────────────────────────────────────────────────

function PanelDokumen({ dokumen }: { dokumen: Dokumen[] }) {
    const [selected, setSelected] = useState<Dokumen | null>(dokumen[0] ?? null);
    const isPdf = (d: Dokumen) =>
        d.path_file?.toLowerCase().endsWith('.pdf') || d.jenis_dokumen?.toLowerCase().includes('pdf');

    return (
        <div className="flex h-full flex-col rounded-xl border bg-card shadow-sm overflow-hidden">
            {/* Tab dokumen */}
            {dokumen.length > 1 && (
                <div className="flex gap-1 overflow-x-auto border-b bg-muted/40 p-2">
                    {dokumen.map(d => (
                        <button
                            key={d.id}
                            onClick={() => setSelected(d)}
                            className={`flex-shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                                selected?.id === d.id
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            {d.jenis_dokumen || d.nama_file}
                        </button>
                    ))}
                </div>
            )}

            {/* Viewer */}
            <div className="flex flex-1 flex-col" style={{ minHeight: '420px' }}>
                {!selected ? (
                    <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">
                        Tidak ada dokumen diunggah.
                    </div>
                ) : isPdf(selected) ? (
                    <iframe
                        key={selected.id}
                        src={`/storage/${selected.path_file}`}
                        title={selected.nama_file}
                        className="h-full w-full flex-1"
                        style={{ minHeight: '420px' }}
                    />
                ) : (
                    <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4">
                        <img
                            key={selected.id}
                            src={`/storage/${selected.path_file}`}
                            alt={selected.nama_file}
                            className="max-h-[380px] max-w-full rounded-lg object-contain shadow"
                        />
                    </div>
                )}
            </div>

            {/* Footer info */}
            {selected && (
                <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-2">
                    <span className="truncate text-xs text-muted-foreground">{selected.nama_file}</span>
                    <a
                        href={`/storage/${selected.path_file}`}
                        target="_blank"
                        rel="noopener"
                        className="ml-2 flex-shrink-0 rounded border px-2 py-1 text-xs hover:bg-muted"
                    >
                        Buka Baru
                    </a>
                </div>
            )}
        </div>
    );
}

// ─── PanelIdentitas ───────────────────────────────────────────────────────────

function PanelIdentitas({
    user,
    penduduk,
    masterSurat,
    dataFormulir,
}: {
    user: PengajuanDetail['user'];
    penduduk: Penduduk | null;
    masterSurat: PengajuanDetail['master_surat'];
    dataFormulir: PengajuanDetail['data_formulir'];
}) {
    return (
        <div className="space-y-4">
            {/* Akun Warga */}
            <div className="rounded-xl border bg-card p-5 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <User className="h-4 w-4" /> Akun Pemohon
                </h3>
                <dl>
                    <InfoRow label="Nama" value={user?.name} />
                    <InfoRow label="NIK" value={<span className="font-mono">{user?.nik}</span>} />
                    <InfoRow label="Email" value={user?.email} />
                    <InfoRow label="Telepon" value={user?.phone} />
                </dl>
            </div>

            {/* Data Kependudukan */}
            {penduduk ? (
                <div className="rounded-xl border bg-card p-5 shadow-sm">
                    <h3 className="mb-3 text-sm font-semibold text-foreground">Data Kependudukan</h3>
                    <dl>
                        <InfoRow label="Nama Lengkap" value={penduduk.nama} />
                        <InfoRow label="No. KK" value={<span className="font-mono">{penduduk.no_kk}</span>} />
                        <InfoRow
                            label="Tempat, Tgl Lahir"
                            value={
                                penduduk.tempat_lahir && penduduk.tanggal_lahir
                                    ? `${penduduk.tempat_lahir}, ${new Date(penduduk.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
                                    : penduduk.tempat_lahir ?? penduduk.tanggal_lahir
                            }
                        />
                        <InfoRow label="Jenis Kelamin" value={penduduk.jenis_kelamin_label} />
                        <InfoRow label="Agama" value={penduduk.agama_label} />
                        <InfoRow label="Status Perkawinan" value={penduduk.status_perkawinan_label} />
                        <InfoRow label="Pekerjaan" value={penduduk.pekerjaan} />
                        <InfoRow label="Alamat" value={penduduk.alamat} />
                    </dl>
                </div>
            ) : (
                <div className="rounded-xl border bg-amber-50 p-4 dark:bg-amber-900/20">
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                        Data kependudukan tidak ditemukan di penduduk. Ditampilkan data akun saja.
                    </p>
                </div>
            )}

            {/* Jenis Surat */}
            <div className="rounded-xl border bg-card p-5 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                    <FileText className="h-4 w-4" /> Jenis Surat
                </h3>
                <dl>
                    <InfoRow
                        label="Jenis"
                        value={masterSurat ? `${masterSurat.kode} — ${masterSurat.nama_surat}` : '—'}
                    />
                    {masterSurat?.persyaratan && (
                        <InfoRow label="Dokumen Pendukung" value={
                            <span className="whitespace-pre-wrap text-xs">{masterSurat.persyaratan}</span>
                        } />
                    )}
                </dl>
            </div>

            {/* Data Formulir */}
            {dataFormulir && Object.keys(dataFormulir).length > 0 && (
                <div className="rounded-xl border bg-card p-5 shadow-sm">
                    <h3 className="mb-3 text-sm font-semibold text-foreground">Data Formulir</h3>
                    <dl>
                        {Object.entries(dataFormulir).map(([k, v]) => (
                            <InfoRow key={k} label={k} value={String(v ?? '—')} />
                        ))}
                    </dl>
                </div>
            )}
        </div>
    );
}

// ─── PreviewSurat (collapsible iframe) ───────────────────────────────────────

function PreviewSurat({ pengajuanId }: { pengajuanId: number }) {
    const [show, setShow] = useState(false);

    return (
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <button
                onClick={() => setShow(s => !s)}
                className="flex w-full items-center justify-between px-5 py-4 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
            >
                <span className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-violet-500" />
                    Preview Draft Surat
                </span>
                {show ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>
            {show && (
                <div className="border-t">
                    <iframe
                        src={`/kepala-desa/pengajuan/${pengajuanId}/preview-surat`}
                        title="Preview Surat"
                        className="h-[700px] w-full"
                    />
                </div>
            )}
        </div>
    );
}

// ─── FormPengesahan ───────────────────────────────────────────────────────────

function FormPengesahan({ pengajuanId }: { pengajuanId: number }) {
    const form = useForm({ action: 'setujui', catatan: '' });
    const [konfirmasi, setKonfirmasi] = useState<'setujui' | 'tolak' | null>(null);

    const handleClick = (action: 'setujui' | 'tolak') => {
        if (konfirmasi !== action) {
            setKonfirmasi(action);
            return;
        }
        // Second click → submit
        form.setData('action', action);
        setTimeout(() => {
            form.patch(`/kepala-desa/pengajuan/${pengajuanId}/pengesahan`);
        }, 0);
    };

    return (
        <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h4 className="mb-4 font-semibold text-foreground">Tindakan Pengesahan</h4>

            <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Catatan <span className="text-xs text-muted-foreground">(opsional)</span>
                </label>
                <textarea
                    value={form.data.catatan}
                    onChange={e => form.setData('catatan', e.target.value)}
                    rows={3}
                    placeholder="Catatan untuk pemohon…"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
                {form.errors.catatan && (
                    <p className="mt-1 text-xs text-red-500">{form.errors.catatan}</p>
                )}
            </div>

            {konfirmasi === 'setujui' && (
                <div className="mb-3 rounded-lg bg-teal-50 p-3 text-xs text-teal-700 dark:bg-teal-900/20 dark:text-teal-400">
                    Setelah disahkan, surat akan di-generate otomatis dan bisa dicetak oleh staff.
                    Klik <strong>Sahkan</strong> sekali lagi untuk konfirmasi.
                </div>
            )}
            {konfirmasi === 'tolak' && (
                <div className="mb-3 rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-400">
                    Pengajuan ini akan ditolak dan pemohon akan mendapat notifikasi.
                    Klik <strong>Tolak</strong> sekali lagi untuk konfirmasi.
                </div>
            )}

            <div className="flex gap-3">
                <button
                    type="button"
                    disabled={form.processing}
                    onClick={() => handleClick('setujui')}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
                        konfirmasi === 'setujui'
                            ? 'bg-teal-600 text-white hover:bg-teal-700 ring-2 ring-teal-400'
                            : 'bg-teal-600 text-white hover:bg-teal-700'
                    }`}
                >
                    {form.processing && form.data.action === 'setujui' ? 'Memproses…' : '✓ Sahkan'}
                </button>
                <button
                    type="button"
                    disabled={form.processing}
                    onClick={() => handleClick('tolak')}
                    className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
                        konfirmasi === 'tolak'
                            ? 'border-red-500 bg-red-600 text-white hover:bg-red-700 ring-2 ring-red-400'
                            : 'border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                    }`}
                >
                    {form.processing && form.data.action === 'tolak' ? 'Memproses…' : '✕ Tolak'}
                </button>
            </div>

            {form.errors.action && (
                <p className="mt-2 text-xs text-red-500">{form.errors.action}</p>
            )}
        </div>
    );
}

// ─── SuratOutputCard ──────────────────────────────────────────────────────────
// Kades hanya melihat info surat — download/cetak dilakukan oleh staff.

function SuratOutputCard({
    suratOutput,
}: {
    suratOutput: NonNullable<PengajuanDetail['surat_output']>;
}) {
    return (
        <div className="rounded-xl border border-teal-200 bg-teal-50 p-5 dark:border-teal-700 dark:bg-teal-900/20">
            <h4 className="mb-3 flex items-center gap-2 font-semibold text-teal-800 dark:text-teal-300">
                <CheckCircle className="h-4 w-4" />
                Surat Berhasil Di-generate
            </h4>
            <div className="mb-3 space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-teal-700 dark:text-teal-400">Nomor Surat</span>
                    <span className="font-mono font-semibold text-foreground">{suratOutput.no_surat}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-teal-700 dark:text-teal-400">Tanggal</span>
                    <span className="font-medium text-foreground">
                        {new Date(suratOutput.tanggal_surat).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'long', year: 'numeric',
                        })}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-teal-700 dark:text-teal-400">Dibuat</span>
                    <span className="text-foreground">
                        {new Date(suratOutput.created_at).toLocaleString('id-ID')}
                    </span>
                </div>
            </div>
            <p className="rounded-lg bg-teal-100 px-3 py-2 text-center text-xs text-teal-700 dark:bg-teal-900/40 dark:text-teal-400">
                Surat akan dicetak dan ditandatangani oleh staff, lalu diserahkan ke warga.
            </p>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function KepalaPengajuanDetail({ pengajuan, penduduk }: Props) {
    const cfg   = STATUS_COLOR[pengajuan.status] ?? 'bg-muted text-muted-foreground';
    const label = STATUS_LABEL[pengajuan.status] ?? pengajuan.status;

    const bisaDisahkan  = pengajuan.status === 'menunggu_pengesahan';
    const adaSuratOutput = !!pengajuan.surat_output;
    const bisaDownload  = ['disetujui', 'siap_diambil', 'selesai'].includes(pengajuan.status) && adaSuratOutput;

    const dokumen = pengajuan.dokumen_persyaratan ?? [];
    const showPreview = ['menunggu_pengesahan', 'disetujui', 'siap_diambil', 'selesai'].includes(pengajuan.status);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Pengesahan ${pengajuan.no_pengajuan} | SADESA`} />

            <div className="flex flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        href="/kepala-desa/pengajuan"
                        className="rounded-lg border p-2 hover:bg-muted transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold text-foreground">{pengajuan.no_pengajuan}</h1>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className={`inline-flex rounded-full px-3 py-0.5 text-xs font-medium ${cfg}`}>
                                {label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {pengajuan.master_surat?.nama_surat ?? '—'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid gap-6 xl:grid-cols-3">

                    {/* ── Kolom Utama (2/3) ────────────────────────────────── */}
                    <div className="xl:col-span-2 space-y-6">

                        {/* Split screen: Dokumen | Identitas */}
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Panel Kiri — Dokumen */}
                            <div>
                                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Dokumen Pendukung
                                </h3>
                                {dokumen.length > 0 ? (
                                    <PanelDokumen dokumen={dokumen} />
                                ) : (
                                    <div className="flex h-40 items-center justify-center rounded-xl border bg-muted/20 text-sm text-muted-foreground">
                                        Tidak ada dokumen.
                                    </div>
                                )}
                            </div>

                            {/* Panel Kanan — Identitas */}
                            <div>
                                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Data Pemohon
                                </h3>
                                <PanelIdentitas
                                    user={pengajuan.user}
                                    penduduk={penduduk}
                                    masterSurat={pengajuan.master_surat}
                                    dataFormulir={pengajuan.data_formulir}
                                />
                            </div>
                        </div>

                        {/* Preview Surat */}
                        {showPreview && (
                            <PreviewSurat pengajuanId={pengajuan.id} />
                        )}
                    </div>

                    {/* ── Sidebar (1/3) ─────────────────────────────────────── */}
                    <div className="space-y-4">

                        {/* Form Pengesahan */}
                        {bisaDisahkan && (
                            <FormPengesahan pengajuanId={pengajuan.id} />
                        )}

                        {/* Surat Output — info saja; download/cetak di halaman staff */}
                        {bisaDownload && pengajuan.surat_output && (
                            <SuratOutputCard
                                suratOutput={pengajuan.surat_output}
                            />
                        )}

                        {/* Placeholder jika belum bisa diaksi */}
                        {!bisaDisahkan && !bisaDownload && (
                            <div className="rounded-xl border bg-muted/30 p-5 text-center text-sm text-muted-foreground">
                                {['ditolak_kepala', 'ditolak_staff', 'dibatalkan'].includes(pengajuan.status)
                                    ? 'Pengajuan ini sudah ditolak atau dibatalkan.'
                                    : 'Pengajuan belum siap untuk disahkan.'}
                            </div>
                        )}

                        {/* Riwayat Verifikasi Staff */}
                        {pengajuan.verifikasi_berkas && (
                            <div className="rounded-xl border bg-card p-5 shadow-sm">
                                <h4 className="mb-3 text-sm font-semibold text-foreground">Verifikasi Petugas</h4>
                                <p className="text-sm text-muted-foreground">
                                    Oleh:{' '}
                                    <span className="font-medium text-foreground">
                                        {pengajuan.verifikasi_berkas.staff?.name ?? '—'}
                                    </span>
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {new Date(pengajuan.verifikasi_berkas.created_at).toLocaleString('id-ID')}
                                </p>
                                {pengajuan.verifikasi_berkas.catatan && (
                                    <p className="mt-2 rounded-lg bg-muted p-2 text-sm">
                                        {pengajuan.verifikasi_berkas.catatan}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Riwayat Pengesahan */}
                        {pengajuan.pengesahan_permohonan && (
                            <div className="rounded-xl border bg-card p-5 shadow-sm">
                                <h4 className="mb-3 text-sm font-semibold text-foreground">Keputusan Pengesahan</h4>
                                <p className="text-sm text-muted-foreground">
                                    Oleh:{' '}
                                    <span className="font-medium text-foreground">
                                        {pengajuan.pengesahan_permohonan.kepala_desa?.name ?? '—'}
                                    </span>
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {new Date(pengajuan.pengesahan_permohonan.created_at).toLocaleString('id-ID')}
                                </p>
                                {pengajuan.pengesahan_permohonan.catatan && (
                                    <p className="mt-2 rounded-lg bg-muted p-2 text-sm">
                                        {pengajuan.pengesahan_permohonan.catatan}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Info Pengajuan */}
                        <div className="rounded-xl border bg-card p-5 shadow-sm">
                            <h4 className="mb-3 text-sm font-semibold text-foreground">Info Pengajuan</h4>
                            <dl>
                                <InfoRow
                                    label="Tgl Diajukan"
                                    value={new Date(pengajuan.created_at).toLocaleString('id-ID')}
                                />
                                <InfoRow
                                    label="Terakhir Update"
                                    value={new Date(pengajuan.updated_at).toLocaleString('id-ID')}
                                />
                                {pengajuan.catatan && (
                                    <InfoRow label="Catatan" value={pengajuan.catatan} />
                                )}
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
