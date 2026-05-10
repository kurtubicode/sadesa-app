import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, FileText, User } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

interface PengajuanDetail {
    id: number;
    no_pengajuan: string;
    status: string;
    catatan: string | null;
    data_formulir: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
    user?: { id: number; name: string; nik: string | null; email: string; phone: string | null } | null;
    master_surat?: { id: number; nama: string; kode: string; persyaratan: string | null } | null;
    dokumen_persyaratan?: { id: number; nama_file: string; tipe: string; created_at: string }[];
    verifikasi_berkas?: { catatan: string | null; staff: { name: string } | null; created_at: string } | null;
    pengesahan_permohonan?: { catatan: string | null; kepala_desa: { name: string } | null; created_at: string } | null;
}

interface Props { pengajuan: PengajuanDetail }

const STATUS_LABEL: Record<string, string> = {
    menunggu_pengesahan: 'Menunggu Pengesahan',
    disetujui:           'Disetujui',
    ditolak_kepala:      'Ditolak',
    selesai:             'Selesai',
};
const STATUS_COLOR: Record<string, string> = {
    menunggu_pengesahan: 'bg-purple-100 text-purple-700',
    disetujui:           'bg-green-100 text-green-700',
    ditolak_kepala:      'bg-red-100 text-red-700',
    selesai:             'bg-teal-100 text-teal-700',
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
    { title: 'Pengajuan Surat', href: '/kepala-desa/pengajuan' },
    { title: 'Detail', href: '#' },
];

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid grid-cols-3 gap-2 border-b py-2.5 last:border-0">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="col-span-2 text-sm font-medium text-foreground">{value ?? '—'}</dd>
        </div>
    );
}

// ─── Form Pengesahan ──────────────────────────────────────────────────────────

function FormPengesahan({ pengajuanId }: { pengajuanId: number }) {
    const form = useForm({ action: 'setujui', catatan: '' });

    const submit = (action: 'setujui' | 'tolak') => {
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
                    Catatan <span className="text-muted-foreground text-xs">(opsional)</span>
                </label>
                <textarea
                    value={form.data.catatan}
                    onChange={e => form.setData('catatan', e.target.value)}
                    rows={4}
                    placeholder="Catatan untuk pemohon…"
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y"
                />
                {form.errors.catatan && (
                    <p className="mt-1 text-xs text-red-500">{form.errors.catatan}</p>
                )}
            </div>

            <div className="flex gap-3">
                <button
                    type="button"
                    disabled={form.processing}
                    onClick={() => submit('setujui')}
                    className="flex-1 rounded-lg bg-teal-600 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
                >
                    ✓ Setujui
                </button>
                <button
                    type="button"
                    disabled={form.processing}
                    onClick={() => submit('tolak')}
                    className="flex-1 rounded-lg border border-red-300 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 dark:hover:bg-red-900/20"
                >
                    ✕ Tolak
                </button>
            </div>

            {form.errors.action && (
                <p className="mt-2 text-xs text-red-500">{form.errors.action}</p>
            )}
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function KepalaPengajuanDetail({ pengajuan }: Props) {
    const cfg   = STATUS_COLOR[pengajuan.status] ?? 'bg-muted text-muted-foreground';
    const label = STATUS_LABEL[pengajuan.status] ?? pengajuan.status;

    const bisaDisahkan = pengajuan.status === 'menunggu_pengesahan';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Pengesahan ${pengajuan.no_pengajuan} | SADESA`} />

            <div className="flex flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link href="/kepala-desa/pengajuan" className="rounded-lg border p-2 hover:bg-muted">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">{pengajuan.no_pengajuan}</h1>
                        <span className={`inline-flex rounded-full px-3 py-0.5 text-xs font-medium ${cfg}`}>
                            {label}
                        </span>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Kiri: detail */}
                    <div className="col-span-2 space-y-6">
                        {/* Data pemohon */}
                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                                <User className="h-4 w-4" /> Data Pemohon
                            </h3>
                            <dl>
                                <InfoRow label="Nama" value={pengajuan.user?.name} />
                                <InfoRow label="NIK" value={<span className="font-mono">{pengajuan.user?.nik}</span>} />
                                <InfoRow label="Email" value={pengajuan.user?.email} />
                                <InfoRow label="Telepon" value={pengajuan.user?.phone} />
                            </dl>
                        </div>

                        {/* Data surat */}
                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                                <FileText className="h-4 w-4" /> Data Pengajuan
                            </h3>
                            <dl>
                                <InfoRow
                                    label="Jenis Surat"
                                    value={`${pengajuan.master_surat?.kode} — ${pengajuan.master_surat?.nama}`}
                                />
                                <InfoRow
                                    label="Tanggal Pengajuan"
                                    value={new Date(pengajuan.created_at).toLocaleString('id-ID')}
                                />
                                <InfoRow
                                    label="Terakhir Diperbarui"
                                    value={new Date(pengajuan.updated_at).toLocaleString('id-ID')}
                                />
                                {pengajuan.catatan && (
                                    <InfoRow label="Catatan Petugas" value={pengajuan.catatan} />
                                )}
                            </dl>
                        </div>

                        {/* Dokumen */}
                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <h3 className="mb-4 font-semibold text-foreground">Dokumen Diunggah</h3>
                            {(!pengajuan.dokumen_persyaratan || pengajuan.dokumen_persyaratan.length === 0) ? (
                                <p className="text-sm text-muted-foreground">Belum ada dokumen diunggah.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {pengajuan.dokumen_persyaratan.map(dok => (
                                        <li key={dok.id} className="flex items-center gap-3 rounded-lg border p-3">
                                            <span className="text-lg">
                                                {dok.tipe?.includes('pdf') ? '📄' : '🖼️'}
                                            </span>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-foreground">{dok.nama_file}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(dok.created_at).toLocaleDateString('id-ID')}
                                                </p>
                                            </div>
                                            <a
                                                href={`/storage/${dok.nama_file}`}
                                                target="_blank"
                                                rel="noopener"
                                                className="rounded-md border px-2.5 py-1.5 text-xs hover:bg-muted"
                                            >
                                                Buka
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Kanan: sidebar aksi */}
                    <div className="space-y-4">
                        {/* Form pengesahan */}
                        {bisaDisahkan && (
                            <FormPengesahan pengajuanId={pengajuan.id} />
                        )}

                        {/* Riwayat verifikasi staff */}
                        {pengajuan.verifikasi_berkas && (
                            <div className="rounded-xl border bg-card p-5 shadow-sm">
                                <h4 className="mb-3 font-semibold text-foreground">Verifikasi Petugas</h4>
                                <p className="text-sm text-muted-foreground">
                                    Oleh:{' '}
                                    <span className="font-medium text-foreground">
                                        {pengajuan.verifikasi_berkas.staff?.name ?? '—'}
                                    </span>
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {new Date(pengajuan.verifikasi_berkas.created_at).toLocaleString('id-ID')}
                                </p>
                                {pengajuan.verifikasi_berkas.catatan && (
                                    <p className="mt-2 rounded-lg bg-muted p-2 text-sm">
                                        {pengajuan.verifikasi_berkas.catatan}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Riwayat pengesahan */}
                        {pengajuan.pengesahan_permohonan && (
                            <div className="rounded-xl border bg-card p-5 shadow-sm">
                                <h4 className="mb-3 font-semibold text-foreground">Pengesahan</h4>
                                <p className="text-sm text-muted-foreground">
                                    Oleh:{' '}
                                    <span className="font-medium text-foreground">
                                        {pengajuan.pengesahan_permohonan.kepala_desa?.name ?? '—'}
                                    </span>
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {new Date(pengajuan.pengesahan_permohonan.created_at).toLocaleString('id-ID')}
                                </p>
                                {pengajuan.pengesahan_permohonan.catatan && (
                                    <p className="mt-2 rounded-lg bg-muted p-2 text-sm">
                                        {pengajuan.pengesahan_permohonan.catatan}
                                    </p>
                                )}
                            </div>
                        )}

                        {!bisaDisahkan && !pengajuan.pengesahan_permohonan && (
                            <div className="rounded-xl border bg-muted/30 p-5 text-center text-sm text-muted-foreground">
                                Pengajuan ini belum siap untuk disahkan.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
