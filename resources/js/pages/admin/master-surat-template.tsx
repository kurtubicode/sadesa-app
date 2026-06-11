import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlignLeft,
    ChevronDown,
    ChevronUp,
    Eye,
    FileSignature,
    GripVertical,
    LayoutList,
    MessageSquare,
    Minus,
    Plus,
    Save,
    Settings2,
    TableProperties,
    Trash2,
    X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

// ─── Types ───────────────────────────────────────────────────────────────────

type BlockType = 'paragraph' | 'fields_table' | 'alasan' | 'signature' | 'spacer';

interface FieldRow {
    id: string;
    label: string;
    source: 'profile' | 'input';
    profile_key?: string;
    field_key?: string;    // key di data_formulir saat source=input (auto dari label)
    input_type?: 'text' | 'number' | 'date' | 'dropdown';
    placeholder?: string;
    options?: string[];
}

interface Block {
    id: string;
    type: BlockType;
    content?: string;    // paragraph teks | alasan label
    fields?: FieldRow[]; // fields_table
    field_key?: string;  // alasan: key di data_formulir (default: 'keperluan')
}

interface TemplateData {
    judul: string;
    blocks: Block[];
}

interface MasterSurat {
    id: number;
    kode: string;
    kategori: string | null;
    nomor_prefix: string | null;
    kode_bidang: string | null;
    nama_surat: string;
    deskripsi: string | null;
    template: TemplateData | null;
}

interface KopSettings {
    kop_jabatan?:   string;
    kop_nama_desa?: string;
    kop_kecamatan?: string;
    kop_kabupaten?: string;
    kop_alamat?:    string;
    kop_telepon?:   string;
    kop_kode_pos?:  string;
    kop_logo_path?: string;
    kades_nama?:    string;
    kades_nip?:     string;
    kades_jabatan?: string;
    [key: string]: string | undefined;
}

interface PageProps {
    surat: MasterSurat;
    kategoriList: Record<string, string>;
    settings: KopSettings;
    flash?: { success?: string; error?: string };
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PROFILE_FIELDS: { key: string; label: string; hint: string }[] = [
    { key: 'nama_lengkap',       label: 'Nama Lengkap',         hint: 'Dari data akun warga' },
    { key: 'nik',                label: 'NIK',                  hint: 'Dari data akun warga' },
    { key: 'tempat_tgl_lahir',   label: 'Tempat/Tgl Lahir',     hint: 'Dari data penduduk' },
    { key: 'tempat_lahir',       label: 'Tempat Lahir',         hint: 'Dari data penduduk' },
    { key: 'tanggal_lahir',      label: 'Tanggal Lahir',        hint: 'Dari data penduduk' },
    { key: 'jenis_kelamin',      label: 'Jenis Kelamin',        hint: 'Dari data penduduk' },
    { key: 'agama',              label: 'Agama',                hint: 'Dari data penduduk' },
    { key: 'pekerjaan',          label: 'Pekerjaan',            hint: 'Dari data penduduk' },
    { key: 'status_perkawinan',  label: 'Status Perkawinan',    hint: 'Dari data penduduk' },
    { key: 'kewarganegaraan',    label: 'Kewarganegaraan',      hint: 'Default: WNI' },
    { key: 'alamat',             label: 'Alamat',               hint: 'Dari data penduduk' },
    { key: 'no_kk',              label: 'No. Kartu Keluarga',   hint: 'Dari data penduduk' },
    { key: 'wilayah',            label: 'Wilayah/Dusun',        hint: 'Dari data akun warga' },
];

function uid(): string {
    return Math.random().toString(36).slice(2, 10);
}

/** Label → snake_case key: "Nama Usaha" → "nama_usaha" */
function labelToKey(label: string): string {
    return label
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .replace(/^_+|_+$/g, '');
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function KopSuratPreview({ settings }: { settings: KopSettings }) {
    const jabatan   = settings.kop_jabatan   ?? 'KEPALA DESA';
    const namaDesa  = (settings.kop_nama_desa ?? 'CIRANGKONG').toUpperCase();
    const kecamatan = (settings.kop_kecamatan ?? 'KECAMATAN').toUpperCase();
    const kabupaten = (settings.kop_kabupaten ?? 'KABUPATEN').toUpperCase();
    const alamat    = settings.kop_alamat    ?? '';
    const telepon   = settings.kop_telepon   ?? '';
    const kodePos   = settings.kop_kode_pos  ?? '';
    const logoPath  = settings.kop_logo_path;

    let alamatLine = alamat;
    if (telepon) alamatLine += '  Telp: ' + telepon;
    if (kodePos)  alamatLine += '  Kode Pos ' + kodePos;

    return (
        <div className="border-b-2 border-black pb-3" style={{ fontFamily: 'inherit' }}>
            <table className="w-full">
                <tbody>
                    <tr>
                        <td className="w-14 text-center align-middle">
                            {logoPath ? (
                                <img
                                    src={`/storage/${logoPath}`}
                                    alt="Logo"
                                    className="mx-auto h-12 w-12 object-contain"
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/images/logo-kab-subang.png'; }}
                                />
                            ) : (
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-gray-300 bg-gray-50 text-[8px] text-gray-400">LOGO</div>
                            )}
                        </td>
                        <td className="text-center align-middle">
                            <p className="text-base font-black uppercase tracking-wide">{jabatan} {namaDesa}</p>
                            <p className="text-sm font-bold uppercase">KECAMATAN {kecamatan}</p>
                            <p className="text-sm">KABUPATEN {kabupaten}</p>
                            {alamatLine && <p className="mt-0.5 text-[10px] text-gray-600">{alamatLine}</p>}
                        </td>
                        <td className="w-14" />
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

function ProfileChip({ fieldKey }: { fieldKey: string }) {
    const field = PROFILE_FIELDS.find(f => f.key === fieldKey);
    return (
        <span className="inline-flex items-center rounded bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
            {`{${field?.label ?? fieldKey}}`}
        </span>
    );
}

function InputChip({ label, placeholder }: { label: string; placeholder?: string }) {
    return (
        <span className="inline-flex items-center rounded border border-dashed border-teal-400 bg-teal-50 px-2 py-0.5 text-xs text-teal-600 dark:bg-teal-900/20 dark:text-teal-400">
            {placeholder ?? label}
        </span>
    );
}

// ─── Block Editor ─────────────────────────────────────────────────────────────

function ParagraphBlock({
    block, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast,
}: {
    block: Block;
    onChange: (b: Block) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
}) {
    return (
        <div className="group relative rounded-xl border border-border bg-card">
            <BlockHeader
                label="Paragraf"
                icon={<AlignLeft className="h-3.5 w-3.5" />}
                onDelete={onDelete}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                isFirst={isFirst}
                isLast={isLast}
            />
            <div className="px-4 pb-4">
                <textarea
                    className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    rows={4}
                    value={block.content ?? ''}
                    onChange={e => onChange({ ...block, content: e.target.value })}
                    placeholder="Tulis isi paragraf di sini..."
                />
                <p className="mt-1 text-xs text-muted-foreground">
                    Gunakan <code className="rounded bg-muted px-1">{'{{nama_variabel}}'}</code> untuk menyisipkan data warga secara manual.
                </p>
            </div>
        </div>
    );
}

function FieldsTableBlock({
    block, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast,
}: {
    block: Block;
    onChange: (b: Block) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
}) {
    const fields = block.fields ?? [];

    function addField() {
        const newField: FieldRow = {
            id: uid(), label: 'Label Baru', source: 'profile', profile_key: 'nama_lengkap', field_key: 'label_baru',
        };
        onChange({ ...block, fields: [...fields, newField] });
    }

    function updateField(idx: number, updated: FieldRow) {
        const next = fields.map((f, i) => (i === idx ? updated : f));
        onChange({ ...block, fields: next });
    }

    function removeField(idx: number) {
        onChange({ ...block, fields: fields.filter((_, i) => i !== idx) });
    }

    function moveField(idx: number, dir: -1 | 1) {
        const next = [...fields];
        const swap = idx + dir;
        if (swap < 0 || swap >= next.length) return;
        [next[idx], next[swap]] = [next[swap], next[idx]];
        onChange({ ...block, fields: next });
    }

    return (
        <div className="group relative rounded-xl border border-border bg-card">
            <BlockHeader
                label="Tabel Data"
                icon={<TableProperties className="h-3.5 w-3.5" />}
                onDelete={onDelete}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                isFirst={isFirst}
                isLast={isLast}
            />
            <div className="px-4 pb-4 space-y-2">
                {fields.map((field, idx) => (
                    <FieldRowEditor
                        key={field.id}
                        field={field}
                        isFirst={idx === 0}
                        isLast={idx === fields.length - 1}
                        onChange={f => updateField(idx, f)}
                        onDelete={() => removeField(idx)}
                        onMove={dir => moveField(idx, dir)}
                    />
                ))}
                {fields.length === 0 && (
                    <p className="rounded-lg border border-dashed border-border py-4 text-center text-xs text-muted-foreground">
                        Belum ada baris. Klik "+ Tambah Baris" untuk menambahkan data.
                    </p>
                )}
                <button
                    type="button"
                    onClick={addField}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-teal-400 py-2 text-xs font-medium text-teal-600 transition hover:bg-teal-50 dark:hover:bg-teal-900/20"
                >
                    <Plus className="h-3.5 w-3.5" /> Tambah Baris
                </button>
            </div>
        </div>
    );
}

function FieldRowEditor({
    field, onChange, onDelete, onMove, isFirst, isLast,
}: {
    field: FieldRow;
    onChange: (f: FieldRow) => void;
    onDelete: () => void;
    onMove: (dir: -1 | 1) => void;
    isFirst: boolean;
    isLast: boolean;
}) {
    return (
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2 rounded-lg border border-border bg-muted/30 p-2.5">
            {/* Label */}
            <div>
                <label className="mb-1 block text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Label</label>
                <input
                    type="text"
                    value={field.label}
                    onChange={e => onChange({ ...field, label: e.target.value })}
                    className="w-full rounded border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                    placeholder="NAMA LENGKAP"
                />
            </div>

            {/* Source & Field */}
            <div>
                <label className="mb-1 block text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Sumber Data</label>
                <select
                    value={field.source}
                    onChange={e => onChange({ ...field, source: e.target.value as 'profile' | 'input', profile_key: 'nama_lengkap', input_type: 'text' })}
                    className="w-full rounded border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 mb-1.5"
                >
                    <option value="profile">Profil Warga (otomatis)</option>
                    <option value="input">Input Manual (warga isi)</option>
                </select>
                {field.source === 'profile' ? (
                    <select
                        value={field.profile_key ?? 'nama_lengkap'}
                        onChange={e => onChange({ ...field, profile_key: e.target.value })}
                        className="w-full rounded border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                        {PROFILE_FIELDS.map(f => (
                            <option key={f.key} value={f.key}>{f.label}</option>
                        ))}
                    </select>
                ) : (
                    <div className="space-y-1.5">
                        <div className="flex gap-1.5">
                            <select
                                value={field.input_type ?? 'text'}
                                onChange={e => onChange({ ...field, input_type: e.target.value as FieldRow['input_type'] })}
                                className="w-1/2 rounded border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                            >
                                <option value="text">Teks</option>
                                <option value="number">Angka</option>
                                <option value="date">Tanggal</option>
                                <option value="dropdown">Pilihan</option>
                            </select>
                            <input
                                type="text"
                                value={field.placeholder ?? ''}
                                onChange={e => onChange({ ...field, placeholder: e.target.value })}
                                className="w-1/2 rounded border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                                placeholder="Placeholder..."
                            />
                        </div>
                        {/* Field key — key yang disimpan di data_formulir */}
                        <div className="flex items-center gap-1">
                            <span className="text-[9px] text-muted-foreground shrink-0">key:</span>
                            <input
                                type="text"
                                value={field.field_key ?? labelToKey(field.label)}
                                onChange={e => onChange({ ...field, field_key: e.target.value })}
                                className="w-full rounded border border-border bg-background px-2 py-0.5 font-mono text-[10px] text-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:text-teal-400"
                                placeholder={labelToKey(field.label) || 'field_key'}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex flex-col items-center justify-between gap-1 pt-5">
                <button
                    type="button"
                    onClick={() => onMove(-1)}
                    disabled={isFirst}
                    className="rounded p-0.5 text-muted-foreground hover:bg-muted disabled:opacity-30"
                >
                    <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                    type="button"
                    onClick={onDelete}
                    className="rounded p-0.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
                <button
                    type="button"
                    onClick={() => onMove(1)}
                    disabled={isLast}
                    className="rounded p-0.5 text-muted-foreground hover:bg-muted disabled:opacity-30"
                >
                    <ChevronDown className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}

function SignatureBlock({
    onDelete, onMoveUp, onMoveDown, isFirst, isLast,
}: {
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
}) {
    return (
        <div className="group relative rounded-xl border border-border bg-card">
            <BlockHeader
                label="Tanda Tangan"
                icon={<FileSignature className="h-3.5 w-3.5" />}
                onDelete={onDelete}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                isFirst={isFirst}
                isLast={isLast}
            />
            <div className="px-4 pb-4">
                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-center text-xs text-muted-foreground">
                    <p className="font-medium">Blok Tanda Tangan Kepala Desa</p>
                    <p className="mt-0.5">Tanggal • Jabatan • E-Signature Placeholder • Nama</p>
                </div>
            </div>
        </div>
    );
}

function SpacerBlock({
    onDelete, onMoveUp, onMoveDown, isFirst, isLast,
}: {
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
}) {
    return (
        <div className="group relative rounded-xl border border-dashed border-border bg-card/50">
            <BlockHeader
                label="Spasi"
                icon={<Minus className="h-3.5 w-3.5" />}
                onDelete={onDelete}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                isFirst={isFirst}
                isLast={isLast}
            />
            <div className="h-6" />
        </div>
    );
}

function AlasanBlock({
    block, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast,
}: {
    block: Block;
    onChange: (b: Block) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
}) {
    return (
        <div className="group relative rounded-xl border border-amber-300 bg-amber-50/60 dark:border-amber-700 dark:bg-amber-900/10">
            <BlockHeader
                label="Alasan Permohonan"
                icon={<MessageSquare className="h-3.5 w-3.5" />}
                onDelete={onDelete}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                isFirst={isFirst}
                isLast={isLast}
            />
            <div className="px-4 pb-4">
                <div className="mt-1 grid grid-cols-2 gap-3">
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                            Label (ditampilkan ke warga)
                        </label>
                        <input
                            type="text"
                            value={block.content ?? ''}
                            onChange={e => onChange({ ...block, content: e.target.value })}
                            placeholder="Keperluan / Alasan Permohonan"
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                            Key di data formulir
                        </label>
                        <input
                            type="text"
                            value={block.field_key ?? 'keperluan'}
                            onChange={e => onChange({ ...block, field_key: e.target.value })}
                            placeholder="keperluan"
                            className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:text-teal-400"
                        />
                        <p className="mt-0.5 text-[10px] text-muted-foreground">default: keperluan</p>
                    </div>
                </div>
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-800 dark:bg-amber-900/20">
                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                        ℹ️ Field ini akan diisi warga saat pengajuan
                    </p>
                    <p className="mt-0.5 text-xs text-amber-600 dark:text-amber-500">
                        Warga wajib mencentang persetujuan bahwa alasan yang mereka tulis akan tertera di surat resmi.
                    </p>
                </div>
            </div>
        </div>
    );
}

function BlockHeader({
    label, icon, onDelete, onMoveUp, onMoveDown, isFirst, isLast,
}: {
    label: string;
    icon: React.ReactNode;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
}) {
    return (
        <div className="flex items-center justify-between rounded-t-xl border-b border-border bg-muted/40 px-3 py-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <GripVertical className="h-3.5 w-3.5" />
                {icon}
                {label}
            </div>
            <div className="flex items-center gap-0.5">
                <button
                    type="button"
                    onClick={onMoveUp}
                    disabled={isFirst}
                    title="Naikkan"
                    className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                >
                    <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                    type="button"
                    onClick={onMoveDown}
                    disabled={isLast}
                    title="Turunkan"
                    className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
                >
                    <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button
                    type="button"
                    onClick={onDelete}
                    title="Hapus blok"
                    className="rounded p-1 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}

// ─── Preview Panel ────────────────────────────────────────────────────────────

function LetterPreview({
    template, surat, settings,
}: {
    template: TemplateData;
    surat: MasterSurat;
    settings: KopSettings;
}) {
    const today     = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const tahun     = new Date().getFullYear();
    const prefix    = surat.nomor_prefix ?? '___';
    const kodeB     = surat.kode_bidang  ?? '___';
    const nomorSurat = `${prefix}/1/${kodeB}-${tahun}`;

    const namaDesa   = settings.kop_nama_desa ?? 'Cirangkong';
    const kadesNama  = settings.kades_nama    ?? '____________________';
    const kadesJabatan = settings.kades_jabatan ?? 'Kepala Desa';
    const kadesNip   = settings.kades_nip ?? '';

    return (
        <div className="mx-auto max-w-[680px] bg-white p-10 text-black shadow-sm" style={{ fontFamily: 'Times New Roman, serif', fontSize: '12pt', lineHeight: 1.5 }}>
            <KopSuratPreview settings={settings} />

            <div className="mt-4 text-center">
                <p className="text-base font-bold uppercase" style={{ textDecoration: 'underline' }}>{template.judul || surat.nama_surat.toUpperCase()}</p>
                <p className="text-sm">Nomor : {nomorSurat}</p>
            </div>

            <div className="mt-4 space-y-3">
                {template.blocks.map(block => (
                    <PreviewBlock key={block.id} block={block} settings={settings} />
                ))}
            </div>

            {/* Footer fallback jika tidak ada signature block */}
            {!template.blocks.some(b => b.type === 'signature') && (
                <div className="mt-8 flex justify-end">
                    <div className="text-center text-sm">
                        <p>{namaDesa}, {today}</p>
                        <p className="font-bold">{kadesJabatan}</p>
                        <div className="my-12" />
                        <p className="border-b border-black pb-0.5 font-bold">{kadesNama}</p>
                        {kadesNip && <p>NIP. {kadesNip}</p>}
                    </div>
                </div>
            )}
        </div>
    );
}

function PreviewBlock({ block, settings = {} }: { block: Block; settings?: KopSettings }) {
    if (block.type === 'paragraph') {
        return <p className="text-justify text-sm">{block.content || <em className="text-gray-400">(paragraf kosong)</em>}</p>;
    }

    if (block.type === 'fields_table') {
        return (
            <table className="w-full text-sm">
                <tbody>
                    {(block.fields ?? []).map(field => (
                        <tr key={field.id}>
                            <td className="w-48 py-0.5 font-medium uppercase">{field.label}</td>
                            <td className="w-4 py-0.5">:</td>
                            <td className="py-0.5">
                                {field.source === 'profile'
                                    ? <ProfileChip fieldKey={field.profile_key ?? ''} />
                                    : <InputChip label={field.label} placeholder={field.placeholder} />
                                }
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }

    if (block.type === 'alasan') {
        return (
            <div className="my-1">
                <p className="mb-1 text-sm font-medium uppercase">{block.content || 'Keperluan / Alasan Permohonan'}</p>
                <span className="inline-flex items-center gap-1 rounded border border-dashed border-amber-400 bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                    <MessageSquare className="h-3 w-3" />
                    [Alasan yang akan diisi oleh warga]
                </span>
            </div>
        );
    }

    if (block.type === 'signature') {
        const today      = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        const namaDesa   = settings.kop_nama_desa  ?? 'Cirangkong';
        const kadesNama  = settings.kades_nama     ?? '____________________';
        const kadesJbtn  = settings.kades_jabatan  ?? 'Kepala Desa';
        const kadesNip   = settings.kades_nip      ?? '';
        return (
            <div className="mt-8 flex justify-end">
                <div className="text-center text-sm">
                    <p>{namaDesa}, {today}</p>
                    <p className="font-bold">{kadesJbtn}</p>
                    <div className="my-10 rounded border border-dashed border-gray-300 px-8 py-4 text-xs text-gray-400">
                        E-Signature Placeholder
                    </div>
                    <p className="border-b border-black pb-0.5 font-bold">{kadesNama}</p>
                    {kadesNip && <p>NIP. {kadesNip}</p>}
                </div>
            </div>
        );
    }

    if (block.type === 'spacer') {
        return <div className="h-4" />;
    }

    return null;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MasterSuratTemplatePage() {
    const { surat, flash, settings } = usePage<PageProps>().props;

    const [showPreview, setShowPreview] = useState(false);
    const [saving, setSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const defaultTemplate: TemplateData = {
        judul: surat.nama_surat.toUpperCase(),
        blocks: [],
    };

    const [template, setTemplate] = useState<TemplateData>(
        surat.template ?? defaultTemplate
    );

    // Auto-save setiap 30 detik jika ada perubahan
    const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isDirtyRef = useRef(false);

    useEffect(() => {
        isDirtyRef.current = true;
        if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
        autoSaveRef.current = setTimeout(() => {
            if (isDirtyRef.current) handleSave(true);
        }, 30_000);
        return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current); };
    }, [template]);

    const handleSave = useCallback((silent = false) => {
        setSaving(true);
        router.put(
            `/admin/master-surat/${surat.id}/template`,
            { template },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSaving(false);
                    setLastSaved(new Date());
                    isDirtyRef.current = false;
                },
                onError: () => setSaving(false),
            }
        );
    }, [template, surat.id]);

    function addBlock(type: BlockType) {
        const newBlock: Block = {
            id: uid(),
            type,
            ...(type === 'paragraph'    ? { content: '' } : {}),
            ...(type === 'fields_table' ? { fields: [] } : {}),
            ...(type === 'alasan'       ? { content: 'Keperluan / Alasan Permohonan' } : {}),
        };
        setTemplate(t => ({ ...t, blocks: [...t.blocks, newBlock] }));
    }

    function updateBlock(id: string, updated: Block) {
        setTemplate(t => ({ ...t, blocks: t.blocks.map(b => b.id === id ? updated : b) }));
    }

    function deleteBlock(id: string) {
        setTemplate(t => ({ ...t, blocks: t.blocks.filter(b => b.id !== id) }));
    }

    function moveBlock(idx: number, dir: -1 | 1) {
        const next = [...template.blocks];
        const swap = idx + dir;
        if (swap < 0 || swap >= next.length) return;
        [next[idx], next[swap]] = [next[swap], next[idx]];
        setTemplate(t => ({ ...t, blocks: next }));
    }

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Master Surat', href: '/admin/master-surat' },
        { title: `Template: ${surat.nama_surat}`, href: '#' },
    ];

    const activeBlockCount = template.blocks.length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Template: ${surat.nama_surat}`} />

            {/* ─── Top Bar ─────────────────────────────────────────────────── */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/95 px-6 py-3 backdrop-blur">
                <div className="flex items-center gap-3">
                    <LayoutList className="h-5 w-5 text-teal-600" />
                    <div>
                        <h1 className="text-sm font-semibold leading-tight">Rancang Template Surat</h1>
                        <p className="text-xs text-muted-foreground">{surat.kode} · {surat.nama_surat}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setShowPreview(v => !v)}
                        className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted"
                    >
                        <Eye className="h-4 w-4" />
                        {showPreview ? 'Tutup Pratinjau' : 'Pratinjau'}
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSave(false)}
                        disabled={saving}
                        className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-1.5 text-sm font-semibold text-white shadow hover:bg-teal-700 disabled:opacity-60"
                    >
                        <Save className="h-4 w-4" />
                        {saving ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </div>

            {/* ─── Flash ───────────────────────────────────────────────────── */}
            {flash?.success && (
                <div className="mx-6 mt-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-sm text-teal-700 dark:border-teal-800 dark:bg-teal-900/20 dark:text-teal-300">
                    {flash.success}
                </div>
            )}

            <div className="flex h-[calc(100vh-112px)]">
                {/* ─── Left Panel: Components ──────────────────────────────── */}
                <aside className="w-56 shrink-0 overflow-y-auto border-r border-border bg-muted/20 p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Komponen
                    </p>
                    <div className="space-y-2">
                        {[
                            { type: 'paragraph' as BlockType,    icon: <AlignLeft className="h-4 w-4" />,       label: 'Paragraf',        sub: 'Teks bebas' },
                            { type: 'fields_table' as BlockType, icon: <TableProperties className="h-4 w-4" />, label: 'Tabel Data',      sub: 'Data warga' },
                            { type: 'alasan' as BlockType,       icon: <MessageSquare className="h-4 w-4" />,   label: 'Alasan/Keperluan', sub: 'Diisi warga' },
                            { type: 'signature' as BlockType,    icon: <FileSignature className="h-4 w-4" />,   label: 'Tanda Tangan',    sub: 'Kepala Desa' },
                            { type: 'spacer' as BlockType,       icon: <Minus className="h-4 w-4" />,           label: 'Spasi',           sub: 'Baris kosong' },
                        ].map(item => (
                            <button
                                key={item.type}
                                type="button"
                                onClick={() => addBlock(item.type)}
                                className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-left transition hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                            >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white shadow-sm">
                                    {item.icon}
                                </span>
                                <div>
                                    <p className="text-xs font-semibold">{item.label}</p>
                                    <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Profile fields reference */}
                    <div className="mt-6">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            Field Profil
                        </p>
                        <div className="space-y-1">
                            {PROFILE_FIELDS.map(f => (
                                <div key={f.key} className="rounded-lg px-2 py-1 hover:bg-muted">
                                    <p className="text-[11px] font-medium">{f.label}</p>
                                    <p className="text-[10px] text-muted-foreground">{f.hint}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* ─── Center: Editor ──────────────────────────────────────── */}
                <main className={`flex-1 overflow-y-auto p-6 ${showPreview ? 'hidden lg:block' : ''}`}>
                    {/* Judul Surat */}
                    <div className="mb-4 rounded-2xl border border-border bg-card p-4">
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            Judul Surat
                        </label>
                        <input
                            type="text"
                            value={template.judul}
                            onChange={e => setTemplate(t => ({ ...t, judul: e.target.value }))}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="SURAT KETERANGAN ..."
                        />
                    </div>

                    {/* Kop preview (readonly — edit di Pengaturan) */}
                    <div className="mb-4 rounded-2xl border border-dashed border-teal-300 bg-teal-50/50 p-4 dark:bg-teal-900/10">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-teal-600">
                                Kop Surat (Global)
                            </p>
                            <a
                                href="/admin/pengaturan"
                                target="_blank"
                                className="flex items-center gap-1 text-[10px] font-semibold text-teal-600 hover:underline"
                            >
                                <Settings2 className="h-3 w-3" /> Edit
                            </a>
                        </div>
                        <KopSuratPreview settings={settings} />
                    </div>

                    {/* Blocks */}
                    <div className="space-y-3">
                        {template.blocks.length === 0 && (
                            <div className="rounded-2xl border border-dashed border-border py-16 text-center">
                                <LayoutList className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
                                <p className="text-sm font-medium text-muted-foreground">Template masih kosong</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Klik komponen di panel kiri untuk mulai menambahkan blok
                                </p>
                            </div>
                        )}

                        {template.blocks.map((block, idx) => {
                            const props = {
                                key: block.id,
                                isFirst: idx === 0,
                                isLast: idx === template.blocks.length - 1,
                                onDelete: () => deleteBlock(block.id),
                                onMoveUp: () => moveBlock(idx, -1),
                                onMoveDown: () => moveBlock(idx, 1),
                            };

                            if (block.type === 'paragraph') {
                                return <ParagraphBlock {...props} block={block} onChange={b => updateBlock(block.id, b)} />;
                            }
                            if (block.type === 'fields_table') {
                                return <FieldsTableBlock {...props} block={block} onChange={b => updateBlock(block.id, b)} />;
                            }
                            if (block.type === 'alasan') {
                                return <AlasanBlock {...props} block={block} onChange={b => updateBlock(block.id, b)} />;
                            }
                            if (block.type === 'signature') {
                                return <SignatureBlock {...props} />;
                            }
                            if (block.type === 'spacer') {
                                return <SpacerBlock {...props} />;
                            }
                            return null;
                        })}
                    </div>
                </main>

                {/* ─── Right: Preview ───────────────────────────────────── */}
                {showPreview && (
                    <aside className="w-full overflow-y-auto border-l border-border bg-gray-100 p-6 lg:w-[560px] dark:bg-gray-900">
                        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Pratinjau Surat</p>
                        <LetterPreview template={template} surat={surat} settings={settings} />
                    </aside>
                )}
            </div>

            {/* ─── Bottom Status Bar ───────────────────────────────────────── */}
            <div className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-between border-t border-border bg-background/95 px-6 py-2 text-xs text-muted-foreground backdrop-blur">
                <div className="flex items-center gap-4">
                    <span>1 Halaman</span>
                    <span>{activeBlockCount} Blok Aktif</span>
                    {template.blocks.some(b => b.type === 'signature') && (
                        <span className="text-teal-600">✓ Tanda Tangan</span>
                    )}
                    {template.blocks.some(b => b.type === 'alasan') && (
                        <span className="text-amber-600">✓ Alasan/Keperluan</span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/admin/master-surat" className="font-medium text-teal-600 hover:underline">
                        ← Kembali ke Master Surat
                    </Link>
                    {lastSaved && (
                        <span>
                            Terakhir disimpan pukul {lastSaved.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </span>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
