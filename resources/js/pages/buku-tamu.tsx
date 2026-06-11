import { Head, useForm, usePage } from '@inertiajs/react';
import { BookOpen, CheckCircle, ChevronRight, Home, Loader2, Phone, User, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function BukuTamu() {
    const { props } = usePage<{ flash?: { sukses?: string } }>();
    const [submitted, setSubmitted] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        nama_pengunjung: '',
        instansi:        '',
        keperluan:       '',
        no_hp:           '',
    });

    // Deteksi sukses via flash
    useEffect(() => {
        if (props.flash?.sukses) {
            setSubmitted(true);
            reset();
        }
    }, [props.flash?.sukses]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/buku-tamu');
    };

    return (
        <>
            <Head title="Buku Tamu Digital — SADESA" />

            <div className="min-h-screen bg-gradient-to-br from-teal-950 via-teal-900 to-emerald-900">
                {/* Top nav mini */}
                <div className="mx-auto flex max-w-xl items-center justify-between px-5 py-4">
                    <a href="/" className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
                            <Home className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <span className="text-sm font-bold text-white leading-none">SADESA</span>
                            <p className="text-xs text-teal-300 leading-none">Desa Cirangkong</p>
                        </div>
                    </a>
                    <a href="/" className="flex items-center gap-1 text-xs text-teal-300 hover:text-white transition-colors">
                        Kembali ke beranda <ChevronRight className="h-3.5 w-3.5" />
                    </a>
                </div>

                {/* Card */}
                <div className="mx-auto max-w-xl px-4 pb-12 pt-4">
                    <div className="rounded-3xl border border-white/10 bg-white/95 shadow-2xl backdrop-blur-sm dark:bg-gray-900/95">
                        {/* Header */}
                        <div className="rounded-t-3xl bg-gradient-to-r from-teal-700 to-emerald-700 px-8 py-6 text-center">
                            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                                <BookOpen className="h-7 w-7 text-white" />
                            </div>
                            <h1 className="text-xl font-bold text-white">Buku Tamu Digital</h1>
                            <p className="mt-1 text-sm text-teal-100">Kantor Desa Cirangkong</p>
                        </div>

                        <div className="px-8 py-7">
                            {submitted ? (
                                /* ── Success state ─────────────────────────── */
                                <div className="py-6 text-center">
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50">
                                        <CheckCircle className="h-9 w-9 text-teal-600" />
                                    </div>
                                    <h2 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                                        Terima Kasih!
                                    </h2>
                                    <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                                        Data kunjungan Anda telah berhasil tercatat.
                                        Silakan masuk ke loket pelayanan.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setSubmitted(false)}
                                        className="rounded-2xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
                                    >
                                        Isi Ulang (Tamu Lain)
                                    </button>
                                </div>
                            ) : (
                                /* ── Form ──────────────────────────────────── */
                                <>
                                    <p className="mb-6 text-center text-sm text-gray-500 dark:text-gray-400">
                                        Harap isi data di bawah ini sebelum memulai pelayanan
                                    </p>

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        {/* Nama */}
                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                <span className="flex items-center gap-1.5">
                                                    <User className="h-3.5 w-3.5 text-teal-600" />
                                                    Nama Lengkap <span className="text-red-500">*</span>
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.nama_pengunjung}
                                                onChange={e => setData('nama_pengunjung', e.target.value)}
                                                placeholder="Masukkan nama lengkap Anda"
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-teal-400"
                                            />
                                            {errors.nama_pengunjung && (
                                                <p className="mt-1.5 text-xs text-red-500">{errors.nama_pengunjung}</p>
                                            )}
                                        </div>

                                        {/* Instansi */}
                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                <span className="flex items-center gap-1.5">
                                                    <Users className="h-3.5 w-3.5 text-teal-600" />
                                                    Instansi / Asal{' '}
                                                    <span className="font-normal text-gray-400">(opsional)</span>
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                value={data.instansi}
                                                onChange={e => setData('instansi', e.target.value)}
                                                placeholder="Nama instansi, sekolah, atau alamat asal"
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-teal-400"
                                            />
                                        </div>

                                        {/* Keperluan */}
                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                Keperluan <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={data.keperluan}
                                                onChange={e => setData('keperluan', e.target.value)}
                                                placeholder="Jelaskan keperluan kunjungan Anda"
                                                rows={3}
                                                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-teal-400"
                                            />
                                            {errors.keperluan && (
                                                <p className="mt-1.5 text-xs text-red-500">{errors.keperluan}</p>
                                            )}
                                        </div>

                                        {/* No HP */}
                                        <div>
                                            <label className="mb-1.5 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                <span className="flex items-center gap-1.5">
                                                    <Phone className="h-3.5 w-3.5 text-teal-600" />
                                                    Nomor HP{' '}
                                                    <span className="font-normal text-gray-400">(opsional)</span>
                                                </span>
                                            </label>
                                            <input
                                                type="tel"
                                                value={data.no_hp}
                                                onChange={e => setData('no_hp', e.target.value)}
                                                placeholder="cth: 08123456789"
                                                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-teal-400"
                                            />
                                            {errors.no_hp && (
                                                <p className="mt-1.5 text-xs text-red-500">{errors.no_hp}</p>
                                            )}
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-teal-700 disabled:opacity-60"
                                        >
                                            {processing ? (
                                                <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</>
                                            ) : (
                                                <>Daftar Kunjungan <ChevronRight className="h-4 w-4" /></>
                                            )}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>

                    <p className="mt-6 text-center text-xs text-teal-400">
                        © {new Date().getFullYear()} Desa Cirangkong — SADESA
                    </p>
                </div>
            </div>
        </>
    );
}
