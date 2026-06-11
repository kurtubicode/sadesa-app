import { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getUser, UserData } from "@/lib/userStorage";
import api from "@/lib/api";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "@/constants/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

interface InformasiItem {
  id: number;
  judul: string;
  slug: string;
  tipe: string;
  isi?: string;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)} menit yang lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam yang lalu`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} hari yang lalu`;
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTgl(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const TIPE_LABEL: Record<string, string> = {
  berita: "BERITA",
  pengumuman: "PENGUMUMAN",
  agenda: "AGENDA",
};

const TIPE_COLOR: Record<string, { bg: string; text: string }> = {
  berita: { bg: "#E8F0FB", text: COLORS.primary },
  pengumuman: { bg: "#FEF3C7", text: "#92400E" },
  agenda: { bg: "#F0FDF4", text: "#166534" },
};

// ─── Sub-komponen ─────────────────────────────────────────────────────────────

function QuickAction({
  icon,
  label,
  color,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  color?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.qaItem}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View
        style={[
          styles.qaIconBox,
          color ? { backgroundColor: color + "18" } : null,
        ]}
      >
        {icon}
      </View>
      <Text style={styles.qaLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function InformasiCardLarge({
  item,
  onPress,
}: {
  item: InformasiItem;
  onPress: () => void;
}) {
  const tc = TIPE_COLOR[item.tipe] ?? TIPE_COLOR.berita;
  const excerpt = item.isi?.replace(/<[^>]+>/g, "").slice(0, 100);

  return (
    <TouchableOpacity
      style={styles.cardLarge}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Thumbnail placeholder */}
      <View style={styles.cardThumbnail}>
        <Ionicons name="image-outline" size={28} color="#CCCCCC" />
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardMeta}>
          <View style={[styles.catBadge, { backgroundColor: tc.bg }]}>
            <Text style={[styles.catBadgeText, { color: tc.text }]}>
              {TIPE_LABEL[item.tipe] ?? item.tipe.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.cardTime}>{timeAgo(item.created_at)}</Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.judul}
        </Text>
        {excerpt ? (
          <Text style={styles.cardExcerpt} numberOfLines={2}>
            {excerpt}…
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

function InformasiCardSmall({
  item,
  onPress,
}: {
  item: InformasiItem;
  onPress: () => void;
}) {
  const tc = TIPE_COLOR[item.tipe] ?? TIPE_COLOR.agenda;

  return (
    <TouchableOpacity
      style={styles.cardSmall}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.cardSmallLeft}>
        <View
          style={[
            styles.catBadge,
            { backgroundColor: tc.bg, marginBottom: SPACING.sm },
          ]}
        >
          <Text style={[styles.catBadgeText, { color: tc.text }]}>
            {TIPE_LABEL[item.tipe] ?? item.tipe.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.judul}
        </Text>
        <Text style={styles.cardTime}>{formatTgl(item.created_at)}</Text>
      </View>
      <View style={styles.cardSmallThumb}>
        <Ionicons name="image-outline" size={22} color="#CCCCCC" />
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function BerandaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser]           = useState<UserData | null>(null);
  const [informasi, setInformasi] = useState<InformasiItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadData = async () => {
    const u = await getUser();
    if (!u) {
      router.replace("/");
      return;
    }
    setUser(u);
    try {
      const [infoRes, notifRes] = await Promise.allSettled([
        api.get("/api/informasi?per_page=5"),
        api.get("/api/notifications"),
      ]);
      if (infoRes.status === "fulfilled")  setInformasi(infoRes.value.data.data ?? []);
      if (notifRes.status === "fulfilled") setUnreadCount(notifRes.value.data.unread_count ?? 0);
    } catch {
      // tampilkan kosong
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, []),
  );
  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Memuat beranda…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, SPACING.xl) + SPACING.xl }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials(user?.name ?? "U")}</Text>
          </View>
          <View>
            <Text style={styles.headerGreetLabel}>SELAMAT DATANG</Text>
            <Text style={styles.headerGreetName}>
              Halo, {user?.name?.split(" ")[0]}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => router.push("/notifikasi" as any)}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
          {unreadCount > 0 && (
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Verifikasi Banner ── */}
      {user?.status === "menunggu_verifikasi" && (
        <TouchableOpacity
          style={styles.verifikasiBanner}
          onPress={() => router.push("/verifikasi" as any)}
          activeOpacity={0.85}
        >
          <Ionicons name="shield-outline" size={20} color={COLORS.warning} />
          <View style={{ flex: 1 }}>
            <Text style={styles.verifikasiBannerTitle}>Akun Belum Terverifikasi</Text>
            <Text style={styles.verifikasiBannerSub}>Lengkapi verifikasi untuk akses penuh →</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={COLORS.warning} />
        </TouchableOpacity>
      )}

      {/* ── Banner ── */}
      <View style={styles.bannerWrap}>
        <View style={styles.banner}>
          {/* Background gradient effect */}
          <View style={styles.bannerOverlay} />
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>SADESA Digital</Text>
            <Text style={styles.bannerSub}>
              Pusat Layanan Terpadu Desa Mandiri
            </Text>
          </View>
        </View>
      </View>

      {/* ── Aksi Cepat ── */}
      <View style={styles.qaRow}>
        <QuickAction
          icon={
            <Ionicons
              name="document-text-outline"
              size={24}
              color={COLORS.primary}
            />
          }
          label="BUAT SURAT"
          color={COLORS.primary}
          onPress={() => router.push("/pengajuan/buat")}
        />
        <QuickAction
          icon={<Ionicons name="megaphone-outline" size={24} color="#E07B39" />}
          label="LAPOR"
          color="#E07B39"
          onPress={() => router.push("/pengaduan/buat")}
        />
        <QuickAction
          icon={
            <Ionicons name="book-outline" size={24} color={COLORS.primary} />
          }
          label="BUKU TAMU"
          color={COLORS.primary}
          onPress={() => router.push("/buku-tamu" as any)}
        />
      </View>

      {/* ── Informasi Desa ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Informasi Desa</Text>
          <TouchableOpacity onPress={() => router.push("/informasi" as any)}>
            <Text style={styles.sectionMore}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        {informasi.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="newspaper-outline" size={32} color="#CCCCCC" />
            <Text style={styles.emptyText}>Belum ada informasi terbaru</Text>
          </View>
        ) : (
          <View style={styles.cardList}>
            {informasi.map((item, idx) =>
              item.tipe === "agenda" ? (
                <InformasiCardSmall
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/informasi/${item.slug}` as any)}
                />
              ) : (
                <InformasiCardLarge
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/informasi/${item.slug}` as any)}
                />
              ),
            )}
          </View>
        )}
      </View>

      <View style={{ height: SPACING.xxxl }} />
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },

  // Verifikasi banner
  verifikasiBanner: {
    flexDirection: "row", alignItems: "center", gap: SPACING.sm,
    marginHorizontal: SPACING.lg, marginBottom: SPACING.md, marginTop: SPACING.sm,
    backgroundColor: COLORS.warningLight,
    borderRadius: RADIUS.lg, padding: SPACING.md,
    borderWidth: 1, borderColor: "#FDE68A",
  },
  verifikasiBannerTitle: { fontSize: FONT.sm, fontWeight: "700", color: "#92400E" },
  verifikasiBannerSub:   { fontSize: FONT.xs, color: "#B45309", marginTop: 1 },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textMuted,
    fontSize: FONT.base,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: FONT.md, fontWeight: "700", color: COLORS.primary },
  headerGreetLabel: {
    fontSize: FONT.xs,
    color: COLORS.textMuted,
    fontWeight: "600",
    letterSpacing: 0.8,
  },
  headerGreetName: {
    fontSize: FONT.xxl,
    fontWeight: "700",
    color: COLORS.text,
  },
  bellBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  bellBadge: {
    position: "absolute",
    top: 4, right: 4,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: COLORS.danger,
    justifyContent: "center", alignItems: "center",
    borderWidth: 1.5, borderColor: COLORS.white,
  },
  bellBadgeText: { fontSize: 9, fontWeight: "800", color: COLORS.white },

  // Banner
  bannerWrap: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  banner: {
    borderRadius: RADIUS.xl,
    overflow: "hidden",
    height: 130,
    backgroundColor: COLORS.primary,
    ...SHADOW.md,
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,30,80,0.35)",
  },
  bannerContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.xl,
  },
  bannerTitle: {
    fontSize: FONT.xxl,
    fontWeight: "800",
    color: COLORS.white,
    marginBottom: 2,
  },
  bannerSub: { fontSize: FONT.base, color: "rgba(255,255,255,0.85)" },

  // Quick Actions
  qaRow: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  qaItem: { flex: 1, alignItems: "center", gap: SPACING.sm },
  qaIconBox: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
  },
  qaLabel: {
    fontSize: FONT.xs,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: 0.3,
    textAlign: "center",
  },

  // Section
  section: { paddingTop: SPACING.xl },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: { fontSize: FONT.xxl, fontWeight: "700", color: COLORS.text },
  sectionMore: { fontSize: FONT.md, color: COLORS.primary, fontWeight: "600" },

  cardList: { paddingHorizontal: SPACING.lg, gap: SPACING.md },

  // Card Large (berita / pengumuman)
  cardLarge: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    overflow: "hidden",
    ...SHADOW.sm,
  },
  cardThumbnail: {
    height: 150,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  cardBody: { padding: SPACING.lg },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  cardTime: { fontSize: FONT.sm, color: COLORS.textMuted },
  cardTitle: {
    fontSize: FONT.xl,
    fontWeight: "700",
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: SPACING.sm,
  },
  cardExcerpt: {
    fontSize: FONT.base,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  // Card Small (agenda)
  cardSmall: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.lg,
    gap: SPACING.md,
    ...SHADOW.sm,
  },
  cardSmallLeft: { flex: 1 },
  cardSmallThumb: {
    width: 70,
    height: 70,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },

  // Category badge
  catBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  catBadgeText: { fontSize: FONT.xs, fontWeight: "700" },

  // Empty
  emptyCard: {
    marginHorizontal: SPACING.lg,
    padding: SPACING.xxl,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    alignItems: "center",
    gap: SPACING.sm,
    ...SHADOW.sm,
  },
  emptyText: { fontSize: FONT.base, color: COLORS.textMuted },
});
