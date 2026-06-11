import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-muted/40 p-4">
            <Head title="Daftar | SADESA" />

            <div className="w-full max-w-sm">
                {/* Logo & Title */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-600 shadow-lg">
                        <svg viewBox="0 0 24 24" fill="none" className="h-9 w-9 text-white" stroke="currentColor" strokeWidth="1.8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            <polyline strokeLinecap="round" strokeLinejoin="round" points="9 22 9 12 15 12 15 22" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">SADESA</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Sahabat Digital Desa Cirangkong</p>
                </div>

                {/* Card */}
                <div className="rounded-2xl border bg-card p-6 shadow-sm">
                    <h2 className="mb-1 text-lg font-semibold text-foreground">Buat Akun Baru</h2>
                    <p className="mb-6 text-sm text-muted-foreground">Isi data di bawah untuk mendaftar sebagai warga</p>

                    <Form
                        {...store.form()}
                        resetOnSuccess={['password', 'password_confirmation']}
                        disableWhileProcessing
                        className="flex flex-col gap-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                {/* Nama Lengkap */}
                                <div className="grid gap-1.5">
                                    <Label htmlFor="name">Nama Lengkap</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="name"
                                        name="name"
                                        placeholder="Nama lengkap sesuai KTP"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                {/* Email */}
                                <div className="grid gap-1.5">
                                    <Label htmlFor="email">Alamat Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        tabIndex={2}
                                        autoComplete="email"
                                        name="email"
                                        placeholder="nama@contoh.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                {/* Password */}
                                <div className="grid gap-1.5">
                                    <Label htmlFor="password">Kata Sandi</Label>
                                    <PasswordInput
                                        id="password"
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Minimal 8 karakter"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                {/* Konfirmasi Password */}
                                <div className="grid gap-1.5">
                                    <Label htmlFor="password_confirmation">Konfirmasi Kata Sandi</Label>
                                    <PasswordInput
                                        id="password_confirmation"
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Ulangi kata sandi"
                                    />
                                    <InputError message={errors.password_confirmation} />
                                </div>

                                {/* Submit */}
                                <Button
                                    type="submit"
                                    tabIndex={5}
                                    disabled={processing}
                                    className="mt-2 w-full bg-teal-600 hover:bg-teal-700"
                                    data-test="register-user-button"
                                >
                                    {processing && <Spinner />}
                                    Buat Akun
                                </Button>

                                <p className="text-center text-sm text-muted-foreground">
                                    Sudah punya akun?{' '}
                                    <Link
                                        href={login()}
                                        className="font-medium text-teal-600 hover:underline"
                                        tabIndex={6}
                                    >
                                        Masuk sekarang
                                    </Link>
                                </p>
                            </>
                        )}
                    </Form>
                </div>

                <p className="mt-6 text-center text-xs text-muted-foreground">
                    © {new Date().getFullYear()} Pemerintah Desa Cirangkong
                </p>
            </div>
        </div>
    );
}
