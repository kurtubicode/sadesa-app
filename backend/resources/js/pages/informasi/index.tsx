import { Head, Link, router } from '@inertiajs/react';
import { Search, Calendar, Newspaper, Megaphone } from 'lucide-react';
import { useState } from 'react';
import PublicLayout from '@/layouts/public-layout';

interface KontenItem {
    id: number;
    judul: string;
    slug: string;
    tipe: string;
    created_at: string;
    konten: string;
    admin?: { id: number; name: string } | null;
}

interface Paginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    konten: Paginator<KontenItem>;
    filters: { tipe?: string; search?: string };
}

export default function InformasiIndex({ konten, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const applyFilter = (extra: Record<string, string>) =>
        router.get('/informasi', { ...filters, ...extra }, { preserveState: true });

    return (
        <PublicLayout>
            <Head title="Pusat Informasi & Berita Resmi | Pemerintah Desa Cirangkong" />

            <div className="bg-muted min-h-screen py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Page title */}
                    <div className="mb-10 text-center border-b pb-8 border-gray-200 dark:border-gray-800">
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl tracking-tight">
                            Pusat Informasi & Berita Resmi
                        </h1>
                        <p className="mt-3 max-w-2xl mx-auto text-base text-gray-500 dark:text-gray-400">
                            Ikuti perkembangan terbaru, agenda kegiatan, pengumuman, dan transparansi pelayanan dari Pemerintah Desa Cirangkong.
                        </p>
                    </div>

                    {/* Filter & Search */}
                    <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-card border-border shadow-sm dark:bg-gray-800">
                        <div className="flex flex-wrap gap-2">
                            {(['', 'berita', 'pengumuman'] as const).map(t => (
                                <button
                                    key={t}
                                    onClick={() => applyFilter({ tipe: t })}
                                    className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 ${(filters.tipe ?? '') === t ? 'bg-teal-600 text-white shadow-md shadow-teal-600/10' : 'border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                                >
                                    {t === '' ? 'Semua Informasi' : t === 'berita' ? <><Newspaper className="h-4 w-4" /> Berita</> : <><Megaphone className="h-4 w-4" /> Pengumuman</>}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={e => { e.preventDefault(); applyFilter({ search }); }} className="flex gap-2 w-full md:w-auto">
                            <div className="relative w-full md:w-72">
                                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Cari kata kunci berita…"
                                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-teal-500 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-teal-500/20"
                                />
                            </div>
                            <button type="submit" className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700 transition shadow-sm">
                                Cari
                            </button>
                        </form>
                    </div>

                    {/* Grid artikel */}
                    {konten.data.length === 0 ? (
                        <div className="py-24 text-center rounded-3xl bg-white dark:bg-gray-800 shadow-sm border">
                            <Newspaper className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                            <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">Belum Ada Informasi</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Tidak ada berita atau pengumuman yang sesuai dengan kriteria pencarian Anda.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {konten.data.map(item => (
                                <article key={item.id} className="group flex flex-col rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                                    <div className="h-44 rounded-t-2xl bg-gradient-to-br from-teal-600 to-emerald-700 p-6 flex flex-col justify-between text-white relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-10 font-bold text-7xl select-none">GOV</div>
                                        <div>
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-sm`}>
                                                {item.tipe}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-teal-100 font-medium">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>
                                    </div>
                                    <div className="flex flex-1 flex-col p-6">
                                        <h2 className="mb-3 text-lg font-bold leading-snug text-gray-900 group-hover:text-teal-600 dark:text-white dark:group-hover:text-teal-400 line-clamp-2">
                                            <Link href={`/informasi/${item.slug}`}>
                                                {item.judul}
                                            </Link>
                                        </h2>
                                        <p className="mb-5 text-sm leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-3" dangerouslySetInnerHTML={{ __html: item.konten.substring(0, 120) + '...' }} />
                                        <div className="mt-auto flex items-center justify-between border-t pt-4 border-gray-100 dark:border-gray-700">
                                            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                                                Oleh: {item.admin?.name ?? 'Pemerintah Desa'}
                                            </span>
                                            <Link href={`/informasi/${item.slug}`} className="flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400">
                                                Baca Artikel →
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {konten.last_page > 1 && (
                        <div className="mt-12 flex items-center justify-center gap-1">
                            {konten.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url ?? '#'}
                                    preserveState
                                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${link.active ? 'bg-teal-600 text-white shadow-md shadow-teal-600/10' : 'border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'} ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
