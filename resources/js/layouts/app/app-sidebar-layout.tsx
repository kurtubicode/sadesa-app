import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';

// ─── Flash banner ─────────────────────────────────────────────────────────────

type FlashType = 'success' | 'error' | 'info';

const FLASH_STYLE: Record<FlashType, string> = {
    success: 'bg-green-50 border-green-400 text-green-800',
    error:   'bg-red-50 border-red-400 text-red-800',
    info:    'bg-blue-50 border-blue-400 text-blue-800',
};

const FLASH_ICON: Record<FlashType, string> = {
    success: '✅',
    error:   '⚠️',
    info:    'ℹ️',
};

function FlashBanner() {
    const { flash } = usePage<{ flash: Record<FlashType, string | null> }>().props;
    const [visible, setVisible] = useState<FlashType | null>(null);

    useEffect(() => {
        if (flash?.error)   { setVisible('error');   return; }
        if (flash?.success) { setVisible('success'); return; }
        if (flash?.info)    { setVisible('info');    return; }
        setVisible(null);
    }, [flash]);

    if (!visible) return null;

    return (
        <div className={`mx-4 mt-4 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${FLASH_STYLE[visible]}`}>
            <span>{FLASH_ICON[visible]}</span>
            <span className="flex-1">{flash[visible]}</span>
            <button
                onClick={() => setVisible(null)}
                className="ml-2 shrink-0 font-bold opacity-60 hover:opacity-100"
            >
                ✕
            </button>
        </div>
    );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <FlashBanner />
                {children}
            </AppContent>
        </AppShell>
    );
}
