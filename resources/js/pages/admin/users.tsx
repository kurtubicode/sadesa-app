import { Head, Link, router, useForm } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Pencil, Search, Trash2, UserCheck } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
    id: number;
    nik: string | null;
    name: string;
    email: string;
    phone: string | null;
    role: string;
    status: string;
    wilayah?: { id: number; nama: string } | null;
    created_at: string;
}

interface Paginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    users: Paginator<User>;
    filters: { role?: string; status?: string; search?: string };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLE_LABEL: Record<string, string> = {
    admin: 'Admin', staff: 'Staff', kepala_desa: 'Kepala Desa', warga: 'Warga',
};
const ROLE_COLOR: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700', staff: 'bg-blue-100 text-blue-700',
    kepala_desa: 'bg-teal-100 text-teal-700', warga: 'bg-gray-100 text-gray-700',
};
const STATUS_LABEL: Record<string, string> = {
    aktif: 'Aktif', nonaktif: 'Nonaktif', menunggu_verifikasi: 'Menunggu',
};
const STATUS_COLOR: Record<string, string> = {
    aktif: 'bg-green-100 text-green-700',
    nonaktif: 'bg-red-100 text-red-700',
    menunggu_verifikasi: 'bg-amber-100 text-amber-700',
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard() },
    { title: 'Kelola Pengguna', href: '/admin/users' },
];

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ user, onClose }: { user: User; onClose: () => void }) {
    const statusForm = useForm({ status: user.status });
    const roleForm   = useForm({ role: user.role });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-xl bg-background shadow-xl">
                <div className="border-b px-6 py-4">
                    <h3 className="font-semibold text-foreground">Edit Pengguna</h3>
                    <p className="text-sm text-muted-foreground">{user.name} — {user.email}</p>
                </div>
                <div className="space-y-4 p-6">
                    {/* Status */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">Status Akun</label>
                        <select
                            value={statusForm.data.status}
                            onChange={e => statusForm.setData('status', e.target.value)}
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                            <option value="aktif">Aktif</option>
                            <option value="nonaktif">Nonaktif</option>
                            <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
                        </select>
                    </div>
                    {/* Role */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-foreground">Role</label>
                        <select
                            value={roleForm.data.role}
                            onChange={e => roleForm.setData('role', e.target.value)}
                            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                            <option value="warga">Warga</option>
                            <option value="staff">Staff</option>
                            <option value="kepala_desa">Kepala Desa</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-3 border-t px-6 py-4">
                    <button onClick={onClose} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">
                        Batal
                    </button>
                    <button
                        onClick={() => {
                            if (statusForm.data.status !== user.status) {
                                statusForm.patch(`/admin/users/${user.id}/status`, { onSuccess: onClose });
                            } else if (roleForm.data.role !== user.role) {
                                roleForm.patch(`/admin/users/${user.id}/role`, { onSuccess: onClose });
                            } else {
                                onClose();
                            }
                        }}
                        disabled={statusForm.processing || roleForm.processing}
                        className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
                    >
                        Simpan
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function AdminUsers({ users, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [editUser, setEditUser] = useState<User | null>(null);

    const applyFilter = (extra: Record<string, string>) => {
        router.get('/admin/users', { ...filters, ...extra }, { preserveState: true });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter({ search });
    };

    const handleDelete = (user: User) => {
        if (!confirm(`Hapus akun ${user.name}? Tindakan tidak dapat dibatalkan.`)) return;
        router.delete(`/admin/users/${user.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Pengguna | SADESA" />
            {editUser && <EditModal user={editUser} onClose={() => setEditUser(null)} />}

            <div className="flex flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-bold text-foreground">Kelola Pengguna</h1>
                        <p className="text-sm text-muted-foreground">Total {users.total} pengguna terdaftar</p>
                    </div>
                </div>

                {/* Filter bar */}
                <div className="flex flex-wrap gap-3">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Cari nama, email, NIK…"
                                className="rounded-lg border bg-background py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 w-64"
                            />
                        </div>
                        <button type="submit" className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
                            Cari
                        </button>
                    </form>

                    <select
                        value={filters.role ?? ''}
                        onChange={e => applyFilter({ role: e.target.value })}
                        className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        <option value="">Semua Role</option>
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                        <option value="kepala_desa">Kepala Desa</option>
                        <option value="warga">Warga</option>
                    </select>

                    <select
                        value={filters.status ?? ''}
                        onChange={e => applyFilter({ status: e.target.value })}
                        className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        <option value="">Semua Status</option>
                        <option value="aktif">Aktif</option>
                        <option value="nonaktif">Nonaktif</option>
                        <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
                    </select>

                    {(filters.role || filters.status || filters.search) && (
                        <button onClick={() => router.get('/admin/users')} className="rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
                            Reset Filter
                        </button>
                    )}
                </div>

                {/* Table */}
                <div className="rounded-xl border bg-card shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/30 text-left">
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Pengguna</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">NIK</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Wilayah</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Role</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Terdaftar</th>
                                    <th className="px-4 py-3 font-medium text-muted-foreground">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.length === 0 ? (
                                    <tr><td colSpan={7} className="py-12 text-center text-muted-foreground">Tidak ada pengguna ditemukan.</td></tr>
                                ) : users.data.map(user => (
                                    <tr key={user.id} className="border-b last:border-0 hover:bg-muted/20">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-foreground">{user.name}</div>
                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{user.nik ?? '—'}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{user.wilayah?.nama ?? '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLOR[user.role] ?? 'bg-muted text-muted-foreground'}`}>
                                                {ROLE_LABEL[user.role] ?? user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[user.status] ?? 'bg-muted text-muted-foreground'}`}>
                                                {STATUS_LABEL[user.status] ?? user.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {new Date(user.created_at).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button onClick={() => setEditUser(user)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" title="Edit">
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDelete(user)} className="rounded-md p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20" title="Hapus">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.last_page > 1 && (
                        <div className="flex items-center justify-between border-t px-4 py-3">
                            <p className="text-sm text-muted-foreground">
                                Halaman {users.current_page} dari {users.last_page} ({users.total} data)
                            </p>
                            <div className="flex gap-1">
                                {users.links.map((link, i) => (
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
