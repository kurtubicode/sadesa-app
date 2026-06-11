import { Head, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, Info, User } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PendudukData {
    id?: number;
    nik: string;
    nama: string | null;
    tempat_lahir: string | null;
    tanggal_lahir: string | null;
    jenis_kelamin: 'L' | 'P' | null;
    agama: string | null;
    status_perkawinan: string | null;
    pekerjaan: string | null;
    alamat: string | null;
    no_kk: string | null;
    wilayah_id: number | null;
}

interface WilayahItem {
    id: number;
    label: string;
}

interface PageProps {
    penduduk: PendudukData | null;
    wilayahList: WilayahItem[];
    flash?: { success?: string };
}

// ─── Constants ───────────────────────────────────────────────────────────────

const AGAMA_OPTIONS = [
    { value: 'islam',     label: 'Islam' },
    { value: 'kristen',   label: 'Kristen Protestan' },
    { value: 'katolik',   label: 'Kristen Katolik' },
    { value: 'hindu',     label: 'Hindu' },
    { value: 'buddha',    label: 'Buddha' },
    { value: 'konghucu',  label: 'Konghucu' },
];

const STATUS_PERKAWINAN_OPTIONS = [
    { value: 'belum_kawin', label: 'Belum Kawin' },
    { value: 'kawin',       label: 'Kawin' },
    { value: 'cerai_hidup', label: 'Cerai Hidup' },
    { value: 'cerai_mati',  label: 'Cerai Mati' },
];

const REQUIRED_FIELDS = ['nama', 'tempat_lahir', 'tanggal_lahir', 'jenis_kelamin', 'agama', 'status_perkawinan', 'pekerjaan', 'alamat'] as const;

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Data Kependudukan', href: '/warga/data-diri' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function InputBase({ id, type = 'text', value, onChange, placeholder, readOnly, error }: {
    id: string; type?: string; value: string;
    onChange?: (v: string) => void; placeholder?: string;
    readOnly?: boolean; error?: string;
}) {
    return (
        <div>
            <input
                id={id}
                type={type}
                value={value}
                readOnly={readOnly}
                onChange={e => onChange?.(e.target.value)}
                placeholder={placeholder}
                className={`w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:cursor-not-allowed
                    ${readOnly ? 'cursor-default bg-muted text-muted-foreground' : ''}
                    ${error ? 'border-red-400 focus:ring-red-400' : 'border-border'}`}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

function FieldLabel({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
    return (
        <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-foreground">
            {children}
            {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DataDiri({ penduduk, wilayahList, flash }: PageProps) {
    const { auth } = usePage<{ auth: { user: { name: string; nik: string | null } } }>().props;

    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        nama:               penduduk?.nama              ?? auth.user.name ?? '',
        tempat_lahir:       penduduk?.tempat_lahir      ?? '',
        tanggal_lahir:      penduduk?.tanggal_lahir     ?? '',
        jenis_kelamin:      penduduk?.jenis_kelamin     ?? '',
        agama:              penduduk?.agama             ?? '',
        status_perkawinan:  penduduk?.status_perkawinan ?? '',
        pekerjaan:          penduduk?.pekerjaan         ?? '',
        alamat:             penduduk?.alamat            ?? '',
        no_kk:              penduduk?.no_kk             ?? '',
        wilayah_id:         penduduk?.wilayah_id?.toString() ?? '',
    });

    const nik = penduduk?.nik ?? auth.user.nik ?? '—';

    // Kelengkapan — hitung field wajib yang sudah diisi
    const filledCount = REQUIRED_FIELDS.filter(f => !!data[f]).length;
    const pct         = Math.round((filledCount / REQUIRED_FIELDS.length) * 100);
    const isComplete  = filledCount === REQUIRED_FIELDS.length;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/warga/data-diri');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Kependudukan | SADESA" />

            <div className="mx-auto max-w-3xl space-y-6 p-4">

                {/* ── Header ─────────────────────────────────────────────── */}
                <div>
                    <h1 className="text-xl font-bold text-foreground">Data Kependudukan</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Lengkapi data diri Anda. Data ini digunakan secara otomatis saat mengajukan surat —
                        tidak perlu upload KTP/KK berulang kali.
                    </p>
                </div>

                {/* ── Flash success ──────────────────────────────────────── */}
                {(flash?.success || recentlySuccessful) && (
                    <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 dark:border-green-800/40 dark:bg-green-900/20 dark:text-green-300">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        {flash?.success ?? 'Data kependudukan berhasil disimpan.'}
                    </div>
                )}

                {/* ── Progress kelengkapan ───────────────────────────────── */}
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                    <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">Kelengkapan Data</span>
                        <span className={`font-semibold ${isComplete ? 'text-green-600' : 'text-amber-600'}`}>
                            {filledCount} / {REQUIRED_FIELDS.length} field ({pct}%)
                        </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-amber-500'}`}
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                    {isComplete && (
                        <p className="mt-2 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Data sudah lengkap — Anda dapat mengajukan surat
                        </p>
                    )}
                </div>

                {/* ── Form ──────────────────────────────────────────────── */}
                <form onSubmit={submit} className="space-y-5">

                    {/* Identitas Akun (read-only) */}
                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                            <User className="h-4 w-4 text-teal-600" /> Identitas Akun
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <FieldLabel htmlFor="nik">NIK</FieldLabel>
                                <InputBase id="nik" value={nik} readOnly />
                                <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                                    <Info className="h-3 w-3" /> Dari akun Anda — hubungi admin jika salah
                                </p>
                            </div>
                            <div>
                                <FieldLabel htmlFor="nama" required>Nama Lengkap</FieldLabel>
                                <InputBase
                                    id="nama"
                                    value={data.nama}
                                    onChange={v => setData('nama', v)}
                                    placeholder="Sesuai KTP"
                                    error={errors.nama}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Kelahiran */}
                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <h2 className="mb-4 text-sm font-semibold text-foreground">Kelahiran</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <FieldLabel htmlFor="tempat_lahir" required>Tempat Lahir</FieldLabel>
                                <InputBase
                                    id="tempat_lahir"
                                    value={data.tempat_lahir}
                                    onChange={v => setData('tempat_lahir', v)}
                                    placeholder="Nama kota/kabupaten"
                                    error={errors.tempat_lahir}
                                />
                            </div>
                            <div>
                                <FieldLabel htmlFor="tanggal_lahir" required>Tanggal Lahir</FieldLabel>
                                <InputBase
                                    id="tanggal_lahir"
                                    type="date"
                                    value={data.tanggal_lahir}
                                    onChange={v => setData('tanggal_lahir', v)}
                                    error={errors.tanggal_lahir}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Personal */}
                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <h2 className="mb-4 text-sm font-semibold text-foreground">Data Personal</h2>

                        {/* Jenis Kelamin */}
                        <div className="mb-4">
                            <FieldLabel htmlFor="jenis_kelamin" required>Jenis Kelamin</FieldLabel>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { value: 'L', label: '♂ Laki-laki' },
                                    { value: 'P', label: '♀ Perempuan' },
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setData('jenis_kelamin', opt.value)}
                                        className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors
                                            ${data.jenis_kelamin === opt.value
                                                ? 'border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                                                : 'border-border bg-background text-foreground hover:bg-muted'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                            {errors.jenis_kelamin && <p className="mt-1 text-xs text-red-500">{errors.jenis_kelamin}</p>}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {/* Agama */}
                            <div>
                                <FieldLabel htmlFor="agama" required>Agama</FieldLabel>
                                <select
                                    id="agama"
                                    value={data.agama}
                                    onChange={e => setData('agama', e.target.value)}
                                    className={`w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500
                                        ${errors.agama ? 'border-red-400' : 'border-border'}`}
                                >
                                    <option value="">— Pilih Agama —</option>
                                    {AGAMA_OPTIONS.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                {errors.agama && <p className="mt-1 text-xs text-red-500">{errors.agama}</p>}
                            </div>

                            {/* Status Perkawinan */}
                            <div>
                                <FieldLabel htmlFor="status_perkawinan" required>Status Perkawinan</FieldLabel>
                                <select
                                    id="status_perkawinan"
                                    value={data.status_perkawinan}
                                    onChange={e => setData('status_perkawinan', e.target.value)}
                                    className={`w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500
                                        ${errors.status_perkawinan ? 'border-red-400' : 'border-border'}`}
                                >
                                    <option value="">— Pilih Status —</option>
                                    {STATUS_PERKAWINAN_OPTIONS.map(o => (
                                        <option key={o.value} value={o.value}>{o.label}</option>
                                    ))}
                                </select>
                                {errors.status_perkawinan && <p className="mt-1 text-xs text-red-500">{errors.status_perkawinan}</p>}
                            </div>

                            {/* Pekerjaan */}
                            <div className="sm:col-span-2">
                                <FieldLabel htmlFor="pekerjaan" required>Pekerjaan</FieldLabel>
                                <InputBase
                                    id="pekerjaan"
                                    value={data.pekerjaan}
                                    onChange={v => setData('pekerjaan', v)}
                                    placeholder="Contoh: Petani, Wiraswasta, Pelajar/Mahasiswa"
                                    error={errors.pekerjaan}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Domisili */}
                    <div className="rounded-xl border bg-card p-5 shadow-sm">
                        <h2 className="mb-4 text-sm font-semibold text-foreground">Domisili</h2>
                        <div className="space-y-4">

                            {/* Wilayah */}
                            {wilayahList.length > 0 && (
                                <div>
                                    <FieldLabel htmlFor="wilayah_id">Wilayah / Dusun</FieldLabel>
                                    <select
                                        id="wilayah_id"
                                        value={data.wilayah_id}
                                        onChange={e => setData('wilayah_id', e.target.value)}
                                        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    >
                                        <option value="">— Pilih Wilayah —</option>
                                        {wilayahList.map(w => (
                                            <option key={w.id} value={w.id}>{w.label}</option>
                                        ))}
                                    </select>
                                    {errors.wilayah_id && <p className="mt-1 text-xs text-red-500">{errors.wilayah_id}</p>}
                                </div>
                            )}

                            {/* Alamat */}
                            <div>
                                <FieldLabel htmlFor="alamat" required>Alamat Lengkap</FieldLabel>
                                <textarea
                                    id="alamat"
                                    value={data.alamat}
                                    onChange={e => setData('alamat', e.target.value)}
                                    rows={3}
                                    placeholder="Nama jalan, nomor rumah, RT/RW, dusun..."
                                    className={`w-full resize-none rounded-xl border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500
                                        ${errors.alamat ? 'border-red-400' : 'border-border'}`}
                                />
                                {errors.alamat && <p className="mt-1 text-xs text-red-500">{errors.alamat}</p>}
                            </div>

                            {/* No KK */}
                            <div>
                                <FieldLabel htmlFor="no_kk">Nomor Kartu Keluarga (No. KK)</FieldLabel>
                                <InputBase
                                    id="no_kk"
                                    value={data.no_kk}
                                    onChange={v => setData('no_kk', v)}
                                    placeholder="16 digit — opsional"
                                    error={errors.no_kk}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tombol simpan */}
                    <div className="flex items-center justify-between rounded-xl border bg-card px-5 py-4 shadow-sm">
                        <p className="text-xs text-muted-foreground">
                            <span className="text-red-500">*</span> Field wajib diisi
                        </p>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-xl bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {processing ? 'Menyimpan…' : 'Simpan Data'}
                        </button>
                    </div>

                </form>
            </div>
        </AppLayout>
    );
}
