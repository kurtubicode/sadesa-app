/**
 * Layar Verifikasi Identitas
 * Warga dengan status "menunggu_verifikasi" diarahkan ke sini setelah login.
 * Mereka harus upload foto KTP (wajib) dan foto KK (opsional).
 */

import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "@/lib/api";
import { getUser, saveSession, getToken, clearSession, UserData } from "@/lib/userStorage";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "@/constants/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VerifikasiStatus {
  user_status: string;
  dokumen: {
    id: number;
    status: "menunggu" | "disetujui" | "ditolak";
    catatan: string | null;
    submitted_at: string;
    reviewed_at: string | null;
  } | null;
}

// ─── Photo Picker Card ────────────────────────────────────────────────────────

function PhotoCard({
  label,
  sublabel,
  uri,
  required,
  onPick,
  onRemove,
}: {
  label: string;
  sublabel: string;
  uri: string | null;
  required?: boolean;
  onPick: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.photoCard}>
      <View style={styles.photoCardHeader}>
        <View>
          <Text style={styles.photoLabel}>
            {label}
            {required && <Text style={styles.requiredStar}> *</Text>}
          </Text>
          <Text style={styles.photoSub}>{sublabel}</Text>
        </View>
        {uri && (
          <TouchableOpacity onPress={onRemove} style={styles.removeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={16} color={COLORS.danger} />
          </TouchableOpacity>
        )}
      </View>

      {uri ? (
        <TouchableOpacity onPress={onPick} activeOpacity={0.9}>
          <Image source={{ uri }} style={styles.photoPreview} resizeMode="cover" />
          <View style={styles.photoChangeOverlay}>
            <Ionicons name="camera" size={18} color={COLORS.white} />
            <Text style={styles.photoChangeText}>Ganti Foto</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.photoPlaceholder} onPress={onPick} activeOpacity={0.7}>
          <Ionicons name="camera-outline" size={32} color={COLORS.textMuted} />
          <Text style={styles.photoPlaceholderText}>Ambil Foto / Pilih dari Galeri</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function VerifikasiScreen() {
  const insets = useSafeAreaInsets();
  const footerPb = Math.max(insets.bottom, SPACING.md);

  const [user, setUser]             = useState<UserData | null>(null);
  const [statusData, setStatusData] = useState<VerifikasiStatus | null>(null);
  const [loading, setLoading]       = useState(true);
  const [checking, setChecking]     = useState(false);
  const [photoKtp, setPhotoKtp]     = useState<string | null>(null);
  const [photoKk, setPhotoKk]       = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  useFocusEffect(useCallback(() => {
    (async () => {
      try {
        const u = await getUser();
        setUser(u);
        const res = await api.get("/api/verifikasi-status");
        setStatusData(res.data.data);

        // Jika sudah aktif, langsung ke home
        if (res.data.data?.user_status === "aktif") {
          router.replace("/home");
        }
        // Jika dokumen sudah disetujui tapi user_status belum update di storage,
        // refresh storage dan redirect
        if (res.data.data?.dokumen?.status === "disetujui") {
          const meRes = await api.get("/api/user");
          const token = await getToken();
          if (token) await saveSession(token, meRes.data.user);
          router.replace("/home");
        }
      } catch {
        // jaringan error — tetap tampilkan UI
      } finally {
        setLoading(false);
      }
    })();
  }, []));

  // ─── Pick photo ───────────────────────────────────────────────────────────

  const pickPhoto = async (setter: (uri: string | null) => void) => {
    Alert.alert("Pilih Foto", "Ambil dari kamera atau pilih dari galeri?", [
      {
        text: "Kamera",
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) {
            Alert.alert("Izin Ditolak", "Berikan akses kamera untuk mengambil foto.");
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            quality: 0.75,
            allowsEditing: true,
            aspect: [3, 2],
          });
          if (!result.canceled) setter(result.assets[0].uri);
        },
      },
      {
        text: "Galeri",
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) {
            Alert.alert("Izin Ditolak", "Berikan akses galeri untuk memilih foto.");
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.75,
            allowsEditing: true,
            aspect: [3, 2],
          });
          if (!result.canceled) setter(result.assets[0].uri);
        },
      },
      { text: "Batal", style: "cancel" },
    ]);
  };

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!photoKtp) {
      Alert.alert("Foto KTP Wajib", "Mohon upload foto KTP Anda untuk verifikasi.");
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();

      const ext = (uri: string) => uri.split(".").pop()?.toLowerCase() ?? "jpg";
      const mime = (e: string) => (e === "png" ? "image/png" : "image/jpeg");

      const ktpExt = ext(photoKtp);
      form.append("foto_ktp", {
        uri: Platform.OS === "ios" ? photoKtp.replace("file://", "") : photoKtp,
        name: `ktp.${ktpExt}`,
        type: mime(ktpExt),
      } as any);

      if (photoKk) {
        const kkExt = ext(photoKk);
        form.append("foto_kk", {
          uri: Platform.OS === "ios" ? photoKk.replace("file://", "") : photoKk,
          name: `kk.${kkExt}`,
          type: mime(kkExt),
        } as any);
      }

      await api.post("/api/verifikasi-dokumen", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSubmitted(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Gagal mengunggah dokumen. Coba lagi.";
      Alert.alert("Gagal", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckStatus = async () => {
    setChecking(true);
    try {
      const res = await api.get("/api/verifikasi-status");
      const d = res.data.data;
      setStatusData(d);
      if (d?.user_status === "aktif" || d?.dokumen?.status === "disetujui") {
        // Refresh user di storage lalu ke home
        const token = await getToken();
        const meRes = await api.get("/api/user");
        if (token) await saveSession(token, meRes.data.user);
        router.replace("/home");
      } else if (d?.dokumen?.status === "ditolak") {
        // Akan otomatis tampil form upload ulang karena showDitolak = true
        setSubmitted(false);
      } else {
        Alert.alert("Masih Menunggu", "Dokumen Anda masih dalam proses tinjauan Admin. Coba lagi nanti.");
      }
    } catch {
      Alert.alert("Gagal", "Tidak bisa terhubung ke server. Periksa koneksi internet Anda.");
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Keluar", "Yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Keluar",
        style: "destructive",
        onPress: async () => {
          try { await api.post("/api/logout"); } catch { /* silent */ }
          await clearSession();
          router.replace("/");
        },
      },
    ]);
  };

  // ─── Loading ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // ─── Sudah disubmit / menunggu tinjauan admin ─────────────────────────────

  const dokumen = statusData?.dokumen;
  const showWaiting = submitted || (dokumen && dokumen.status === "menunggu");
  const showDitolak = !submitted && dokumen?.status === "ditolak";

  if (showWaiting && !showDitolak) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + SPACING.xl }]}>
        <View style={styles.waitingCard}>
          <View style={styles.waitingIconWrap}>
            <Ionicons name="time-outline" size={40} color={COLORS.warning} />
          </View>
          <Text style={styles.waitingTitle}>Dokumen Sedang Ditinjau</Text>
          <Text style={styles.waitingSub}>
            Dokumen identitas Anda telah diterima dan sedang dalam proses verifikasi oleh Admin Desa Cirangkong.
            Anda akan mendapatkan notifikasi setelah proses selesai.
          </Text>

          <View style={styles.waitingInfoRow}>
            <Ionicons name="information-circle-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.waitingInfoText}>Proses verifikasi biasanya 1–2 hari kerja.</Text>
          </View>

          {dokumen?.submitted_at && (
            <View style={styles.submittedBadge}>
              <Text style={styles.submittedBadgeText}>Dikirim {dokumen.submitted_at}</Text>
            </View>
          )}

          {/* Tombol periksa manual */}
          <TouchableOpacity
            style={styles.checkBtn}
            onPress={handleCheckStatus}
            disabled={checking}
            activeOpacity={0.8}
          >
            {checking
              ? <ActivityIndicator size="small" color={COLORS.primary} />
              : <Ionicons name="refresh-outline" size={16} color={COLORS.primary} />
            }
            <Text style={styles.checkBtnText}>
              {checking ? "Memeriksa…" : "Periksa Status"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.75}>
          <Ionicons name="log-out-outline" size={16} color={COLORS.textMuted} />
          <Text style={styles.logoutBtnText}>Keluar dari akun</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Form Upload ──────────────────────────────────────────────────────────

  return (
    <View style={[styles.screen, { flex: 1 }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 + footerPb }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + SPACING.xl }]}>
          <View style={styles.headerIcon}>
            <Ionicons name="shield-checkmark" size={28} color={COLORS.primary} />
          </View>
          <Text style={styles.headerTitle}>Verifikasi Identitas</Text>
          <Text style={styles.headerSub}>
            {showDitolak
              ? "Pengajuan sebelumnya ditolak. Silakan upload ulang dokumen yang valid."
              : `Halo, ${user?.name ?? "Warga"}! Upload dokumen identitas Anda untuk mengaktifkan akun SADESA.`}
          </Text>
        </View>

        {/* Catatan penolakan */}
        {showDitolak && dokumen?.catatan && (
          <View style={styles.rejectBanner}>
            <Ionicons name="close-circle" size={18} color={COLORS.danger} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rejectTitle}>Alasan Penolakan</Text>
              <Text style={styles.rejectNote}>{dokumen.catatan}</Text>
            </View>
          </View>
        )}

        {/* Panduan */}
        <View style={styles.guideCard}>
          <Text style={styles.guideTitle}>Panduan Upload</Text>
          {[
            "Foto harus jelas, tidak buram, dan seluruh kartu terlihat",
            "Pastikan teks pada KTP/KK dapat dibaca",
            "Ukuran foto maksimal 5 MB",
            "Format: JPG, PNG",
          ].map((tip, i) => (
            <View key={i} style={styles.guideTip}>
              <View style={styles.guideDot} />
              <Text style={styles.guideTipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* KTP */}
        <View style={{ paddingHorizontal: SPACING.lg }}>
          <PhotoCard
            label="Foto KTP"
            sublabel="Kartu Tanda Penduduk"
            uri={photoKtp}
            required
            onPick={() => pickPhoto(setPhotoKtp)}
            onRemove={() => setPhotoKtp(null)}
          />

          <View style={styles.photoSpacer} />

          <PhotoCard
            label="Foto Kartu Keluarga"
            sublabel="Opsional — tapi disarankan"
            uri={photoKk}
            onPick={() => pickPhoto(setPhotoKk)}
            onRemove={() => setPhotoKk(null)}
          />
        </View>
      </ScrollView>

      {/* Fixed footer */}
      <View style={[styles.footer, { paddingBottom: footerPb }]}>
        <TouchableOpacity
          style={styles.logoutLink}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutLinkText}>Keluar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitBtn, (!photoKtp || submitting) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!photoKtp || submitting}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="cloud-upload-outline" size={18} color={COLORS.white} />
              <Text style={styles.submitBtnText}>Kirim Dokumen</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: COLORS.background },
  center:  { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background },

  // Header
  header: {
    alignItems: "center",
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.xl,
  },
  headerIcon: {
    width: 72, height: 72, borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center", alignItems: "center",
    marginBottom: SPACING.lg,
    ...SHADOW.sm,
  },
  headerTitle: {
    fontSize: FONT.xxl, fontWeight: "800", color: COLORS.text,
    textAlign: "center", marginBottom: SPACING.sm,
  },
  headerSub: {
    fontSize: FONT.md, color: COLORS.textSecondary,
    textAlign: "center", lineHeight: 21,
  },

  // Reject banner
  rejectBanner: {
    flexDirection: "row", alignItems: "flex-start", gap: SPACING.sm,
    marginHorizontal: SPACING.lg, marginBottom: SPACING.md,
    backgroundColor: COLORS.dangerLight,
    borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, borderColor: "#FECACA",
  },
  rejectTitle: { fontSize: FONT.sm, fontWeight: "700", color: COLORS.danger, marginBottom: 2 },
  rejectNote:  { fontSize: FONT.sm, color: COLORS.danger, lineHeight: 18 },

  // Guide
  guideCard: {
    marginHorizontal: SPACING.lg, marginBottom: SPACING.lg,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.lg, padding: SPACING.md,
  },
  guideTitle:   { fontSize: FONT.sm, fontWeight: "700", color: COLORS.primary, marginBottom: SPACING.sm },
  guideTip:     { flexDirection: "row", alignItems: "flex-start", gap: SPACING.sm, marginBottom: SPACING.xs },
  guideDot:     { width: 5, height: 5, borderRadius: 99, backgroundColor: COLORS.primary, marginTop: 6, flexShrink: 0 },
  guideTipText: { fontSize: FONT.sm, color: COLORS.primary, flex: 1, lineHeight: 18 },

  // Photo cards
  photoSpacer: { height: SPACING.md },

  photoCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl, overflow: "hidden",
    marginBottom: 0,
    ...SHADOW.sm,
  },
  photoCardHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
    padding: SPACING.md,
  },
  photoLabel:    { fontSize: FONT.md, fontWeight: "700", color: COLORS.text },
  requiredStar:  { color: COLORS.danger },
  photoSub:      { fontSize: FONT.sm, color: COLORS.textMuted, marginTop: 2 },
  removeBtn:     { padding: SPACING.xs },

  photoPreview: {
    width: "100%", height: 180,
  },
  photoChangeOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: SPACING.sm,
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingVertical: SPACING.sm,
  },
  photoChangeText: { color: COLORS.white, fontSize: FONT.sm, fontWeight: "600" },

  photoPlaceholder: {
    height: 160, margin: SPACING.md, marginTop: 0,
    borderRadius: RADIUS.lg,
    borderWidth: 2, borderColor: COLORS.border, borderStyle: "dashed",
    justifyContent: "center", alignItems: "center", gap: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  photoPlaceholderText: {
    fontSize: FONT.sm, color: COLORS.textMuted, textAlign: "center",
  },

  // Footer
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center",
    gap: SPACING.md,
    backgroundColor: COLORS.white,
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    ...SHADOW.md,
  },
  logoutLink:     { paddingVertical: SPACING.md, paddingHorizontal: SPACING.sm },
  logoutLinkText: { fontSize: FONT.md, color: COLORS.textMuted, fontWeight: "600" },

  submitBtn: {
    flex: 1,
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    height: 50,
    ...SHADOW.md,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText:     { color: COLORS.white, fontSize: FONT.xl, fontWeight: "700" },

  // Waiting state
  waitingCard: {
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xxl,
    alignItems: "center",
    ...SHADOW.md,
  },
  waitingIconWrap: {
    width: 80, height: 80, borderRadius: RADIUS.full,
    backgroundColor: COLORS.warningLight,
    justifyContent: "center", alignItems: "center",
    marginBottom: SPACING.xl,
  },
  waitingTitle: {
    fontSize: FONT.xxl, fontWeight: "800", color: COLORS.text,
    textAlign: "center", marginBottom: SPACING.md,
  },
  waitingSub: {
    fontSize: FONT.md, color: COLORS.textSecondary,
    textAlign: "center", lineHeight: 21, marginBottom: SPACING.xl,
  },
  waitingInfoRow: {
    flexDirection: "row", alignItems: "center", gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  waitingInfoText: { fontSize: FONT.sm, color: COLORS.textMuted },

  submittedBadge: {
    backgroundColor: COLORS.warningLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
  },
  submittedBadgeText: { fontSize: FONT.sm, color: COLORS.warning, fontWeight: "600" },

  checkBtn: {
    flexDirection: "row", alignItems: "center", gap: SPACING.sm,
    marginTop: SPACING.xl,
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.xl,
    borderRadius: RADIUS.full,
    borderWidth: 1.5, borderColor: COLORS.primary,
  },
  checkBtnText: { fontSize: FONT.md, color: COLORS.primary, fontWeight: "600" },

  logoutBtn: {
    flexDirection: "row", alignItems: "center", gap: SPACING.xs,
    marginTop: SPACING.xxl, alignSelf: "center",
    padding: SPACING.sm,
  },
  logoutBtnText: { fontSize: FONT.md, color: COLORS.textMuted },
});
