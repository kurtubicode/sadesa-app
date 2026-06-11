/**
 * Halaman dashboard default (fallback).
 * Role-specific dashboards: dashboard/admin.tsx, dashboard/staff.tsx, dashboard/kepala-desa.tsx
 * Controller: App\Http\Controllers\DashboardController
 */
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: dashboard() }];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard | SADESA" />
            <div className="flex h-full flex-1 items-center justify-center p-8">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-foreground">Dashboard</h2>
                    <p className="mt-2 text-muted-foreground">
                        Selamat datang di SADESA — Sahabat Digital Desa Cirangkong.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
