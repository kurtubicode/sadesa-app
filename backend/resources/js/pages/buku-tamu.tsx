import { Head, useForm, usePage } from '@inertiajs/react';
import { BookOpen, CheckCircle, ChevronRight, Loader2, Phone, User, Users, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import PublicLayout from '@/layouts/public-layout';

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
        <PublicLayout>
            <Head title="Buku Tamu Digital | Pemerintah Desa Cirangkong" />

            <div className="bg-muted min-h-screen py-12">
                <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
                    {/* Intro */}
                    <div className="mb-10 text-center">
                        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                            Buku Tamu Digital
                        </h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Silakan isi data kunjungan Anda sebelum memulai pelayanan di Kantor Desa Cirangkong.
                        </p>
                    </div>

                    {/* Card */}
                    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-teal-900/5">
                        {/* Status bar */}
                        <div className="h-2 bg-gradient-to-r from-teal-500 to-emerald-500"></div>

                        <div className="p-8 sm:p-10">
                            {submitted ? (
                                /* ── Success state ─────────────────────────── */
                                <div className="py-10 text-center">
                                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-teal-50 dark:bg-teal-900/20">
                                        <CheckCircle className="h-10 w-10 text-teal-600 dark:text-teal-400" />
                                    </div>
                                    <h2 className="mb-3 text-2xl font-bold text-foreground">
                                        Data Tersimpan!
                                    </h2>
                                    <p className="mb-8 text-base text-muted-foreground leading-relaxed">
                                        Terima kasih telah mengisi buku tamu. <br />
                                        Silakan menunggu antrian atau langsung menuju loket pelayanan yang dituju.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setSubmitted(false)}
                                        className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-8 py-3.5 text-sm font-bold text-white hover:bg-teal-700 transition shadow-lg shadow-teal-600/20"
                                    >
                                        Isi Untuk Tamu Lain
                                    </button>
                                </div>
                            ) : (
                                /* ── Form ──────────────────────────────────── */
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid gap-6 sm:grid-cols-2">
                                        {/* Nama */}
                                        <div className="sm:col-span-2">
                                            <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                                Nama Lengkap <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={data.nama_pengunjung}
                                                    onChange={e => setData('nama_pengunjung', e.target.value)}
                                                    placeholder="Nama sesuai KTP"
                                                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-teal-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:focus:bg-gray-800"
                                                />
                                            </div>
                                            {errors.nama_pengunjung && (
                                                <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.nama_pengunjung}</p>
                                            )}
                                        </div>

                                        {/* Instansi */}
                                        <div className="sm:col-span-2">
                                            <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                                Instansi / Asal <span className="text-xs font-normal text-gray-400 ml-1">(Boleh dikosongkan)</span>
                                            </label>
                                            <div className="relative">
                                                <Users className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={data.instansi}
                                                    onChange={e => setData('instansi', e.target.value)}
                                                    placeholder="Contoh: Dinas Kesehatan / Alamat Rumah"
                                                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-teal-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:focus:bg-gray-800"
                                                />
                                            </div>
                                        </div>

                                        {/* No HP */}
                                        <div className="sm:col-span-2">
                                            <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                                Nomor HP Aktif <span className="text-xs font-normal text-gray-400 ml-1">(WhatsApp lebih baik)</span>
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    value={data.no_hp}
                                                    onChange={e => setData('no_hp', e.target.value)}
                                                    placeholder="0812xxxx"
                                                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-teal-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:focus:bg-gray-800"
                                                />
                                            </div>
                                            {errors.no_hp && (
                                                <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.no_hp}</p>
                                            )}
                                        </div>

                                        {/* Keperluan */}
                                        <div className="sm:col-span-2">
                                            <label className="mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300">
                                                Keperluan Kunjungan <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={data.keperluan}
                                                onChange={e => setData('keperluan', e.target.value)}
                                                placeholder="Contoh: Mengurus Surat Keterangan Domisili"
                                                rows={3}
                                                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:focus:bg-gray-800"
                                            />
                                            {errors.keperluan && (
                                                <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.keperluan}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                                        <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                        <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-400">
                                            Data yang Anda masukkan akan digunakan untuk keperluan pendataan tamu dan evaluasi pelayanan publik Desa Cirangkong.
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700 disabled:opacity-60"
                                    >
                                        {processing ? (
                                            <><Loader2 className="h-4 w-4 animate-spin" /> Memproses...</>
                                        ) : (
                                            <>Simpan Kunjungan <ChevronRight className="h-4 w-4" /></>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    <div className="mt-10 text-center">
                        <p className="text-xs text-gray-400">
                            Pemerintah Desa Cirangkong · Kecamatan Cijambe · Kabupaten Subang
                        </p>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
