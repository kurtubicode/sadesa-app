import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "@/lib/api";
import { getUser, UserData } from "@/lib/userStorage";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "@/constants/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  nama_pengunjung: string;
  instansi: string;
  keperluan: string;
  no_hp: string;
}

interface FormErrors {
  nama_pengunjung?: string;
  keperluan?: string;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function BukuTamuScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [user, setUser]         = useState<UserData | null>(null);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [errors, setErrors]     = useState<FormErrors>({});

  const [form, setForm] = useState<FormData>({
    nama_pengunjung: "",
    instansi:        "",
    keperluan:       "",
    no_hp:           "",
  });

  // Auto-fill from profile
  useEffect(() => {
    getUser().then((u) => {
      setUser(u);
      if (u) {
        setForm((prev) => ({
          ...prev,
          nama_pengunjung: u.name  ?? "",
          no_hp:           u.phone ?? "",
        }));
      }
    });
  }, []);

  const setField = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.nama_pengunjung.trim()) newErrors.nama_pengunjung = "Nama wajib diisi.";
    if (!form.keperluan.trim())       newErrors.keperluan       = "Keperluan wajib diisi.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await api.post("/api/buku-tamu", {
        nama_pengunjung: form.nama_pengunjung.trim(),
        instansi:        form.instansi.trim()   || null,
        keperluan:       form.keperluan.trim(),
        no_hp:           form.no_hp.trim()       || null,
      });
      setSuccess(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Gagal menyimpan data. Coba lagi.";
      Alert.alert("Gagal", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccess(false);
    setForm({
      nama_pengunjung: user?.name  ?? "",
      instansi:        "",
      keperluan:       "",
      no_hp:           user?.phone ?? "",
    });
    setErrors({});
  };

  // ── Success screen ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Buku Tamu Digital</Text>
          <View style={styles.backBtn} />
        </View>

        {/* Success card */}
        <View style={styles.successContainer}>
          <View style={styles.successIconWrap}>
            <Ionicons name="checkmark-circle" size={60} color="#0F766E" />
          </View>
          <Text style={styles.successTitle}>Terima Kasih!</Text>
          <Text style={styles.successDesc}>
            Data kunjungan Anda telah berhasil tercatat.{"\n"}
            Silakan masuk ke loket pelayanan.
          </Text>

          <TouchableOpacity style={styles.btnOutline} onPress={handleReset}>
            <Ionicons name="refresh" size={16} color="#0F766E" />
            <Text style={styles.btnOutlineText}>Isi Ulang (Tamu Lain)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnBack} onPress={() => router.back()}>
            <Text style={styles.btnBackText}>Kembali</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buku Tamu Digital</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero mini */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="book" size={28} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>Daftar Kunjungan</Text>
          <Text style={styles.heroSub}>Kantor Desa Cirangkong</Text>
        </View>

        {/* Form card */}
        <View style={styles.card}>
          <Text style={styles.cardHint}>
            Harap isi data di bawah ini sebelum memulai pelayanan
          </Text>

          {/* Nama */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Nama Lengkap <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.nama_pengunjung && styles.inputError]}
              value={form.nama_pengunjung}
              onChangeText={(v) => setField("nama_pengunjung", v)}
              placeholder="Masukkan nama lengkap Anda"
              placeholderTextColor={COLORS.textPlaceholder}
              autoCapitalize="words"
            />
            {errors.nama_pengunjung && (
              <Text style={styles.errorText}>{errors.nama_pengunjung}</Text>
            )}
          </View>

          {/* Instansi */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Instansi / Asal{" "}
              <Text style={styles.optional}>(opsional)</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={form.instansi}
              onChangeText={(v) => setField("instansi", v)}
              placeholder="Nama instansi, sekolah, atau alamat asal"
              placeholderTextColor={COLORS.textPlaceholder}
              autoCapitalize="words"
            />
          </View>

          {/* Keperluan */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Keperluan <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.inputMultiline, errors.keperluan && styles.inputError]}
              value={form.keperluan}
              onChangeText={(v) => setField("keperluan", v)}
              placeholder="Jelaskan keperluan kunjungan Anda"
              placeholderTextColor={COLORS.textPlaceholder}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            {errors.keperluan && (
              <Text style={styles.errorText}>{errors.keperluan}</Text>
            )}
          </View>

          {/* No HP */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Nomor HP{" "}
              <Text style={styles.optional}>(opsional)</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={form.no_hp}
              onChangeText={(v) => setField("no_hp", v)}
              placeholder="cth: 08123456789"
              placeholderTextColor={COLORS.textPlaceholder}
              keyboardType="phone-pad"
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.btnSubmit, loading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                <Text style={styles.btnSubmitText}>Daftar Kunjungan</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    flexDirection:   "row",
    alignItems:      "center",
    justifyContent:  "space-between",
    paddingHorizontal: SPACING.md,
    paddingBottom:   SPACING.sm,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems:     "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize:   16,
    fontFamily: FONT.semibold,
    color:      COLORS.text,
  },

  // Scroll
  scrollContent: {
    padding: SPACING.md,
    gap:     SPACING.md,
  },

  // Hero
  hero: {
    alignItems:      "center",
    paddingVertical: SPACING.lg,
    backgroundColor: "#0F766E",
    borderRadius:    RADIUS.xl,
    gap:             6,
  },
  heroIcon: {
    width:           56,
    height:          56,
    borderRadius:    16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems:      "center",
    justifyContent:  "center",
    marginBottom:    4,
  },
  heroTitle: {
    fontSize:   18,
    fontFamily: FONT.bold,
    color:      "#fff",
  },
  heroSub: {
    fontSize:   13,
    fontFamily: FONT.regular,
    color:      "rgba(255,255,255,0.75)",
  },

  // Card
  card: {
    backgroundColor: COLORS.card,
    borderRadius:    RADIUS.xl,
    padding:         SPACING.lg,
    gap:             SPACING.md,
    ...SHADOW.sm,
  },
  cardHint: {
    fontSize:    13,
    fontFamily:  FONT.regular,
    color:       COLORS.textMuted,
    textAlign:   "center",
    marginBottom: 4,
  },

  // Fields
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize:   13,
    fontFamily: FONT.semibold,
    color:      COLORS.text,
  },
  required: {
    color: COLORS.danger,
  },
  optional: {
    fontFamily: FONT.regular,
    color:      COLORS.textMuted,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius:    RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical:   SPACING.sm + 2,
    fontSize:        14,
    fontFamily:      FONT.regular,
    color:           COLORS.text,
    borderWidth:     1,
    borderColor:     "transparent",
  },
  inputMultiline: {
    minHeight:  88,
    paddingTop: SPACING.sm + 2,
  },
  inputError: {
    borderColor: COLORS.danger,
    backgroundColor: "#FEF2F2",
  },
  errorText: {
    fontSize:   12,
    fontFamily: FONT.regular,
    color:      COLORS.danger,
  },

  // Submit button
  btnSubmit: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "center",
    gap:            8,
    backgroundColor: "#0F766E",
    borderRadius:   RADIUS.xl,
    paddingVertical: SPACING.md,
    marginTop:      4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnSubmitText: {
    fontSize:   15,
    fontFamily: FONT.bold,
    color:      "#fff",
  },

  // Success screen
  successContainer: {
    flex:           1,
    alignItems:     "center",
    justifyContent: "center",
    padding:        SPACING.xl,
    gap:            SPACING.md,
  },
  successIconWrap: {
    width:           96,
    height:          96,
    borderRadius:    48,
    backgroundColor: "#CCFBF1",
    alignItems:      "center",
    justifyContent:  "center",
    marginBottom:    SPACING.sm,
  },
  successTitle: {
    fontSize:   22,
    fontFamily: FONT.bold,
    color:      COLORS.text,
  },
  successDesc: {
    fontSize:   14,
    fontFamily: FONT.regular,
    color:      COLORS.textSecondary,
    textAlign:  "center",
    lineHeight: 22,
  },
  btnOutline: {
    flexDirection:  "row",
    alignItems:     "center",
    gap:            6,
    borderWidth:    1.5,
    borderColor:    "#0F766E",
    borderRadius:   RADIUS.xl,
    paddingVertical:  SPACING.sm + 2,
    paddingHorizontal: SPACING.xl,
    marginTop:      SPACING.md,
  },
  btnOutlineText: {
    fontSize:   14,
    fontFamily: FONT.semibold,
    color:      "#0F766E",
  },
  btnBack: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xl,
  },
  btnBackText: {
    fontSize:   14,
    fontFamily: FONT.regular,
    color:      COLORS.textMuted,
  },
});
