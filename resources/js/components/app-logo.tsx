/** SADESA logomark — derived from design system assets/logomark.svg */
export default function AppLogo() {
    return (
        <>
            {/* Logomark: teal rounded square + house icon + signal arcs */}
            <div className="flex aspect-square size-[38px] shrink-0 items-center justify-center">
                <svg width="38" height="38" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="56" height="56" rx="14" fill="#0d9488"/>
                    <path d="M28 16.5 L40 26 V40.5 a1.5 1.5 0 0 1-1.5 1.5 H17.5 A1.5 1.5 0 0 1 16 40.5 V26 Z"
                        fill="none" stroke="#fff" strokeWidth="2.6" strokeLinejoin="round"/>
                    <rect x="24.6" y="31.5" width="6.8" height="10.5" rx="1" fill="#fff"/>
                    <path d="M33.5 16.2 a6 6 0 0 1 6 6"
                        fill="none" stroke="#99f6e4" strokeWidth="2.4" strokeLinecap="round"/>
                    <path d="M33.8 12 a10.2 10.2 0 0 1 10.2 10.2"
                        fill="none" stroke="#5eead4" strokeWidth="2.4" strokeLinecap="round" opacity="0.7"/>
                </svg>
            </div>

            {/* Wordmark */}
            <div className="ml-2.5 grid flex-1 text-left leading-tight">
                <span className="truncate text-[17px] font-bold tracking-[0.5px] text-foreground">
                    SADESA
                </span>
                <span className="truncate text-[10.5px] font-medium text-muted-foreground">
                    Sahabat Digital Desa
                </span>
            </div>
        </>
    );
}
