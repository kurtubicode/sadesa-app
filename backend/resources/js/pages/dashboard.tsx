/**
 * Halaman dashboard default (fallback).
 * Role-specific dashboards: dashboard/admin.tsx, dashboard/staff.tsx, dashboard/kepala-desa.tsx
 * Controller: App\Http\Controllers\DashboardController
 */
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem } from '@/types';
import { Users, ShieldCheck, FileCheck, MessageSquare, TrendingUp, Calendar, ChevronRight } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: dashboard() }];

export default function Dashboard() {
    // Data stats sesuai framework desain
    const widgets = [
        { title: 'Total Penduduk', value: '3,842', sub: '+2.4% bln ini', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
        { title: 'Surat Diproses', value: '14', sub: '5 butuh verifikasi', icon: FileCheck, color: 'text-teal-600', bg: 'bg-teal-50 dark:bg-teal-950/30' },
        { title: 'Laporan Baru', value: '3', sub: 'Belum ditanggapi', icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
        { title: 'Warga Aktif', value: '1,205', sub: '+12% aktif app', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
    ];

    const activities = [
        { id: 1, name: 'Budi Santoso', action: 'Mengajukan SKU', time: '10:45 WIB', date: 'Hari ini' },
        { id: 2, name: 'Siti Aminah', action: 'Laporan Jalan Rusak', time: '09:20 WIB', date: 'Hari ini' },
        { id: 3, name: 'Admin', action: 'Update Berita Desa', time: '16:00 WIB', date: 'Kemarin' },
        { id: 4, name: 'Kepala Desa', action: 'Tanda Tangan Digital', time: '14:30 WIB', date: 'Kemarin' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard | SADESA" />
            
            <div className="flex h-full flex-1 flex-col gap-6 p-8">
                {/* Header Section (Design Detail) */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold text-foreground">Ringkasan Statistik</h1>
                    <p className="text-sm text-muted-foreground">Gambaran umum operasional dan pelayanan Desa Cirangkong.</p>
                </div>

                {/* Stat Cards Grid (Framework Design) */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {widgets.map((w, i) => (
                        <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:shadow-md">
                            <div className="mb-4 flex items-center justify-between">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${w.bg} ${w.color}`}>
                                    <w.icon className="h-5 w-5" />
                                </div>
                                <TrendingUp className="h-4 w-4 text-muted-foreground opacity-20" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{w.title}</p>
                                <h3 className="mt-1 text-2xl font-bold text-foreground">{w.value}</h3>
                                <p className="mt-1 text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">{w.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid (12 Columns as per Design) */}
                <div className="grid gap-6 lg:grid-cols-12">
                    {/* Line Chart Widget (8/12 Width) */}
                    <div className="lg:col-span-8">
                        <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-8 shadow-sm">
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-foreground">Grafik Pelayanan</h3>
                                    <p className="text-xs text-muted-foreground">Volume pengajuan surat & laporan per bulan</p>
                                </div>
                                <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs font-semibold text-foreground">
                                    <Calendar className="h-3.5 w-3.5" /> Semester 1 2025
                                </div>
                            </div>

                            {/* Custom SVG Visualization (Adapting D3 style) */}
                            <div className="relative mt-auto flex-1 min-h-[300px]">
                                <svg className="h-full w-full overflow-visible" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="grad-teal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="rgb(20 184 166)" stopOpacity="0.1" />
                                            <stop offset="100%" stopColor="rgb(20 184 166)" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>
                                    {/* Y-Axis lines */}
                                    {[0, 1, 2, 3, 4].map((i) => (
                                        <line key={i} x1="0" y1={`${i * 25}%`} x2="100%" y2={`${i * 25}%`} className="stroke-border" strokeDasharray="6 6" />
                                    ))}
                                    {/* Area */}
                                    <path 
                                        d="M 0 250 Q 150 180 300 220 T 600 120 T 900 150 T 1200 100 V 300 H 0 Z" 
                                        fill="url(#grad-teal)" 
                                        vectorEffect="non-scaling-stroke"
                                    />
                                    {/* Line */}
                                    <path 
                                        d="M 0 250 Q 150 180 300 220 T 600 120 T 900 150 T 1200 100" 
                                        fill="none" 
                                        stroke="rgb(20 184 166)" 
                                        strokeWidth="3" 
                                        strokeLinecap="round"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                    {/* Points */}
                                    {[0, 300, 600, 900, 1200].map((x, i) => (
                                        <circle key={i} cx={`${(i / 4) * 100}%`} cy={i === 2 ? '40%' : i === 4 ? '33%' : '70%'} r="4" fill="white" stroke="rgb(20 184 166)" strokeWidth="2" />
                                    ))}
                                </svg>
                                <div className="mt-6 flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
                                    <span>Januari</span>
                                    <span>Februari</span>
                                    <span>Maret</span>
                                    <span>April</span>
                                    <span>Mei</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity Widget (4/12 Width) */}
                    <div className="lg:col-span-4">
                        <div className="flex h-full flex-col rounded-3xl border border-border bg-card shadow-sm">
                            <div className="border-b border-border p-6">
                                <h3 className="text-lg font-bold text-foreground">Aktivitas Terbaru</h3>
                                <p className="text-xs text-muted-foreground">Log kegiatan sistem secara real-time</p>
                            </div>
                            <div className="flex-1 overflow-auto p-6">
                                <div className="relative space-y-6 before:absolute before:left-[15px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-border">
                                    {activities.map((a) => (
                                        <div key={a.id} className="relative pl-9">
                                            <div className="absolute left-0 top-1.5 h-8 w-8 rounded-full border-4 border-card bg-teal-500 shadow-sm"></div>
                                            <div className="flex flex-col gap-1 rounded-xl bg-muted/40 p-3 transition hover:bg-muted/70">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-tight">{a.date}</span>
                                                    <span className="text-[10px] text-muted-foreground">{a.time}</span>
                                                </div>
                                                <p className="text-sm font-bold text-foreground leading-tight">{a.name}</p>
                                                <p className="text-xs text-muted-foreground">{a.action}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted/20 py-3 text-xs font-bold text-muted-foreground transition hover:bg-muted/50 hover:text-foreground">
                                    Lihat Semua Log <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
