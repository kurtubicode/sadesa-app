# Panduan Onboarding Developer — SADESA

Panduan ini membantu developer baru setup environment dan mulai berkontribusi dalam waktu singkat.

---

## 1. Gambaran Proyek

SADESA adalah sistem informasi dan administrasi untuk Desa Cirangkong. Terdiri dari:

- **Backend** — Laravel 12: panel web admin + REST API untuk mobile
- **Mobile** — Expo + React Native: aplikasi warga Android/iOS
- **Docs** — Dokumentasi teknis

```
sadesa-project/
├── backend/   Laravel 12 (web + API)
├── mobile/    Expo Router v4 (mobile warga)
└── docs/      Dokumentasi
```

---

## 2. Prasyarat

| Tool | Versi | Download |
|------|-------|----------|
| PHP | ≥ 8.2 | https://php.net atau via Laragon |
| Composer | ≥ 2.x | https://getcomposer.org |
| Node.js | ≥ 20 LTS | https://nodejs.org |
| MySQL | ≥ 8.0 | via Laragon / XAMPP |
| Git | terbaru | https://git-scm.com |
| Expo Go | terbaru | Play Store / App Store |

> **Rekomendasi Windows:** Gunakan **Laragon** — sudah include PHP, MySQL, dan Nginx dalam satu installer.

---

## 3. Setup Backend

```bash
cd backend

# Install dependensi
composer install
npm install

# Buat file environment
cp .env.example .env
php artisan key:generate
```

Edit `backend/.env`:

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

Buat database `sadesa` di MySQL, lalu:

```bash
# Jalankan migrasi
php artisan migrate

# Isi data awal
php artisan db:seed

# Build asset (untuk production / pertama kali)
npm run build

# Jalankan server (0.0.0.0 agar bisa diakses dari HP/emulator di LAN)
php artisan serve --host=0.0.0.0 --port=8000
```

> **Development:** jalankan `npm run dev` di terminal terpisah untuk hot-reload Vite.

Panel web bisa diakses di: `http://localhost:8000`

---

## 4. Setup Mobile

```bash
cd mobile

# Install dependensi
npm install

# Buat file environment
cp .env.example .env
```

Edit `mobile/.env`:

```env
# IP lokal komputermu (cek dengan: ipconfig di Windows, ifconfig di Mac/Linux)
# HP dan komputer harus terhubung ke Wi-Fi yang sama
EXPO_PUBLIC_API_URL=http://192.168.1.10:8000
```

```bash
# Jalankan Expo
npx expo start

# Jika ada masalah cache:
npx expo start -c
```

Scan QR code dengan **Expo Go** di HP, atau tekan:
- `a` → Android emulator
- `i` → iOS Simulator (Mac only)
- `w` → Web browser

> ⚠️ **Jangan hardcode IP di kode sumber.** Semua screen mobile menggunakan `import api from "@/lib/api"` yang membaca `EXPO_PUBLIC_API_URL` dari `.env`.

---

## 5. Buat Akun Development

Jalankan seeder (jika sudah dikonfigurasi):
```bash
php artisan db:seed
```

Atau buat manual via Tinker:

```bash
php artisan tinker
```

```php
// Admin
\App\Models\User::create([
    'name' => 'Admin Desa', 'email' => 'admin@sadesa.test',
    'password' => 'password', 'role' => 'admin', 'status' => 'aktif',
    'nik' => '3210000000000000',
]);

// Staff
\App\Models\User::create([
    'name' => 'Petugas', 'email' => 'staff@sadesa.test',
    'password' => 'password', 'role' => 'staff', 'status' => 'aktif',
    'nik' => '3210000000000001',
]);

// Kepala Desa
\App\Models\User::create([
    'name' => 'Kepala Desa', 'email' => 'kepala@sadesa.test',
    'password' => 'password', 'role' => 'kepala_desa', 'status' => 'aktif',
    'nik' => '3210000000000002',
]);

// Warga (untuk testing mobile)
\App\Models\User::create([
    'name' => 'Warga Test', 'email' => 'warga@sadesa.test',
    'password' => 'password', 'role' => 'warga', 'status' => 'aktif',
    'nik' => '3210000000000003',
]);
```

| Akun | URL / App | Email | Password |
|------|-----------|-------|----------|
| Admin | `http://localhost:8000/login` | admin@sadesa.test | password |
| Staff | `http://localhost:8000/login` | staff@sadesa.test | password |
| Kepala Desa | `http://localhost:8000/login` | kepala@sadesa.test | password |
| Warga (mobile) | Expo Go | warga@sadesa.test | password |

> ⚠️ Akun admin/staff/kepala tidak bisa digunakan di aplikasi mobile — akan diblokir dengan pesan error.

---

## 6. Cara Kerja Sistem

### Autentikasi

| Konteks | Mekanisme | Library |
|---------|-----------|---------|
| Web admin/staff/kepala/warga | Session + cookie | Laravel Fortify |
| Mobile warga | Bearer token | Laravel Sanctum |

### Web — Inertia.js

Controller mengembalikan `Inertia::render('NamaHalaman', $data)`. React merender halaman di browser sebagai SPA. Tidak ada endpoint JSON untuk halaman web. Lihat `resources/js/pages/` untuk semua halaman.

### Mobile — Routing

Expo Router menggunakan file-based routing. Nama file = URL:

```
app/index.tsx              → /              (Login)
app/register.tsx           → /register
app/(tabs)/home.tsx        → /(tabs)/home   (Beranda — tab 1)
app/(tabs)/layanan.tsx     → /(tabs)/layanan (Layanan — tab 2)
app/(tabs)/status.tsx      → /(tabs)/status  (Status — tab 3)
app/(tabs)/profile.tsx     → /(tabs)/profile (Profil — tab 4)
app/pengajuan/buat.tsx     → /pengajuan/buat
app/pengajuan/[id].tsx     → /pengajuan/123  (dynamic)
app/pengaduan/[id].tsx     → /pengaduan/7    (dynamic)
```

Stack screen baru harus didaftarkan di `app/_layout.tsx`.

---

## 7. Task Harian

### Menambah Endpoint API Baru

1. Tambah route di `backend/routes/api.php`
2. Buat/update controller di `app/Http/Controllers/Api/`
3. Test dengan Postman / Insomnia (sertakan header `Authorization: Bearer <token>`)
4. Update `docs/api.md`

### Menambah Halaman Web Baru

1. Buat file di `backend/resources/js/pages/` (contoh: `admin/laporan.tsx`)
2. Tambah route di `backend/routes/web.php`
3. Tambah controller method
4. Tambah item sidebar di `components/app-sidebar.tsx` (jika perlu)

### Menambah Screen Mobile Baru

1. Buat file di `mobile/app/` (contoh: `mobile/app/notifikasi.tsx`)
2. Daftarkan di `mobile/app/_layout.tsx` dengan `<Stack.Screen name="notifikasi" options={{...}} />`
3. Navigasi dari screen lain: `router.push('/notifikasi')`

### Menambah Kolom Database

```bash
php artisan make:migration add_foto_to_users_table --table=users
# Edit file migration
php artisan migrate
```

### Melihat Log Error

```bash
# Laravel log
tail -f backend/storage/logs/laravel.log

# Atau buka di browser saat APP_DEBUG=true
```

---

## 8. Git Workflow

### Branch Convention

```
main          → production-ready
develop       → integrasi fitur aktif
feature/xxx   → fitur baru  (contoh: feature/notifikasi-push)
fix/xxx       → bugfix      (contoh: fix/upload-foto-gagal)
docs/xxx      → update docs
```

### Workflow Harian

```bash
# Mulai dari develop
git checkout develop && git pull

# Buat branch baru
git checkout -b feature/nama-fitur

# Commit
git add .
git commit -m "feat: deskripsi singkat"

# Push dan buat PR ke develop
git push origin feature/nama-fitur
```

### Format Commit

```
feat:     tambah fitur baru
fix:      perbaiki bug
docs:     update dokumentasi
refactor: restructure kode tanpa ubah behaviour
style:    formatting (tidak mengubah logika)
test:     tambah atau perbaiki test
chore:    update dependency, config
```

---

## 9. Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `php artisan migrate` error | Pastikan database `sadesa` sudah dibuat dan `.env` sudah benar |
| Mobile tidak connect ke API | Cek IP di `mobile/.env`, pastikan HP dan PC di Wi-Fi yang sama |
| Vite asset tidak muncul | Jalankan `npm run dev` atau `npm run build` di folder `backend/` |
| Expo QR tidak bisa scan | Coba `npx expo start --tunnel` atau pastikan port 8081 tidak diblokir |
| `composer install` gagal | Pastikan PHP ≥ 8.2 (`php -v`) |
| Token rejected `401` | Logout dan login ulang untuk mendapat token baru |
| `NODE_OPTIONS` error saat build | Jalankan: `NODE_OPTIONS=--max-old-space-size=4096 npm run build` |
| Login mobile diblokir (403) | Akun `menunggu_verifikasi` — admin harus aktivasi dulu |
| Login mobile diblokir (Alert) | Role bukan `warga` — gunakan web panel, bukan mobile |
| Hot-reload Inertia tidak jalan | Pastikan `npm run dev` berjalan dan `VITE_HMR_HOST=localhost` di `.env` |

---

## 10. Referensi

| Dokumen | Link |
|---------|------|
| API Reference | [docs/api.md](api.md) |
| Arsitektur Sistem | [docs/architecture.md](architecture.md) |
| Mobile Feature Checklist | `LOG_SISTEM/SADESA_MOBILE_CHECKLIST.md` |
| Laravel 12 | https://laravel.com/docs/12.x |
| Laravel Sanctum | https://laravel.com/docs/12.x/sanctum |
| Laravel Fortify | https://laravel.com/docs/12.x/fortify |
| Inertia.js | https://inertiajs.com |
| Expo Router | https://docs.expo.dev/router/introduction/ |
| Expo SecureStore | https://docs.expo.dev/versions/latest/sdk/securestore/ |
| React Native | https://reactnative.dev/docs/getting-started |
