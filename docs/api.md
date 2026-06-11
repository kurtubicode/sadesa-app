# SADESA — API Reference

REST API untuk aplikasi mobile SADESA. Autentikasi menggunakan **Laravel Sanctum** (Bearer Token).

**Base URL (development):** `http://<IP_LOKAL>:8000`  
**Content-Type:** `application/json` (kecuali upload file: `multipart/form-data`)

---

## Autentikasi

Sertakan token di setiap request yang memerlukan autentikasi:

```
Authorization: Bearer <token>
```

Token diperoleh dari respons `POST /api/login` dan disimpan di **Expo SecureStore** (key: `sadesa_user_token`).

---

## Kode Respons Umum

| Kode | Keterangan |
|------|-----------|
| `200` | Sukses |
| `201` | Resource berhasil dibuat |
| `401` | Token tidak valid / belum login |
| `403` | Role tidak punya akses / akun dinonaktifkan |
| `404` | Resource tidak ditemukan |
| `422` | Validasi input gagal |
| `500` | Server error |

---

## 1. Public Endpoints

Tidak memerlukan token.

---

### `POST /api/register`

Daftar akun warga baru. Akun berstatus `menunggu_verifikasi` hingga disetujui admin.

**Body:**

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|-----------|
| `nik` | string(16) | ✅ | NIK KTP, harus unik |
| `name` | string | ✅ | Nama lengkap |
| `email` | string | ✅ | Email, harus unik |
| `password` | string(≥8) | ✅ | |
| `password_confirmation` | string | ✅ | Harus sama dengan `password` |
| `phone` | string | — | No. HP (opsional) |
| `wilayah_id` | integer | — | ID wilayah dari `GET /api/wilayah` |

**Respons `201`:**

```json
{
  "message": "Registrasi berhasil. Akun Anda sedang menunggu verifikasi dari Admin.",
  "user": {
    "id": 10,
    "nik": "3210xxxxxxxxxxxxxx",
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "role": "warga",
    "status": "menunggu_verifikasi"
  }
}
```

---

### `POST /api/login`

Login dan mendapatkan Bearer token.

> ⚠️ **Mobile hanya untuk warga.** Akun dengan role `admin`, `staff`, atau `kepala_desa` akan diblokir di sisi aplikasi mobile (bukan di API). API tetap mengembalikan token untuk semua role yang aktif.

**Body:**

| Field | Tipe | Wajib |
|-------|------|-------|
| `email` | string | ✅ |
| `password` | string | ✅ |

**Respons `200`:**

```json
{
  "message": "Login berhasil.",
  "user": {
    "id": 10,
    "nik": "3210xxxxxxxxxxxxxx",
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "phone": "08123456789",
    "role": "warga",
    "status": "aktif",
    "wilayah_id": 3
  },
  "token": "1|abcdefghijklmnopqrstuvwxyz"
}
```

**Respons `401`:** Email/password salah.  
**Respons `403`:** Akun `menunggu_verifikasi` atau `nonaktif`.

---

### `GET /api/master-surat`

Daftar jenis surat yang aktif. Digunakan di form pengajuan mobile.

**Respons `200`:**

```json
{
  "data": [
    {
      "id": 1,
      "kode": "SKD",
      "nama_surat": "Surat Keterangan Domisili",
      "persyaratan": "KTP asli, KK asli, Surat pengantar RT/RW"
    }
  ]
}
```

---

### `GET /api/kategori-aduan`

Daftar kategori pengaduan. Digunakan di form buat pengaduan mobile.

**Respons `200`:**

```json
{
  "data": [
    { "id": 1, "nama_kategori": "Infrastruktur", "deskripsi": "Jalan, jembatan, drainase" },
    { "id": 2, "nama_kategori": "Keamanan",      "deskripsi": "Ketertiban lingkungan" }
  ]
}
```

---

### `GET /api/wilayah`

Daftar wilayah (desa, dusun, RW, RT). Digunakan di form registrasi.

**Respons `200`:**

```json
{
  "data": [
    { "id": 1, "nama": "Desa Cirangkong", "tipe": "desa",  "parent_id": null },
    { "id": 2, "nama": "Dusun Barat",     "tipe": "dusun", "parent_id": 1 }
  ]
}
```

---

### `GET /api/informasi`

Daftar berita dan pengumuman desa (publik).

**Query params:** `?per_page=N` (default 20, maks 50)

**Respons `200`:**

```json
{
  "data": [
    {
      "id": 5,
      "judul": "Jadwal Posyandu Bulan Ini",
      "slug": "jadwal-posyandu-bulan-ini",
      "tipe": "pengumuman",
      "created_at": "2026-05-10T08:00:00.000000Z"
    }
  ]
}
```

---

### `GET /api/informasi/{slug}`

Detail satu artikel berita/pengumuman.

**Respons `200`:**

```json
{
  "data": {
    "id": 5,
    "judul": "Jadwal Posyandu Bulan Ini",
    "slug": "jadwal-posyandu-bulan-ini",
    "konten": "Posyandu akan dilaksanakan pada...",
    "tipe": "pengumuman",
    "created_at": "2026-05-10T08:00:00.000000Z"
  }
}
```

---

### `GET /api/tes-koneksi`

Cek koneksi ke server (development only).

**Respons `200`:** `{ "status": "ok", "pesan": "Koneksi ke API SADESA berhasil!" }`

---

## 2. Protected — Semua Role (`auth:sanctum`)

---

### `POST /api/logout`

Revoke token aktif. Panggil sebelum hapus token lokal.

**Respons `200`:** `{ "message": "Logout berhasil." }`

---

### `GET /api/user`

Data profil user yang sedang login (dengan relasi wilayah).

**Respons `200`:** `{ "user": { ...data user + wilayah } }`

---

## 3. Protected — Warga (`auth:sanctum` + `role:warga`)

---

### `GET /api/pengajuan`

Riwayat pengajuan surat milik warga.

**Query params:** `?per_page=N` (default semua)

**Respons `200`:**

```json
{
  "data": [
    {
      "id": 12,
      "no_pengajuan": "ADM/20260513/0001",
      "jenis_surat": "Surat Keterangan Domisili",
      "status": "menunggu",
      "catatan": null,
      "tanggal": "13/05/2026"
    }
  ]
}
```

**Status yang mungkin:**

| Status | Keterangan |
|--------|-----------|
| `menunggu` | Baru dikirim, belum diproses |
| `diproses` | Staff sedang memproses |
| `diverifikasi` | Staff sudah verifikasi |
| `ditolak_staff` | Ditolak oleh staff |
| `menunggu_pengesahan` | Menunggu tanda tangan kepala desa |
| `disetujui` | Disetujui kepala desa |
| `ditolak_kepala` | Ditolak kepala desa |
| `selesai` | Surat siap diambil |
| `dibatalkan` | Dibatalkan warga |

---

### `POST /api/pengajuan`

Buat pengajuan surat baru.

**Body:**

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|-----------|
| `master_surat_id` | integer | ✅ | ID dari `GET /api/master-surat` |
| `data_formulir` | object | — | Data tambahan, misal `{ "keterangan": "..." }` |

**Respons `201`:**

```json
{
  "message": "Pengajuan berhasil dibuat. Silakan upload dokumen persyaratan.",
  "data": {
    "id": 12,
    "no_pengajuan": "ADM/20260513/0001",
    "status": "menunggu"
  }
}
```

---

### `GET /api/pengajuan/{id}`

Detail satu pengajuan beserta dokumen dan status.

**Respons `200`:**

```json
{
  "data": {
    "id": 12,
    "no_pengajuan": "ADM/20260513/0001",
    "jenis_surat": "Surat Keterangan Domisili",
    "persyaratan": "KTP asli, KK asli, Surat pengantar RT/RW",
    "status": "diverifikasi",
    "catatan": "Dokumen sudah lengkap.",
    "keterangan": "Untuk keperluan menikah",
    "tanggal": "13/05/2026",
    "dokumen": [
      {
        "id": 3,
        "nama_file": "ktp.jpg",
        "tipe": "jpg",
        "url": "http://localhost:8000/storage/dokumen/12/ktp.jpg"
      }
    ]
  }
}
```

---

### `POST /api/pengajuan/{id}/dokumen`

Upload file dokumen persyaratan. Panggil berulang untuk tiap file.

**Content-Type:** `multipart/form-data`

**Body:**

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|-----------|
| `file` | file | ✅ | PDF / JPG / PNG, maks 5 MB |
| `jenis_dokumen` | string | ✅ | Label file, misal: `"KTP"`, `"Kartu Keluarga"` |

**Contoh (React Native / Axios):**

```javascript
const formData = new FormData();
formData.append('file', { uri: fileUri, name: 'ktp.jpg', type: 'image/jpeg' });
formData.append('jenis_dokumen', 'KTP');

await api.post(`/api/pengajuan/${id}/dokumen`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
```

**Respons `201`:** `{ "message": "Dokumen berhasil diupload.", "data": { ...dokumen } }`

---

### `DELETE /api/pengajuan/{id}`

Batalkan pengajuan. Hanya bisa saat status `menunggu`.

**Respons `200`:** `{ "message": "Pengajuan berhasil dibatalkan." }`  
**Respons `422`:** Tidak bisa dibatalkan karena sudah diproses.

---

### `GET /api/pengaduan`

Riwayat pengaduan milik warga.

**Query params:** `?per_page=N` (default 50)

**Respons `200`:**

```json
{
  "data": [
    {
      "id": 7,
      "judul": "Jalan berlubang di Gang Mawar",
      "kategori": "Infrastruktur",
      "status": "diproses",
      "tanggal": "10/05/2026"
    }
  ]
}
```

---

### `POST /api/pengaduan`

Buat pengaduan baru dengan foto bukti (opsional, maks 3).

**Content-Type:** `multipart/form-data`

**Body:**

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|-----------|
| `kategori_aduan_id` | integer | ✅ | ID dari `GET /api/kategori-aduan` |
| `judul` | string(≤255) | ✅ | |
| `deskripsi` | string | ✅ | |
| `bukti[]` | file[] | — | JPG / PNG, maks 5 MB per file, maks 3 file |

**Contoh (React Native / Axios — 2 foto):**

```javascript
const formData = new FormData();
formData.append('kategori_aduan_id', '1');
formData.append('judul', 'Jalan berlubang');
formData.append('deskripsi', 'Jalan di Gang Mawar berlubang besar...');
formData.append('bukti[]', { uri: foto1.uri, name: 'bukti_1.jpg', type: 'image/jpeg' });
formData.append('bukti[]', { uri: foto2.uri, name: 'bukti_2.jpg', type: 'image/jpeg' });

await api.post('/api/pengaduan', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
```

**Respons `201`:**

```json
{
  "message": "Pengaduan berhasil dikirim. Petugas akan segera menindaklanjuti.",
  "data": { "id": 7, "judul": "Jalan berlubang di Gang Mawar", "status": "menunggu" }
}
```

---

### `GET /api/pengaduan/{id}`

Detail pengaduan beserta foto bukti dan tanggapan petugas.

**Respons `200`:**

```json
{
  "data": {
    "id": 7,
    "judul": "Jalan berlubang di Gang Mawar",
    "deskripsi": "Jalan di Gang Mawar berlubang besar sejak minggu lalu...",
    "status": "diproses",
    "created_at": "2026-05-10T08:00:00.000000Z",
    "kategori": {
      "id": 1,
      "nama_kategori": "Infrastruktur"
    },
    "bukti": [
      { "id": 1, "path_file": "bukti_pengaduan/7/foto1.jpg" },
      { "id": 2, "path_file": "bukti_pengaduan/7/foto2.jpg" }
    ],
    "tanggapan": [
      {
        "id": 1,
        "isi": "Laporan sudah diterima, tim akan turun lapangan besok.",
        "created_at": "2026-05-11T09:30:00.000000Z",
        "user": { "name": "Petugas Desa", "role": "staff" }
      }
    ]
  }
}
```

> **URL foto bukti:** `{BASE_URL}/storage/{path_file}`  
> Contoh: `http://192.168.1.10:8000/storage/bukti_pengaduan/7/foto1.jpg`

---

## 4. Protected — Staff (`auth:sanctum` + `role:staff,admin`)

Prefix: `/api/staff`

---

### `GET /api/staff/pengajuan`

Semua pengajuan yang masuk (untuk antrian verifikasi).

**Query params:** `?status=menunggu` (opsional)

---

### `GET /api/staff/pengajuan/{id}`

Detail pengajuan beserta dokumen untuk keperluan verifikasi.

---

### `POST /api/staff/pengajuan/{id}/verifikasi`

Verifikasi pengajuan (setujui atau tolak).

**Body:**

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|-----------|
| `action` | string | ✅ | `"setujui"` atau `"tolak"` |
| `catatan` | string | — | Catatan untuk warga |

**Efek:**
- `setujui` → status berubah ke `menunggu_pengesahan`
- `tolak` → status berubah ke `ditolak_staff`

**Respons `200`:**

```json
{
  "message": "Pengajuan berhasil diverifikasi.",
  "data": { "id": 12, "status": "menunggu_pengesahan" }
}
```

---

## 5. Protected — Kepala Desa (`auth:sanctum` + `role:kepala_desa,admin`)

Prefix: `/api/kepala-desa`

---

### `GET /api/kepala-desa/pengajuan`

Pengajuan yang siap disahkan (`status=menunggu_pengesahan`).

---

### `GET /api/kepala-desa/pengajuan/{id}`

Detail pengajuan untuk keperluan pengesahan.

---

### `POST /api/kepala-desa/pengajuan/{id}/pengesahan`

Sahkan atau tolak pengajuan.

**Body:**

| Field | Tipe | Wajib | Keterangan |
|-------|------|-------|-----------|
| `action` | string | ✅ | `"setujui"` atau `"tolak"` |
| `catatan` | string | — | Catatan untuk warga |

**Efek:**
- `setujui` → status berubah ke `disetujui`
- `tolak` → status berubah ke `ditolak_kepala`

---

## Alur Status Pengajuan

```
Warga buat pengajuan
        ↓
   [menunggu]
        ↓  Staff ambil
   [diproses]
        ↓  Staff verifikasi
   [diverifikasi]
        ↓  Diteruskan ke kepala
   [menunggu_pengesahan]
        ↓  Kepala desa tanda tangan
   [disetujui]  ──atau──  [ditolak_kepala]
        ↓
    [selesai]

Jalur penolakan:
   [menunggu/diproses]  →  ditolak_staff   (oleh staff)
   [menunggu]           →  dibatalkan       (oleh warga)
```

---

## Konfigurasi Axios (Mobile)

File: `mobile/lib/api.ts`

```typescript
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: { 'Accept': 'application/json' },
  timeout: 15000,
});

// Attach token otomatis ke setiap request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('sadesa_user_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```
