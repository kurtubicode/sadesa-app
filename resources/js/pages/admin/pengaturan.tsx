import { Head, router, usePage } from '@inertiajs/react';
import { Building2, ImageIcon, Save, Settings2, UserCheck } from 'lucide-react';
import { useRef, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Settings {
    kop_jabatan?:   string;
    kop_nama_desa?: string;
    kop_kecamatan?: string;
    kop_kabupaten?: string;
    kop_alamat?:    string;
    kop_telepon?:   string;
    kop_fax?:       string;
    kop_kode_pos?:  string;
    kop_website?:   string;
    kop_email?:     string;
    kop_logo_path?: string;
    kades_nama?:    string;
    kades_nip?:     string;
    kades_jabatan?: string;
    [key: string]: string | undefined;
}

interface Props {
    settings: Settings;
    flash?: { success?: string; error?: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
    { title: 'Pengaturan Desa', href: '/admin/pengaturan' },
];

// ─── Kop Preview ─────────────────────────────────────────────────────────────

function KopPreview({ form }: { form: Settings }) {
    const jabatan   = form.kop_jabatan   ?? 'KEPALA DESA';
    const namaDesa  = (form.kop_nama_desa ?? 'NAMA DESA').toUpperCase();
    const kecamatan = (form.kop_kecamatan ?? 'KECAMATAN').toUpperCase();
    const kabupaten = (form.kop_kabupaten ?? 'KABUPATEN').toUpperCase();
    const alamat    = form.kop_alamat   ?? '';
    const telepon   = form.kop_telepon  ?? '';
    const kodePos   = form.kop_kode_pos ?? '';

    let alamatLine = alamat;
    if (telepon) alamatLine += '  Telp: ' + telepon;
    if (kodePos)  alamatLine += '  Kode Pos ' + kodePos;

    return (
        <div
            className="mx-auto max-w-[520px] border-b-2 border-black pb-3"
            style={{ fontFamily: 'Times New Roman, serif' }}
        >
            <table className="w-full">
                <tbody>
                    <tr>
                        <td className="w-16 text-center align-middle">
                            {form.kop_logo_path ? (
                                <img
                                    src={`/storage/${form.kop_logo_path}`}
                                    alt="Logo"
                                    className="mx-auto h-14 w-14 object-contain"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            ) : (
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-gray-300 bg-gray-50 text-[9px] text-gray-400">
                                    LOGO
                                </div>
                            )}
                        </td>
                        <td className="text-center align-middle">
                            <p className="text-[13pt] font-bold tracking-wide">{jabatan} {namaDesa}</p>
                            <p className="text-[11pt] font-semibold">KECAMATAN {kecamatan}</p>
                            <p className="text-[11pt]">KABUPATEN {kabupaten}</p>
                            {alamatLine && (
                                <p className="mt-1 text-[9pt] text-gray-600">{alamatLine}</p>
                            )}
                        </td>
                        <td className="w-16" />
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PengaturanPage() {
    const { settings, flash } = usePage<Props>().props;

    const [form, setForm] = useState<Settings>({ ...settings });
    const [processing, setSaving] = useState(false);
    const logoRef = useRef<HTMLInputElement>(null);

    const set = (key: keyof Settings, val: string) =>
        setForm(f => ({ ...f, [key]: val }));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const fd = new FormData();
        (Object.keys(form) as (keyof Settings)[]).forEach(k => {
            if (k !== 'kop_logo_path') {
                fd.append(k as string, form[k] ?? '');
            }
        });
        if (logoRef.current?.files?.[0]) {
            fd.append('kop_logo', logoRef.current.files[0]);
        }

        router.post('/admin/pengaturan', fd, {
            forceFormData: true,
            onFinish: () => setSaving(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Desa | SADESA" />

            <div className="mx-auto max-w-5xl p-6 pb-12">

                {/* Header */}
                <div className="mb-6 flex items-center gap-3">
                    <Settings2 className="h-6 w-6 text-teal-600" />
                    <div>
                        <h1 className="text-xl font-bold">Pengaturan Desa</h1>
                        <p className="text-sm text-muted-foreground">
                            Konfigurasi kop surat dan identitas kepala desa yang akan digunakan pada seluruh surat resmi
                        </p>
                    </div>
                </div>

                {/* Flash */}
                {flash?.success && (
                    <div className="mb-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-700 dark:border-teal-800 dark:bg-teal-900/20 dark:text-teal-300">
                        ✓ {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20">
                        ✕ {flash.error}
                    </div>
                )}

                <form onSubmit={submit}>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">

                        {/* ── Form ─────────────────────────────────────────── */}
                        <div className="space-y-6">

                            {/* Identitas Desa */}
                            <div className="rounded-2xl border bg-card p-6 shadow-sm">
                                <div className="mb-5 flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-teal-600" />
                                    <h2 className="font-semibold">Identitas Desa</h2>
                                </div>
                                <div className="space-y-4">

                                    {/* Jabatan + Nama Desa */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium">Jabatan Kop</label>
                                            <input
                                                type="text"
                                                value={form.kop_jabatan ?? ''}
                                                onChange={e => set('kop_jabatan', e.target.value)}
                                                placeholder="KEPALA DESA"
                                                className="input-base"
                                            />
                                            <p className="mt-1 text-[11px] text-muted-foreground">
                                                Contoh: KEPALA DESA atau PEMERINTAH DESA
                                            </p>
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium">Nama Desa</label>
                                            <input
                                                type="text"
                                                value={form.kop_nama_desa ?? ''}
                                                onChange={e => set('kop_nama_desa', e.target.value)}
                                                placeholder="CIRANGKONG"
                                                className="input-base uppercase"
                                            />
                                        </div>
                                    </div>

                                    {/* Kecamatan + Kabupaten */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium">Kecamatan</label>
                                            <input
                                                type="text"
                                                value={form.kop_kecamatan ?? ''}
                                                onChange={e => set('kop_kecamatan', e.target.value)}
                                                placeholder="CIJAMBE"
                                                className="input-base uppercase"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium">Kabupaten/Kota</label>
                                            <input
                                                type="text"
                                                value={form.kop_kabupaten ?? ''}
                                                onChange={e => set('kop_kabupaten', e.target.value)}
                                                placeholder="SUBANG"
                                                className="input-base uppercase"
                                            />
                                        </div>
                                    </div>

                                    {/* Alamat */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium">Alamat Kantor Desa</label>
                                        <input
                                            type="text"
                                            value={form.kop_alamat ?? ''}
                                            onChange={e => set('kop_alamat', e.target.value)}
                                            placeholder="Jln. Raya ..."
                                            className="input-base"
                                        />
                                    </div>

                                    {/* Telepon + Fax + Kode Pos */}
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium">Telepon</label>
                                            <input
                                                type="text"
                                                value={form.kop_telepon ?? ''}
                                                onChange={e => set('kop_telepon', e.target.value)}
                                                placeholder="(0260) ..."
                                                className="input-base"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium">Fax</label>
                                            <input
                                                type="text"
                                                value={form.kop_fax ?? ''}
                                                onChange={e => set('kop_fax', e.target.value)}
                                                placeholder="(opsional)"
                                                className="input-base"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium">Kode Pos</label>
                                            <input
                                                type="text"
                                                value={form.kop_kode_pos ?? ''}
                                                onChange={e => set('kop_kode_pos', e.target.value)}
                                                placeholder="41285"
                                                className="input-base"
                                            />
                                        </div>
                                    </div>

                                    {/* Website + Email */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium">Website <span className="font-normal text-muted-foreground">(opsional)</span></label>
                                            <input
                                                type="text"
                                                value={form.kop_website ?? ''}
                                                onChange={e => set('kop_website', e.target.value)}
                                                placeholder="https://..."
                                                className="input-base"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium">Email <span className="font-normal text-muted-foreground">(opsional)</span></label>
                                            <input
                                                type="email"
                                                value={form.kop_email ?? ''}
                                                onChange={e => set('kop_email', e.target.value)}
                                                placeholder="desa@..."
                                                className="input-base"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Kepala Desa */}
                            <div className="rounded-2xl border bg-card p-6 shadow-sm">
                                <div className="mb-5 flex items-center gap-2">
                                    <UserCheck className="h-4 w-4 text-teal-600" />
                                    <h2 className="font-semibold">Kepala Desa</h2>
                                    <span className="text-xs text-muted-foreground">— Muncul di tanda tangan surat</span>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium">Nama Lengkap Kepala Desa</label>
                                        <input
                                            type="text"
                                            value={form.kades_nama ?? ''}
                                            onChange={e => set('kades_nama', e.target.value)}
                                            placeholder="Nama lengkap"
                                            className="input-base"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium">NIP <span className="font-normal text-muted-foreground">(opsional)</span></label>
                                            <input
                                                type="text"
                                                value={form.kades_nip ?? ''}
                                                onChange={e => set('kades_nip', e.target.value)}
                                                placeholder="Kosongkan jika tidak ada"
                                                className="input-base font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1.5 block text-sm font-medium">Jabatan (dalam surat)</label>
                                            <input
                                                type="text"
                                                value={form.kades_jabatan ?? ''}
                                                onChange={e => set('kades_jabatan', e.target.value)}
                                                placeholder="Kepala Desa Cirangkong"
                                                className="input-base"
                                            />
                                            <p className="mt-1 text-[11px] text-muted-foreground">
                                                Teks di atas tanda tangan surat
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Logo */}
                            <div className="rounded-2xl border bg-card p-6 shadow-sm">
                                <div className="mb-5 flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4 text-teal-600" />
                                    <h2 className="font-semibold">Logo Kop Surat</h2>
                                </div>
                                <div className="flex items-start gap-4">
                                    {/* Current logo */}
                                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border bg-muted/30">
                                        {form.kop_logo_path ? (
                                            <img
                                                src={`/storage/${form.kop_logo_path}`}
                                                alt="Logo"
                                                className="h-16 w-16 object-contain"
                                                onError={(e) => { (e.target as HTMLImageElement).src = '/images/logo-kab-subang.png'; }}
                                            />
                                        ) : (
                                            <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            ref={logoRef}
                                            type="file"
                                            accept="image/*"
                                            className="block w-full rounded-xl border border-dashed border-border px-3 py-2 text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-teal-700 hover:file:bg-teal-100"
                                        />
                                        <p className="mt-1.5 text-xs text-muted-foreground">
                                            PNG/JPG, maks 2 MB. Logo akan tampil di kiri kop surat.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Right: Live Preview ───────────────────────── */}
                        <div className="space-y-4">
                            <div className="sticky top-20 rounded-2xl border bg-card p-5 shadow-sm">
                                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                    Pratinjau Kop Surat
                                </p>
                                <div className="overflow-hidden rounded-lg bg-white p-4 shadow-inner ring-1 ring-border">
                                    <KopPreview form={form} />
                                    <div className="mt-4 text-center">
                                        <p className="text-sm font-bold uppercase" style={{ fontFamily: 'Times New Roman, serif' }}>
                                            SURAT KETERANGAN ___
                                        </p>
                                        <p className="text-xs" style={{ fontFamily: 'Times New Roman, serif' }}>
                                            Nomor : 445/1/Ks-{new Date().getFullYear()}
                                        </p>
                                    </div>
                                </div>
                                <p className="mt-3 text-[11px] text-muted-foreground">
                                    Preview akan diperbarui secara real-time saat Anda mengedit form.
                                </p>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-teal-700 disabled:opacity-60"
                                >
                                    <Save className="h-4 w-4" />
                                    {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                                </button>
                            </div>
                        </div>

                    </div>
                </form>
            </div>

            {/* Inline style for input-base since we can't use @apply in TSX */}
            <style>{`
                .input-base {
                    width: 100%;
                    border-radius: 0.75rem;
                    border: 1px solid hsl(var(--border));
                    background: hsl(var(--background));
                    padding: 0.5rem 0.75rem;
                    font-size: 0.875rem;
                    outline: none;
                }
                .input-base:focus {
                    ring: 2px;
                    ring-color: #0d9488;
                    border-color: #0d9488;
                    box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.25);
                }
            `}</style>
        </AppLayout>
    );
}
