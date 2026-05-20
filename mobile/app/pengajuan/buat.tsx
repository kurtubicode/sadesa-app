import { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Alert, Modal, FlatList,
  KeyboardAvoidingView, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getUser, UserData } from "@/lib/userStorage";
import api from "@/lib/api";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "@/constants/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MasterSurat {
  id: number;
  kode: string;
  nama_surat: string;
  persyaratan: string | null;
}

interface DokumenItem {
  uri: string;
  name: string;
  mimeType: string;
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

const CIRCLE_SIZE = 32;

function StepCircle({
  n, current, label,
}: {
  n: 1 | 2 | 3; current: 1 | 2 | 3; label: string;
}) {
  const done   = current > n;
  const active = current === n;
  return (
    <View style={si.stepCol}>
      <View style={[si.circle, active && si.circleActive, done && si.circleDone]}>
        {done ? (
          <Ionicons name="checkmark" size={14} color={COLORS.white} />
        ) : (
          <Text style={[si.num, active && si.numActive]}>{n}</Text>
        )}
      </View>
      <Text style={[si.label, active && si.labelActive, done && si.labelDone]}>
        {label}
      </Text>
    </View>
  );
}

function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  return (
    <View style={si.wrap}>
      <StepCircle n={1} current={current} label="DATA DIRI" />
      <View style={[si.line, current > 1 && si.lineDone]} />
      <StepCircle n={2} current={current} label={"UNGGAH\nDOKUMEN"} />
      <View style={[si.line, current > 2 && si.lineDone]} />
      <StepCircle n={3} current={current} label="KONFIRMASI" />
    </View>
  );
}

const si = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-start",           // align to top; line uses marginTop to center with circle
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  stepCol: { alignItems: "center", gap: SPACING.xs },
  circle: {
    width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 2, borderColor: COLORS.border,
    justifyContent: "center", alignItems: "center",
    backgroundColor: COLORS.white,
  },
  circleActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  circleDone:   { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  num:          { fontSize: FONT.sm, fontWeight: "700", color: COLORS.textMuted },
  numActive:    { color: COLORS.white },
  line: {
    flex: 1, height: 2,
    backgroundColor: COLORS.border,
    marginTop: CIRCLE_SIZE / 2 - 1,   // center line with circle vertically
    marginHorizontal: SPACING.xs,
  },
  lineDone: { backgroundColor: COLORS.primary },
  label: {
    fontSize: 10, fontWeight: "600", color: COLORS.textMuted,
    textAlign: "center", letterSpacing: 0.3, maxWidth: 64,
  },
  labelActive: { color: COLORS.primary, fontWeight: "700" },
  labelDone:   { color: COLORS.primary },
});

// ─── Form Field wrapper ───────────────────────────────────────────────────────

function FormField({ label, children, hint }: {
  label: string; children: React.ReactNode; hint?: string;
}) {
  return (
    <View style={ff.wrap}>
      <Text style={ff.label}>{label}</Text>
      {children}
      {hint ? <Text style={ff.hint}>{hint}</Text> : null}
    </View>
  );
}

const ff = StyleSheet.create({
  wrap:  { marginBottom: SPACING.lg },
  label: { fontSize: FONT.xs, fontWeight: "700", color: COLORS.textSecondary, letterSpacing: 0.8, marginBottom: SPACING.sm },
  hint:  { fontSize: FONT.xs, color: COLORS.textMuted, marginTop: SPACING.xs },
});

// ─── Icon Input ───────────────────────────────────────────────────────────────

function IconInput({
  icon, placeholder, value, onChangeText,
  keyboardType, maxLength, multiline,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText?: (v: string) => void;
  keyboardType?: any;
  maxLength?: number;
  multiline?: boolean;
}) {
  return (
    <View style={[inp.wrap, multiline && inp.wrapMulti]}>
      <Ionicons name={icon} size={18} color={COLORS.textMuted} style={inp.icon} />
      <TextInput
        style={[inp.input, multiline && inp.inputMulti]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textPlaceholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        maxLength={maxLength}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );
}

const inp = StyleSheet.create({
  wrap:       { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.inputBg, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.lg, height: 52 },
  wrapMulti:  { height: undefined, alignItems: "flex-start", paddingVertical: SPACING.md },
  icon:       { marginRight: SPACING.sm },
  input:      { flex: 1, fontSize: FONT.lg, color: COLORS.text },
  inputMulti: { minHeight: 100 },
});

// ─── Dok row ──────────────────────────────────────────────────────────────────

function DokRow({ dok, onRemove }: { dok: DokumenItem; onRemove: () => void }) {
  const isPdf = dok.mimeType?.includes("pdf") || dok.name.toLowerCase().endsWith(".pdf");
  return (
    <View style={dr.row}>
      <View style={dr.icon}>
        <Ionicons name={isPdf ? "document-text-outline" : "image-outline"} size={18} color={COLORS.primary} />
      </View>
      <Text style={dr.name} numberOfLines={1}>{dok.name}</Text>
      <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="close-circle" size={20} color={COLORS.danger} />
      </TouchableOpacity>
    </View>
  );
}

const dr = StyleSheet.create({
  row:  { flexDirection: "row", alignItems: "center", gap: SPACING.md, marginTop: SPACING.md },
  icon: { width: 36, height: 36, borderRadius: RADIUS.md, backgroundColor: COLORS.primaryLight, justifyContent: "center", alignItems: "center" },
  name: { flex: 1, fontSize: FONT.md, color: COLORS.text, fontWeight: "500" },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function BuatPengajuanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep]               = useState<1 | 2 | 3>(1);
  const [loadingInit, setLoadingInit] = useState(true);
  const [submitting, setSubmitting]   = useState(false);

  // Step 1
  const [masterList, setMasterList]     = useState<MasterSurat[]>([]);
  const [selectedSurat, setSelectedSurat] = useState<MasterSurat | null>(null);
  const [showPicker, setShowPicker]     = useState(false);
  const [namaLengkap, setNamaLengkap]   = useState("");
  const [nik, setNik]                   = useState("");
  const [keterangan, setKeterangan]     = useState("");

  // Step 2
  const [dokUtama, setDokUtama]           = useState<DokumenItem | null>(null);
  const [dokPendukung, setDokPendukung]   = useState<DokumenItem[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const [u, msRes] = await Promise.all([getUser(), api.get("/api/master-surat")]);
        if (u) { setNamaLengkap(u.name ?? ""); setNik(u.nik ?? ""); }
        setMasterList(msRes.data.data ?? msRes.data);
      } catch {
        Alert.alert("Error", "Gagal memuat data. Silakan coba lagi.");
      } finally {
        setLoadingInit(false);
      }
    };
    init();
  }, []);

  const validateStep1 = () => {
    if (!selectedSurat)               { Alert.alert("Perhatian", "Pilih jenis surat terlebih dahulu."); return false; }
    if (!namaLengkap.trim())          { Alert.alert("Perhatian", "Nama lengkap tidak boleh kosong."); return false; }
    if (!/^\d{16}$/.test(nik.trim())) { Alert.alert("Perhatian", "NIK harus tepat 16 digit angka."); return false; }
    return true;
  };

  const goNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 3) { handleSubmit(); return; }
    setStep((s) => (s + 1) as 1 | 2 | 3);
  };
  const goBack = () => {
    if (step === 1) { router.back(); return; }
    setStep((s) => (s - 1) as 1 | 2 | 3);
  };

  const pickDokUtama = async () => {
    try {
      const r = await DocumentPicker.getDocumentAsync({ type: ["application/pdf", "image/jpeg", "image/png"], copyToCacheDirectory: true });
      if (!r.canceled) { const f = r.assets[0]; setDokUtama({ uri: f.uri, name: f.name, mimeType: f.mimeType ?? "application/octet-stream" }); }
    } catch { /* silent */ }
  };

  const pickDokPendukung = async () => {
    try {
      const r = await DocumentPicker.getDocumentAsync({ type: ["application/pdf", "image/jpeg", "image/png"], copyToCacheDirectory: true });
      if (!r.canceled) { const f = r.assets[0]; setDokPendukung((prev) => [...prev, { uri: f.uri, name: f.name, mimeType: f.mimeType ?? "application/octet-stream" }]); }
    } catch { /* silent */ }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.post("/api/pengajuan", {
        master_surat_id: selectedSurat!.id,
        data_formulir: { nama_lengkap: namaLengkap.trim(), nik: nik.trim(), keterangan: keterangan.trim() || undefined },
      });
      const newId = res.data.data?.id;
      const uploadDok = async (dok: DokumenItem, jenis: string) => {
        if (!newId) return;
        const fd = new FormData();
        fd.append("file", { uri: dok.uri, name: dok.name, type: dok.mimeType } as any);
        fd.append("jenis_dokumen", jenis);
        await api.post(`/api/pengajuan/${newId}/dokumen`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      };
      if (dokUtama) await uploadDok(dokUtama, "Berkas Persyaratan");
      for (const dok of dokPendukung) await uploadDok(dok, "Dokumen Pendukung");

      const d = res.data.data ?? {};
      router.replace({
        pathname: "/sukses",
        params: {
          type:  "pengajuan",
          id:    String(d.id ?? ""),
          nomor: d.no_pengajuan ?? "",
          jenis: selectedSurat?.nama_surat ?? "",
        },
      } as any);
    } catch (err: any) {
      Alert.alert("Gagal", err?.response?.data?.message ?? "Gagal mengirim pengajuan.");
    } finally { setSubmitting(false); }
  };

  if (loadingInit) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Memuat data…</Text>
      </View>
    );
  }

  const footerPb = Math.max(insets.bottom, SPACING.md);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StepIndicator current={step} />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ═══ STEP 1 ═══ */}
        {step === 1 && (
          <View>
            <FormField label="JENIS SURAT">
              <TouchableOpacity style={styles.dropdown} onPress={() => setShowPicker(true)} activeOpacity={0.8}>
                <Text style={[styles.dropdownText, !selectedSurat && styles.dropdownPlaceholder]}>
                  {selectedSurat ? selectedSurat.nama_surat : "Pilih jenis surat…"}
                </Text>
                <Ionicons name="chevron-down" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </FormField>

            {selectedSurat?.persyaratan ? (
              <View style={styles.persyaratanHint}>
                <Ionicons name="information-circle-outline" size={14} color="#92400E" />
                <Text style={styles.persyaratanText}>Persyaratan: {selectedSurat.persyaratan}</Text>
              </View>
            ) : null}

            <FormField label="NAMA LENGKAP">
              <IconInput icon="person-outline" placeholder="Nama lengkap" value={namaLengkap} onChangeText={setNamaLengkap} />
            </FormField>

            <FormField label="NIK" hint="16 digit Nomor Induk Kependudukan">
              <IconInput icon="card-outline" placeholder="16 digit Nomor Induk Kependudukan" value={nik} onChangeText={setNik} keyboardType="numeric" maxLength={16} />
            </FormField>

            <FormField label="KETERANGAN / KEPERLUAN">
              <IconInput icon="document-outline" placeholder="Jelaskan alasan pengajuan surat…" value={keterangan} onChangeText={setKeterangan} multiline />
            </FormField>
          </View>
        )}

        {/* ═══ STEP 2 ═══ */}
        {step === 2 && (
          <View>
            <Text style={styles.stepHeading}>Lengkapi Berkas</Text>
            <Text style={styles.stepSub}>Silakan unggah dokumen yang diperlukan untuk memproses pengajuan administrasi Anda.</Text>

            <FormField label="UPLOAD BERKAS">
              {dokUtama ? (
                <DokRow dok={dokUtama} onRemove={() => setDokUtama(null)} />
              ) : (
                <TouchableOpacity style={styles.uploadBox} onPress={pickDokUtama} activeOpacity={0.8}>
                  <Ionicons name="cloud-upload-outline" size={36} color={COLORS.primary} />
                  <Text style={styles.uploadTitle}>Pilih File Berkas</Text>
                  <Text style={styles.uploadHint}>FORMAT JPG/PDF, MAKS 2MB</Text>
                </TouchableOpacity>
              )}
            </FormField>

            <FormField label="DOKUMEN PENDUKUNG">
              {dokPendukung.map((dok, idx) => (
                <DokRow key={idx} dok={dok} onRemove={() => setDokPendukung((prev) => prev.filter((_, i) => i !== idx))} />
              ))}
              <TouchableOpacity style={styles.addDokBtn} onPress={pickDokPendukung} activeOpacity={0.8}>
                <View style={styles.addDokIconWrap}>
                  <Ionicons name="add-circle-outline" size={22} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.addDokText}>Tambahkan dokumen Anda</Text>
                  <Text style={styles.addDokHint}>MAKS 2MB PER FILE</Text>
                </View>
                <View style={styles.opsionalBadge}>
                  <Text style={styles.opsionalText}>OPSIONAL</Text>
                </View>
              </TouchableOpacity>
            </FormField>

            <View style={styles.infoBox}>
              <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
              <Text style={styles.infoBoxText}>Pastikan seluruh dokumen terlihat jelas dan tidak terpotong untuk mempercepat proses verifikasi oleh petugas desa.</Text>
            </View>
          </View>
        )}

        {/* ═══ STEP 3 ═══ */}
        {step === 3 && (
          <View>
            <Text style={styles.stepHeading}>Halaman Konfirmasi</Text>
            <Text style={styles.stepSub}>Periksa kembali data pengajuan Anda sebelum dikirimkan.</Text>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardTitle}>Data Pengajuan</Text>
              <SummaryRow label="Jenis Surat"  value={selectedSurat?.nama_surat ?? "-"} />
              <View style={styles.summaryDivider} />
              <SummaryRow label="Nama Lengkap" value={namaLengkap} />
              <View style={styles.summaryDivider} />
              <SummaryRow label="NIK"          value={nik} />
              {keterangan ? (<><View style={styles.summaryDivider} /><SummaryRow label="Keterangan" value={keterangan} multiline /></>) : null}
            </View>

            <View style={[styles.summaryCard, { marginTop: SPACING.md }]}>
              <Text style={styles.summaryCardTitle}>Dokumen</Text>
              {dokUtama ? (
                <View style={styles.summaryRow}>
                  <Ionicons name="document-text-outline" size={16} color={COLORS.primary} />
                  <Text style={[styles.summaryValue, { flex: 1 }]} numberOfLines={1}>{dokUtama.name}</Text>
                  <View style={styles.dokTagBadge}><Text style={styles.dokTagText}>Utama</Text></View>
                </View>
              ) : (
                <Text style={styles.summaryEmpty}>Tidak ada berkas utama.</Text>
              )}
              {dokPendukung.map((d, i) => (
                <View key={i}>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryRow}>
                    <Ionicons name="document-outline" size={16} color={COLORS.textMuted} />
                    <Text style={[styles.summaryValue, { flex: 1 }]} numberOfLines={1}>{d.name}</Text>
                    <View style={[styles.dokTagBadge, { backgroundColor: "#F3F4F6" }]}>
                      <Text style={[styles.dokTagText, { color: COLORS.textSecondary }]}>Pendukung</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.warnBox}>
              <Ionicons name="alert-circle-outline" size={16} color="#92400E" />
              <Text style={styles.warnText}>Setelah dikirim, pengajuan tidak dapat diubah. Pastikan semua data sudah benar.</Text>
            </View>
          </View>
        )}

        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>

      {/* ── Footer ── */}
      <View style={[styles.footer, { paddingBottom: footerPb }]}>
        {step > 1 && (
          <TouchableOpacity style={styles.backBtn} onPress={goBack} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextBtn, submitting && { opacity: 0.7 }]}
          onPress={goNext}
          disabled={submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.nextBtnText}>{step === 3 ? "Kirim Pengajuan" : "Selanjutnya"}</Text>
              {step < 3 && <Ionicons name="arrow-forward" size={18} color={COLORS.white} />}
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Surat Picker Modal ── */}
      <Modal visible={showPicker} animationType="slide" transparent onRequestClose={() => setShowPicker(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowPicker(false)} />
        <View style={[styles.modalSheet, { paddingBottom: footerPb }]}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Pilih Jenis Surat</Text>
          {masterList.length === 0 ? (
            <View style={styles.modalEmpty}>
              <Ionicons name="document-outline" size={36} color="#CCCCCC" />
              <Text style={styles.modalEmptyText}>Belum ada jenis surat.</Text>
            </View>
          ) : (
            <FlatList
              data={masterList}
              keyExtractor={(item) => String(item.id)}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 380 }}
              renderItem={({ item }) => {
                const active = selectedSurat?.id === item.id;
                return (
                  <TouchableOpacity
                    style={[styles.pickerItem, active && styles.pickerItemActive]}
                    onPress={() => { setSelectedSurat(item); setShowPicker(false); }}
                    activeOpacity={0.8}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.pickerTitle, active && { color: COLORS.primary }]}>{item.nama_surat}</Text>
                      <Text style={styles.pickerCode}>{item.kode}</Text>
                    </View>
                    {active && <Ionicons name="checkmark-circle" size={22} color={COLORS.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ─── Summary row helper ───────────────────────────────────────────────────────

function SummaryRow({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <View style={[styles.summaryRow, multiline && { alignItems: "flex-start" }]}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, multiline && { maxWidth: "60%", textAlign: "right" }]}>{value}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: COLORS.background },
  content:     { padding: SPACING.lg },
  center:      { flex: 1, justifyContent: "center", alignItems: "center", gap: SPACING.md },
  loadingText: { color: COLORS.textMuted, fontSize: FONT.base },

  stepHeading: { fontSize: FONT.xxl, fontWeight: "800", color: COLORS.text, marginBottom: SPACING.xs },
  stepSub:     { fontSize: FONT.md, color: COLORS.textSecondary, lineHeight: 20, marginBottom: SPACING.xl },

  dropdown: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: COLORS.inputBg, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg, height: 52,
  },
  dropdownText:        { fontSize: FONT.lg, color: COLORS.text, flex: 1 },
  dropdownPlaceholder: { color: COLORS.textPlaceholder },

  persyaratanHint: {
    flexDirection: "row", gap: SPACING.xs, alignItems: "flex-start",
    backgroundColor: "#FFFBEB", borderRadius: RADIUS.lg, padding: SPACING.md,
    borderLeftWidth: 3, borderLeftColor: COLORS.warning, marginBottom: SPACING.lg,
  },
  persyaratanText: { flex: 1, fontSize: FONT.sm, color: "#78350F", lineHeight: 18 },

  uploadBox: {
    borderWidth: 2, borderColor: COLORS.border, borderStyle: "dashed",
    borderRadius: RADIUS.xl, paddingVertical: SPACING.xxl,
    alignItems: "center", gap: SPACING.sm, backgroundColor: COLORS.white,
  },
  uploadTitle: { fontSize: FONT.xl, fontWeight: "700", color: COLORS.text },
  uploadHint:  { fontSize: FONT.xs, color: COLORS.textMuted, fontWeight: "600", letterSpacing: 0.3 },

  addDokBtn: {
    flexDirection: "row", alignItems: "center", gap: SPACING.md,
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    padding: SPACING.lg, marginTop: SPACING.sm, ...SHADOW.sm,
  },
  addDokIconWrap: { width: 40, height: 40, borderRadius: RADIUS.lg, backgroundColor: COLORS.primaryLight, justifyContent: "center", alignItems: "center" },
  addDokText:     { fontSize: FONT.md, fontWeight: "600", color: COLORS.text },
  addDokHint:     { fontSize: FONT.xs, color: COLORS.textMuted, marginTop: 2, letterSpacing: 0.3 },
  opsionalBadge:  { backgroundColor: "#F3F4F6", paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  opsionalText:   { fontSize: 10, fontWeight: "700", color: COLORS.textMuted },

  infoBox:     { flexDirection: "row", gap: SPACING.sm, alignItems: "flex-start", backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.lg, padding: SPACING.md, marginTop: SPACING.sm },
  infoBoxText: { flex: 1, fontSize: FONT.sm, color: COLORS.primary, lineHeight: 18 },

  summaryCard:      { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SPACING.lg, ...SHADOW.sm },
  summaryCardTitle: { fontSize: FONT.xs, fontWeight: "700", color: COLORS.textMuted, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: SPACING.md },
  summaryRow:       { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: SPACING.md, paddingVertical: SPACING.xs },
  summaryDivider:   { height: 1, backgroundColor: COLORS.divider, marginVertical: SPACING.xs },
  summaryLabel:     { fontSize: FONT.md, color: COLORS.textMuted },
  summaryValue:     { fontSize: FONT.md, fontWeight: "600", color: COLORS.text, textAlign: "right" },
  summaryEmpty:     { fontSize: FONT.md, color: COLORS.textMuted, fontStyle: "italic" },
  dokTagBadge:      { backgroundColor: COLORS.primaryLight, paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: RADIUS.full },
  dokTagText:       { fontSize: 10, fontWeight: "700", color: COLORS.primary },

  warnBox:  { flexDirection: "row", gap: SPACING.sm, alignItems: "flex-start", backgroundColor: "#FFFBEB", borderRadius: RADIUS.lg, padding: SPACING.md, marginTop: SPACING.lg, borderLeftWidth: 3, borderLeftColor: COLORS.warning },
  warnText: { flex: 1, fontSize: FONT.sm, color: "#78350F", lineHeight: 18 },

  footer: {
    flexDirection: "row", gap: SPACING.md,
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1, borderTopColor: COLORS.divider,
  },
  backBtn: { width: 52, height: 54, borderRadius: RADIUS.full, borderWidth: 1.5, borderColor: COLORS.primary, justifyContent: "center", alignItems: "center" },
  nextBtn: { flex: 1, height: 54, borderRadius: RADIUS.full, backgroundColor: COLORS.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SPACING.sm, ...SHADOW.md },
  nextBtnText: { color: COLORS.white, fontSize: FONT.xl, fontWeight: "700" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  modalSheet:   { backgroundColor: COLORS.white, borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl, paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  modalHandle:  { width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border, alignSelf: "center", marginBottom: SPACING.lg },
  modalTitle:   { fontSize: FONT.xxl, fontWeight: "800", color: COLORS.text, marginBottom: SPACING.md },
  modalEmpty:   { alignItems: "center", paddingVertical: SPACING.xxxl, gap: SPACING.md },
  modalEmptyText: { fontSize: FONT.base, color: COLORS.textMuted },
  pickerItem:       { flexDirection: "row", alignItems: "center", paddingVertical: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.divider, gap: SPACING.md },
  pickerItemActive: { backgroundColor: COLORS.primaryLight + "60" },
  pickerTitle:      { fontSize: FONT.xl, fontWeight: "600", color: COLORS.text, marginBottom: 2 },
  pickerCode:       { fontSize: FONT.sm, color: COLORS.textMuted },
});
