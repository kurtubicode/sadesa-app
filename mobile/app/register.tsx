import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Alert, StyleSheet, ActivityIndicator, SafeAreaView, Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import api from "@/lib/api";
import { saveSession } from "@/lib/userStorage";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "@/constants/theme";

// ─── Komponen Field ───────────────────────────────────────────────────────────

function Field({
  label, placeholder, value, onChangeText,
  keyboardType, secureTextEntry, maxLength, autoCapitalize, showToggle, onToggle, showText,
}: {
  label: string; placeholder: string; value: string;
  onChangeText: (v: string) => void;
  keyboardType?: any; secureTextEntry?: boolean; maxLength?: number;
  autoCapitalize?: any; showToggle?: boolean; onToggle?: () => void; showText?: boolean;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textPlaceholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry && !showText}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize ?? "none"}
        />
        {showToggle && (
          <TouchableOpacity onPress={onToggle} style={{ padding: SPACING.xs }}>
            <Ionicons
              name={showText ? "eye-outline" : "eye-off-outline"}
              size={18} color={COLORS.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function RegisterScreen() {
  const router = useRouter();

  const [nik, setNik]           = useState("");
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleRegister = async () => {
    if (!nik || !name || !email || !password || !confirm) {
      Alert.alert("Peringatan", "NIK, nama, email, dan kata sandi wajib diisi.");
      return;
    }
    if (!/^\d{16}$/.test(nik)) {
      Alert.alert("Peringatan", "NIK harus terdiri dari 16 digit angka.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Peringatan", "Format email tidak valid.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Peringatan", "Kata sandi minimal 8 karakter.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Peringatan", "Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      // 1. Register
      await api.post("/api/register", {
        nik,
        name,
        email,
        password,
        password_confirmation: confirm,
        phone: phone || undefined,
      });

      // 2. Auto-login agar langsung bisa upload dokumen verifikasi
      const loginRes = await api.post("/api/login", { email, password });
      await saveSession(loginRes.data.token, loginRes.data.user);

      // 3. Langsung ke halaman verifikasi
      router.replace("/verifikasi" as any);
    } catch (error: any) {
      const msg = error?.response?.data?.message ?? "Pendaftaran gagal. Periksa kembali data Anda.";
      Alert.alert("Pendaftaran Gagal", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.replace("/")}>
              <Ionicons name="arrow-back" size={22} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Daftar Akun Baru</Text>
          </View>

          {/* ── Heading ── */}
          <View style={styles.heading}>
            <Text style={styles.headingTitle}>Mari bergabung</Text>
            <Text style={styles.headingDesc}>
              Lengkapi formulir di bawah ini untuk memulai akses layanan kependudukan digital Anda.
            </Text>
          </View>

          {/* ── Fields ── */}
          <Field
            label="NIK (16 DIGIT)"
            placeholder="Masukkan Nomor Induk Kependudukan"
            value={nik}
            onChangeText={setNik}
            keyboardType="numeric"
            maxLength={16}
          />
          <Field
            label="NAMA LENGKAP"
            placeholder="Nama sesuai KTP"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <Field
            label="EMAIL"
            placeholder="contoh@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <Field
            label="NOMOR WHATSAPP / TELEPON"
            placeholder="Contoh: 081234567890"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={15}
          />
          <Field
            label="KATA SANDI"
            placeholder="Minimal 8 karakter"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            showToggle
            showText={showPass}
            onToggle={() => setShowPass((v) => !v)}
          />
          <Field
            label="KONFIRMASI KATA SANDI"
            placeholder="Ulangi kata sandi Anda"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
            showToggle
            showText={showConf}
            onToggle={() => setShowConf((v) => !v)}
          />

          {/* ── Submit ── */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={COLORS.white} />
              : <Text style={styles.submitBtnText}>Daftar Akun</Text>
            }
          </TouchableOpacity>

          {/* ── Login link ── */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Sudah punya akun? </Text>
            <TouchableOpacity onPress={() => router.replace("/")}>
              <Text style={styles.loginLink}>Masuk</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, paddingHorizontal: SPACING.xxl, paddingBottom: SPACING.xxxl },

  header: {
    flexDirection: "row", alignItems: "center", gap: SPACING.md,
    paddingTop: SPACING.xl, marginBottom: SPACING.xxxl,
  },
  backBtn: {
    width: 36, height: 36, justifyContent: "center", alignItems: "center",
  },
  headerTitle: { fontSize: FONT.xl, fontWeight: "700", color: COLORS.primary },

  heading: { marginBottom: SPACING.xxl },
  headingTitle: { fontSize: FONT.display, fontWeight: "800", color: COLORS.text, marginBottom: SPACING.sm },
  headingDesc:  { fontSize: FONT.md, color: COLORS.textSecondary, lineHeight: 22 },

  fieldGroup:   { marginBottom: SPACING.lg },
  fieldLabel:   {
    fontSize: FONT.xs, fontWeight: "700", color: COLORS.textSecondary,
    letterSpacing: 0.8, marginBottom: SPACING.sm,
  },
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg, height: 52,
  },
  input: { flex: 1, fontSize: FONT.lg, color: COLORS.text },

  submitBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    height: 54, justifyContent: "center", alignItems: "center",
    marginTop: SPACING.sm, marginBottom: SPACING.xl,
    ...SHADOW.md,
  },
  submitBtnText: { color: COLORS.white, fontSize: FONT.xl, fontWeight: "700", letterSpacing: 0.3 },

  loginRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  loginText: { fontSize: FONT.md, color: COLORS.textMuted },
  loginLink: { fontSize: FONT.md, color: COLORS.primary, fontWeight: "700" },
});
