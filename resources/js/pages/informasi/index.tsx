import { Head, Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface KontenItem {
    id: number;
    judul: string;
    slug: string;
    tipe: string;
    created_at: string;
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
        <div className="min-h-screen bg-background">
            <Head title="Informasi Desa | SADESA" />

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
                {/* Page title */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground">Informasi Desa</h1>
                    <p className="text-sm text-muted-foreground">Berita dan pengumuman terbaru dari Desa Cirangkong</p>
                </div>

                {/* Filter */}
                <div className="mb-6 flex flex-wrap gap-3">
                    <form onSubmit={e => { e.preventDefault(); applyFilter({ search }); }} className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Cari berita…"
                                className="w-56 rounded-lg border bg-background py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                        <button type="submit" className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
                            Cari
                        </button>
                    </form>
                    <div className="flex gap-2">
                        {(['', 'berita', 'pengumuman'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => applyFilter({ tipe: t })}
                                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${(filters.tipe ?? '') === t ? 'bg-teal-600 text-white' : 'border hover:bg-muted text-muted-foreground'}`}
                            >
                                {t === '' ? 'Semua' : t === 'berita' ? '📰 Berita' : '📢 Pengumuman'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid artikel */}
                {konten.data.length === 0 ? (
                    <div className="py-16 text-center text-muted-foreground">
                        Tidak ada informasi yang ditemukan.
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {konten.data.map(item => (
                            <Link
                                key={item.id}
                                href={`/informasi/${item.slug}`}
                                className="group rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                            >
                                <div className="mb-3 flex items-center justify-between">
                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${item.tipe === 'berita' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {item.tipe === 'berita' ? '📰 Berita' : '📢 Pengumuman'}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                                <h2 className="font-semibold text-foreground group-hover:text-teal-600 line-clamp-2 leading-snug">
                                    {item.judul}
                                </h2>
                                {item.admin && (
                                    <p className="mt-2 text-xs text-muted-foreground">Oleh: {item.admin.name}</p>
                                )}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {konten.last_page > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-1">
                        {konten.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                preserveState
                                className={`rounded-md px-3 py-1.5 text-sm ${link.active ? 'bg-teal-600 text-white' : 'border hover:bg-muted text-muted-foreground'} ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
