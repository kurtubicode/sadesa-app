import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Alert,
  StyleSheet, ActivityIndicator, SafeAreaView, KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "@/lib/api";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "@/constants/theme";

// ─── Password field ───────────────────────────────────────────────────────────

function PasswordField({
  label, value, onChangeText, placeholder, show, onToggle,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textPlaceholder}
          secureTextEntry={!show}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={onToggle} style={styles.eyeBtn}>
          <Ionicons
            name={show ? "eye-outline" : "eye-off-outline"}
            size={18}
            color={COLORS.textMuted}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function GantiPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [current, setCurrent]         = useState("");
  const [newPass, setNewPass]         = useState("");
  const [confirm, setConfirm]         = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving]           = useState(false);

  const handleSave = async () => {
    if (!current || !newPass || !confirm) {
      Alert.alert("Peringatan", "Semua kolom wajib diisi.");
      return;
    }
    if (newPass.length < 8) {
      Alert.alert("Peringatan", "Kata sandi baru minimal 8 karakter.");
      return;
    }
    if (newPass !== confirm) {
      Alert.alert("Peringatan", "Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setSaving(true);
    try {
      await api.put("/api/password", {
        current_password:      current,
        password:              newPass,
        password_confirmation: confirm,
      });
      Alert.alert("Berhasil", "Kata sandi berhasil diperbarui.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Gagal mengubah kata sandi.";
      Alert.alert("Gagal", msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + SPACING.xxxl }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Icon heading ── */}
          <View style={styles.iconSection}>
            <View style={styles.iconCircle}>
              <Ionicons name="lock-closed" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.iconDesc}>
              Masukkan kata sandi saat ini dan buat kata sandi baru yang kuat.
            </Text>
          </View>

          {/* ── Form ── */}
          <View style={styles.card}>
            <PasswordField
              label="KATA SANDI SAAT INI"
              value={current}
              onChangeText={setCurrent}
              placeholder="Masukkan kata sandi saat ini"
              show={showCurrent}
              onToggle={() => setShowCurrent((v) => !v)}
            />
            <View style={styles.divider} />
            <PasswordField
              label="KATA SANDI BARU"
              value={newPass}
              onChangeText={setNewPass}
              placeholder="Minimal 8 karakter"
              show={showNew}
              onToggle={() => setShowNew((v) => !v)}
            />
            <View style={styles.divider} />
            <PasswordField
              label="KONFIRMASI KATA SANDI BARU"
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Ulangi kata sandi baru"
              show={showConfirm}
              onToggle={() => setShowConfirm((v) => !v)}
            />
          </View>

          {/* ── Hint ── */}
          <View style={styles.hintBox}>
            <Ionicons name="shield-checkmark-outline" size={16} color={COLORS.primary} />
            <Text style={styles.hintText}>
              Gunakan minimal 8 karakter dengan kombinasi huruf dan angka untuk keamanan optimal.
            </Text>
          </View>

          {/* ── Save ── */}
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <>
                <Ionicons name="checkmark-outline" size={20} color={COLORS.white} />
                <Text style={styles.saveBtnText}>Perbarui Kata Sandi</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl },

  iconSection: { alignItems: "center", marginBottom: SPACING.xxl },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center", alignItems: "center",
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  iconDesc: {
    fontSize: FONT.md, color: COLORS.textSecondary,
    textAlign: "center", lineHeight: 21,
    paddingHorizontal: SPACING.lg,
  },

  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOW.sm,
  },
  divider: { height: 1, backgroundColor: COLORS.divider },

  fieldGroup:  { paddingVertical: SPACING.md },
  fieldLabel:  {
    fontSize: FONT.xs, fontWeight: "700", color: COLORS.textSecondary,
    letterSpacing: 0.8, marginBottom: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 46,
  },
  input:   { flex: 1, fontSize: FONT.md, color: COLORS.text },
  eyeBtn:  { padding: SPACING.xs },

  hintBox: {
    flexDirection: "row", gap: SPACING.sm, alignItems: "flex-start",
    backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.xl,
  },
  hintText: { flex: 1, fontSize: FONT.sm, color: COLORS.primary, lineHeight: 18 },

  saveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    height: 54,
    ...SHADOW.md,
  },
  saveBtnDisabled: { opacity: 0.65 },
  saveBtnText:     { color: COLORS.white, fontSize: FONT.xl, fontWeight: "700" },
});
