import { Head, Link, router } from '@inertiajs/react';
import { ClockIcon, CheckCircle, XCircle, Users } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface VerifikasiItem {
    id: number;
    status: 'menunggu' | 'disetujui' | 'ditolak';
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
        nik: string | null;
        phone: string | null;
    };
}

interface Paginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    data: Paginator<VerifikasiItem>;
    filter: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
    menunggu: 'Menunggu', disetujui: 'Disetujui', ditolak: 'Ditolak',
};
const STATUS_COLOR: Record<string, string> = {
    menunggu:  'bg-amber-100 text-amber-700',
    disetujui: 'bg-green-100 text-green-700',
    ditolak:   'bg-red-100 text-red-700',
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
    { title: 'Verifikasi Warga', href: '/admin/verifikasi-warga' },
];

const FILTERS = [
    { value: 'menunggu',  label: 'Menunggu', icon: ClockIcon },
    { value: 'disetujui', label: 'Disetujui', icon: CheckCircle },
    { value: 'ditolak',   label: 'Ditolak', icon: XCircle },
    { value: 'semua',     label: 'Semua', icon: Users },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VerifikasiWarga({ data, filter }: Props) {
    const setFilter = (f: string) => {
        router.get('/admin/verifikasi-warga', { filter: f }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Verifikasi Warga | SADESA" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Verifikasi Warga</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Tinjau dan validasi dokumen identitas warga yang mendaftar.
                        </p>
                    </div>
                    <div className="rounded-xl bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 border border-amber-200">
                        {data.total} pengajuan
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 flex-wrap">
                    {FILTERS.map(({ value, label, icon: Icon }) => (
                        <button
                            key={value}
                            onClick={() => setFilter(value)}
                            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                                filter === value
                                    ? 'bg-teal-700 text-white shadow-sm'
                                    : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-400 hover:text-teal-700'
                            }`}
                        >
                            <Icon size={14} />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                {['Warga', 'NIK', 'Email/HP', 'Dikirim', 'Status', ''].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-16 text-center text-gray-400">
                                        Tidak ada pengajuan verifikasi.
                                    </td>
                                </tr>
                            ) : data.data.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition">
                                    <td className="px-4 py-3 font-semibold text-gray-900">{item.user.name}</td>
                                    <td className="px-4 py-3 font-mono text-gray-600">{item.user.nik ?? '—'}</td>
                                    <td className="px-4 py-3 text-gray-500">
                                        <div>{item.user.email}</div>
                                        {item.user.phone && <div className="text-xs">{item.user.phone}</div>}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{item.created_at}</td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_COLOR[item.status]}`}>
                                            {STATUS_LABEL[item.status]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/admin/verifikasi-warga/${item.id}`}
                                            className="text-xs font-semibold text-teal-700 hover:underline"
                                        >
                                            Tinjau →
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {data.last_page > 1 && (
                    <div className="flex justify-center gap-1">
                        {data.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                                    link.active
                                        ? 'bg-teal-700 text-white'
                                        : 'bg-white border text-gray-600 hover:border-teal-400 disabled:opacity-40 disabled:cursor-not-allowed'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
