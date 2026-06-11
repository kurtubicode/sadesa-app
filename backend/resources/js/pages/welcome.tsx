import { Head, Link, usePage } from '@inertiajs/react';
import {
    ChevronDown,
    ChevronRight,
    Clock,
    Facebook,
    FileText,
    FolderOpen,
    Instagram,
    Lock,
    Mail,
    MapPin,
    Menu,
    Phone,
    Shield,
    ShieldCheck,
    FileCheck,
    MessageSquare,
    Users,
    X,
    Youtube,
    Zap,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { dashboard, login, register } from '@/routes';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PageProps {
    auth: { user: { name: string } | null };
    canRegister?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupiah(n: number): string {
    return 'Rp ' + n.toLocaleString('id-ID') + ',-';
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({ user, canRegister }: { user: PageProps['auth']['user']; canRegister: boolean }) {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handler);
        return () => window.removeEventListener('scroll', handler);
    }, []);

    const navLinks = [
        { href: '#beranda', label: 'Beranda' },
        { href: '#tentang', label: 'Tentang' },
        { href: '#fitur', label: 'Layanan' },
        { href: '#transparansi', label: 'Transparansi' },
        { href: '#statistik', label: 'Statistik' },
        { href: '#berita', label: 'Berita' },
        { href: '#kontak', label: 'Kontak' },
    ];

    return (
        <nav className={`fixed top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-white/95 shadow-md backdrop-blur-sm dark:bg-gray-900/95' : 'bg-transparent'}`}>
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <a href="#beranda" className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 shadow">
                        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            <polyline strokeLinecap="round" strokeLinejoin="round" points="9 22 9 12 15 12 15 22" />
                        </svg>
                    </div>
                    <div>
                        <span className={`text-lg font-bold leading-none ${scrolled ? 'text-foreground' : 'text-white'}`}>SADESA</span>
                        <p className={`text-xs leading-none ${scrolled ? 'text-muted-foreground' : 'text-teal-100'}`}>Desa Cirangkong</p>
                    </div>
                </a>

                {/* Desktop nav */}
                <div className="hidden items-center gap-6 lg:flex">
                    {navLinks.map(l => (
                        <a key={l.href} href={l.href}
                            className={`text-sm font-medium transition-colors hover:text-teal-400 ${scrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white/90'}`}>
                            {l.label}
                        </a>
                    ))}
                </div>

                {/* CTA */}
                <div className="hidden items-center gap-3 lg:flex">
                    {user ? (
                        <Link href={dashboard()}
                            className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-teal-700">
                            Dashboard <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                    ) : (
                        <>
                            <Link href={login()}
                                className={`text-sm font-medium transition-colors hover:text-teal-400 ${scrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white'}`}>
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
                <button onClick={() => setOpen(v => !v)}
                    className={`rounded-lg p-2 lg:hidden ${scrolled ? 'text-gray-700 dark:text-gray-200' : 'text-white'}`}>
                    {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile menu */}
            {open && (
                <div className="border-t bg-white px-4 py-4 shadow-lg dark:border-gray-700 dark:bg-gray-900 lg:hidden">
                    <div className="flex flex-col gap-3">
                        {navLinks.map(l => (
                            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
                                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-teal-50 hover:text-teal-700 dark:text-gray-200 dark:hover:bg-teal-900/20">
                                {l.label}
                            </a>
                        ))}
                        <hr className="dark:border-gray-700" />
                        {user ? (
                            <Link href={dashboard()} className="rounded-xl bg-teal-600 px-4 py-2 text-center text-sm font-semibold text-white">
                                Dashboard
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
    );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero({ user, canRegister }: { user: PageProps['auth']['user']; canRegister: boolean }) {
    return (
        <section id="beranda" className="relative flex min-h-screen items-center overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute left-0 top-0 h-full w-full"
                    style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
            </div>
            {/* Gradient orbs */}
            <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl" />
            <div className="absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />

            <div className="relative z-10 mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    {/* Text */}
                    <div className="text-center lg:text-left">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-4 py-1.5 text-sm text-teal-200">
                            <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                            Sistem Digital Resmi Desa Cirangkong
                        </div>
                        <h1 className="mb-4 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                            Sistem Administrasi<br />
                            <span className="text-teal-300">Desa Cirangkong</span>
                        </h1>
                        <p className="mb-4 text-lg font-medium text-teal-100">
                            Digitalisasi Pelayanan untuk Desa yang Lebih Maju dan Transparan
                        </p>
                        <p className="mb-8 max-w-lg text-base leading-relaxed text-teal-100/80">
                            SADESA hadir sebagai solusi digital untuk meningkatkan kualitas pelayanan administrasi dan transparansi pengelolaan desa. Akses informasi lebih cepat, pelayanan lebih mudah.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
                            <Link href={user ? dashboard() : login()}
                                className="flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-teal-800 shadow-lg transition hover:bg-teal-50 hover:shadow-xl">
                                {user ? 'Buka Dashboard' : 'Masuk ke Dashboard'}
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                            <a href="#tentang"
                                className="flex items-center gap-2 rounded-2xl border-2 border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20">
                                Pelajari Lebih Lanjut
                                <ChevronDown className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    {/* Stats card */}
                    <div className="mx-auto w-full max-w-sm lg:max-w-none">
                        <div className="rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-md">
                            <p className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-teal-200">
                                Statistik Desa
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { value: '2.847', label: 'Jiwa', sub: 'Total Penduduk' },
                                    { value: '785', label: 'KK', sub: 'Kepala Keluarga' },
                                    { value: '342', label: 'Ha', sub: 'Luas Wilayah' },
                                    { value: '12/4', label: 'RT/RW', sub: 'Pembagian Wilayah' },
                                ].map((s, i) => (
                                    <div key={i} className="rounded-2xl bg-white/10 p-4 text-center">
                                        <div className="text-2xl font-bold text-white">{s.value}</div>
                                        <div className="text-sm font-semibold text-teal-200">{s.label}</div>
                                        <div className="mt-0.5 text-xs text-teal-300/70">{s.sub}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <a href="#tentang" className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/60 hover:text-white">
                <ChevronDown className="h-8 w-8" />
            </a>
        </section>
    );
}

// ─── Tentang ──────────────────────────────────────────────────────────────────

function Tentang() {
    const keunggulan = [
        { icon: Zap, title: 'Pelayanan Lebih Cepat', desc: 'Proses administrasi yang lebih cepat dengan sistem digital terintegrasi', color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' },
        { icon: Shield, title: 'Transparansi Penuh', desc: 'Akses informasi keuangan dan program desa secara real-time', color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' },
        { icon: Users, title: 'User-Friendly', desc: 'Interface yang mudah digunakan untuk semua kalangan', color: 'bg-teal-50 text-teal-600 dark:bg-teal-900/20' },
        { icon: Lock, title: 'Data Terjamin', desc: 'Keamanan data terjaga dengan sistem enkripsi modern', color: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20' },
    ];

    return (
        <section id="tentang" className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-16 lg:grid-cols-2">
                    <div>
                        <div className="mb-3 inline-block rounded-full bg-teal-50 px-4 py-1.5 text-sm font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                            Tentang SADESA
                        </div>
                        <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl">
                            Platform Digital untuk Desa yang Lebih Baik
                        </h2>
                        <p className="mb-6 text-base leading-relaxed text-muted-foreground">
                            SADESA — Sahabat Digital Desa, adalah platform digital yang dirancang khusus untuk memudahkan pengelolaan administrasi Desa Cirangkong. Mengintegrasikan berbagai layanan desa dalam satu platform yang mudah diakses, transparan, dan efisien.
                        </p>
                        <div className="space-y-3">
                            {['Pengajuan surat online tanpa antri', 'Laporan pengaduan real-time', 'Transparansi anggaran desa', 'Informasi & pengumuman resmi desa'].map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-600">
                                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {keunggulan.map((k, i) => (
                            <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md">
                                <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl ${k.color}`}>
                                    <k.icon className="h-5 w-5" />
                                </div>
                                <h3 className="mb-1.5 text-sm font-bold text-foreground">{k.title}</h3>
                                <p className="text-xs leading-relaxed text-muted-foreground">{k.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── Fitur ────────────────────────────────────────────────────────────────────

function Fitur() {
    const fitur = [
        { icon: Users, title: 'Manajemen Data Penduduk', desc: 'Pengelolaan data kependudukan yang terstruktur dan terintegrasi. Data warga tersimpan aman dan mudah diakses untuk keperluan administrasi.', color: 'bg-blue-600' },
        { icon: FileText, title: 'Layanan Surat Menyurat', desc: 'Pembuatan surat administrasi seperti Surat Keterangan, Surat Pengantar, dan dokumen resmi lainnya dengan sistem digital.', color: 'bg-teal-600' },
        { icon: Shield, title: 'Transparansi Keuangan', desc: 'Pengelolaan dan monitoring APBDes secara transparan. Laporan keuangan dapat diakses oleh warga untuk akuntabilitas yang lebih baik.', color: 'bg-emerald-600' },
        { icon: FolderOpen, title: 'Administrasi Umum', desc: 'Pengelolaan arsip, dokumen desa, dan administrasi umum lainnya dalam sistem yang terorganisir dengan baik.', color: 'bg-orange-500' },
    ];

    return (
        <section id="fitur" className="bg-muted py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-14 text-center">
                    <div className="mb-3 inline-block rounded-full bg-teal-50 px-4 py-1.5 text-sm font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                        Fitur & Layanan
                    </div>
                    <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                        Semua Kebutuhan Desa dalam Satu Platform
                    </h2>
                    <p className="mx-auto max-w-2xl text-base text-muted-foreground">
                        Berbagai fitur yang memudahkan administrasi dan pelayanan desa untuk seluruh warga Cirangkong
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {fitur.map((f, i) => (
                        <div key={i} className="group rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                            <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${f.color} shadow-md`}>
                                <f.icon className="h-6 w-6 text-white" />
                            </div>
                            <h3 className="mb-3 text-base font-bold text-foreground">{f.title}</h3>
                            <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Profil Desa ──────────────────────────────────────────────────────────────

function ProfilDesa() {
    const misi = [
        'Meningkatkan kualitas pelayanan publik yang cepat, mudah, dan transparan',
        'Mendorong partisipasi aktif masyarakat dalam pembangunan desa',
        'Mengelola keuangan desa secara profesional dan akuntabel',
        'Mengembangkan potensi ekonomi lokal untuk kesejahteraan masyarakat',
        'Melestarikan nilai-nilai budaya dan kearifan lokal',
    ];

    const struktur = [
        { jabatan: 'Kepala Desa', nama: '[Nama Kepala Desa]' },
        { jabatan: 'Sekretaris Desa', nama: '[Nama Sekretaris]' },
        { jabatan: 'Kasi Pemerintahan', nama: '[Nama Kasi]' },
        { jabatan: 'Kasi Kesejahteraan', nama: '[Nama Kasi]' },
        { jabatan: 'Kasi Pelayanan', nama: '[Nama Kasi]' },
        { jabatan: 'Kaur Keuangan', nama: '[Nama Kaur]' },
        { jabatan: 'Kaur Umum & Perencanaan', nama: '[Nama Kaur]' },
    ];

    return (
        <section className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-14 text-center">
                    <div className="mb-3 inline-block rounded-full bg-teal-50 px-4 py-1.5 text-sm font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                        Profil Desa
                    </div>
                    <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                        Profil Desa Cirangkong
                    </h2>
                </div>

                <div className="grid gap-10 lg:grid-cols-2">
                    {/* Visi Misi */}
                    <div className="space-y-6">
                        <p className="text-base leading-relaxed text-muted-foreground">
                            Desa Cirangkong merupakan salah satu desa yang berada di wilayah Kabupaten Bandung, Jawa Barat. Dengan komitmen untuk terus berkembang, kami menghadirkan sistem digital untuk meningkatkan kualitas pelayanan kepada masyarakat.
                        </p>

                        <div className="rounded-2xl border-l-4 border-teal-500 bg-teal-50 p-5 dark:bg-teal-900/20">
                            <h3 className="mb-2 font-bold text-teal-800 dark:text-teal-300">Visi</h3>
                            <p className="text-sm leading-relaxed text-teal-700 dark:text-teal-400">
                                Terwujudnya Desa Cirangkong yang Maju, Mandiri, dan Sejahtera melalui Tata Kelola Pemerintahan yang Baik dan Berlandaskan Nilai-Nilai Kearifan Lokal.
                            </p>
                        </div>

                        <div>
                            <h3 className="mb-3 font-bold text-foreground">Misi</h3>
                            <ol className="space-y-2">
                                {misi.map((m, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-muted-foreground">
                                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">{i + 1}</span>
                                        {m}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>

                    {/* Struktur */}
                    <div>
                        <h3 className="mb-4 font-bold text-foreground">Struktur Organisasi</h3>
                        <div className="space-y-2">
                            {struktur.map((s, i) => (
                                <div key={i} className={`flex items-center justify-between rounded-xl p-3.5 ${i === 0 ? 'bg-teal-600 text-white' : 'border border-border bg-muted/50'}`}>
                                    <div>
                                        <p className={`text-sm font-semibold ${i === 0 ? 'text-white' : 'text-foreground'}`}>{s.jabatan}</p>
                                        <p className={`text-xs ${i === 0 ? 'text-teal-100' : 'text-muted-foreground'}`}>{s.nama}</p>
                                    </div>
                                    {i === 0 && (
                                        <div className="rounded-full bg-white/20 px-2 py-0.5 text-xs text-white">Pimpinan</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── Transparansi ─────────────────────────────────────────────────────────────

function Transparansi() {
    const pendapatan = [
        { label: 'Dana Desa', value: 750_000_000, total: 1_245_000_000 },
        { label: 'Alokasi Dana Desa', value: 325_000_000, total: 1_245_000_000 },
        { label: 'Bagi Hasil Pajak & Retribusi', value: 120_000_000, total: 1_245_000_000 },
        { label: 'Lain-lain Pendapatan', value: 50_000_000, total: 1_245_000_000 },
    ];
    const belanja = [
        { label: 'Penyelenggaraan Pemerintahan', value: 425_000_000, total: 1_245_000_000 },
        { label: 'Pelaksanaan Pembangunan', value: 520_000_000, total: 1_245_000_000 },
        { label: 'Pembinaan Kemasyarakatan', value: 180_000_000, total: 1_245_000_000 },
        { label: 'Pemberdayaan Masyarakat', value: 95_000_000, total: 1_245_000_000 },
        { label: 'Penanggulangan Bencana', value: 25_000_000, total: 1_245_000_000 },
    ];
    const program = [
        { judul: 'Pembangunan Jalan Desa', status: 'Dalam Pelaksanaan', progress: 65, anggaran: 250_000_000, color: 'bg-blue-500' },
        { judul: 'Pengadaan Air Bersih', status: 'Perencanaan', progress: 20, anggaran: 150_000_000, color: 'bg-amber-500' },
        { judul: 'Pemberdayaan UMKM', status: 'Berjalan', progress: 80, anggaran: 75_000_000, color: 'bg-teal-500' },
    ];

    return (
        <section id="transparansi" className="bg-muted py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-14 text-center">
                    <div className="mb-3 inline-block rounded-full bg-teal-50 px-4 py-1.5 text-sm font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                        Transparansi
                    </div>
                    <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
                        Transparansi Anggaran & Program
                    </h2>
                    <p className="text-base text-muted-foreground">Keterbukaan informasi untuk akuntabilitas yang lebih baik</p>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* APBDes */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="font-bold text-foreground">APBDes Tahun 2025</h3>
                                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                                    Total: Rp 1,245 M
                                </span>
                            </div>

                            <div className="mb-5">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Pendapatan</p>
                                <div className="space-y-2">
                                    {pendapatan.map((p, i) => (
                                        <div key={i}>
                                            <div className="mb-1 flex justify-between text-xs">
                                                <span className="text-muted-foreground">{p.label}</span>
                                                <span className="font-medium text-foreground">{formatRupiah(p.value)}</span>
                                            </div>
                                            <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                                                <div className="h-full rounded-full bg-teal-500 transition-all"
                                                    style={{ width: `${(p.value / p.total) * 100}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Belanja</p>
                                <div className="space-y-2">
                                    {belanja.map((b, i) => (
                                        <div key={i}>
                                            <div className="mb-1 flex justify-between text-xs">
                                                <span className="text-muted-foreground">{b.label}</span>
                                                <span className="font-medium text-foreground">{formatRupiah(b.value)}</span>
                                            </div>
                                            <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                                                <div className="h-full rounded-full bg-blue-500 transition-all"
                                                    style={{ width: `${(b.value / b.total) * 100}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Program Prioritas */}
                    <div>
                        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                            <h3 className="mb-4 font-bold text-foreground">Program Prioritas 2025</h3>
                            <div className="space-y-5">
                                {program.map((p, i) => (
                                    <div key={i}>
                                        <div className="mb-1.5 flex items-start justify-between gap-2">
                                            <p className="text-sm font-semibold text-foreground">{p.judul}</p>
                                            <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                                {p.status}
                                            </span>
                                        </div>
                                        <div className="mb-1 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                                            <div className={`h-full rounded-full ${p.color} transition-all`}
                                                style={{ width: `${p.progress}%` }} />
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>{p.progress}% selesai</span>
                                            <span>{formatRupiah(p.anggaran)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── Statistik ────────────────────────────────────────────────────────────────

function Statistik() {
    // Data dummy untuk simulasi statistik desa sesuai desain dashboard
    const stats = [
        { label: 'Total Penduduk', value: '3,842', trend: '+2.4%', icon: Users },
        { label: 'Warga Terverifikasi', value: '2,150', trend: '+12%', icon: ShieldCheck },
        { label: 'Pengajuan Selesai', value: '450', trend: '+5.7%', icon: FileCheck },
        { label: 'Laporan Warga', value: '12', trend: '-2', icon: MessageSquare },
    ];

    const activities = [
        { user: 'Budi Santoso', action: 'Mengajukan Surat Domisili', time: '2 jam yang lalu' },
        { user: 'Siti Aminah', action: 'Melaporkan Lampu Jalan Mati', time: '5 jam yang lalu' },
        { user: 'Admin Desa', action: 'Update APBDes 2025', time: 'Kemarin' },
    ];

    return (
        <section id="statistik" className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-14 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <div className="mb-3 inline-block rounded-full bg-teal-50 px-4 py-1.5 text-sm font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                            Data & Statistik
                        </div>
                        <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                            Monitoring Layanan Desa
                        </h2>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-12">
                    {/* Stat Cards (Right side/Top in mobile) */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1">
                        {stats.map((s, i) => (
                            <div key={i} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400">
                                    <s.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-xl font-bold text-foreground">{s.value}</p>
                                        <span className={`text-[10px] font-bold ${s.trend.startsWith('+') ? 'text-emerald-600' : 'text-amber-600'}`}>
                                            {s.trend}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chart Area (Main/Left side) */}
                    <div className="lg:col-span-8">
                        <div className="flex h-full flex-col rounded-3xl border border-border bg-card p-8 shadow-sm">
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-foreground">Aktivitas Pelayanan</h3>
                                    <p className="text-xs text-muted-foreground">Statistik pengajuan surat 6 bulan terakhir</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                                        <span className="h-2 w-2 rounded-full bg-teal-500"></span> Pengajuan
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                                        <span className="h-2 w-2 rounded-full bg-blue-500"></span> Selesai
                                    </div>
                                </div>
                            </div>

                            {/* Simulated Chart with SVG */}
                            <div className="relative mt-auto flex-1 min-h-[250px]">
                                <svg className="h-full w-full overflow-visible" preserveAspectRatio="none">
                                    {/* Grid lines */}
                                    {[0, 1, 2, 3, 4].map((i) => (
                                        <line key={i} x1="0" y1={`${i * 25}%`} x2="100%" y2={`${i * 25}%`} className="stroke-border" strokeDasharray="4 4" />
                                    ))}
                                    {/* Line Graph 1 */}
                                    <path 
                                        d="M 0 180 Q 150 150 300 190 T 600 100 T 900 130 T 1200 80" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="3" 
                                        className="text-teal-500" 
                                        vectorEffect="non-scaling-stroke"
                                    />
                                    {/* Line Graph 2 */}
                                    <path 
                                        d="M 0 220 Q 150 200 300 230 T 600 160 T 900 180 T 1200 140" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="3" 
                                        className="text-blue-500 opacity-60" 
                                        vectorEffect="non-scaling-stroke"
                                    />
                                </svg>
                                <div className="mt-4 flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    <span>Jan</span>
                                    <span>Feb</span>
                                    <span>Mar</span>
                                    <span>Apr</span>
                                    <span>Mei</span>
                                    <span>Jun</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity (Full width bottom or separate column) */}
                    <div className="lg:col-span-12">
                        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                            <h3 className="mb-5 text-sm font-bold text-foreground">Aktivitas Terakhir</h3>
                            <div className="space-y-4">
                                {activities.map((a, i) => (
                                    <div key={i} className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 p-3 transition hover:bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                                                {a.user.substring(0, 2)}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-foreground leading-none">{a.user}</p>
                                                <p className="mt-1 text-[10px] text-muted-foreground">{a.action}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-medium text-muted-foreground italic">{a.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── Berita ───────────────────────────────────────────────────────────────────

function Berita({ berita = [] }: { berita?: any[] }) {
    return (
        <section id="berita" className="bg-background py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-14 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <div className="mb-3 inline-block rounded-full bg-teal-50 px-4 py-1.5 text-sm font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                            Berita & Pengumuman
                        </div>
                        <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                            Berita & Pengumuman Terbaru
                        </h2>
                    </div>
                    <Link href="/informasi" className="flex items-center gap-1.5 text-sm font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400">
                        Lihat Semua <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {berita.length > 0 ? berita.map((b, i) => (
                        <article key={i} className="group flex flex-col rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                            <div className="h-36 rounded-t-2xl bg-gradient-to-br from-teal-600 to-emerald-700" />
                            <div className="flex flex-1 flex-col p-5">
                                <div className="mb-3 flex items-center gap-2">
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${b.tipe === 'pengumuman' ? 'bg-blue-100 text-blue-700' : 'bg-teal-100 text-teal-700'} dark:bg-opacity-20 uppercase`}>
                                        {b.tipe}
                                    </span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(b.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                                <h3 className="mb-2 flex-1 text-sm font-bold leading-snug text-gray-900 group-hover:text-teal-600 dark:text-white dark:group-hover:text-teal-400 line-clamp-2">
                                    {b.judul}
                                </h3>
                                <p className="mb-4 text-xs leading-relaxed text-muted-foreground line-clamp-2" dangerouslySetInnerHTML={{ __html: b.konten.substring(0, 100) + '...' }} />
                                <Link href={`/informasi/${b.slug}`} className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400">
                                    Baca selengkapnya <ChevronRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>
                        </article>
                    )) : (
                        <div className="col-span-full py-12 text-center text-gray-500">
                            Belum ada berita terbaru.
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

// ─── Kontak ───────────────────────────────────────────────────────────────────

function Kontak() {
    return (
        <section id="kontak" className="bg-muted py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-14 text-center">
                    <div className="mb-3 inline-block rounded-full bg-teal-50 px-4 py-1.5 text-sm font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                        Kontak
                    </div>
                    <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Hubungi Kami</h2>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* Info kontak */}
                    <div className="space-y-5">
                        {[
                            { 
                                icon: MapPin, 
                                title: 'Alamat', 
                                lines: [
                                    'Pemerintah Desa Cirangkong', 
                                    'Jl. Lempar - Cirangkong KM. 08', 
                                    'Desa Cirangkong Kecamatan Cijambe',
                                    'Kabupaten Subang, 41286'
                                ] 
                            },
                            { icon: Phone, title: 'Telepon', lines: ['(0260) xxxx-xxxx'] },
                            { icon: Mail, title: 'Email', lines: ['desacirangkong@subang.go.id'] },
                            { icon: Clock, title: 'Jam Pelayanan', lines: ['Senin – Kamis: 08.00 – 15.00 WIB', 'Jumat: 08.00 – 11.30 WIB', 'Sabtu – Minggu: Libur'] },
                        ].map((c, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-900/30">
                                    <c.icon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">{c.title}</p>
                                    {c.lines.map((l, j) => (
                                        <p key={j} className="text-sm text-gray-700 dark:text-gray-300">{l}</p>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Sosmed */}
                        <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Media Sosial</p>
                            <div className="flex gap-3">
                                {[
                                    { Icon: Facebook, href: '#', label: 'Facebook' },
                                    { Icon: Instagram, href: '#', label: 'Instagram' },
                                    { Icon: Youtube, href: '#', label: 'YouTube' },
                                ].map(({ Icon, href, label }) => (
                                    <a key={label} href={href}
                                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition hover:border-teal-400 hover:bg-teal-50 hover:text-teal-600 dark:hover:border-teal-500 dark:hover:bg-teal-900/30 dark:hover:text-teal-400">
                                        <Icon className="h-4 w-4" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Map */}
                    <div className="lg:col-span-2">
                        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm h-full min-h-[400px]">
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31718.42340576395!2d107.7262447!3d-6.4251765!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e6923c6f05a9b73%3A0xc669f6f6f9c9a66a!2sDesa%20Cirangkong!5e0!3m2!1sid!2sid!4v1717000000000!5m2!1sid!2sid" 
                                width="100%" 
                                height="100%" 
                                style={{ border: 0 }} 
                                allowFullScreen={true} 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                                className="invert-[0.05] grayscale-[0.2] dark:invert-[0.9] dark:hue-rotate-180"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({ canRegister }: { canRegister: boolean }) {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <div className="mb-4 flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600">
                                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                    <polyline strokeLinecap="round" strokeLinejoin="round" points="9 22 9 12 15 12 15 22" />
                                </svg>
                            </div>
                            <span className="text-lg font-bold text-white">SADESA</span>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-400">
                            Sahabat Digital Desa Cirangkong — platform digital untuk pelayanan yang lebih cepat dan transparan.
                        </p>
                    </div>

                    {/* Navigasi */}
                    <div>
                        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">Navigasi</p>
                        <ul className="space-y-2">
                            {['Beranda', 'Tentang', 'Layanan', 'Berita', 'Transparansi', 'Kontak'].map(l => (
                                <li key={l}><a href={`#${l.toLowerCase()}`} className="text-sm text-gray-400 transition hover:text-teal-400">{l}</a></li>
                            ))}
                        </ul>
                    </div>

                    {/* Layanan */}
                    <div>
                        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">Layanan</p>
                        <ul className="space-y-2">
                            {['Surat Keterangan', 'Surat Pengantar', 'Informasi APBDes', 'Pengaduan Masyarakat'].map(l => (
                                <li key={l}><a href="#" className="text-sm text-gray-400 transition hover:text-teal-400">{l}</a></li>
                            ))}
                        </ul>
                    </div>

                    {/* CTA */}
                    <div>
                        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">Akses Sistem</p>
                        <div className="space-y-3">
                            <Link href={login()}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">
                                Masuk ke Dashboard
                            </Link>
                            {canRegister && (
                                <Link href={register()}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-600 px-4 py-2.5 text-sm font-semibold text-gray-300 hover:border-teal-500 hover:text-teal-400">
                                    Daftar Akun
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                <hr className="my-8 border-gray-800" />

                <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <p className="text-xs text-gray-500">
                        © {new Date().getFullYear()} Pemerintah Desa Cirangkong. SADESA — Sahabat Digital Desa.
                    </p>
                    <p className="text-xs text-gray-600">
                        Kecamatan Cijambe, Kabupaten Subang
                    </p>
                </div>
            </div>
        </footer>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Welcome({ canRegister = true, berita = [] }: { canRegister?: boolean; berita?: any[] }) {
    const { auth } = usePage<PageProps>().props;
    const user = auth?.user ?? null;

    return (
        <>
            <Head title="SADESA — Sahabat Digital Desa Cirangkong" />
            <div className="font-sans antialiased">
                <Navbar user={user} canRegister={canRegister} />
                <Hero user={user} canRegister={canRegister} />
                <Tentang />
                <Fitur />
                <ProfilDesa />
                <Transparansi />
                <Statistik />
                <Berita berita={berita} />
                <Kontak />
                <Footer canRegister={canRegister} />
            </div>
        </>
    );
}
