import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

interface PengaduanDetail {
    id: number;
    judul: string;
    deskripsi: string;
    status: string;
    created_at: string;
    user?: { id: number; name: string; nik: string | null; phone: string | null } | null;
    kategori?: { id: number; nama_kategori: string } | null;
    bukti?: { id: number; path_file: string }[];
    tanggapan?: { id: number; isi: string; created_at: string; user: { name: string; role: string } | null }[];
}

interface Props { pengaduan: PengaduanDetail }

const STATUS_COLOR: Record<string, string> = {
    menunggu: 'bg-amber-100 text-amber-700', diproses: 'bg-blue-100 text-blue-700',
    selesai: 'bg-green-100 text-green-700', ditolak: 'bg-red-100 text-red-700',
};
const STATUS_LABEL: Record<string, string> = {
    menunggu: 'Menunggu', diproses: 'Diproses', selesai: 'Selesai', ditolak: 'Ditolak',
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
    { title: 'Pengaduan', href: '/admin/pengaduan' },
    { title: 'Detail', href: '#' },
];

export default function AdminPengaduanDetail({ pengaduan }: Props) {
    const cfg = STATUS_COLOR[pengaduan.status] ?? 'bg-muted text-muted-foreground';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Pengaduan | SADESA`} />

            <div className="flex flex-col gap-6 p-4">
                <div className="flex items-center gap-3">
                    <Link href="/admin/pengaduan" className="rounded-lg border p-2 hover:bg-muted">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-foreground">{pengaduan.judul}</h1>
                        <div className="mt-1 flex items-center gap-2">
                            <span className={`inline-flex rounded-full px-3 py-0.5 text-xs font-medium ${cfg}`}>
                                {STATUS_LABEL[pengaduan.status] ?? pengaduan.status}
                            </span>
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                {pengaduan.kategori?.nama_kategori}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="col-span-2 space-y-6">
                        {/* Deskripsi */}
                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <h3 className="mb-3 font-semibold text-foreground">Isi Pengaduan</h3>
                            <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">{pengaduan.deskripsi}</p>
                            <p className="mt-3 text-xs text-muted-foreground">
                                Dilaporkan: {new Date(pengaduan.created_at).toLocaleString('id-ID')}
                            </p>
                        </div>

                        {/* Foto bukti */}
                        {pengaduan.bukti && pengaduan.bukti.length > 0 && (
                            <div className="rounded-xl border bg-card p-6 shadow-sm">
                                <h3 className="mb-3 font-semibold text-foreground">Foto Bukti</h3>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {pengaduan.bukti.map(b => (
                                        <a key={b.id} href={`/storage/${b.path_file}`} target="_blank" rel="noopener" className="block">
                                            <img src={`/storage/${b.path_file}`} alt="bukti" className="h-32 w-full rounded-lg object-cover border hover:opacity-90" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tanggapan */}
                        <div className="rounded-xl border bg-card p-6 shadow-sm">
                            <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                                <MessageSquare className="h-4 w-4" /> Tanggapan ({pengaduan.tanggapan?.length ?? 0})
                            </h3>
                            {(!pengaduan.tanggapan || pengaduan.tanggapan.length === 0) ? (
                                <p className="text-sm text-muted-foreground">Belum ada tanggapan.</p>
                            ) : (
                                <div className="space-y-3">
                                    {pengaduan.tanggapan.map(t => (
                                        <div key={t.id} className="rounded-lg bg-muted/40 p-3">
                                            <div className="mb-1 flex items-center justify-between">
                                                <span className="text-sm font-medium text-foreground">{t.user?.name ?? '—'}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(t.created_at).toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-foreground">{t.isi}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar: info pelapor */}
                    <div>
                        <div className="rounded-xl border bg-card p-5 shadow-sm">
                            <h4 className="mb-3 font-semibold text-foreground">Data Pelapor</h4>
                            <dl className="space-y-2">
                                {[
                                    ['Nama', pengaduan.user?.name],
                                    ['NIK', pengaduan.user?.nik],
                                    ['Telepon', pengaduan.user?.phone],
                                ].map(([label, value]) => (
                                    <div key={label as string}>
                                        <dt className="text-xs text-muted-foreground">{label}</dt>
                                        <dd className="text-sm font-medium text-foreground">{value ?? '—'}</dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
