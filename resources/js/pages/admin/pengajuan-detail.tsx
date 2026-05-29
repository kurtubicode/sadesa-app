import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText, User } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

interface PengajuanDetail {
    id: number;
    no_pengajuan: string;
    status: string;
    catatan: string | null;
    keterangan: string | null;
    data_formulir: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
    user?: { id: number; name: string; nik: string | null; email: string; phone: string | null } | null;
    master_surat?: { id: number; nama: string; kode: string; persyaratan: string | null } | null;
    dokumen_persyaratan?: { id: number; nama_file: string; path_file: string; jenis_dokumen: string; created_at: string }[];
    verifikasi_berkas?: { catatan: string | null; staff: { name: string } | null; created_at: string } | null;
    pengesahan_permohonan?: { catatan: string | null; kepala_desa: { name: string } | null; created_at: string } | null;
}

interface Props { pengajuan: PengajuanDetail }

const STATUS_LABEL: Record<string, string> = {
    menunggu: 'Menunggu', diproses: 'Diproses', diverifikasi: 'Diverifikasi',
    ditolak_staff: 'Ditolak Petugas', menunggu_pengesahan: 'Menunggu Pengesahan',
    disetujui: 'Disetujui', ditolak_kepala: 'Ditolak Kepala Desa',
    siap_diambil: 'Siap Diambil', selesai: 'Selesai', dibatalkan: 'Dibatalkan',
};
const STATUS_COLOR: Record<string, string> = {
    menunggu: 'bg-amber-100 text-amber-700', diproses: 'bg-blue-100 text-blue-700',
    diverifikasi: 'bg-indigo-100 text-indigo-700', ditolak_staff: 'bg-red-100 text-red-700',
    menunggu_pengesahan: 'bg-purple-100 text-purple-700', disetujui: 'bg-orange-100 text-orange-700',
    ditolak_kepala: 'bg-red-100 text-red-700', siap_diambil: 'bg-teal-100 text-teal-700',
    selesai: 'bg-green-100 text-green-700', dibatalkan: 'bg-gray-100 text-gray-600',
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
    { title: 'Pengajuan Surat', href: '/admin/pengajuan' },
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

export default function AdminPengajuanDetail({ pengajuan }: Props) {
    const cfg = STATUS_COLOR[pengajuan.status] ?? 'bg-muted text-muted-foreground';
    const label = STATUS_LABEL[pengajuan.status] ?? pengajuan.status;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Pengajuan ${pengajuan.no_pengajuan} | SADESA`} />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center gap-3">
                    <Link href="/admin/pengajuan" className="rounded-lg border p-2 hover:bg-muted">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">{pengajuan.no_pengajuan}</h1>
                        <span className={`inline-flex rounded-full px-3 py-0.5 text-xs font-medium ${cfg}`}>{label}</span>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Kiri: info utama */}
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
                                <InfoRow label="Jenis Surat" value={`${pengajuan.master_surat?.kode} — ${pengajuan.master_surat?.nama}`} />
                                <InfoRow label="Tanggal Pengajuan" value={new Date(pengajuan.created_at).toLocaleString('id-ID')} />
                                <InfoRow label="Terakhir Diperbarui" value={new Date(pengajuan.updated_at).toLocaleString('id-ID')} />
                                {pengajuan.catatan && <InfoRow label="Catatan Petugas" value={pengajuan.catatan} />}
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
                                            <span className="text-lg">{dok.path_file?.endsWith('.pdf') || dok.jenis_dokumen?.toLowerCase().includes('pdf') ? '📄' : '🖼️'}</span>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{dok.nama_file}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(dok.created_at).toLocaleDateString('id-ID')}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Kanan: timeline verifikasi */}
                    <div className="space-y-4">
                        {/* Verifikasi Staff */}
                        <div className="rounded-xl border bg-card p-5 shadow-sm">
                            <h4 className="mb-3 font-semibold text-foreground">Verifikasi Petugas</h4>
                            {pengajuan.verifikasi_berkas ? (
                                <>
                                    <p className="text-sm text-muted-foreground">Oleh: <span className="font-medium text-foreground">{pengajuan.verifikasi_berkas.staff?.name}</span></p>
                                    <p className="mt-1 text-sm text-muted-foreground">{new Date(pengajuan.verifikasi_berkas.created_at).toLocaleString('id-ID')}</p>
                                    {pengajuan.verifikasi_berkas.catatan && <p className="mt-2 rounded-lg bg-muted p-2 text-sm">{pengajuan.verifikasi_berkas.catatan}</p>}
                                </>
                            ) : <p className="text-sm text-muted-foreground">Belum diverifikasi.</p>}
                        </div>

                        {/* Pengesahan Kepala Desa */}
                        <div className="rounded-xl border bg-card p-5 shadow-sm">
                            <h4 className="mb-3 font-semibold text-foreground">Pengesahan Kepala Desa</h4>
                            {pengajuan.pengesahan_permohonan ? (
                                <>
                                    <p className="text-sm text-muted-foreground">Oleh: <span className="font-medium text-foreground">{pengajuan.pengesahan_permohonan.kepala_desa?.name}</span></p>
                                    <p className="mt-1 text-sm text-muted-foreground">{new Date(pengajuan.pengesahan_permohonan.created_at).toLocaleString('id-ID')}</p>
                                    {pengajuan.pengesahan_permohonan.catatan && <p className="mt-2 rounded-lg bg-muted p-2 text-sm">{pengajuan.pengesahan_permohonan.catatan}</p>}
                                </>
                            ) : <p className="text-sm text-muted-foreground">Belum disahkan.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
