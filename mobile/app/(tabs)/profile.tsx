import { useCallback, useState } from "react";
import {
  View, Text, TouchableOpacity, Alert,
  StyleSheet, ScrollView, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getUser, clearSession, UserData } from "@/lib/userStorage";
import api from "@/lib/api";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "@/constants/theme";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

// ─── Sub-komponen ─────────────────────────────────────────────────────────────

function SectionLabel({ title }: { title: string }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
}

function MenuRow({
  icon, label, onPress, danger = false, showDivider = true,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
  showDivider?: boolean;
}) {
  return (
    <>
      <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.65}>
        <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
          <Ionicons name={icon} size={19} color={danger ? COLORS.danger : COLORS.textSecondary} />
        </View>
        <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
        <Ionicons name="chevron-forward" size={16} color={danger ? COLORS.danger : COLORS.textMuted} />
      </TouchableOpacity>
      {showDivider && <View style={styles.rowDivider} />}
    </>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const insets  = useSafeAreaInsets();
  const [user, setUser]       = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    getUser().then((u) => { setUser(u); setLoading(false); });
  }, []));

  const handleLogout = () => {
    Alert.alert(
      "Konfirmasi Keluar",
      "Yakin ingin keluar dari akun SADESA?",
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
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!user) { router.replace("/"); return null; }

  return (
    <ScrollView
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: SPACING.xxxl + insets.bottom }}
    >
      {/* ── Top bar ── */}
      <View style={[styles.topBar, { paddingTop: insets.top + SPACING.sm }]}>
        <View style={styles.topBarLeft}>
          <Ionicons name="business" size={16} color={COLORS.primary} />
          <Text style={styles.topBarBrand}>SADESA</Text>
        </View>
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => router.push("/notifikasi" as any)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* ── Avatar & Nama ── */}
      <View style={styles.heroSection}>
        {/* Avatar ring + edit btn */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarInner}>
              <Text style={styles.avatarText}>{initials(user.name)}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => Alert.alert("Segera Hadir", "Fitur edit foto profil akan segera tersedia.")}
            activeOpacity={0.8}
          >
            <Ionicons name="pencil" size={13} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Nama */}
        <Text style={styles.heroName}>{user.name}</Text>

        {/* NIK badge */}
        {user.nik ? (
          <View style={styles.nikBadge}>
            <Text style={styles.nikText}>NIK: {user.nik}</Text>
          </View>
        ) : null}
      </View>

      {/* ── DATA & KEAMANAN ── */}
      <View style={styles.section}>
        <SectionLabel title="DATA & KEAMANAN" />
        <View style={styles.card}>
          <MenuRow
            icon="person-outline"
            label="Data Diri"
            onPress={() => router.push("/profil/edit" as any)}
          />
          <MenuRow
            icon="lock-closed-outline"
            label="Ganti Kata Sandi"
            onPress={() => router.push("/profil/ganti-password" as any)}
            showDivider={false}
          />
        </View>
      </View>

      {/* ── DUKUNGAN ── */}
      <View style={styles.section}>
        <SectionLabel title="DUKUNGAN" />
        <View style={styles.card}>
          <MenuRow
            icon="help-circle-outline"
            label="Bantuan & FAQ"
            onPress={() => Alert.alert("Segera Hadir", "Fitur bantuan akan segera tersedia.")}
            showDivider={false}
          />
        </View>
      </View>

      {/* ── SISTEM ── */}
      <View style={styles.section}>
        <SectionLabel title="SISTEM" />
        <View style={styles.card}>
          <MenuRow
            icon="settings-outline"
            label="Pengaturan Aplikasi"
            onPress={() => Alert.alert("Segera Hadir", "Pengaturan aplikasi akan segera tersedia.")}
          />
          <MenuRow
            icon="information-circle-outline"
            label="Tentang Aplikasi"
            onPress={() => Alert.alert("SADESA", "Sahabat Digital Desa\nVersi 2.4.1")}
          />
          <MenuRow
            icon="log-out-outline"
            label="Keluar"
            onPress={handleLogout}
            danger
            showDivider={false}
          />
        </View>
      </View>

      {/* ── Versi ── */}
      <Text style={styles.version}>SADESA V2.4.1 — 2024</Text>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const AVATAR_SIZE  = 100;
const RING_WIDTH   = 3;
const RING_GAP     = 4;
const RING_OUTER   = AVATAR_SIZE + (RING_WIDTH + RING_GAP) * 2;
const EDIT_SIZE    = 30;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: COLORS.background },

  // Top bar
  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md,
    backgroundColor: COLORS.background,
  },
  topBarLeft:  { flexDirection: "row", alignItems: "center", gap: SPACING.xs },
  topBarBrand: { fontSize: FONT.xl, fontWeight: "800", color: COLORS.text },
  bellBtn:     { width: 40, height: 40, justifyContent: "center", alignItems: "center" },

  // Hero
  heroSection: {
    alignItems: "center",
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xxl,
    backgroundColor: COLORS.background,
  },

  // Avatar
  avatarWrap: { position: "relative", marginBottom: SPACING.lg },
  avatarRing: {
    width: RING_OUTER, height: RING_OUTER, borderRadius: RING_OUTER / 2,
    borderWidth: RING_WIDTH, borderColor: COLORS.primary,
    padding: RING_GAP,
    justifyContent: "center", alignItems: "center",
  },
  avatarInner: {
    width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center", alignItems: "center",
    ...SHADOW.sm,
  },
  avatarText: { fontSize: FONT.xxxl + 4, fontWeight: "800", color: COLORS.primary },
  editBtn: {
    position: "absolute", bottom: 2, right: 2,
    width: EDIT_SIZE, height: EDIT_SIZE, borderRadius: EDIT_SIZE / 2,
    backgroundColor: COLORS.primary,
    justifyContent: "center", alignItems: "center",
    borderWidth: 2, borderColor: COLORS.background,
    ...SHADOW.sm,
  },

  heroName: {
    fontSize: FONT.xxl, fontWeight: "800", color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  nikBadge: {
    backgroundColor: COLORS.inputBg, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
  },
  nikText: { fontSize: FONT.sm, color: COLORS.textSecondary, fontWeight: "500" },

  // Section
  section:      { paddingHorizontal: SPACING.lg, marginBottom: SPACING.md },
  sectionLabel: {
    fontSize: FONT.xs, fontWeight: "700", color: COLORS.textMuted,
    letterSpacing: 0.8, textTransform: "uppercase",
    marginBottom: SPACING.sm, marginLeft: SPACING.xs,
  },

  // Card
  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    overflow: "hidden", ...SHADOW.sm,
  },

  // Menu row
  menuRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: SPACING.lg, paddingVertical: 14,
    gap: SPACING.md,
  },
  menuIcon: {
    width: 38, height: 38, borderRadius: RADIUS.md,
    backgroundColor: COLORS.inputBg,
    justifyContent: "center", alignItems: "center",
    flexShrink: 0,
  },
  menuIconDanger: { backgroundColor: COLORS.dangerLight },
  menuLabel:      { flex: 1, fontSize: FONT.md, fontWeight: "600", color: COLORS.text },
  menuLabelDanger:{ color: COLORS.danger },
  rowDivider:     { height: 1, backgroundColor: COLORS.divider, marginLeft: SPACING.lg + 38 + SPACING.md },

  // Footer
  version: {
    textAlign: "center", color: COLORS.textMuted,
    fontSize: FONT.xs, letterSpacing: 0.5,
    marginTop: SPACING.lg,
  },
});
