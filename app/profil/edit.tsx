import { useCallback, useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  Alert, StyleSheet, ActivityIndicator, SafeAreaView,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "@/lib/api";
import { getUser, saveSession, getToken, UserData } from "@/lib/userStorage";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "@/constants/theme";

// ─── Field component ──────────────────────────────────────────────────────────

function Field({
  label, value, onChangeText, placeholder,
  keyboardType, maxLength, autoCapitalize, editable = true,
}: {
  label: string;
  value: string;
  onChangeText?: (v: string) => void;
  placeholder?: string;
  keyboardType?: any;
  maxLength?: number;
  autoCapitalize?: any;
  editable?: boolean;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputWrapper, !editable && styles.inputDisabled]}>
        <TextInput
          style={[styles.input, !editable && styles.inputTextDisabled]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder ?? label}
          placeholderTextColor={COLORS.textPlaceholder}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize ?? "none"}
          editable={editable}
        />
        {!editable && (
          <Ionicons name="lock-closed-outline" size={16} color={COLORS.textMuted} style={{ marginLeft: SPACING.sm }} />
        )}
      </View>
      {!editable && (
        <Text style={styles.fieldHint}>Tidak dapat diubah</Text>
      )}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function EditProfilScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [user, setUser]       = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);

  // Editable fields
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useFocusEffect(useCallback(() => {
    (async () => {
      const u = await getUser();
      if (!u) { router.replace("/"); return; }
      setUser(u);
      setName(u.name);
      setEmail(u.email);
      setPhone(u.phone ?? "");
      setLoading(false);
    })();
  }, []));

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Peringatan", "Nama lengkap tidak boleh kosong.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Peringatan", "Format email tidak valid.");
      return;
    }

    setSaving(true);
    try {
      const res = await api.put("/api/profile", {
        name:  name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
      });

      // Perbarui storage dengan data terbaru
      const token = await getToken();
      if (token) {
        await saveSession(token, { ...user!, ...res.data.user });
      }

      Alert.alert("Berhasil", "Data diri berhasil diperbarui.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.message
        ?? err?.response?.data?.errors?.email?.[0]
        ?? "Gagal menyimpan. Coba lagi.";
      Alert.alert("Gagal", msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + SPACING.xxxl }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Avatar ── */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase() || "U"}
              </Text>
            </View>
            <Text style={styles.avatarName}>{name || "—"}</Text>
            {user?.nik && (
              <View style={styles.nikBadge}>
                <Text style={styles.nikText}>NIK: {user.nik}</Text>
              </View>
            )}
          </View>

          {/* ── Form ── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DATA PRIBADI</Text>
            <View style={styles.card}>
              <Field
                label="NAMA LENGKAP"
                value={name}
                onChangeText={setName}
                placeholder="Nama sesuai KTP"
                autoCapitalize="words"
              />
              <View style={styles.divider} />
              <Field
                label="NIK"
                value={user?.nik ?? "—"}
                editable={false}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>KONTAK</Text>
            <View style={styles.card}>
              <Field
                label="EMAIL"
                value={email}
                onChangeText={setEmail}
                placeholder="contoh@email.com"
                keyboardType="email-address"
              />
              <View style={styles.divider} />
              <Field
                label="NOMOR WHATSAPP / HP"
                value={phone}
                onChangeText={setPhone}
                placeholder="Contoh: 081234567890"
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>
          </View>

          {/* ── Info ── */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={16} color={COLORS.primary} />
            <Text style={styles.infoText}>
              NIK tidak dapat diubah. Hubungi Admin desa jika ada kesalahan data.
            </Text>
          </View>

          {/* ── Save button ── */}
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
                <Text style={styles.saveBtnText}>Simpan Perubahan</Text>
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
  safe:    { flex: 1, backgroundColor: COLORS.background },
  scroll:  { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl },
  center:  { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background },

  // Avatar
  avatarSection: { alignItems: "center", marginBottom: SPACING.xxl },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center", alignItems: "center",
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  avatarText:  { fontSize: FONT.xxl, fontWeight: "800", color: COLORS.primary },
  avatarName:  { fontSize: FONT.xl, fontWeight: "700", color: COLORS.text, marginBottom: SPACING.xs },
  nikBadge:    { backgroundColor: COLORS.inputBg, borderRadius: RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs },
  nikText:     { fontSize: FONT.sm, color: COLORS.textSecondary, fontWeight: "500" },

  // Section
  section:      { marginBottom: SPACING.lg },
  sectionLabel: {
    fontSize: FONT.xs, fontWeight: "700", color: COLORS.textMuted,
    letterSpacing: 0.8, marginBottom: SPACING.sm, marginLeft: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg, overflow: "hidden", ...SHADOW.sm,
  },
  divider: { height: 1, backgroundColor: COLORS.divider },

  // Fields
  fieldGroup:   { paddingVertical: SPACING.md },
  fieldLabel:   {
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
  inputDisabled: { backgroundColor: COLORS.divider },
  input:         { flex: 1, fontSize: FONT.md, color: COLORS.text },
  inputTextDisabled: { color: COLORS.textMuted },
  fieldHint:     { fontSize: FONT.xs, color: COLORS.textMuted, marginTop: SPACING.xs },

  // Info box
  infoBox: {
    flexDirection: "row", gap: SPACING.sm, alignItems: "flex-start",
    backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.xl,
  },
  infoText: { flex: 1, fontSize: FONT.sm, color: COLORS.primary, lineHeight: 18 },

  // Save button
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
