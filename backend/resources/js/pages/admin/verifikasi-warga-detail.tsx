import { Head, Link, useForm } from '@inertiajs/react';
import { CheckCircle, XCircle, ArrowLeft, User, FileImage } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface VerifikasiDetail {
    id: number;
    status: 'menunggu' | 'disetujui' | 'ditolak';
    catatan: string | null;
    created_at: string;
    reviewed_at: string | null;
    user: {
        id: number;
        name: string;
        email: string;
        nik: string | null;
        phone: string | null;
        status: string;
    };
    reviewer: { id: number; name: string } | null;
}

interface Props {
    verifikasi: VerifikasiDetail;
    foto_ktp_url: string;
    foto_kk_url: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
    menunggu: 'Menunggu Tinjauan', disetujui: 'Disetujui', ditolak: 'Ditolak',
};
const STATUS_COLOR: Record<string, string> = {
    menunggu:  'bg-amber-50 text-amber-700 border-amber-200',
    disetujui: 'bg-green-50 text-green-700 border-green-200',
    ditolak:   'bg-red-50 text-red-700 border-red-200',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VerifikasiWargaDetail({ verifikasi, foto_ktp_url, foto_kk_url }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        aksi: '' as 'setujui' | 'tolak' | '',
        catatan: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Verifikasi Warga', href: '/admin/verifikasi-warga' },
        { title: verifikasi.user.name, href: '#' },
    ];

    const submit = (aksi: 'setujui' | 'tolak') => {
        setData('aksi', aksi);
        post(`/admin/verifikasi-warga/${verifikasi.id}/proses`);
    };

    const sudahDiproses = verifikasi.status !== 'menunggu';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Verifikasi — ${verifikasi.user.name} | SADESA`} />

            <div className="max-w-4xl mx-auto p-6 space-y-6">
                {/* Back */}
                <Link href="/admin/verifikasi-warga" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-teal-700">
                    <ArrowLeft size={16} /> Kembali ke daftar
                </Link>

                {/* Status banner */}
                <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${STATUS_COLOR[verifikasi.status]}`}>
                    Status: {STATUS_LABEL[verifikasi.status]}
                    {verifikasi.reviewer && (
                        <span className="ml-2 font-normal opacity-75">
                            oleh {verifikasi.reviewer.name} — {verifikasi.reviewed_at}
                        </span>
                    )}
                    {verifikasi.catatan && (
                        <p className="mt-1 font-normal">{verifikasi.catatan}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* ── Data Warga ── */}
                    <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
                        <h2 className="flex items-center gap-2 font-semibold text-gray-900">
                            <User size={16} /> Data Warga
                        </h2>
                        {[
                            ['Nama', verifikasi.user.name],
                            ['NIK', verifikasi.user.nik ?? '—'],
                            ['Email', verifikasi.user.email],
                            ['No. HP', verifikasi.user.phone ?? '—'],
                            ['Dikirim', verifikasi.created_at],
                        ].map(([label, value]) => (
                            <div key={label}>
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
                                <p className="mt-0.5 text-sm font-medium text-gray-800">{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* ── Foto Dokumen ── */}
                    <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
                        <h2 className="flex items-center gap-2 font-semibold text-gray-900">
                            <FileImage size={16} /> Dokumen Identitas
                        </h2>

                        <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Foto KTP</p>
                            <a href={foto_ktp_url} target="_blank" rel="noreferrer">
                                <img
                                    src={foto_ktp_url}
                                    alt="Foto KTP"
                                    className="w-full rounded-xl border object-cover max-h-48 hover:opacity-90 transition cursor-zoom-in"
                                />
                            </a>
                        </div>

                        {foto_kk_url && (
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Foto KK</p>
                                <a href={foto_kk_url} target="_blank" rel="noreferrer">
                                    <img
                                        src={foto_kk_url}
                                        alt="Foto KK"
                                        className="w-full rounded-xl border object-cover max-h-48 hover:opacity-90 transition cursor-zoom-in"
                                    />
                                </a>
                            </div>
                        )}

                        {!foto_kk_url && (
                            <p className="text-xs text-gray-400 italic">Foto KK tidak diunggah.</p>
                        )}
                    </div>
                </div>

                {/* ── Action Form ── */}
                {!sudahDiproses && (
                    <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-4">
                        <h2 className="font-semibold text-gray-900">Tindakan Verifikasi</h2>

                        <div className="grid gap-1.5">
                            <Label htmlFor="catatan">Catatan (opsional, wajib jika ditolak)</Label>
                            <Textarea
                                id="catatan"
                                placeholder="Tulis catatan untuk warga, misalnya alasan penolakan atau permintaan perbaikan dokumen..."
                                value={data.catatan}
                                onChange={(e) => setData('catatan', e.target.value)}
                                rows={3}
                                className="resize-none"
                            />
                            {errors.catatan && <p className="text-xs text-red-600">{errors.catatan}</p>}
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                onClick={() => submit('setujui')}
                                disabled={processing}
                                className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800"
                            >
                                <CheckCircle size={16} />
                                Setujui & Aktifkan
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => submit('tolak')}
                                disabled={processing}
                                className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
                            >
                                <XCircle size={16} />
                                Tolak
                            </Button>
                        </div>

                        {errors.aksi && <p className="text-xs text-red-600">{errors.aksi}</p>}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
