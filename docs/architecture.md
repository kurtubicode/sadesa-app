# Arsitektur Sistem SADESA

---

## Gambaran Umum

SADESA menggunakan arsitektur **monorepo dual-client**: satu backend Laravel melayani dua jenis klien secara berbeda — panel web (Inertia.js) dan aplikasi mobile (REST API).

```
┌──────────────────────────────────────────────────────────────┐
│                          SADESA                              │
│                                                              │
│  ┌─────────────────────┐      ┌──────────────────────────┐  │
│  │    Web Dashboard    │      │     Aplikasi Mobile      │  │
│  │  Admin / Staff /    │      │   Warga (Android/iOS)    │  │
│  │  Kepala Desa /      │      │                          │  │
│  │  Warga (read-only)  │      │  Expo + React Native     │  │
│  │  React + Inertia    │      │  Expo Router v4          │  │
│  └──────────┬──────────┘      └────────────┬─────────────┘  │
│             │ HTTP (session cookie)         │ HTTP (Bearer)  │
│             │                              │                 │
│  ┌──────────▼──────────────────────────────▼─────────────┐  │
│  │                      BACKEND                          │  │
│  │                    Laravel 12                        │  │
│  │                                                      │  │
│  │  ┌──────────────┐        ┌──────────────────────┐   │  │
│  │  │  Web Routes  │        │     API Routes       │   │  │
│  │  │  Inertia.js  │        │  /api/* — Sanctum    │   │  │
│  │  │  Fortify     │        │  Token-based auth    │   │  │
│  │  └──────┬───────┘        └──────────┬───────────┘   │  │
│  │         │                           │                │  │
│  │  ┌──────▼───────────────────────────▼───────────┐   │  │
│  │  │     Controllers  →  Models (Eloquent ORM)     │   │  │
│  │  │     Middleware (CheckRole)                    │   │  │
│  │  └─────────────────────┬────────────────────────┘   │  │
│  │                        │                             │  │
│  │                 ┌──────▼──────┐                      │  │
│  │                 │    MySQL    │                      │  │
│  │                 └─────────────┘                      │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## Komponen Utama

### Backend (Laravel 12)

**Panel Web (Admin, Staff, Kepala Desa, Warga)**
- Menggunakan **Inertia.js** — Laravel merender halaman React tanpa membangun API JSON terpisah
- Navigasi SPA tanpa full-page reload, React berjalan di browser
- Autentikasi via **Laravel Fortify** (session + cookie, dengan 2FA opsional)
- Role dispatch di `DashboardController` → render halaman berbeda per role
- Middleware `CheckRole` melindungi route `/admin/*`, `/staff/*`, `/kepala-desa/*`

**REST API (Mobile Warga)**
- Route di `routes/api.php`, prefix `/api/`
- Autentikasi via **Laravel Sanctum** (personal access token di database)
- Mengembalikan JSON murni
- Role guard via middleware `role:warga`, `role:staff,admin`, `role:kepala_desa,admin`

### Mobile (Expo + React Native)

- **Expo Router v4** — file-based routing (`app/` directory = route tree)
- **Axios** dengan request interceptor → attach Bearer token otomatis dari SecureStore
- **Expo SecureStore** — penyimpanan token terenkripsi di level OS
- **Warga-only guard** — cek `user.role !== 'warga'` setelah login, blokir non-warga
- 4 bottom tab: **Beranda**, **Layanan**, **Status**, **Profil**

---

## Roles & Akses

| Role | Web | Mobile |
|------|-----|--------|
| `admin` | Full access semua modul | ❌ Diblokir |
| `staff` | Verifikasi pengajuan, handle pengaduan | ❌ Diblokir |
| `kepala_desa` | Pengesahan pengajuan | ❌ Diblokir |
| `warga` | Dashboard read-only, pengajuan & pengaduan own | ✅ Full mobile app |

---

## Skema Database (Tabel Utama)

```
users
├── id, nik (unique), name, email (unique), password
├── role          ENUM(admin, staff, kepala_desa, warga)
├── status        ENUM(aktif, nonaktif, menunggu_verifikasi)
├── phone, wilayah_id (FK)
└── timestamps

wilayah
└── id, nama, tipe ENUM(desa,dusun,rw,rt), parent_id (FK self)

master_surat
└── id, kode, nama_surat, deskripsi, persyaratan, is_aktif, timestamps

pengajuan_surat
├── id, no_pengajuan (unique)
├── user_id (FK), master_surat_id (FK)
├── data_formulir (JSON)
├── status        ENUM(menunggu,diproses,diverifikasi,ditolak_staff,
│                      menunggu_pengesahan,disetujui,ditolak_kepala,
│                      selesai,dibatalkan)
├── catatan
└── timestamps

dokumen_persyaratan
└── id, pengajuan_id (FK), nama_file, path_file, jenis_dokumen, timestamps

verifikasi_berkas
└── id, pengajuan_id (FK), staff_id (FK), status, catatan, timestamps

pengesahan_permohonan
└── id, pengajuan_id (FK), kepala_desa_id (FK), status, catatan, timestamps

kategori_aduan
└── id, nama_kategori, deskripsi, timestamps

pengaduan
├── id, user_id (FK), kategori_aduan_id (FK)
├── judul, deskripsi
├── status  ENUM(menunggu, diproses, selesai, ditolak)
└── timestamps

bukti_pengaduan
└── id, pengaduan_id (FK), path_file, timestamps

tanggapan_pengaduan
└── id, pengaduan_id (FK), user_id (FK), isi_tanggapan, timestamps

konten_desa
├── id, judul, slug (unique), konten, tipe ENUM(berita, pengumuman)
├── status, admin_id (FK)
└── timestamps

audit_log
├── id, user_id (FK), aksi, model, model_id
├── data (JSON), ip_address
└── timestamps

personal_access_tokens   ← Sanctum tokens
sessions                 ← Web sessions
```

---

## Alur Autentikasi

### Web Admin — Fortify + Session

```
Browser → POST /login {email, password}
        → Fortify validasi + buat session → set cookie
        → Redirect ke /dashboard
        → Request selanjutnya: cookie otomatis dikirim
```

Fitur aktif: 2FA (TOTP), verifikasi email, reset password, rate limit 5x/menit.

### Mobile — Sanctum + Bearer Token

```
App dibuka
  → Cek SecureStore["sadesa_user_token"]
  → Ada?  → Langsung ke /(tabs)/home
  → Tidak? → Tampilkan halaman login

Login:
  → POST /api/login {email, password}
  → Cek role = "warga" (jika bukan → Alert + batalkan)
  → Simpan token ke SecureStore
  → router.replace("/(tabs)/home")

Setiap request:
  → Interceptor Axios baca token dari SecureStore
  → Sisipkan header: Authorization: Bearer <token>

Logout:
  → POST /api/logout (revoke token di server)
  → Hapus token dari SecureStore
  → router.replace("/")
```

---

## Alur Pengajuan Surat

```
Warga (mobile)          Staff (web)           Kepala Desa (web)
──────────────          ────────────          ─────────────────
POST /api/pengajuan
  → status: menunggu
                        GET /staff/pengajuan
                        PATCH /staff/pengajuan/{id}/verifikasi
                          action: setujui
                          → status: menunggu_pengesahan

                          action: tolak
                          → status: ditolak_staff
                                                GET /kepala-desa/pengajuan
                                                PATCH /kepala-desa/pengajuan/{id}/pengesahan
                                                  action: setujui → status: disetujui
                                                  action: tolak   → status: ditolak_kepala
```

---

## Struktur File Penting

### Backend

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/         AdminDashboard, Pengguna, MasterSurat,
│   │   │   │                  Pengaduan, KontenDesa, AuditLog, Wilayah
│   │   │   ├── Staff/         StaffPengajuanController
│   │   │   ├── KepalaDesa/    KepalaPengajuanController
│   │   │   ├── Api/           PengajuanSuratController, PengaduanController,
│   │   │   │                  VerifikasiController, PengesahanController
│   │   │   ├── DashboardController
│   │   │   └── InformasiController
│   │   └── Middleware/        CheckRole, HandleAppearance, HandleInertiaRequests
│   └── Models/                User, PengajuanSurat, Pengaduan, MasterSurat,
│                              KontenDesa, AuditLog, BuktiPengaduan,
│                              TanggapanPengaduan, VerifikasiBerkas,
│                              PengesahanPermohonan, DokumenPersyaratan
├── resources/js/
│   ├── pages/
│   │   ├── admin/             dashboard, pengguna, master-surat, pengaduan,
│   │   │                      konten-desa, audit-log, wilayah
│   │   ├── staff/             pengajuan-list, pengajuan-detail
│   │   ├── kepala-desa/       pengajuan-list, pengajuan-detail
│   │   ├── dashboard/         warga.tsx
│   │   ├── informasi/         index.tsx, show.tsx
│   │   └── auth/              login.tsx, register.tsx
│   └── layouts/               app-layout.tsx, app-sidebar.tsx
└── routes/
    ├── web.php                Web routes (Inertia)
    └── api.php                REST API routes (Sanctum)
```

### Mobile

```
mobile/
├── app/
│   ├── _layout.tsx            Root Stack navigator
│   ├── index.tsx              Login (warga-only guard)
│   ├── register.tsx           Register
│   ├── (tabs)/
│   │   ├── _layout.tsx        4-tab navigator
│   │   ├── home.tsx           Beranda
│   │   ├── layanan.tsx        Hub layanan
│   │   ├── status.tsx         Riwayat & tracking
│   │   └── profile.tsx        Profil & logout
│   ├── pengajuan/
│   │   ├── buat.tsx           Form ajukan surat
│   │   ├── index.tsx          List pengajuan
│   │   └── [id].tsx           Detail + upload dokumen + batalkan
│   ├── pengaduan/
│   │   ├── buat.tsx           Form laporan + max 3 foto
│   │   ├── index.tsx          List pengaduan
│   │   └── [id].tsx           Detail + foto gallery + tanggapan
│   └── informasi/
│       ├── index.tsx          List berita/pengumuman
│       └── [slug].tsx         Detail artikel
└── lib/
    ├── api.ts                 Axios instance + interceptor
    └── userStorage.ts         SecureStore helpers
```

---

## Keputusan Teknis

### Inertia.js vs REST API untuk Web Admin

**Keputusan:** Inertia.js.  
**Alasan:** Tidak perlu membangun dua layer (API + frontend) untuk panel admin. Server-side validation Laravel tetap berlaku, routing dan session berfungsi seperti biasa, React tetap bisa dipakai untuk UI interaktif.  
**Trade-off:** Admin panel tidak bisa dikonsumsi sebagai pure API dari domain lain.

---

### Sanctum vs JWT untuk Mobile

**Keputusan:** Sanctum (database tokens).  
**Alasan:** Token bisa di-revoke dari server kapan saja (logout benar-benar logout). Tidak ada refresh token yang perlu dikelola. Built-in di Laravel.  
**Trade-off:** Setiap request auth melakukan query database. Dapat dimitigasi dengan caching jika skala besar.

---

### Warga-only Guard di Mobile (bukan di API)

**Keputusan:** Guard dilakukan di sisi mobile setelah login berhasil, bukan di API endpoint login.  
**Alasan:** API `POST /api/login` tetap generik untuk semua role — berguna untuk testing dan masa depan (staff mobile, dsb). Pembatasan akses mobile adalah keputusan UX, bukan security.  
**Trade-off:** Admin yang tahu caranya masih bisa akses API dengan token Sanctum via Postman — tapi tidak akan ada UI untuk itu.

---

## Variabel Environment Penting

### Backend (`.env`)

| Variabel | Dev | Production | Catatan |
|----------|-----|-----------|---------|
| `APP_ENV` | `local` | `production` | |
| `APP_DEBUG` | `true` | **`false`** | Wajib false di prod |
| `APP_URL` | `http://localhost:8000` | URL publik | |
| `DB_CONNECTION` | `mysql` | `mysql` | |
| `SESSION_DRIVER` | `database` | `database` | |
| `BCRYPT_ROUNDS` | `12` | `14` | Naikkan di prod |

### Mobile (`.env`)

| Variabel | Keterangan |
|----------|-----------|
| `EXPO_PUBLIC_API_URL` | Base URL backend, misal `http://192.168.1.10:8000` |

---

## Roadmap

### ✅ Selesai
- Auth dual: Fortify (web) + Sanctum (mobile)
- Role-based routing dan sidebar: admin / staff / kepala_desa / warga
- Pengajuan surat: end-to-end (warga → staff → kepala desa)
- Pengaduan: buat, list, detail, tanggapan petugas
- Konten desa: berita & pengumuman (web CRUD + mobile read)
- Audit log aksi admin/staff
- Aplikasi mobile warga: 4 tab, 10+ screen, warga-only guard

### 🔜 Mendatang
- Push notifications (Firebase Cloud Messaging)
- Scan QR Buku Tamu (mobile)
- Download surat hasil (PDF dari storage)
- Edit profil warga (mobile)
- Form dinamis per jenis surat (field schema di `master_surat`)
- Token refresh / auto-logout saat expired
