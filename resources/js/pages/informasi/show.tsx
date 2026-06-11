import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar, User } from 'lucide-react';

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
        <div className="min-h-screen bg-background">
            <Head title={`${artikel.judul} | SADESA`} />

            {/* Header */}
            <header className="border-b bg-card shadow-sm">
                <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600">
                            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                <polyline strokeLinecap="round" strokeLinejoin="round" points="9 22 9 12 15 12 15 22" />
                            </svg>
                        </div>
                        <span className="font-bold text-foreground">SADESA</span>
                    </Link>
                    <Link href="/dashboard" className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
                        Portal
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-4 py-8">
                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Artikel utama */}
                    <article className="col-span-2">
                        <Link
                            href="/informasi"
                            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" /> Kembali ke Informasi
                        </Link>

                        {/* Meta */}
                        <div className="mb-3 flex items-center gap-3">
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${artikel.tipe === 'berita' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                {artikel.tipe === 'berita' ? '📰 Berita' : '📢 Pengumuman'}
                            </span>
                        </div>

                        {/* Judul */}
                        <h1 className="mb-4 text-2xl font-bold leading-tight text-foreground sm:text-3xl">
                            {artikel.judul}
                        </h1>

                        {/* Info penulis & tanggal */}
                        <div className="mb-6 flex flex-wrap items-center gap-4 border-b pb-5 text-sm text-muted-foreground">
                            {artikel.admin && (
                                <span className="flex items-center gap-1.5">
                                    <User className="h-4 w-4" /> {artikel.admin.name}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                {new Date(artikel.created_at).toLocaleDateString('id-ID', {
                                    day: 'numeric', month: 'long', year: 'numeric',
                                })}
                            </span>
                        </div>

                        {/* Isi konten */}
                        <div className="prose prose-sm max-w-none text-foreground">
                            {artikel.konten.split('\n').map((para, i) =>
                                para.trim() ? (
                                    <p key={i} className="mb-4 leading-relaxed">
                                        {para}
                                    </p>
                                ) : null
                            )}
                        </div>
                    </article>

                    {/* Sidebar: artikel terkait */}
                    <aside className="space-y-4">
                        <h3 className="font-semibold text-foreground">
                            {artikel.tipe === 'berita' ? 'Berita' : 'Pengumuman'} Lainnya
                        </h3>
                        {terkait.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Tidak ada artikel lain.</p>
                        ) : (
                            <div className="space-y-3">
                                {terkait.map(item => (
                                    <Link
                                        key={item.id}
                                        href={`/informasi/${item.slug}`}
                                        className="block rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug hover:text-teal-600">
                                            {item.judul}
                                        </p>
                                        <p className="mt-1.5 text-xs text-muted-foreground">
                                            {new Date(item.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric', month: 'short', year: 'numeric',
                                            })}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        )}

                        <div className="pt-2">
                            <Link
                                href="/informasi"
                                className="block rounded-lg bg-teal-50 px-4 py-3 text-center text-sm font-medium text-teal-700 hover:bg-teal-100 dark:bg-teal-900/20 dark:text-teal-400"
                            >
                                Lihat semua informasi →
                            </Link>
                        </div>
                    </aside>
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-12 border-t bg-card py-6">
                <p className="text-center text-xs text-muted-foreground">
                    © {new Date().getFullYear()} Pemerintah Desa Cirangkong · SADESA
                </p>
            </footer>
        </div>
    );
}
