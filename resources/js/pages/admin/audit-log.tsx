import { Head, Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

interface AuditLogItem {
    id: number;
    action: string;
    model: string | null;
    model_id: number | null;
    ip_address: string | null;
    created_at: string;
    user?: { id: number; name: string; role: string } | null;
}

interface Paginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    logs: Paginator<AuditLogItem>;
    filters: { search?: string; date?: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
    { title: 'Audit Log', href: '/admin/audit-log' },
];

const ROLE_COLOR: Record<string, string> = {
    admin:        'bg-red-100 text-red-700',
    staff:        'bg-blue-100 text-blue-700',
    kepala_desa:  'bg-purple-100 text-purple-700',
    warga:        'bg-green-100 text-green-700',
};

const ROLE_LABEL: Record<string, string> = {
    admin:       'Admin',
    staff:       'Staff',
    kepala_desa: 'Kepala Desa',
    warga:       'Warga',
};

function shortModel(model: string | null): string {
    if (!model) return '—';
    const parts = model.split('\\');
    return parts[parts.length - 1];
}

export default function AdminAuditLog({ logs, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [date,   setDate]   = useState(filters.date   ?? '');

    const applyFilter = (extra: Record<string, string>) =>
        router.get('/admin/audit-log', { ...filters, ...extra }, { preserveState: true });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter({ search, date });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Log | SADESA" />

            <div className="flex flex-col gap-6 p-4">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Audit Log</h1>
                    <p className="text-sm text-muted-foreground">Riwayat aktivitas sistem — {logs.total} entri</p>
                </div>

                {/* Filter */}
                <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Cari aksi atau pengguna…"
                            className="w-64 rounded-lg border bg-background py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                        type="submit"
                        className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                    >
                        Cari
                    </button>
                    {(filters.search || filters.date) && (
                        <button
                            type="button"
                            onClick={() => { setSearch(''); setDate(''); router.get('/admin/audit-log'); }}
                            className="rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
                        >
                            Reset
                        </button>
                    )}
                </form>

                {/* Table */}
                <div className="rounded-xl border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/30 text-left">
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Pengguna</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Aksi</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Model</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">ID</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">IP Address</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Waktu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-muted-foreground">
                                            Tidak ada data audit log.
                                        </td>
                                    </tr>
                                ) : logs.data.map(item => (
                                    <tr key={item.id} className="border-b last:border-0 hover:bg-muted/20">
                                        <td className="px-4 py-3">
                                            {item.user ? (
                                                <>
                                                    <p className="font-medium text-foreground">{item.user.name}</p>
                                                    <span className={`mt-0.5 inline-flex rounded-full px-1.5 py-0.5 text-xs font-medium ${ROLE_COLOR[item.user.role] ?? 'bg-muted text-muted-foreground'}`}>
                                                        {ROLE_LABEL[item.user.role] ?? item.user.role}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-muted-foreground">System</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">
                                                {item.action}
                                            </code>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {shortModel(item.model)}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                            {item.model_id ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                            {item.ip_address ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                            {new Date(item.created_at).toLocaleString('id-ID')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {logs.last_page > 1 && (
                        <div className="flex items-center justify-between border-t px-4 py-3">
                            <p className="text-sm text-muted-foreground">
                                Halaman {logs.current_page} dari {logs.last_page}
                            </p>
                            <div className="flex gap-1">
                                {logs.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url ?? '#'}
                                        preserveState
                                        className={`rounded-md px-3 py-1.5 text-sm ${link.active ? 'bg-teal-600 text-white' : 'border hover:bg-muted text-muted-foreground'} ${!link.url ? 'pointer-events-none opacity-40' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
