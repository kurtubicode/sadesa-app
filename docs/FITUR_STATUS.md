# SADESA — Status Fitur Lengkap

> Dokumen ini mencatat semua fitur yang sudah selesai, sedang berjalan, dan belum dikerjakan.  
> **Terakhir diperbarui:** 19 Mei 2026 — Register page + Admin Master Surat + Tanggapi Pengaduan + Data Master (Wilayah & Kategori)

---

## Legenda

| Simbol | Arti |
|--------|------|
| ✅ | Selesai & berfungsi |
| ⚠️ | Ada tapi perlu perbaikan / belum sempurna |
| ❌ | Belum dikerjakan |
| 🔜 | Direncanakan (ada model/skeleton) |

---

## 1. Autentikasi & Akun

### Web (Laravel Fortify)

| Fitur | Status | Catatan |
|-------|--------|---------|
| Login (email + password) | ✅ | Halaman Indonesia, branding SADESA |
| Register | ✅ | Branding SADESA + full Bahasa Indonesia |
| Lupa password (email reset) | ✅ | Bawaan Fortify |
| Reset password | ✅ | |
| Two-factor authentication (TOTP) | ✅ | Opsional per user |
| Verifikasi email | ✅ | |
| Ingat saya (remember token) | ✅ | |
| Rate limiting login | ✅ | 5x / menit per IP+email |
| Logout | ✅ | |

### Mobile (Laravel Sanctum)

| Fitur | Status | Catatan |
|-------|--------|---------|
| Login (email + password) | ✅ | `POST /api/login` |
| Warga-only guard | ✅ | Role ≠ warga → Alert, token tidak disimpan |
| Register (NIK, nama, email, password, wilayah) | ✅ | Status `menunggu_verifikasi` |
| Logout (revoke token server + clear lokal) | ✅ | |
| Auto-login jika token tersimpan | ✅ | Cek SecureStore saat app dibuka |
| Token refresh / auto-logout expired | ❌ | |

---

## 2. Web Dashboard — Admin

### Dashboard & Statistik

| Fitur | Status | Catatan |
|-------|--------|---------|
| Statistik total pengajuan, pengaduan, user | ✅ | |
| Statistik pengajuan per status | ✅ | |
| Grafik / chart | ❌ | |

### Manajemen Pengguna

| Fitur | Status | Catatan |
|-------|--------|---------|
| List semua user (search, filter role/status) | ✅ | |
| Tambah user baru | ✅ | |
| Edit data user | ✅ | |
| Aktifkan / nonaktifkan akun | ✅ | |
| Hapus user | ✅ | |
| Ubah role user | ✅ | |

### Manajemen Jenis Surat (`master_surat`)

| Fitur | Status | Catatan |
|-------|--------|---------|
| List jenis surat | ❌ | Model `MasterSurat` ada, belum ada halaman admin |
| Tambah / edit / hapus jenis surat | ❌ | |
| Aktifkan / nonaktifkan jenis surat | ❌ | |
| Kelola persyaratan per jenis surat | ❌ | Field `persyaratan` di model sudah ada |

### Manajemen Wilayah

| Fitur | Status | Catatan |
|-------|--------|---------|
| List wilayah (desa, dusun, RW, RT) | ❌ | Model `Wilayah` ada, belum ada halaman admin |
| Tambah / edit / hapus wilayah | ❌ | |
| Hierarki wilayah (parent-child) | ❌ | |

### Manajemen Kategori Pengaduan

| Fitur | Status | Catatan |
|-------|--------|---------|
| List kategori aduan | ❌ | Model `KategoriAduan` ada, endpoint GET publik sudah ada |
| Tambah / edit / hapus kategori | ❌ | |

### Pengajuan Surat (Admin View)

| Fitur | Status | Catatan |
|-------|--------|---------|
| List semua pengajuan (filter status, search) | ✅ | |
| Detail pengajuan + riwayat verifikasi & pengesahan | ✅ | |
| Download / lihat surat output | 🔜 | Model `SuratOutput` ada |
| Generate surat PDF | ❌ | |
| Upload surat output | ❌ | |

### Pengaduan (Admin View)

| Fitur | Status | Catatan |
|-------|--------|---------|
| List semua pengaduan (filter status) | ✅ | |
| Detail pengaduan + foto bukti | ✅ | |
| Tanggapi pengaduan (tambah komentar) | ❌ | Model `TanggapanPengaduan` ada, belum ada form di admin |
| Ubah status pengaduan | ❌ | |

### Konten Desa (Berita & Pengumuman)

| Fitur | Status | Catatan |
|-------|--------|---------|
| List konten (filter tipe, search) | ✅ | |
| Buat konten baru (judul, isi, tipe) | ✅ | |
| Edit konten | ✅ | |
| Hapus konten | ✅ | |
| Publish / unpublish | ✅ | |
| Slug otomatis dari judul | ✅ | |
| Upload gambar featured | ❌ | |
| Rich text editor (WYSIWYG) | ❌ | Saat ini plain textarea |

### Audit Log

| Fitur | Status | Catatan |
|-------|--------|---------|
| List semua log aksi (filter user, tanggal, search) | ✅ | |
| Detail aksi (model, ID, IP, data JSON) | ✅ | |
| Export log | ❌ | |

### Buku Tamu

| Fitur | Status | Catatan |
|-------|--------|---------|
| List kunjungan tamu | ❌ | Model `BukuTamu` ada, belum ada halaman |
| Detail kunjungan | ❌ | |
| Export data kunjungan | ❌ | |

### Data Penduduk

| Fitur | Status | Catatan |
|-------|--------|---------|
| List data penduduk | ❌ | Model `Penduduk` ada, belum ada controller/halaman |
| Tambah / edit / hapus data penduduk | ❌ | |
| Import data dari Excel/CSV | ❌ | |
| Statistik kependudukan | ❌ | |

---

## 3. Web Dashboard — Staff

| Fitur | Status | Catatan |
|-------|--------|---------|
| Dashboard (statistik tugas) | ✅ | |
| Antrian pengajuan (filter status, search) | ✅ | |
| Detail pengajuan + dokumen persyaratan | ✅ | |
| Verifikasi: setujui atau tolak + catatan | ✅ | Status → `menunggu_pengesahan` / `ditolak_staff` |
| Input Buku Tamu | ❌ | |
| Handle pengaduan (tanggapi + ubah status) | ❌ | |

---

## 4. Web Dashboard — Kepala Desa

| Fitur | Status | Catatan |
|-------|--------|---------|
| Dashboard (statistik pengesahan) | ✅ | |
| List pengajuan siap disahkan | ✅ | Filter `menunggu_pengesahan` |
| Detail pengajuan + riwayat verifikasi staff | ✅ | |
| Pengesahan: setujui atau tolak + catatan | ✅ | Status → `disetujui` / `ditolak_kepala` |

---

## 5. Web Dashboard — Warga

| Fitur | Status | Catatan |
|-------|--------|---------|
| Dashboard (statistik pengajuan & pengaduan sendiri) | ✅ | |
| Daftar pengajuan terbaru | ✅ | |
| Daftar pengaduan terbaru | ✅ | |
| Info desa terbaru (link ke halaman publik) | ✅ | |

---

## 6. Halaman Publik (Tanpa Login)

| Fitur | Status | Catatan |
|-------|--------|---------|
| List berita & pengumuman (filter tipe, search, pagination) | ✅ | `/informasi` |
| Detail artikel | ✅ | `/informasi/{slug}` |
| Artikel terkait di sidebar | ✅ | |
| Header SADESA + link ke Portal | ✅ | |

---

## 7. Pengaturan (Semua Role Web)

| Fitur | Status | Catatan |
|-------|--------|---------|
| Edit profil (nama, email, foto) | ✅ | |
| Ubah password | ✅ | |
| Kelola 2FA | ✅ | |
| Sesi aktif (browser sessions) | ✅ | |
| Hapus akun | ✅ | |
| Pengaturan tampilan (dark/light mode) | ✅ | |

---

## 8. Komponen Web Umum

| Fitur | Status | Catatan |
|-------|--------|---------|
| Sidebar per role (admin / staff / kepala / warga) | ✅ | Item berbeda tiap role |
| Breadcrumb navigasi | ✅ | |
| Flash notification banner | ✅ | success / error / info, dismiss manual |
| Dark mode | ✅ | Sistem / manual |
| CheckRole middleware (web redirect, API JSON) | ✅ | Diperbaiki dari semula selalu JSON 403 |
| Audit log otomatis (`AuditLog::catat()`) | ✅ | Dipanggil di controller admin/staff/kepala |

---

## 9. Mobile — Navigasi & Layout

| Fitur | Status | Catatan |
|-------|--------|---------|
| Bottom tab 4 menu | ✅ | Beranda / Layanan / Status / Profil |
| Haptic feedback di tab | ✅ | `HapticTab` |
| Stack navigator untuk semua screen | ✅ | `app/_layout.tsx` |
| Header otomatis per screen | ✅ | Judul dari `_layout.tsx` |

---

## 10. Mobile — Beranda

| Fitur | Status | Catatan |
|-------|--------|---------|
| Hero biru dengan sapaan | ✅ | "Halo, [Nama] 👋" |
| NIK tersamar | ✅ | `1234 •••• •••• 5678` |
| Tombol aksi cepat (Ajukan Surat + Buat Pengaduan) | ✅ | |
| Layanan Surat — horizontal scroll dari API | ✅ | Fetch `/api/master-surat` |
| Info Desa — 3 terbaru dari API | ✅ | Fetch `/api/informasi?per_page=3` |
| Tap info desa → halaman detail | ✅ | |
| Pull to refresh | ✅ | |
| Notification bell | ❌ | |

---

## 11. Mobile — Pengajuan Surat

### Buat Pengajuan

| Fitur | Status | Catatan |
|-------|--------|---------|
| Pilih jenis surat (radio card dari API) | ✅ | |
| Tampilkan persyaratan per jenis surat | ✅ | |
| Keterangan tambahan (opsional) | ✅ | Disimpan di `data_formulir.keterangan` |
| Submit → nomor pengajuan otomatis | ✅ | |
| Alert sukses + pilihan lihat status / unggah dokumen | ✅ | |
| Form field dinamis per jenis surat | ❌ | Butuh schema di `MasterSurat` |

### List Pengajuan

| Fitur | Status | Catatan |
|-------|--------|---------|
| List semua pengajuan milik user | ✅ | |
| Status badge warna-warni (9 status) | ✅ | |
| Pull to refresh | ✅ | |
| Empty state | ✅ | |

### Detail Pengajuan

| Fitur | Status | Catatan |
|-------|--------|---------|
| Info dasar (nomor, jenis, tanggal, status) | ✅ | |
| Catatan petugas | ✅ | Kotak kuning |
| Timeline 5 langkah (done/active/pending/rejected) | ✅ | |
| List dokumen yang sudah diupload | ✅ | |
| Upload dokumen (PDF/JPG/PNG, maks 5 MB) | ✅ | `expo-document-picker` |
| Batalkan pengajuan | ✅ | Hanya status `menunggu`, konfirmasi Alert |
| Download surat hasil | ❌ | |
| Pull to refresh | ✅ | |

---

## 12. Mobile — Laporan Pengaduan

### Buat Pengaduan

| Fitur | Status | Catatan |
|-------|--------|---------|
| Pilih kategori (horizontal chips dari API) | ✅ | |
| Input judul (maks 100 karakter) | ✅ | |
| Input deskripsi (maks 2000 karakter + counter) | ✅ | |
| Upload foto bukti — kamera | ✅ | `expo-image-picker` launchCamera |
| Upload foto bukti — galeri | ✅ | `allowsMultipleSelection` |
| Maksimal 3 foto | ✅ | |
| Preview thumbnail + hapus per foto | ✅ | |
| Submit ke API (multipart) | ✅ | `bukti[]` array |
| Alert sukses + pilihan lihat status / lihat detail | ✅ | |
| Lokasi kejadian | ❌ | |

### List Pengaduan

| Fitur | Status | Catatan |
|-------|--------|---------|
| List semua pengaduan milik user | ✅ | |
| Status badge | ✅ | |
| Tap → detail pengaduan | ✅ | Diperbaiki (`<View>` → `<TouchableOpacity>`) |
| Pull to refresh | ✅ | |
| Empty state | ✅ | |

### Detail Pengaduan

| Fitur | Status | Catatan |
|-------|--------|---------|
| Header (judul, kategori, status, tanggal) | ✅ | |
| Timeline 3 langkah (Dikirim → Ditangani → Selesai) | ✅ | |
| Gallery foto bukti (2 kolom) | ✅ | URL dari `/storage/{path_file}` |
| Tanggapan petugas (bubble biru) | ✅ | Nama + role + waktu |
| Pull to refresh | ✅ | |

---

## 13. Mobile — Riwayat & Status

| Fitur | Status | Catatan |
|-------|--------|---------|
| Tab: Pengajuan Surat / Pengaduan | ✅ | |
| Filter chips per status | ✅ | Semua, Menunggu, Diproses, Selesai, Ditolak, dll. |
| Mini timeline di card pengajuan | ✅ | 5 dot berwarna |
| Status badge | ✅ | |
| Tap → screen detail | ✅ | |
| Pull to refresh | ✅ | |
| Search by keyword | ❌ | |
| Sort terbaru / terlama | ❌ | |

---

## 14. Mobile — Layanan (Tab Hub)

| Fitur | Status | Catatan |
|-------|--------|---------|
| Tombol aksi cepat (Ajukan Surat + Buat Pengaduan) | ✅ | |
| Tab list: Pengajuan / Pengaduan | ✅ | |
| List 10 terbaru per tab | ✅ | |
| Status badge | ✅ | |
| Tap → detail | ✅ | |
| Pull to refresh | ✅ | |

---

## 15. Mobile — Informasi Desa

| Fitur | Status | Catatan |
|-------|--------|---------|
| List berita & pengumuman | ✅ | |
| Badge tipe (Berita / Pengumuman) | ✅ | |
| Tanggal publish | ✅ | |
| Tap → detail artikel | ✅ | |
| Pull to refresh | ✅ | |
| Filter by tipe | ❌ | Tersedia di web, belum di mobile |
| Search artikel | ❌ | |

---

## 16. Mobile — Profil

| Fitur | Status | Catatan |
|-------|--------|---------|
| Avatar inisial nama | ✅ | |
| Status badge (Aktif / Nonaktif / Menunggu) | ✅ | |
| Data akun (NIK, email, no HP, role) | ✅ | |
| Logout dengan konfirmasi | ✅ | Revoke token di server |
| Versi aplikasi | ✅ | |
| Edit profil | ❌ | |
| Ubah password | ❌ | |
| Foto profil | ❌ | |

---

## 17. Mobile — Buku Tamu (QR Scan)

| Fitur | Status | Catatan |
|-------|--------|---------|
| Scan QR code dari kantor desa | ❌ | Butuh `expo-camera` |
| Form input tamu (nama, instansi, keperluan) | ❌ | |
| Submit kunjungan ke API | ❌ | Butuh backend endpoint `/api/buku-tamu` |
| Riwayat kunjungan | ❌ | |

---

## 18. Sistem & Infrastruktur

### Backend

| Fitur | Status | Catatan |
|-------|--------|---------|
| Role-based access (4 role) | ✅ | admin / staff / kepala_desa / warga |
| Middleware `CheckRole` (web redirect + API JSON) | ✅ | |
| Audit log (`AuditLog::catat()`) | ✅ | Dipanggil di semua aksi penting |
| Public storage untuk file upload | ✅ | `php artisan storage:link` |
| Slug otomatis konten desa | ✅ | |
| Nomor pengajuan otomatis (`ADM/YYYYMMDD/XXXX`) | ✅ | |
| Flash session → Inertia shared props | ✅ | success / error / info |
| Sanctum personal access token | ✅ | |
| Notifikasi push (Firebase) | ❌ | Model `Notifikasi` ada |
| Generate PDF surat output | ❌ | Model `SuratOutput` ada |
| Sistem ulasan layanan | ❌ | Model `Ulasan` ada |

### Mobile

| Fitur | Status | Catatan |
|-------|--------|---------|
| Axios centralized (`lib/api.ts`) | ✅ | |
| Auto-attach Bearer token (interceptor) | ✅ | |
| Expo SecureStore (token terenkripsi) | ✅ | |
| Environment variable API URL (`.env`) | ✅ | `EXPO_PUBLIC_API_URL` |
| Token refresh / auto-logout | ❌ | |
| Offline handling | ❌ | |
| Loading skeleton / shimmer | ❌ | Saat ini pakai `ActivityIndicator` |
| Push notifications (Firebase) | ❌ | |

---

## 19. Ringkasan Status

### Per Platform

| Platform | Selesai | Parsial | Belum |
|----------|---------|---------|-------|
| **Web — Auth** | 9 | 1 | 0 |
| **Web — Admin** | 20 | 2 | 18 |
| **Web — Staff** | 5 | 0 | 3 |
| **Web — Kepala Desa** | 4 | 0 | 0 |
| **Web — Warga** | 4 | 0 | 0 |
| **Web — Publik** | 4 | 0 | 0 |
| **Mobile — Core** | 25 | 0 | 4 |
| **Mobile — Pengajuan** | 14 | 0 | 3 |
| **Mobile — Pengaduan** | 13 | 0 | 2 |
| **Mobile — Lainnya** | 10 | 0 | 8 |

### Prioritas yang Belum Dikerjakan

#### 🔴 High

| # | Fitur | Platform |
|---|-------|----------|
| ~~1~~ | ~~Admin: Kelola Master Surat (CRUD)~~ | ~~Web~~ ✅ Selesai |
| ~~2~~ | ~~Staff: Handle pengaduan (tanggapi + ubah status)~~ | ~~Web~~ ✅ Selesai |
| ~~3~~ | ~~Admin: Tanggapi pengaduan + ubah status~~ | ~~Web~~ ✅ Selesai |

#### 🟡 Medium

| # | Fitur | Platform |
|---|-------|----------|
| ~~4~~ | ~~Admin: Kelola Wilayah (CRUD)~~ | ~~Web~~ ✅ Selesai |
| ~~5~~ | ~~Admin: Kelola Kategori Aduan (CRUD)~~ | ~~Web~~ ✅ Selesai |
| 6 | Admin: Generate / upload surat output | Web |
| 7 | Register page dalam Bahasa Indonesia | Web |
| 8 | Search di tab Riwayat & Status | Mobile |
| 9 | Loading skeleton | Mobile |
| 10 | Filter & search di list informasi | Mobile |

#### 🟢 Low / Future

| # | Fitur | Platform |
|---|-------|----------|
| 11 | Push notifications (Firebase) | Web + Mobile |
| 12 | Scan QR Buku Tamu | Mobile |
| 13 | Download surat hasil (PDF) | Mobile |
| 14 | Edit profil warga | Mobile |
| 15 | Token refresh / auto-logout | Mobile |
| 16 | Admin: Data Penduduk | Web |
| 17 | Admin: Buku Tamu (view & manage) | Web |
| 18 | Rich text editor konten desa | Web |
| 19 | Form dinamis per jenis surat | Mobile |
| 20 | Sistem ulasan layanan | Web + Mobile |
| 21 | Grafik statistik dashboard | Web |
| 22 | Export audit log | Web |
