import { useCallback, useState } from "react";
import {
  View, Text, TouchableOpacity, Alert,
  StyleSheet, ScrollView, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getUser, clearSession, UserData, ROLE_LABEL, STATUS_LABEL } from "@/lib/userStorage";
import api from "@/lib/api";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "@/constants/theme";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

// ─── Sub-komponen ─────────────────────────────────────────────────────────────

function InfoRow({
  icon, label, value,
}: {
  icon: keyof typeof Ionicons.glyphMap; label: string; value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={16} color={COLORS.primary} />
      </View>
      <View style={styles.infoBody}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || "—"}</Text>
      </View>
    </View>
  );
}

function MenuRow({
  icon, label, color, onPress, danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const c = danger ? COLORS.danger : (color ?? COLORS.text);
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, { backgroundColor: (danger ? COLORS.dangerLight : COLORS.primaryLight) }]}>
        <Ionicons name={icon} size={18} color={c} />
      </View>
      <Text style={[styles.menuLabel, danger && { color: COLORS.danger }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} style={{ marginLeft: "auto" }} />
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [user, setUser]     = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    getUser().then((u) => { setUser(u); setLoading(false); });
  }, []));

  const handleLogout = () => {
    Alert.alert(
      "Konfirmasi Keluar",
      "Yakin ingin keluar dari SADESA?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Keluar",
          style: "destructive",
          onPress: async () => {
            try { await api.post("/api/logout"); } catch { /* silent */ } finally {
              await clearSession();
              router.replace("/");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!user) {
    router.replace("/");
    return null;
  }

  const statusCfg: Record<string, { bg: string; text: string }> = {
    aktif:               { bg: COLORS.successLight,  text: COLORS.success  },
    nonaktif:            { bg: COLORS.dangerLight,   text: COLORS.danger   },
    menunggu_verifikasi: { bg: COLORS.warningLight,  text: COLORS.warning  },
  };
  const sc = statusCfg[user.status] ?? { bg: COLORS.primaryLight, text: COLORS.primary };

  return (
    <ScrollView
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: SPACING.xxxl }}
    >
      {/* ── Header / Avatar ── */}
      <View style={[styles.headerBg, { paddingTop: insets.top + SPACING.xl }]}>
        {/* Avatar */}
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials(user.name)}</Text>
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.statusText, { color: sc.text }]}>
            {STATUS_LABEL[user.status] ?? user.status}
          </Text>
        </View>
      </View>

      {/* ── Data Akun ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Akun</Text>
        <View style={styles.card}>
          <InfoRow icon="card-outline"        label="NIK"             value={user.nik ?? "—"} />
          <InfoRow icon="mail-outline"        label="Email"           value={user.email} />
          <InfoRow icon="call-outline"        label="No. HP / WA"     value={user.phone ?? "—"} />
          <InfoRow icon="shield-outline"      label="Role"            value={ROLE_LABEL[user.role] ?? user.role} />
        </View>
      </View>

      {/* ── Menu ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pengaturan</Text>
        <View style={styles.card}>
          <MenuRow
            icon="create-outline"
            label="Edit Profil"
            onPress={() => Alert.alert("Segera Hadir", "Fitur edit profil akan segera tersedia.")}
          />
          <View style={styles.divider} />
          <MenuRow
            icon="lock-closed-outline"
            label="Ubah Kata Sandi"
            onPress={() => Alert.alert("Segera Hadir", "Fitur ubah kata sandi akan segera tersedia.")}
          />
          <View style={styles.divider} />
          <MenuRow
            icon="notifications-outline"
            label="Notifikasi"
            onPress={() => Alert.alert("Segera Hadir", "Pengaturan notifikasi akan segera tersedia.")}
          />
        </View>
      </View>

      {/* ── Logout ── */}
      <View style={[styles.section, { paddingHorizontal: SPACING.lg }]}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>Keluar dari Akun</Text>
        </TouchableOpacity>
      </View>

      {/* ── Versi ── */}
      <Text style={styles.version}>SADESA v1.0.0 · Desa Cirangkong</Text>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:     { flex: 1, backgroundColor: COLORS.background },
  loadingWrap:{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background },

  // Header
  headerBg: {
    backgroundColor: COLORS.primary,
    alignItems: "center",
    paddingBottom: SPACING.xxxl,
  },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.white,
    justifyContent: "center", alignItems: "center",
    marginBottom: SPACING.md,
    ...SHADOW.md,
  },
  avatarText:  { fontSize: FONT.xxxl, fontWeight: "800", color: COLORS.primary },
  userName:    { fontSize: FONT.xxl, fontWeight: "800", color: COLORS.white, marginBottom: SPACING.sm },
  statusBadge: { paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: RADIUS.full },
  statusText:  { fontSize: FONT.sm, fontWeight: "700" },

  // Section
  section:      { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl },
  sectionTitle: {
    fontSize: FONT.sm, fontWeight: "700", color: COLORS.textMuted,
    letterSpacing: 0.8, marginBottom: SPACING.sm, textTransform: "uppercase",
  },

  // Card
  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    overflow: "hidden", ...SHADOW.sm,
  },

  // Info row
  infoRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.divider,
  },
  infoIcon: {
    width: 36, height: 36, borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center", alignItems: "center",
    marginRight: SPACING.md,
  },
  infoBody:  { flex: 1 },
  infoLabel: { fontSize: FONT.xs, color: COLORS.textMuted, marginBottom: 2 },
  infoValue: { fontSize: FONT.md, color: COLORS.text, fontWeight: "600" },

  // Menu row
  menuRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
  },
  menuIcon: {
    width: 36, height: 36, borderRadius: RADIUS.md,
    justifyContent: "center", alignItems: "center",
    marginRight: SPACING.md,
  },
  menuLabel: { fontSize: FONT.md, fontWeight: "600", color: COLORS.text },

  divider: { height: 1, backgroundColor: COLORS.divider, marginLeft: SPACING.lg + 36 + SPACING.md },

  // Logout
  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: SPACING.sm, backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl, paddingVertical: SPACING.lg,
    borderWidth: 1.5, borderColor: COLORS.danger, ...SHADOW.sm,
  },
  logoutText: { color: COLORS.danger, fontSize: FONT.xl, fontWeight: "700" },

  // Version
  version: {
    textAlign: "center", color: COLORS.textMuted,
    fontSize: FONT.xs, marginTop: SPACING.xl,
  },
});
