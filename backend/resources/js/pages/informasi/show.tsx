import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, User, Newspaper, Megaphone, Clock, Share2 } from 'lucide-react';
import PublicLayout from '@/layouts/public-layout';

interface Artikel {
    id: number;
    judul: string;
    slug: string;
    konten: string;
    tipe: string;
    created_at: string;
    admin?: { id: number; name: string } | null;
}

interface TerkaitItem {
    id: number;
    judul: string;
    slug: string;
    tipe: string;
    created_at: string;
}

interface Props {
    artikel: Artikel;
    terkait: TerkaitItem[];
}

export default function InformasiShow({ artikel, terkait }: Props) {
    return (
        <PublicLayout>
            <Head title={`${artikel.judul} | Informasi Resmi Desa Cirangkong`} />

            <div className="bg-muted min-h-screen py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb / Back */}
                    <nav className="mb-8">
                        <Link
                            href="/informasi"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" /> Kembali ke Pusat Informasi
                        </Link>
                    </nav>

                    <div className="grid gap-10 lg:grid-cols-3">
                        {/* Artikel utama */}
                        <div className="lg:col-span-2">
                            <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
                                {/* Header Artikel */}
                                <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-8 py-10 text-white relative">
                                    <div className="absolute top-0 right-0 p-10 opacity-10 font-bold text-8xl select-none">DOC</div>
                                    <div className="relative z-10">
                                        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                                            {artikel.tipe === 'berita' ? <Newspaper className="h-3 w-3" /> : <Megaphone className="h-3 w-3" />}
                                            {artikel.tipe}
                                        </div>
                                        <h1 className="text-2xl font-extrabold leading-tight sm:text-4xl">
                                            {artikel.judul}
                                        </h1>
                                    </div>
                                </div>

                                {/* Meta Info */}
                                <div className="flex flex-wrap items-center gap-6 border-b border-gray-100 bg-gray-50/50 px-8 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-teal-600" />
                                        <span>Penulis: {artikel.admin?.name ?? 'Pemerintah Desa'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-teal-600" />
                                        <span>{new Date(artikel.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-teal-600" />
                                        <span>Dilihat: [Statistik]</span>
                                    </div>
                                </div>

                                {/* Konten */}
                                <div className="p-8 sm:p-10">
                                    <div className="prose prose-teal max-w-none dark:prose-invert">
                                        {artikel.konten.split('\n').map((para, i) =>
                                            para.trim() ? (
                                                <p key={i} className="mb-6 text-base leading-relaxed text-gray-700 dark:text-gray-300">
                                                    {para}
                                                </p>
                                            ) : null
                                        )}
                                    </div>

                                    {/* Footer Artikel */}
                                    <div className="mt-12 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t pt-8 border-gray-100 dark:border-gray-700">
                                        <div className="text-sm text-gray-500 italic">
                                            * Informasi ini dipublikasikan secara resmi oleh Pemerintah Desa Cirangkong.
                                        </div>
                                        <button className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 transition">
                                            <Share2 className="h-4 w-4" /> Bagikan
                                        </button>
                                    </div>
                                </div>
                            </article>
                        </div>

                        {/* Sidebar */}
                        <aside className="space-y-8">
                            {/* Artikel Terkait */}
                            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                                <h3 className="mb-5 flex items-center gap-2 text-lg font-bold text-foreground">
                                    <Newspaper className="h-5 w-5 text-teal-600" />
                                    {artikel.tipe === 'berita' ? 'Berita' : 'Pengumuman'} Lainnya
                                </h3>
                                {terkait.length === 0 ? (
                                    <p className="text-sm text-gray-500 italic">Tidak ada artikel terkait lainnya.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {terkait.map(item => (
                                            <Link
                                                key={item.id}
                                                href={`/informasi/${item.slug}`}
                                                className="group block"
                                            >
                                                <p className="mb-1 text-sm font-bold leading-snug text-gray-900 decoration-teal-500 decoration-2 group-hover:underline dark:text-white">
                                                    {item.judul}
                                                </p>
                                                <p className="text-xs text-gray-400 font-medium">
                                                    {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-8">
                                    <Link
                                        href="/informasi"
                                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-50 py-3 text-sm font-bold text-teal-700 hover:bg-teal-100 dark:bg-teal-900/20 dark:text-teal-400 transition"
                                    >
                                        Lihat Semua Informasi <ArrowLeft className="h-4 w-4 rotate-180" />
                                    </Link>
                                </div>
                            </div>

                            {/* Banner Layanan */}
                            <div className="rounded-3xl bg-gradient-to-br from-teal-700 to-emerald-800 p-8 text-white shadow-lg">
                                <h3 className="mb-3 text-lg font-bold italic opacity-90">Butuh Pelayanan Desa?</h3>
                                <p className="mb-6 text-sm leading-relaxed text-teal-100">
                                    Sekarang urus surat keterangan dan laporan jadi lebih mudah via Portal SADESA.
                                </p>
                                <Link
                                    href="/login"
                                    className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-bold text-teal-800 shadow-md hover:bg-teal-50 transition"
                                >
                                    Masuk ke Portal
                                </Link>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
