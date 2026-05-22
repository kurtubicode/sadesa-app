import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

// ─── Ikon bangunan (dekoratif) ────────────────────────────────────────────────

function BuildingIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 80 80" fill="none" className={className} aria-hidden="true">
            <path
                d="M8 72h64M14 72V32l26-20 26 20v40M30 72V52h20v20M22 44h8M22 54h8M50 44h8M50 54h8"
                stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
            />
            <path d="M32 32h16v10H32z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
    );
}

// ─── Logo SADESA ──────────────────────────────────────────────────────────────

function SadesaLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5 text-white" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    <polyline strokeLinecap="round" strokeLinejoin="round" points="9 22 9 12 15 12 15 22" />
                </svg>
            </div>
            <span className="text-base font-black tracking-wider text-teal-800">SADESA</span>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Login({ status, canResetPassword, canRegister }: Props) {
    return (
        <div className="flex min-h-screen">
            <Head title="Masuk | SADESA Admin" />

            {/* ── Panel Kiri ── */}
            <div className="relative hidden overflow-hidden lg:flex lg:w-[42%] lg:flex-col lg:justify-between bg-gradient-to-br from-teal-950 via-teal-900 to-emerald-900 p-12">

                {/* Dekorasi geometris */}
                <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full border border-teal-700/30" />
                    <div className="absolute -right-8  -top-8  h-48 w-48 rounded-full border border-teal-700/20" />
                    <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full border border-emerald-700/20" />
                    <div className="absolute bottom-32 right-0 h-px w-48 bg-gradient-to-l from-teal-400/30 to-transparent" />
                    <div className="absolute top-1/2 -right-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
                    <div className="absolute top-1/4 -left-24 h-64 w-64 rounded-full bg-teal-400/10 blur-3xl" />
                </div>

                {/* Logo atas */}
                <div className="relative z-10">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-700/50 bg-teal-800/60 backdrop-blur-sm">
                        <BuildingIcon className="h-8 w-8 text-teal-200" />
                    </div>
                </div>

                {/* Konten tengah */}
                <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
                    <h1 className="mb-6 text-4xl font-black leading-tight tracking-tight text-white">
                        Mewujudkan Tata Kelola Desa yang Transparan dan Mandiri.
                    </h1>
                    <p className="text-base leading-relaxed text-teal-200/80">
                        SADESA — Sahabat Digital Desa, hadir untuk memudahkan perangkat Desa Cirangkong dalam melayani warga secara digital.
                    </p>
                </div>

                {/* Footer kiri */}
                <div className="relative z-10">
                    <div className="mb-3 h-px w-12 bg-teal-500/50" />
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400/70">
                        Editorial Civic Excellence
                    </p>
                </div>
            </div>

            {/* ── Panel Kanan ── */}
            <div className="relative flex w-full flex-col bg-stone-50 lg:w-[58%]">

                {/* Watermark bangunan */}
                <div className="pointer-events-none absolute right-0 top-0 overflow-hidden">
                    <BuildingIcon className="h-72 w-72 translate-x-12 -translate-y-8 text-gray-200/60" />
                </div>

                {/* Isi form — tengah vertikal */}
                <div className="flex flex-1 flex-col justify-between px-8 py-10 sm:px-16 lg:px-20">

                    {/* Logo & judul */}
                    <div className="relative z-10">
                        <SadesaLogo />
                    </div>

                    <div className="relative z-10 w-full max-w-md">
                        <h2 className="mb-1 text-3xl font-black text-gray-900 leading-tight">
                            Admin Portal<br />Desa Cirangkong
                        </h2>
                        <p className="mb-8 text-sm text-gray-500">
                            Silakan masuk dengan kredensial staf Anda
                        </p>

                        {/* Status (reset password berhasil, dll) */}
                        {status && (
                            <div className="mb-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
                                {status}
                            </div>
                        )}

                        <Form
                            {...store.form()}
                            resetOnSuccess={['password']}
                            className="flex flex-col gap-5"
                        >
                            {({ processing, errors }) => (
                                <>
                                    {/* Email / Username */}
                                    <div className="grid gap-1.5">
                                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                            Username / NIK
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="email"
                                            placeholder="Contoh: nama@desa.go.id"
                                            className="h-12 rounded-xl border-0 bg-gray-100 px-4 text-sm placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-teal-600"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    {/* Password */}
                                    <div className="grid gap-1.5">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                                Kata Sandi
                                            </Label>
                                            {canResetPassword && (
                                                <Link
                                                    href={request()}
                                                    tabIndex={5}
                                                    className="text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline"
                                                >
                                                    Lupa Sandi?
                                                </Link>
                                            )}
                                        </div>
                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="Kata sandi"
                                            className="h-12 rounded-xl border-0 bg-gray-100 px-4 text-sm placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-teal-600"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    {/* Remember me */}
                                    <div className="flex items-center gap-2.5">
                                        <Checkbox
                                            id="remember"
                                            name="remember"
                                            tabIndex={3}
                                            className="rounded border-gray-300 data-[state=checked]:bg-teal-700 data-[state=checked]:border-teal-700"
                                        />
                                        <Label htmlFor="remember" className="cursor-pointer text-sm font-normal text-gray-600">
                                            Remember Me
                                        </Label>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        tabIndex={4}
                                        disabled={processing}
                                        className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-teal-800 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-900 disabled:opacity-60 mt-1"
                                    >
                                        {processing ? <Spinner /> : (
                                            <>
                                                Masuk
                                                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                                                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                                                </svg>
                                            </>
                                        )}
                                    </button>

                                    {canRegister && (
                                        <p className="text-center text-sm text-gray-500">
                                            Belum punya akun?{' '}
                                            <Link
                                                href={register()}
                                                tabIndex={6}
                                                className="font-semibold text-teal-700 hover:underline"
                                            >
                                                Daftar sekarang
                                            </Link>
                                        </p>
                                    )}
                                </>
                            )}
                        </Form>
                    </div>

                    {/* Footer kanan */}
                    <div className="relative z-10">
                        <div className="mb-5 h-px w-full bg-gray-200" />
                        <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
                            <nav className="flex gap-5">
                                {['Bantuan', 'Kebijakan Privasi', 'Kontak Kami'].map((item) => (
                                    <a
                                        key={item}
                                        href="#"
                                        className="text-xs font-semibold uppercase tracking-wider text-gray-400 transition hover:text-teal-700"
                                    >
                                        {item}
                                    </a>
                                ))}
                            </nav>
                            <p className="text-xs text-gray-400">
                                © {new Date().getFullYear()} Admin Portal Desa Cirangkong
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
