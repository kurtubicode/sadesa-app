<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; }
  body {
    font-family: "Times New Roman", Times, serif;
    font-size: 12pt;
    margin: 0;
    padding: 30px 40px;
    color: #000;
  }

  /* ── KOP SURAT ──────────────────────────────────────── */
  .kop-wrap {
    width: 100%;
    border-bottom: 4px double #000;
    padding-bottom: 10px;
    margin-bottom: 18px;
  }
  .kop-table { width: 100%; }
  .kop-logo  { width: 70px; text-align: center; vertical-align: middle; }
  .kop-logo img { width: 60px; height: 60px; }
  .kop-teks  { text-align: center; vertical-align: middle; }
  .kop-teks .baris1 { font-size: 13pt; font-weight: bold; letter-spacing: 1px; }
  .kop-teks .baris2 { font-size: 11pt; font-weight: bold; }
  .kop-teks .baris3 { font-size: 11pt; }
  .kop-teks .alamat { font-size: 9pt; margin-top: 3px; }

  /* ── JUDUL ──────────────────────────────────────────── */
  .judul-wrap { text-align: center; margin-bottom: 4px; }
  .judul-surat {
    font-size: 13pt;
    font-weight: bold;
    text-transform: uppercase;
    text-decoration: underline;
    letter-spacing: 1px;
  }
  .nomor-surat { font-size: 10.5pt; text-align: center; margin-bottom: 18px; }

  /* ── ISI ────────────────────────────────────────────── */
  .paragraf { text-align: justify; line-height: 1.6; margin-bottom: 10px; }

  .data-warga { width: 100%; margin-bottom: 14px; border-collapse: collapse; }
  .data-warga td { padding: 1.5px 0; vertical-align: top; font-size: 11.5pt; }
  .data-warga .lbl { width: 38%; }
  .data-warga .sep { width: 4%; text-align: center; }
  .data-warga .val { width: 58%; }

  /* ── TTD ────────────────────────────────────────────── */
  .ttd-wrap  { margin-top: 30px; width: 100%; }
  .ttd-table { width: 100%; border-collapse: collapse; }
  .ttd-kiri  { width: 45%; vertical-align: top; }
  .ttd-kanan { width: 55%; text-align: center; vertical-align: top; }
  .ttd-nama  {
    display: inline-block;
    font-weight: bold;
    text-decoration: underline;
    margin-top: 60px;
  }
  .tanggal-baris { text-align: right; margin-bottom: 4px; }

  /* TTD saksi (RT/RW) kiri */
  .ttd-saksi { width: 100%; border-collapse: collapse; }
  .ttd-saksi td { width: 50%; text-align: center; vertical-align: top; font-size: 11pt; }
  .ttd-saksi .nama-saksi {
    display: inline-block;
    font-weight: bold;
    text-decoration: underline;
    margin-top: 55px;
  }

  .ttd-camat { margin-top: 24px; font-size: 11pt; }
  .ttd-camat .judul-camat { margin-bottom: 2px; }
</style>
</head>
<body>

{{-- ═══════════════════════════════════════════════════
     KOP SURAT
════════════════════════════════════════════════════ --}}
<div class="kop-wrap">
  <table class="kop-table">
    <tr>
      <td class="kop-logo">
        @php
          $logoPath = $settings['kop_logo_path'] ?? 'images/logo-kab-subang.png';
          $logoFull = public_path($logoPath);
        @endphp
        @if(file_exists($logoFull))
          <img src="{{ $logoFull }}" alt="Logo">
        @else
          <div style="width:60px;height:60px;border:1px solid #999;text-align:center;font-size:7pt;padding-top:20px;color:#999;">LOGO</div>
        @endif
      </td>
      <td class="kop-teks">
        @php
          $s = $settings ?? [];
          $kopJabatan   = ($s['kop_jabatan']   ?? 'KEPALA DESA') . ' ' . strtoupper($s['kop_nama_desa'] ?? 'CIRANGKONG');
          $kopKecamatan = 'KECAMATAN ' . strtoupper($s['kop_kecamatan'] ?? 'CIJAMBE');
          $kopKabupaten = 'KABUPATEN ' . strtoupper($s['kop_kabupaten'] ?? 'SUBANG');
          $kopAlamat    = $s['kop_alamat'] ?? '';
          $kopTelepon   = $s['kop_telepon'] ?? '';
          $kopKodePOS   = $s['kop_kode_pos'] ?? '';
          $alamatLengkap = 'Alamat: ' . $kopAlamat;
          if ($kopTelepon) $alamatLengkap .= '  Telp: ' . $kopTelepon;
          if ($kopKodePOS) $alamatLengkap .= '  Kode Pos ' . $kopKodePOS;
        @endphp
        <div class="baris1">{{ $kopJabatan }}</div>
        <div class="baris2">{{ $kopKecamatan }}</div>
        <div class="baris3">{{ $kopKabupaten }}</div>
        <div class="alamat">{{ $alamatLengkap }}</div>
      </td>
      <td style="width:70px;"></td>{{-- spacer kanan agar teks tengah --}}
    </tr>
  </table>
</div>

{{-- ═══════════════════════════════════════════════════
     JUDUL & NOMOR SURAT
════════════════════════════════════════════════════ --}}
<div class="judul-wrap">
  <span class="judul-surat">{{ strtoupper($masterSurat->nama_surat) }}</span>
</div>
<div class="nomor-surat">Nomor : {{ $nomor_surat }}</div>

{{-- ═══════════════════════════════════════════════════
     PEMBUKA
════════════════════════════════════════════════════ --}}
<p class="paragraf">
  Yang bertanda tangan di bawah ini, {{ $settings['kades_jabatan'] ?? 'Kepala Desa Cirangkong' }}
  Kecamatan {{ $settings['kop_kecamatan'] ?? 'Cijambe' }} Kabupaten {{ $settings['kop_kabupaten'] ?? 'Subang' }},
  menerangkan bahwa :
</p>

{{-- ═══════════════════════════════════════════════════
     DATA DIRI WARGA
════════════════════════════════════════════════════ --}}
<table class="data-warga">
  <tr>
    <td class="lbl">Nama</td>
    <td class="sep">:</td>
    <td class="val">{{ $penduduk?->nama ?? $user->name }}</td>
  </tr>
  <tr>
    <td class="lbl">NIK</td>
    <td class="sep">:</td>
    <td class="val">{{ $penduduk?->nik ?? $user->nik }}</td>
  </tr>
  <tr>
    <td class="lbl">Tempat, Tanggal Lahir</td>
    <td class="sep">:</td>
    <td class="val">
      {{ $penduduk?->tempat_lahir ?? '-' }},
      {{ $penduduk?->tanggal_lahir?->locale('id')->translatedFormat('d F Y') ?? '-' }}
    </td>
  </tr>
  <tr>
    <td class="lbl">Jenis Kelamin</td>
    <td class="sep">:</td>
    <td class="val">{{ $penduduk?->jenis_kelamin_label ?? '-' }}</td>
  </tr>
  <tr>
    <td class="lbl">Status Perkawinan</td>
    <td class="sep">:</td>
    <td class="val">{{ $penduduk?->status_perkawinan_label ?? '-' }}</td>
  </tr>
  <tr>
    <td class="lbl">Kebangsaan</td>
    <td class="sep">:</td>
    <td class="val">Indonesia</td>
  </tr>
  <tr>
    <td class="lbl">Pekerjaan</td>
    <td class="sep">:</td>
    <td class="val">{{ $penduduk?->pekerjaan ?? '-' }}</td>
  </tr>
  <tr>
    <td class="lbl">Agama</td>
    <td class="sep">:</td>
    <td class="val">{{ $penduduk?->agama_label ?? '-' }}</td>
  </tr>
  <tr>
    <td class="lbl">Alamat</td>
    <td class="sep">:</td>
    <td class="val">{{ $penduduk?->alamat ?? '-' }}</td>
  </tr>
</table>

{{-- ═══════════════════════════════════════════════════
     ISI SURAT — disesuaikan per kode
════════════════════════════════════════════════════ --}}
@php $formulir = $pengajuan->data_formulir ?? []; @endphp

@php
  $desa       = $settings['kop_nama_desa']  ?? 'Cirangkong';
  $kecamatan  = $settings['kop_kecamatan']  ?? 'Cijambe';
  $kabupaten  = $settings['kop_kabupaten']  ?? 'Subang';
@endphp

@switch($masterSurat->kode)

  @case('KTR-MSK')
    <p class="paragraf">
      Nama tersebut di atas adalah benar-benar Penduduk Desa {{ $desa }} Kecamatan {{ $kecamatan }}
      Kabupaten {{ $kabupaten }}, dan menurut keterangan dari RT dan RW bahwa yang bersangkutan
      benar-benar tergolong <strong>tidak mampu</strong> dan Surat Keterangan ini akan
      dipergunakan untuk <strong>{{ $formulir['keperluan'] ?? '...' }}</strong>.
    </p>
    @break

  @case('DOM-DLM')
  @case('DOM-LWY')
  @case('DOM-LBG')
    <p class="paragraf">
      Nama tersebut di atas adalah benar-benar berdomisili / bertempat tinggal di
      {{ $penduduk?->alamat ?? '...' }}, Desa {{ $desa }} Kecamatan {{ $kecamatan }}
      Kabupaten {{ $kabupaten }}.
      Surat Keterangan Domisili ini dibuat untuk keperluan
      <strong>{{ $formulir['keperluan'] ?? '...' }}</strong>.
    </p>
    @break

  @case('DOM-USH')
    <p class="paragraf">
      Nama tersebut di atas adalah benar-benar Penduduk Desa {{ $desa }} Kecamatan {{ $kecamatan }}
      Kabupaten {{ $kabupaten }} dan mempunyai usaha dengan keterangan sebagai berikut :
    </p>
    <table class="data-warga" style="margin-bottom:10px;">
      <tr>
        <td class="lbl">Nama Usaha</td>
        <td class="sep">:</td>
        <td class="val">{{ $formulir['nama_usaha'] ?? '-' }}</td>
      </tr>
      <tr>
        <td class="lbl">Jenis Usaha</td>
        <td class="sep">:</td>
        <td class="val">{{ $formulir['jenis_usaha'] ?? '-' }}</td>
      </tr>
      <tr>
        <td class="lbl">Alamat Usaha</td>
        <td class="sep">:</td>
        <td class="val">{{ $formulir['alamat_usaha'] ?? $penduduk?->alamat ?? '-' }}</td>
      </tr>
    </table>
    <p class="paragraf">
      Surat Keterangan Domisili Usaha ini dibuat untuk keperluan
      <strong>{{ $formulir['keperluan'] ?? '...' }}</strong>.
    </p>
    @break

  @case('KTR-PKJ')
    <p class="paragraf">
      Nama tersebut di atas adalah benar-benar Penduduk Desa {{ $desa }} Kecamatan {{ $kecamatan }}
      Kabupaten {{ $kabupaten }}, dan benar-benar berprofesi / bermata pencaharian sebagai
      <strong>{{ $penduduk?->pekerjaan ?? '-' }}</strong>.
      Surat Keterangan ini dibuat untuk keperluan
      <strong>{{ $formulir['keperluan'] ?? '...' }}</strong>.
    </p>
    @break

  @case('KTR-PKK')
    <p class="paragraf">
      Nama tersebut di atas adalah benar-benar Penduduk Desa {{ $desa }} Kecamatan {{ $kecamatan }}
      Kabupaten {{ $kabupaten }}. Surat Keterangan ini dibuat untuk keperluan proses
      <strong>Kartu Keluarga (KK)</strong>
      @if(!empty($formulir['nama_anggota']))
        atas nama anggota keluarga <strong>{{ $formulir['nama_anggota'] }}</strong>
      @endif
      dengan keperluan <strong>{{ $formulir['keperluan'] ?? '...' }}</strong>.
    </p>
    @break

  @case('NKH-LLK')
  @case('NKH-PRP')
    <p class="paragraf">
      Nama tersebut di atas adalah benar-benar Penduduk Desa {{ $desa }} Kecamatan {{ $kecamatan }}
      Kabupaten {{ $kabupaten }}. Surat Pengantar Nikah ini dibuat untuk keperluan
      pendaftaran pernikahan di KUA Kecamatan {{ $kecamatan }}.
    </p>
    @break

  @default
    <p class="paragraf">
      Nama tersebut di atas adalah benar-benar Penduduk Desa {{ $desa }} Kecamatan {{ $kecamatan }}
      Kabupaten {{ $kabupaten }}. Surat keterangan ini dibuat untuk keperluan
      <strong>{{ $formulir['keperluan'] ?? '...' }}</strong>.
    </p>

@endswitch

{{-- ═══════════════════════════════════════════════════
     PENUTUP
════════════════════════════════════════════════════ --}}
<p class="paragraf">
  Demikian Surat Keterangan ini kami buat dengan sebenarnya, dan kepada yang berkepentingan
  harap menjadi maklum dan dijadikan sebagai bahan pertimbangan.
</p>

{{-- ═══════════════════════════════════════════════════
     TANDA TANGAN
════════════════════════════════════════════════════ --}}
<div class="ttd-wrap">
  <table class="ttd-table">
    <tr>
      {{-- Kiri: RT & RW --}}
      <td class="ttd-kiri">
        <table class="ttd-saksi">
          <tr>
            <td>
              Ketua Rukun Tetangga<br>
              <span class="nama-saksi">{{ $rt_nama ?? '.................................' }}</span>
            </td>
            <td>
              Ketua Rukun Warga<br>
              <span class="nama-saksi">{{ $rw_nama ?? '.................................' }}</span>
            </td>
          </tr>
        </table>

        <div class="ttd-camat">
          <div class="judul-camat">Mengetahui,<br>CAMAT {{ strtoupper($settings['kop_kecamatan'] ?? 'CIJAMBE') }}</div>
          <div style="margin-top:55px;">
            <span style="font-weight:bold;text-decoration:underline;">
              {{ $camat_nama ?? '.................................' }}
            </span><br>
            NIP.
          </div>
        </div>
      </td>

      {{-- Kanan: Kepala Desa --}}
      <td class="ttd-kanan">
        <div class="tanggal-baris">{{ $settings['kop_nama_desa'] ?? 'Cirangkong' }}, {{ $tanggal }}</div>
        <div>{{ $settings['kades_jabatan'] ?? 'Kepala Desa Cirangkong' }}</div>
        <div><span class="ttd-nama">{{ $settings['kades_nama'] ?? $kades?->name ?? '........................' }}</span></div>
        @if(!empty($settings['kades_nip']))
          <div style="font-size:10pt;">NIP. {{ $settings['kades_nip'] }}</div>
        @endif
      </td>
    </tr>
  </table>
</div>

</body>
</html>
