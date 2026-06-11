# SADESA — Sahabat Digital Desa Cirangkong

Platform digital terpadu untuk pelayanan warga Desa Cirangkong. Monorepo yang memisahkan **web dashboard** (admin/staff/kepala desa) dan **aplikasi mobile** (warga).

---

## Struktur Repositori

```
sadesa-project/
├── backend/    Laravel 12 + Inertia.js + React   → Panel web & REST API
├── mobile/     Expo + React Native                → Aplikasi Android/iOS (warga)
└── docs/       Markdown                           → Dokumentasi teknis
```

## Stack Teknologi

| Lapisan | Teknologi |
|---------|-----------|
| **Backend** | Laravel 12, PHP 8.2+, MySQL 8 |
| **Web UI** | Inertia.js v2, React 19, TypeScript, Tailwind CSS v4 |
| **Auth Web** | Laravel Fortify (session + cookie) |
| **Auth API** | Laravel Sanctum (Bearer token) |
| **Mobile** | Expo SDK 52, React Native 0.76, Expo Router v4 |
| **HTTP Client** | Axios (mobile) |
| **Storage Token** | Expo SecureStore |

---

## Fitur

### Web Dashboard

| Fitur | Admin | Staff | Kepala Desa | Warga |
|-------|-------|-------|-------------|-------|
| Dashboard statistik & grafik | ✅ | ✅ | ✅ | ✅ |
| Kelola pengguna | ✅ | — | — | — |
| Verifikasi warga (KTP/KK) | ✅ | — | — | — |
| Kelola jenis surat | ✅ | — | — | — |
| Verifikasi pengajuan | ✅ | ✅ | — | — |
| Pengesahan pengajuan | ✅ | — | ✅ | — |
| Generate & download surat PDF | — | ✅ | — | — |
| Kelola pengaduan | ✅ | ✅ | — | ✅ (own) |
| Konten desa (berita/pengumuman) | ✅ | — | — | ✅ (read) |
| Buku Tamu Digital | ✅ | — | — | — |
| Audit log | ✅ | — | — | — |
| Wilayah & kategori aduan | ✅ | — | — | — |
| Notifikasi in-app | ✅ | ✅ | ✅ | ✅ |

### Aplikasi Mobile (Warga Only)

| Fitur | Status |
|-------|--------|
| Login / Register / Logout | ✅ |
| Warga-only guard (blokir admin/staff/kepala) | ✅ |
| Beranda — hero, NIK masking, aksi cepat | ✅ |
| Layanan Surat — horizontal scroll jenis surat | ✅ |
| Info Desa — 3 berita/pengumuman terbaru | ✅ |
| Ajukan Surat (pilih jenis, keterangan, submit) | ✅ |
| Detail Pengajuan — timeline 5 langkah | ✅ |
| Upload dokumen persyaratan | ✅ |
| Batalkan pengajuan | ✅ |
| Buat Pengaduan — form + max 3 foto (kamera/galeri) | ✅ |
| Detail Pengaduan — timeline + foto gallery + tanggapan | ✅ |
| Riwayat & Status — tab + filter per status | ✅ |
| Profil — data akun + logout | ✅ |
| Informasi Desa — list & detail artikel | ✅ |
| Buku Tamu — form kunjungan (auto-fill dari profil) | ✅ |
| Notifikasi — list + tandai sudah dibaca | ✅ |

---

## Prasyarat

| Tool | Versi |
|------|-------|
| PHP | ≥ 8.2 |
| Composer | ≥ 2.x |
| Node.js | ≥ 20 LTS |
| MySQL | ≥ 8.0 (via Laragon / XAMPP) |
| Expo Go | Terbaru (Play Store / App Store) |

---

## Instalasi

### 1. Clone

```bash
git clone <url-repo> sadesa-project
cd sadesa-project
```

### 2. Backend

```bash
cd backend
composer install
npm install
cp .env.example .env
php artisan key:generate
```

Edit `.env`:

```env
APP_NAME=SADESA
APP_URL=http://localhost:8000
APP_LOCALE=id

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=sadesa
DB_USERNAME=root
DB_PASSWORD=
```

```bash
# Migrasi + seeder sekaligus
php artisan migrate:fresh --seed

# Atau hanya migrasi tanpa seeder
php artisan migrate

# Build asset frontend
npm run build

# Jalankan server (0.0.0.0 agar bisa diakses dari HP/emulator)
php artisan serve --host=0.0.0.0 --port=8000
```

> **Development:** jalankan `npm run dev` di terminal terpisah untuk hot-reload asset.

### 3. Mobile

```bash
cd mobile
npm install
cp .env.example .env
```

Edit `mobile/.env`:

```env
# Ganti dengan IP lokal komputermu (cek dengan ipconfig / ifconfig)
EXPO_PUBLIC_API_URL=http://192.168.1.10:8000
```

```bash
npx expo start
```

Scan QR code dengan **Expo Go**, atau tekan `a` untuk Android emulator / `i` untuk iOS Simulator.

---

## Akun Default (Development)

Akun dibuat otomatis oleh `UserSeeder` saat `migrate:fresh --seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@sadesa.test` | `password` |
| Staff | `staff@sadesa.test` | `password` |
| Kepala Desa | `kepala@sadesa.test` | `password` |
| Warga | `warga@sadesa.test` | `password` |

Login web di `http://localhost:8000/login`.  
Login mobile dengan akun warga via aplikasi Expo Go.

---

## Dokumentasi

| Dokumen | Deskripsi |
|---------|-----------|
| [docs/api.md](docs/api.md) | Referensi lengkap REST API |
| [docs/architecture.md](docs/architecture.md) | Arsitektur sistem & keputusan teknis |
| [docs/onboarding.md](docs/onboarding.md) | Panduan setup untuk developer baru |

---

## Lisensi

Dikembangkan untuk keperluan administrasi Pemerintah Desa Cirangkong, Kecamatan Cijambe, Subang.
