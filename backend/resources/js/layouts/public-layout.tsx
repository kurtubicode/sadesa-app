import { Head, Link, usePage } from '@inertiajs/react';
import {
    Facebook,
    Instagram,
    Mail,
    MapPin,
    Menu,
    Phone,
    X,
    Youtube,
    ChevronRight,
    Moon,
    Sun,
    Monitor,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { dashboard, login, register } from '@/routes';
import { useAppearance } from '@/hooks/use-appearance';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PageProps {
    auth: { user: { name: string } | null };
    canRegister?: boolean;
}

export default function PublicLayout({ children, title }: { children: React.ReactNode; title?: string }) {
    const { auth, canRegister } = usePage<any>().props;
    const user = auth?.user ?? null;
    const { appearance, updateAppearance } = useAppearance();

    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const navLinks = [
        { href: '/#beranda', label: 'Beranda' },
        { href: '/#tentang', label: 'Tentang' },
        { href: '/#fitur', label: 'Layanan' },
        { href: '/informasi', label: 'Berita' },
        { href: '/#kontak', label: 'Kontak' },
        { href: '/buku-tamu', label: 'Buku Tamu' },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground font-sans antialiased">
            {/* Navbar */}
            <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-background/95 shadow-md backdrop-blur-sm' : 'bg-background/80 backdrop-blur-sm'}`}>
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 shadow">
                            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                <polyline strokeLinecap="round" strokeLinejoin="round" points="9 22 9 12 15 12 15 22" />
                            </svg>
                        </div>
                        <div>
                            <span className="text-lg font-bold leading-none">SADESA</span>
                            <p className="text-xs leading-none text-teal-600 dark:text-teal-400 font-semibold">Pemerintah Desa Cirangkong</p>
                        </div>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden items-center gap-6 lg:flex">
                        {navLinks.map(l => (
                            <Link key={l.label} href={l.href}
                                className="text-sm font-medium transition-colors hover:text-teal-600 text-foreground/80 hover:text-foreground">
                                {l.label}
                            </Link>
                        ))}
                    </div>

                    {/* CTA & Theme Toggle */}
                    <div className="hidden items-center gap-3 lg:flex">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                    <span className="sr-only">Toggle theme</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => updateAppearance('light')}>
                                    <Sun className="mr-2 h-4 w-4" /> <span>Light</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateAppearance('dark')}>
                                    <Moon className="mr-2 h-4 w-4" /> <span>Dark</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateAppearance('system')}>
                                    <Monitor className="mr-2 h-4 w-4" /> <span>System</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="h-6 w-px bg-border/60 mx-1"></div>

                        {user ? (
                            <Link href={dashboard()}
                                className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-teal-700">
                                Portal Layanan <ChevronRight className="h-3.5 w-3.5" />
                            </Link>
                        ) : (
                            <>
                                <Link href={login()}
                                    className="text-sm font-medium transition-colors hover:text-teal-600">
                                    Masuk
                                </Link>
                                {canRegister && (
                                    <Link href={register()}
                                        className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-teal-700">
                                        Daftar
                                    </Link>
                                )}
                            </>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <div className="flex items-center gap-2 lg:hidden">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => updateAppearance('light')}>Light</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateAppearance('dark')}>Dark</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateAppearance('system')}>System</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <button onClick={() => setOpen(v => !v)}
                            className="rounded-lg p-2 text-foreground">
                            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {open && (
                    <div className="border-t bg-background px-4 py-4 shadow-lg lg:hidden">
                        <div className="flex flex-col gap-3">
                            {navLinks.map(l => (
                                <Link key={l.label} href={l.href} onClick={() => setOpen(false)}
                                    className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-teal-600">
                                    {l.label}
                                </Link>
                            ))}
                            <hr className="border-border" />
                            {user ? (
                                <Link href={dashboard()} className="rounded-xl bg-teal-600 px-4 py-2 text-center text-sm font-semibold text-white">
                                    Portal Layanan
                                </Link>
                            ) : (
                                <div className="flex gap-2">
                                    <Link href={login()} className="flex-1 rounded-xl border border-teal-600 px-4 py-2 text-center text-sm font-semibold text-teal-600">Masuk</Link>
                                    {canRegister && (
                                        <Link href={register()} className="flex-1 rounded-xl bg-teal-600 px-4 py-2 text-center text-sm font-semibold text-white">Daftar</Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="pt-20">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-neutral-950 text-neutral-300 dark:bg-black">
                <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Brand */}
                        <div className="lg:col-span-1">
                            <div className="mb-4 flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 shadow-lg shadow-teal-900/20">
                                    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                        <polyline strokeLinecap="round" strokeLinejoin="round" points="9 22 9 12 15 12 15 22" />
                                    </svg>
                                </div>
                                <span className="text-lg font-bold text-white">SADESA</span>
                            </div>
                            <p className="text-sm leading-relaxed text-neutral-400">
                                Sahabat Digital Desa Cirangkong — Platform layanan administrasi dan informasi publik resmi Pemerintah Desa Cirangkong, Kecamatan Cijambe, Kabupaten Subang.
                            </p>
                        </div>

                        {/* Kontak */}
                        <div className="lg:col-span-1 text-sm space-y-4">
                            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">Hubungi Kami</p>
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                                <p>Jl. Lempar - Cirangkong KM. 08, Desa Cirangkong, Cijambe, Subang 41286</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-teal-600 shrink-0" />
                                <p>(0260) xxxx-xxxx</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-teal-600 shrink-0" />
                                <p>desacirangkong@subang.go.id</p>
                            </div>
                        </div>

                        {/* Layanan */}
                        <div>
                            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">Layanan Populer</p>
                            <ul className="space-y-2 text-sm">
                                {['Surat Keterangan Domisili', 'Surat Pengantar Nikah', 'Surat Keterangan Usaha', 'Pengaduan Infrastruktur'].map(l => (
                                    <li key={l}><Link href="/dashboard" className="text-neutral-400 transition hover:text-teal-400">{l}</Link></li>
                                ))}
                            </ul>
                        </div>

                        {/* Sosmed */}
                        <div>
                            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-500">Media Sosial</p>
                            <div className="flex gap-3">
                                {[
                                    { Icon: Facebook, href: '#', label: 'Facebook' },
                                    { Icon: Instagram, href: '#', label: 'Instagram' },
                                    { Icon: Youtube, href: '#', label: 'YouTube' },
                                ].map(({ Icon, href, label }) => (
                                    <a key={label} href={href}
                                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 transition hover:border-teal-500 hover:bg-teal-900/20 hover:text-teal-400">
                                        <Icon className="h-5 w-5" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    <hr className="my-10 border-neutral-800" />

                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                        <p className="text-xs text-neutral-500">
                            © {new Date().getFullYear()} Pemerintah Desa Cirangkong. Seluruh Hak Cipta Dilindungi.
                        </p>
                        <div className="flex items-center gap-4 text-xs text-neutral-600">
                            <span>SADESA v1.0</span>
                            <span className="h-4 w-px bg-neutral-800"></span>
                            <span>Kecamatan Cijambe, Subang</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
