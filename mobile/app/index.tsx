import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import api from "@/lib/api";
import { saveSession, getToken } from "@/lib/userStorage";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "@/constants/theme";

// ─── Logo SADESA ──────────────────────────────────────────────────────────────

function SadesaAppIcon() {
  return (
    <View style={styles.appIcon}>
      <Text style={styles.appIconS}>S</Text>
      <Text style={styles.appIconDesa}>DESA</Text>
    </View>
  );
}

// ─── Input field ──────────────────────────────────────────────────────────────

function InputField({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  showToggle,
  onToggle,
  showPassword,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  showToggle?: boolean;
  onToggle?: () => void;
  showPassword?: boolean;
}) {
  return (
    <View style={styles.inputWrapper}>
      <Ionicons name={icon} size={18} color={COLORS.textMuted} style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textPlaceholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !showPassword}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? "none"}
      />
      {showToggle && (
        <TouchableOpacity onPress={onToggle} style={styles.eyeBtn}>
          <Ionicons
            name={showPassword ? "eye-outline" : "eye-off-outline"}
            size={18}
            color={COLORS.textMuted}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [checking, setChecking]     = useState(true);

  const router = useRouter();

  useEffect(() => {
    getToken().then((token) => {
      if (token) router.replace("/home");
      else setChecking(false);
    });
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Peringatan", "Email dan kata sandi tidak boleh kosong.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/api/login", { email: email.trim(), password });

      if (res.data.user?.role !== "warga") {
        Alert.alert(
          "Akses Ditolak",
          "Aplikasi SADESA hanya untuk warga desa. Gunakan web portal untuk akun petugas."
        );
        return;
      }

      await saveSession(res.data.token, res.data.user);
      router.replace("/home");
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 401) Alert.alert("Login Gagal", "Email atau kata sandi salah.");
      else if (status === 403) Alert.alert("Akses Ditolak", error?.response?.data?.message);
      else Alert.alert("Koneksi Gagal", "Tidak dapat terhubung ke server.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <View style={styles.splashContainer}>
        <SadesaAppIcon />
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 24 }} />
        <Text style={styles.splashText}>Memuat SADESA…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <Ionicons name="business" size={18} color={COLORS.primary} />
            <Text style={styles.headerTitle}>SADESA</Text>
          </View>

          {/* ── Logo ── */}
          <View style={styles.logoSection}>
            <SadesaAppIcon />
            <Text style={styles.welcomeTitle}>Selamat Datang</Text>
            <Text style={styles.welcomeSub}>Silakan masuk untuk melanjutkan</Text>
          </View>

          {/* ── Form ── */}
          <View style={styles.form}>
            <Text style={styles.fieldLabel}>NIK ATAU EMAIL</Text>
            <InputField
              icon="person-outline"
              placeholder="Masukkan NIK atau Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <Text style={[styles.fieldLabel, { marginTop: SPACING.md }]}>KATA SANDI</Text>
            <InputField
              icon="lock-closed-outline"
              placeholder="Masukkan Kata Sandi"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              showToggle
              showPassword={showPass}
              onToggle={() => setShowPass((v) => !v)}
            />

            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Lupa Kata Sandi?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitBtnText}>Masuk</Text>
              )}
            </TouchableOpacity>

            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Belum punya akun? </Text>
              <TouchableOpacity onPress={() => router.push("/register")}>
                <Text style={styles.registerLink}>Daftar di sini</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Footer ── */}
          <View style={styles.footer}>
            <View style={styles.footerLine} />
            <Text style={styles.footerText}>LAYANAN DIGITAL TERPADU</Text>
            <View style={styles.footerLine} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, paddingHorizontal: SPACING.xxl, paddingBottom: SPACING.xxxl },

  // Splash
  splashContainer: {
    flex: 1, backgroundColor: COLORS.background,
    justifyContent: "center", alignItems: "center",
  },
  splashText: { marginTop: SPACING.sm, color: COLORS.textMuted, fontSize: FONT.base },

  // Header
  header: {
    flexDirection: "row", alignItems: "center", gap: SPACING.sm,
    paddingTop: SPACING.xl, marginBottom: SPACING.xxxl,
  },
  headerTitle: { fontSize: FONT.xl, fontWeight: "700", color: COLORS.text },

  // Logo section
  logoSection: { alignItems: "center", marginBottom: SPACING.xxxl },
  appIcon: {
    width: 88, height: 88, borderRadius: RADIUS.xl,
    backgroundColor: "#0B5F60",
    justifyContent: "center", alignItems: "center",
    marginBottom: SPACING.xl,
    ...SHADOW.md,
  },
  appIconS:    { color: COLORS.white, fontSize: 30, fontWeight: "800", lineHeight: 34 },
  appIconDesa: { color: "rgba(255,255,255,0.75)", fontSize: 11, fontWeight: "700", letterSpacing: 3 },
  welcomeTitle: { fontSize: FONT.xxxl, fontWeight: "800", color: COLORS.text, marginBottom: SPACING.xs },
  welcomeSub:   { fontSize: FONT.md, color: COLORS.textMuted },

  // Form
  form: { gap: 0 },
  fieldLabel: {
    fontSize: FONT.xs, fontWeight: "700", color: COLORS.textSecondary,
    letterSpacing: 0.8, marginBottom: SPACING.sm,
  },

  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.lg, paddingHorizontal: SPACING.lg,
    height: 52, marginBottom: SPACING.xs,
  },
  inputIcon:  { marginRight: SPACING.sm },
  input:      { flex: 1, fontSize: FONT.lg, color: COLORS.text },
  eyeBtn:     { padding: SPACING.xs },

  forgotBtn: { alignSelf: "flex-end", marginTop: SPACING.sm, marginBottom: SPACING.xl },
  forgotText: { fontSize: FONT.md, color: COLORS.primary, fontWeight: "600" },

  submitBtn: {
    backgroundColor: COLORS.primary, borderRadius: RADIUS.full,
    height: 54, justifyContent: "center", alignItems: "center",
    ...SHADOW.md,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: COLORS.white, fontSize: FONT.xl, fontWeight: "700", letterSpacing: 0.3 },

  registerRow: {
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    marginTop: SPACING.xl,
  },
  registerText: { fontSize: FONT.md, color: COLORS.textMuted },
  registerLink: { fontSize: FONT.md, color: COLORS.primary, fontWeight: "700" },

  // Footer
  footer: {
    flexDirection: "row", alignItems: "center", gap: SPACING.md,
    marginTop: "auto", paddingTop: SPACING.xxxl,
  },
  footerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  footerText: { fontSize: FONT.xs, color: COLORS.textMuted, fontWeight: "600", letterSpacing: 1.5 },
});
