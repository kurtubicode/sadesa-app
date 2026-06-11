# SADESA — Status Fitur Lengkap

> Dokumen ini mencatat semua fitur yang sudah selesai, sedang berjalan, dan belum dikerjakan.  
> **Terakhir diperbarui:** 29 Mei 2026 — Verifikasi Warga + Buku Tamu Digital + PDF Surat + Dashboard Redesign (semua role) + Notifikasi + Staff Pengaduan + Audit Log

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
| Grafik bar chart mingguan (7 hari) | ✅ | Div-based, teal-600 |
| Activity feed audit log terbaru | ✅ | Colored dots + WIB timestamp |
| Tabel pengajuan terbaru (avatar + NIK) | ✅ | |

### Verifikasi Warga

| Fitur | Status | Catatan |
|-------|--------|---------|
| List antrian verifikasi (filter status) | ✅ | |
| Detail dokumen (KTP, KK, foto selfie) | ✅ | |
| Setujui / tolak + catatan | ✅ | Status akun → `aktif` / `ditolak` |

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
| List jenis surat | ✅ | |
| Tambah / edit / hapus jenis surat | ✅ | |
| Aktifkan / nonaktifkan jenis surat | ✅ | |
| Kelola persyaratan per jenis surat | ✅ | Array JSON di field `persyaratan` |

### Manajemen Wilayah

| Fitur | Status | Catatan |
|-------|--------|---------|
| List wilayah (desa, dusun, RW, RT) | ✅ | |
| Tambah / edit / hapus wilayah | ✅ | |
| Hierarki wilayah (parent-child) | ✅ | |

### Manajemen Kategori Pengaduan

| Fitur | Status | Catatan |
|-------|--------|---------|
| List kategori aduan | ✅ | |
| Tambah / edit / hapus kategori | ✅ | |

### Pengajuan Surat (Admin View)

| Fitur | Status | Catatan |
|-------|--------|---------|
| List semua pengajuan (filter status, search) | ✅ | |
| Detail pengajuan + riwayat verifikasi & pengesahan | ✅ | |
| Preview surat (HTML in-browser) | ✅ | |
| Download surat PDF | ✅ | DomPDF, kop surat otomatis |
| Upload surat output | ❌ | |

### Pengaduan (Admin View)

| Fitur | Status | Catatan |
|-------|--------|---------|
| List semua pengaduan (filter status) | ✅ | |
| Detail pengaduan + foto bukti | ✅ | |
| Tanggapi pengaduan (tambah komentar) | ✅ | |
| Ubah status pengaduan | ✅ | |

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
| List kunjungan tamu (filter tanggal, search) | ✅ | Halaman `/admin/buku-tamu` |
| Statistik hari ini / bulan ini / total | ✅ | |
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
| Dashboard (statistik tugas + antrian prioritas) | ✅ | Redesign teal, rounded-2xl |
| Antrian pengajuan (filter status, search) | ✅ | |
| Detail pengajuan + dokumen persyaratan | ✅ | |
| Verifikasi: setujui atau tolak + catatan | ✅ | Status → `menunggu_pengesahan` / `ditolak_staff` |
| Preview & download surat PDF | ✅ | |
| Tandai siap diambil / selesai | ✅ | |
| Handle pengaduan (tanggapi + ubah status) | ✅ | |

---

## 4. Web Dashboard — Kepala Desa

| Fitur | Status | Catatan |
|-------|--------|---------|
| Dashboard (statistik pengesahan bulanan) | ✅ | Redesign teal, rounded-2xl |
| List pengajuan siap disahkan | ✅ | Filter `menunggu_pengesahan` |
| Detail pengajuan + riwayat verifikasi staff | ✅ | |
| Preview surat sebelum pengesahan | ✅ | |
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
| Form Buku Tamu tamu | ✅ | `/buku-tamu`, full-page teal gradient |

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
| CheckRole middleware (web redirect, API JSON) | ✅ | |
| Audit log otomatis (`AuditLog::catat()`) | ✅ | Dipanggil di controller admin/staff/kepala |
| UI konsisten: rounded-2xl, solid teal icons, dark mode | ✅ | Semua 4 dashboard |
| Notifikasi database (bell icon) | ✅ | API `/api/notifications` |

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

## 17. Mobile — Buku Tamu

| Fitur | Status | Catatan |
|-------|--------|---------|
| Form input tamu (nama, instansi, keperluan, no HP) | ✅ | Auto-fill dari profil user |
| Submit ke API `POST /api/buku-tamu` | ✅ | |
| Layar sukses + tombol isi ulang / kembali | ✅ | |
| Scan QR code dari kantor desa | ❌ | Butuh `expo-camera` |
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
| Notifikasi database (bell, mark read) | ✅ | API `/api/notifications` |
| Generate PDF surat output (DomPDF) | ✅ | Kop surat + template per jenis |
| Preview surat HTML (browser) | ✅ | |
| Notifikasi push (Firebase) | ❌ | |
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
| **Web — Admin** | 36 | 0 | 8 |
| **Web — Staff** | 7 | 0 | 0 |
| **Web — Kepala Desa** | 5 | 0 | 0 |
| **Web — Warga** | 4 | 0 | 0 |
| **Web — Publik** | 5 | 0 | 0 |
| **Mobile — Core** | 25 | 0 | 4 |
| **Mobile — Pengajuan** | 14 | 0 | 3 |
| **Mobile — Pengaduan** | 13 | 0 | 2 |
| **Mobile — Lainnya** | 12 | 0 | 6 |

### Prioritas yang Belum Dikerjakan

#### 🔴 High

> Semua item high priority sudah selesai ✅

#### 🟡 Medium

| # | Fitur | Platform |
|---|-------|----------|
| 1 | Search di tab Riwayat & Status | Mobile |
| 2 | Loading skeleton / shimmer | Mobile |
| 3 | Filter & search di list informasi mobile | Mobile |
| 4 | Upload gambar konten desa | Web |

#### 🟢 Low / Future

| # | Fitur | Platform |
|---|-------|----------|
| 5 | Push notifications (Firebase) | Web + Mobile |
| 6 | Scan QR Buku Tamu | Mobile |
| 7 | Download surat PDF di mobile | Mobile |
| 8 | Edit profil & ubah password di mobile | Mobile |
| 9 | Token refresh / auto-logout | Mobile |
| 10 | Admin: Data Penduduk (CRUD + import) | Web |
| 11 | Rich text editor konten desa | Web |
| 12 | Form field dinamis per jenis surat | Mobile |
| 13 | Sistem ulasan layanan | Web + Mobile |
| 14 | Export audit log & buku tamu | Web |
