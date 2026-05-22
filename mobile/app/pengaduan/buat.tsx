import { useState, useCallback, useEffect } from "react";
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Image, Modal,
  FlatList, KeyboardAvoidingView, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import api from "@/lib/api";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "@/constants/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

interface KategoriAduan {
  id: number;
  nama_kategori: string;
  deskripsi?: string;
}

interface BuktiItem {
  uri: string;
  name: string;
  type: string;
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

const CIRCLE = 28;

function StepCircle({ n, current, label }: { n: number; current: number; label: string }) {
  const done   = current > n;
  const active = current === n;
  return (
    <View style={si.col}>
      <View style={[si.circle, active && si.circleActive, done && si.circleDone]}>
        {done
          ? <Ionicons name="checkmark" size={14} color={COLORS.white} />
          : <Text style={[si.num, active && si.numActive]}>{n}</Text>
        }
      </View>
      <Text style={[si.label, active && si.labelActive, done && si.labelDone]} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

function StepIndicator({ current }: { current: number }) {
  return (
    <View style={si.wrap}>
      <StepCircle n={1} current={current} label={"LAPORAN"} />
      <View style={[si.line, current > 1 && si.lineDone]} />
      <StepCircle n={2} current={current} label={"KONFIRMASI"} />
    </View>
  );
}

const si = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: SPACING.xxxl,
    paddingVertical: SPACING.lg,
  },
  col:  { alignItems: "center", width: 64 },
  circle: {
    width: CIRCLE, height: CIRCLE, borderRadius: CIRCLE / 2,
    backgroundColor: COLORS.white,
    borderWidth: 2, borderColor: COLORS.border,
    justifyContent: "center", alignItems: "center",
  },
  circleActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryLight },
  circleDone:   { borderColor: COLORS.primary, backgroundColor: COLORS.primary },
  num:          { fontSize: FONT.sm, fontWeight: "700", color: COLORS.textMuted },
  numActive:    { color: COLORS.primary },
  label: {
    fontSize: FONT.xs, fontWeight: "600", color: COLORS.textMuted,
    marginTop: SPACING.xs, textAlign: "center", letterSpacing: 0.3,
  },
  labelActive: { color: COLORS.primary },
  labelDone:   { color: COLORS.success },
  line: {
    flex: 1, height: 2,
    backgroundColor: COLORS.border,
    marginTop: CIRCLE / 2 - 1,
    marginHorizontal: SPACING.xs,
  },
  lineDone: { backgroundColor: COLORS.primary },
});

// ─── Step 1 — Form ────────────────────────────────────────────────────────────

interface Step1Props {
  selectedKat: KategoriAduan | null;
  judul: string;
  deskripsi: string;
  lokasi: string;
  buktiList: BuktiItem[];
  maxBukti: number;
  onJudulChange: (v: string) => void;
  onDeskripsiChange: (v: string) => void;
  onLokasiChange: (v: string) => void;
  onOpenKatModal: () => void;
  onTambahBukti: () => void;
  onHapusBukti: (i: number) => void;
}

function Step1Form({
  selectedKat, judul, deskripsi, lokasi, buktiList, maxBukti,
  onJudulChange, onDeskripsiChange, onLokasiChange,
  onOpenKatModal, onTambahBukti, onHapusBukti,
}: Step1Props) {
  return (
    <View style={styles.stepWrap}>
      <Text style={styles.stepTitle}>Detail Laporan</Text>
      <Text style={styles.stepSub}>Isi informasi kejadian dengan lengkap dan jelas.</Text>

      {/* KATEGORI */}
      <Text style={styles.fieldLabel}>
        Kategori Laporan <Text style={styles.req}>*</Text>
      </Text>
      <TouchableOpacity
        style={[styles.dropdownBtn, !selectedKat && styles.dropdownBtnEmpty]}
        onPress={onOpenKatModal}
        activeOpacity={0.8}
      >
        <Ionicons
          name="pricetag-outline"
          size={18}
          color={selectedKat ? COLORS.primary : COLORS.textMuted}
        />
        <Text style={[styles.dropdownText, !selectedKat && styles.dropdownPlaceholder]}>
          {selectedKat ? selectedKat.nama_kategori : "Pilih kategori laporan…"}
        </Text>
        <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
      </TouchableOpacity>

      {/* JUDUL */}
      <Text style={[styles.fieldLabel, { marginTop: SPACING.xl }]}>
        Judul Laporan <Text style={styles.req}>*</Text>
      </Text>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          placeholder="Contoh: Jalan rusak di Gang Mawar RT 02"
          placeholderTextColor={COLORS.textPlaceholder}
          value={judul}
          onChangeText={onJudulChange}
          maxLength={120}
        />
      </View>

      {/* DESKRIPSI */}
      <Text style={[styles.fieldLabel, { marginTop: SPACING.lg }]}>
        Deskripsi Kejadian <Text style={styles.req}>*</Text>
      </Text>
      <View style={styles.inputWrap}>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder={"Jelaskan secara rinci:\n• Waktu dan tempat kejadian\n• Kronologi masalah\n• Dampak yang dirasakan"}
          placeholderTextColor={COLORS.textPlaceholder}
          multiline
          numberOfLines={6}
          value={deskripsi}
          onChangeText={onDeskripsiChange}
          maxLength={2000}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{deskripsi.length}/2000</Text>
      </View>

      {/* UPLOAD BUKTI */}
      <Text style={[styles.fieldLabel, { marginTop: SPACING.lg }]}>
        Bukti Foto{" "}
        <Text style={styles.optional}>(opsional, maks. {maxBukti})</Text>
      </Text>

      {buktiList.length > 0 && (
        <View style={styles.buktiGrid}>
          {buktiList.map((b, i) => (
            <View key={i} style={styles.buktiItem}>
              <Image source={{ uri: b.uri }} style={styles.buktiThumb} resizeMode="cover" />
              <TouchableOpacity
                style={styles.buktiDelete}
                onPress={() => onHapusBukti(i)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons name="close" size={11} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {buktiList.length < maxBukti && (
        <TouchableOpacity style={styles.uploadBox} onPress={onTambahBukti} activeOpacity={0.75}>
          <View style={styles.uploadIconWrap}>
            <Ionicons name="camera-outline" size={26} color={COLORS.primary} />
          </View>
          <Text style={styles.uploadTitle}>
            {buktiList.length === 0 ? "Tambah Foto Bukti" : `Tambah Lagi (${buktiList.length}/${maxBukti})`}
          </Text>
          <Text style={styles.uploadSub}>Kamera atau galeri • JPG/PNG</Text>
        </TouchableOpacity>
      )}

      {/* LOKASI */}
      <Text style={[styles.fieldLabel, { marginTop: SPACING.xl }]}>
        Lokasi Kejadian{" "}
        <Text style={styles.optional}>(opsional)</Text>
      </Text>
      <View style={styles.inputWrap}>
        <View style={styles.inputRow}>
          <Ionicons name="location-outline" size={18} color={COLORS.textMuted} style={{ marginRight: SPACING.sm }} />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Contoh: RT 03 RW 01, Gang Melati No. 12"
            placeholderTextColor={COLORS.textPlaceholder}
            value={lokasi}
            onChangeText={onLokasiChange}
            maxLength={200}
          />
        </View>
      </View>

      {/* Map placeholder */}
      <View style={styles.mapPlaceholder}>
        <Ionicons name="map-outline" size={32} color={COLORS.textMuted} />
        <Text style={styles.mapText}>Pilih titik lokasi di peta</Text>
        <Text style={styles.mapSub}>Fitur peta interaktif segera hadir</Text>
      </View>

      {/* Info */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
        <Text style={styles.infoText}>
          Laporan diproses dalam 1–3 hari kerja. Sertakan foto dan deskripsi yang jelas
          agar petugas dapat segera menindaklanjuti.
        </Text>
      </View>
    </View>
  );
}

// ─── Step 2 — Konfirmasi ──────────────────────────────────────────────────────

interface Step2Props {
  selectedKat: KategoriAduan | null;
  judul: string;
  deskripsi: string;
  lokasi: string;
  buktiList: BuktiItem[];
}

function Step2Konfirmasi({ selectedKat, judul, deskripsi, lokasi, buktiList }: Step2Props) {
  return (
    <View style={styles.stepWrap}>
      <Text style={styles.stepTitle}>Konfirmasi Laporan</Text>
      <Text style={styles.stepSub}>
        Periksa kembali data Anda sebelum mengirim laporan.
      </Text>

      {/* Summary card */}
      <View style={styles.summaryCard}>
        {/* Kategori */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryIcon, { backgroundColor: "#EDE9FE" }]}>
            <Ionicons name="pricetag-outline" size={16} color="#7C3AED" />
          </View>
          <View style={styles.summaryBody}>
            <Text style={styles.summaryKey}>Kategori Laporan</Text>
            <Text style={styles.summaryVal}>{selectedKat?.nama_kategori}</Text>
          </View>
        </View>
        <View style={styles.summaryDivider} />

        {/* Judul */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryIcon, { backgroundColor: COLORS.primaryLight }]}>
            <Ionicons name="document-text-outline" size={16} color={COLORS.primary} />
          </View>
          <View style={styles.summaryBody}>
            <Text style={styles.summaryKey}>Judul Laporan</Text>
            <Text style={styles.summaryVal}>{judul}</Text>
          </View>
        </View>
        <View style={styles.summaryDivider} />

        {/* Deskripsi */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryIcon, { backgroundColor: COLORS.infoLight }]}>
            <Ionicons name="chatbubble-outline" size={16} color={COLORS.info} />
          </View>
          <View style={styles.summaryBody}>
            <Text style={styles.summaryKey}>Deskripsi Kejadian</Text>
            <Text style={styles.summaryVal} numberOfLines={4}>{deskripsi}</Text>
          </View>
        </View>

        {/* Bukti */}
        {buktiList.length > 0 && (
          <>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <View style={[styles.summaryIcon, { backgroundColor: COLORS.successLight }]}>
                <Ionicons name="images-outline" size={16} color={COLORS.success} />
              </View>
              <View style={styles.summaryBody}>
                <Text style={styles.summaryKey}>Bukti Foto</Text>
                <View style={styles.buktiPreviewRow}>
                  {buktiList.map((b, i) => (
                    <Image key={i} source={{ uri: b.uri }} style={styles.buktiPreviewThumb} resizeMode="cover" />
                  ))}
                </View>
              </View>
            </View>
          </>
        )}

        {/* Lokasi */}
        {lokasi.trim() !== "" && (
          <>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <View style={[styles.summaryIcon, { backgroundColor: COLORS.warningLight }]}>
                <Ionicons name="location-outline" size={16} color={COLORS.warning} />
              </View>
              <View style={styles.summaryBody}>
                <Text style={styles.summaryKey}>Lokasi Kejadian</Text>
                <Text style={styles.summaryVal}>{lokasi}</Text>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Warning */}
      <View style={styles.warningBox}>
        <Ionicons name="warning-outline" size={18} color="#B45309" />
        <Text style={styles.warningText}>
          Pastikan laporan yang Anda kirim sesuai fakta. Laporan palsu atau tidak bertanggung jawab
          dapat dikenakan sanksi sesuai aturan desa yang berlaku.
        </Text>
      </View>

      <Text style={styles.backHint}>
        Tekan <Text style={{ fontWeight: "700", color: COLORS.primary }}>←</Text> untuk mengubah data.
      </Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

const MAX_BUKTI = 5;

export default function BuatPengaduanScreen() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
  const footerPb = Math.max(insets.bottom, SPACING.md);

  const [kategoriList, setKategoriList] = useState<KategoriAduan[]>([]);
  const [loadingInit, setLoadingInit]   = useState(true);
  const [submitting, setSubmitting]     = useState(false);
  const [step, setStep]                 = useState<1 | 2>(1);

  // Form fields
  const [selectedKat, setSelectedKat] = useState<KategoriAduan | null>(null);
  const [judul, setJudul]             = useState("");
  const [deskripsi, setDeskripsi]     = useState("");
  const [buktiList, setBuktiList]     = useState<BuktiItem[]>([]);
  const [lokasi, setLokasi]           = useState("");

  // Modal
  const [katModal, setKatModal] = useState(false);

  useEffect(() => {
    api.get("/api/kategori-aduan")
      .then((r) => setKategoriList(r.data.data ?? r.data))
      .catch(() => Alert.alert("Error", "Gagal memuat kategori aduan."))
      .finally(() => setLoadingInit(false));
  }, []);

  // ── Callbacks — stable references ─────────────────────────────────────────
  const handleJudulChange     = useCallback((v: string) => setJudul(v), []);
  const handleDeskripsiChange = useCallback((v: string) => setDeskripsi(v), []);
  const handleLokasiChange    = useCallback((v: string) => setLokasi(v), []);
  const handleOpenKatModal    = useCallback(() => setKatModal(true), []);
  const handleHapusBukti      = useCallback((i: number) => setBuktiList((prev) => prev.filter((_, idx) => idx !== i)), []);

  // ── Upload bukti ──────────────────────────────────────────────────────────
  const addBukti = useCallback((asset: ImagePicker.ImagePickerAsset) => {
    const ext  = asset.uri.split(".").pop() ?? "jpg";
    const mime = asset.mimeType ?? `image/${ext}`;
    setBuktiList((prev) =>
      [...prev, { uri: asset.uri, name: `bukti_${Date.now()}.${ext}`, type: mime }].slice(0, MAX_BUKTI),
    );
  }, []);

  const handleTambahBukti = useCallback(() => {
    if (buktiList.length >= MAX_BUKTI) {
      Alert.alert("Batas Foto", `Maksimal ${MAX_BUKTI} foto/gambar bukti.`);
      return;
    }
    Alert.alert("Tambah Bukti", "Pilih sumber", [
      {
        text: "Kamera",
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) { Alert.alert("Izin", "Izin kamera diperlukan."); return; }
          const res = await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.75 });
          if (!res.canceled && res.assets[0]) addBukti(res.assets[0]);
        },
      },
      {
        text: "Galeri",
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) { Alert.alert("Izin", "Izin galeri diperlukan."); return; }
          const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"], quality: 0.75,
            allowsMultipleSelection: true,
            selectionLimit: MAX_BUKTI - buktiList.length,
          });
          if (!res.canceled) res.assets.forEach(addBukti);
        },
      },
      { text: "Batal", style: "cancel" },
    ]);
  }, [buktiList.length, addBukti]);

  // ── Validasi & step navigation ────────────────────────────────────────────
  const goNext = () => {
    if (!selectedKat)      return Alert.alert("Perhatian", "Pilih kategori laporan terlebih dahulu.");
    if (!judul.trim())     return Alert.alert("Perhatian", "Judul laporan tidak boleh kosong.");
    if (!deskripsi.trim()) return Alert.alert("Perhatian", "Deskripsi kejadian tidak boleh kosong.");
    setStep(2);
  };

  const goBack = () => {
    if (step === 2) { setStep(1); return; }
    router.back();
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const fd = new FormData();
    fd.append("kategori_aduan_id", String(selectedKat!.id));
    fd.append("judul",     judul.trim());
    fd.append("deskripsi", deskripsi.trim());
    if (lokasi.trim()) fd.append("lokasi", lokasi.trim());
    buktiList.forEach((b) =>
      fd.append("bukti[]", { uri: b.uri, name: b.name, type: b.type } as any),
    );

    setSubmitting(true);
    try {
      const res = await api.post("/api/pengaduan", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const d = res.data.data ?? {};
      router.replace({
        pathname: "/sukses",
        params: {
          type:  "pengaduan",
          id:    String(d.id ?? ""),
          nomor: d.id ? `#${String(d.id).padStart(4, "0")}` : "",
          jenis: judul.trim(),
        },
      } as any);
    } catch (err: any) {
      Alert.alert("Gagal", err?.response?.data?.message ?? "Gagal mengirim pengaduan. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────

  if (loadingInit) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior="padding"
    >
      {/* ── Step Indicator ── */}
      <View style={styles.indicatorWrap}>
        <StepIndicator current={step} />
      </View>

      {/* ── Scroll Content ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 80 + footerPb }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 1 ? (
          <Step1Form
            selectedKat={selectedKat}
            judul={judul}
            deskripsi={deskripsi}
            lokasi={lokasi}
            buktiList={buktiList}
            maxBukti={MAX_BUKTI}
            onJudulChange={handleJudulChange}
            onDeskripsiChange={handleDeskripsiChange}
            onLokasiChange={handleLokasiChange}
            onOpenKatModal={handleOpenKatModal}
            onTambahBukti={handleTambahBukti}
            onHapusBukti={handleHapusBukti}
          />
        ) : (
          <Step2Konfirmasi
            selectedKat={selectedKat}
            judul={judul}
            deskripsi={deskripsi}
            lokasi={lokasi}
            buktiList={buktiList}
          />
        )}
      </ScrollView>

      {/* ── Footer ── */}
      <View style={[styles.footer, { paddingBottom: footerPb }]}>
        <TouchableOpacity style={styles.backBtn} onPress={goBack} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        {step === 1 ? (
          <TouchableOpacity style={styles.nextBtn} onPress={goNext} activeOpacity={0.85}>
            <Text style={styles.nextBtnText}>Lanjut</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextBtn, styles.submitBtnColor, submitting && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <Ionicons name="megaphone-outline" size={18} color={COLORS.white} />
                <Text style={styles.nextBtnText}>Kirim Laporan</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* ── Kategori Modal ── */}
      <Modal visible={katModal} transparent animationType="slide" onRequestClose={() => setKatModal(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setKatModal(false)} />
        <View style={[styles.modalSheet, { paddingBottom: footerPb }]}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Pilih Kategori Laporan</Text>
          <FlatList
            data={kategoriList}
            keyExtractor={(item) => String(item.id)}
            ItemSeparatorComponent={() => <View style={styles.modalDivider} />}
            renderItem={({ item }) => {
              const active = selectedKat?.id === item.id;
              return (
                <TouchableOpacity
                  style={[styles.modalItem, active && styles.modalItemActive]}
                  onPress={() => { setSelectedKat(item); setKatModal(false); }}
                  activeOpacity={0.75}
                >
                  <View style={styles.modalItemLeft}>
                    <View style={[styles.modalDot, active && styles.modalDotActive]} />
                    <View>
                      <Text style={[styles.modalItemTitle, active && styles.modalItemTitleActive]}>
                        {item.nama_kategori}
                      </Text>
                      {item.deskripsi ? (
                        <Text style={styles.modalItemSub} numberOfLines={2}>{item.deskripsi}</Text>
                      ) : null}
                    </View>
                  </View>
                  {active && <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Indicator
  indicatorWrap: { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.divider },

  // Scroll
  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: SPACING.lg },

  // Steps common
  stepWrap: { padding: SPACING.lg },
  stepTitle:{ fontSize: FONT.xxl, fontWeight: "800", color: COLORS.text, marginBottom: SPACING.xs },
  stepSub:  { fontSize: FONT.md, color: COLORS.textSecondary, lineHeight: 20, marginBottom: SPACING.xl },

  // Labels
  fieldLabel: {
    fontSize: FONT.sm, fontWeight: "700", color: COLORS.textSecondary,
    letterSpacing: 0.5, marginBottom: SPACING.sm,
    textTransform: "uppercase",
  },
  req:      { color: COLORS.danger },
  optional: { fontWeight: "400", color: COLORS.textMuted, textTransform: "none" },

  // Dropdown
  dropdownBtn: {
    flexDirection: "row", alignItems: "center", gap: SPACING.sm,
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md + 2,
    borderWidth: 1.5, borderColor: COLORS.border,
    ...SHADOW.sm,
  },
  dropdownBtnEmpty:    { borderColor: COLORS.border },
  dropdownText:        { flex: 1, fontSize: FONT.md, fontWeight: "600", color: COLORS.text },
  dropdownPlaceholder: { color: COLORS.textPlaceholder, fontWeight: "400" },

  // Input
  inputWrap: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.xs, paddingBottom: 2,
    ...SHADOW.sm,
  },
  input:     { fontSize: FONT.md, color: COLORS.text, paddingVertical: SPACING.sm },
  textarea:  { minHeight: 130 },
  inputRow:  { flexDirection: "row", alignItems: "center" },
  charCount: { textAlign: "right", fontSize: FONT.xs, color: COLORS.textMuted, paddingBottom: SPACING.xs },

  // Bukti grid
  buktiGrid: {
    flexDirection: "row", flexWrap: "wrap",
    gap: SPACING.sm, marginBottom: SPACING.sm,
  },
  buktiItem: { position: "relative" },
  buktiThumb: {
    width: 76, height: 76, borderRadius: RADIUS.md,
    backgroundColor: COLORS.border,
  },
  buktiDelete: {
    position: "absolute", top: -5, right: -5,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: COLORS.danger,
    justifyContent: "center", alignItems: "center", zIndex: 10,
  },

  // Upload dashed box
  uploadBox: {
    borderWidth: 2, borderColor: COLORS.primary, borderStyle: "dashed",
    borderRadius: RADIUS.lg, padding: SPACING.xl,
    alignItems: "center", gap: SPACING.sm,
    backgroundColor: COLORS.primaryLight,
  },
  uploadIconWrap: {
    width: 52, height: 52, borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    justifyContent: "center", alignItems: "center",
    ...SHADOW.sm,
  },
  uploadTitle: { fontSize: FONT.xl, fontWeight: "700", color: COLORS.primary },
  uploadSub:   { fontSize: FONT.sm, color: COLORS.textMuted },

  // Map placeholder
  mapPlaceholder: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: COLORS.border, borderStyle: "dashed",
    height: 130, marginTop: SPACING.sm,
    justifyContent: "center", alignItems: "center", gap: SPACING.xs,
  },
  mapText: { fontSize: FONT.md, fontWeight: "600", color: COLORS.textSecondary },
  mapSub:  { fontSize: FONT.sm, color: COLORS.textMuted },

  // Info box
  infoBox: {
    flexDirection: "row", gap: SPACING.sm, alignItems: "flex-start",
    backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginTop: SPACING.xl,
  },
  infoText: { flex: 1, fontSize: FONT.sm, color: COLORS.primary, lineHeight: 18 },

  // Summary card
  summaryCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    padding: SPACING.lg, ...SHADOW.sm, marginBottom: SPACING.lg,
  },
  summaryRow: {
    flexDirection: "row", gap: SPACING.md, paddingVertical: SPACING.md,
  },
  summaryIcon: {
    width: 36, height: 36, borderRadius: RADIUS.md,
    justifyContent: "center", alignItems: "center", flexShrink: 0,
  },
  summaryBody:    { flex: 1 },
  summaryKey:     { fontSize: FONT.xs, fontWeight: "700", color: COLORS.textMuted, letterSpacing: 0.4, marginBottom: 3, textTransform: "uppercase" },
  summaryVal:     { fontSize: FONT.md, color: COLORS.text, lineHeight: 20 },
  summaryDivider: { height: 1, backgroundColor: COLORS.divider, marginLeft: 36 + SPACING.md },

  // Bukti preview in konfirmasi
  buktiPreviewRow:  { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm, marginTop: SPACING.xs },
  buktiPreviewThumb:{ width: 60, height: 60, borderRadius: RADIUS.sm, backgroundColor: COLORS.border },

  // Warning box
  warningBox: {
    flexDirection: "row", gap: SPACING.sm, alignItems: "flex-start",
    backgroundColor: "#FFFBEB", borderRadius: RADIUS.lg,
    borderWidth: 1, borderColor: "#FDE68A",
    padding: SPACING.md,
  },
  warningText: { flex: 1, fontSize: FONT.sm, color: "#92400E", lineHeight: 18 },

  backHint: {
    fontSize: FONT.sm, color: COLORS.textMuted, textAlign: "center",
    marginTop: SPACING.lg,
  },

  // Footer
  footer: {
    flexDirection: "row", alignItems: "center", gap: SPACING.md,
    backgroundColor: COLORS.white,
    paddingTop: SPACING.md, paddingHorizontal: SPACING.lg,
    borderTopWidth: 1, borderTopColor: COLORS.divider,
    ...SHADOW.sm,
  },
  backBtn: {
    width: 48, height: 48, borderRadius: RADIUS.full,
    borderWidth: 1.5, borderColor: COLORS.primary,
    justifyContent: "center", alignItems: "center",
  },
  nextBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: SPACING.sm, backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full, height: 48, ...SHADOW.md,
  },
  nextBtnText:   { color: COLORS.white, fontSize: FONT.xl, fontWeight: "700" },
  submitBtnColor:{ backgroundColor: "#E07B39" },
  btnDisabled:   { backgroundColor: COLORS.border, elevation: 0, shadowOpacity: 0 },

  // Modal (kategori picker)
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  modalSheet: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xxl, borderTopRightRadius: RADIUS.xxl,
    maxHeight: "70%",
    paddingTop: SPACING.md,
    ...SHADOW.lg,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: COLORS.border,
    alignSelf: "center", marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: FONT.xl, fontWeight: "800", color: COLORS.text,
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md,
  },
  modalDivider: { height: 1, backgroundColor: COLORS.divider, marginLeft: SPACING.lg },
  modalItem: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  modalItemActive:      { backgroundColor: COLORS.primaryLight },
  modalItemLeft:        { flexDirection: "row", alignItems: "flex-start", gap: SPACING.md, flex: 1 },
  modalDot:             { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.border, marginTop: 4, flexShrink: 0 },
  modalDotActive:       { backgroundColor: COLORS.primary },
  modalItemTitle:       { fontSize: FONT.md, fontWeight: "600", color: COLORS.text },
  modalItemTitleActive: { color: COLORS.primary },
  modalItemSub:         { fontSize: FONT.sm, color: COLORS.textMuted, lineHeight: 17, marginTop: 2, flexShrink: 1 },
});
