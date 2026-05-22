import { useCallback, useState } from "react";
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "@/lib/api";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "@/constants/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

type NotifType = "surat" | "informasi" | "verifikasi" | "pengaduan" | "info";

interface NotifItem {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  action_url: string | null;
  read: boolean;
  created_at: string;
}

// ─── Icon config ──────────────────────────────────────────────────────────────

const ICON_CFG: Record<NotifType, { bg: string; icon: string }> = {
  surat:      { bg: COLORS.primary,  icon: "document-text"       },
  informasi:  { bg: "#EF4444",       icon: "warning"             },
  verifikasi: { bg: "#10B981",       icon: "shield-checkmark"    },
  pengaduan:  { bg: "#7C3AED",       icon: "chatbubble-ellipses" },
  info:       { bg: "#9CA3AF",       icon: "information-circle"  },
};

// ─── Notif Card ───────────────────────────────────────────────────────────────

function NotifCard({ item, onPress }: { item: NotifItem; onPress: (item: NotifItem) => void }) {
  const cfg = ICON_CFG[item.type] ?? ICON_CFG.info;

  return (
    <TouchableOpacity
      style={[styles.card, !item.read && styles.cardUnread]}
      onPress={() => onPress(item)}
      activeOpacity={0.75}
    >
      <View style={[styles.iconCircle, { backgroundColor: item.read ? "#E5E7EB" : cfg.bg }]}>
        <Ionicons
          name={cfg.icon as any}
          size={22}
          color={item.read ? "#9CA3AF" : COLORS.white}
        />
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardTitleRow}>
          <Text style={[styles.cardTitle, !item.read && styles.cardTitleUnread]} numberOfLines={1}>
            {item.title}
          </Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.cardBody} numberOfLines={3}>{item.body}</Text>
        <Text style={styles.cardTime}>{item.created_at}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function NotifikasiScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [notifs, setNotifs]       = useState<NotifItem[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [marking, setMarking]     = useState(false);

  const unreadCount = notifs.filter((n) => !n.read).length;

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchData = async () => {
    try {
      const res = await api.get("/api/notifications");
      setNotifs(res.data.data ?? []);
    } catch { /* silent */ } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => {
    setLoading(true);
    fetchData();
  }, []));

  // ── Mark one as read ───────────────────────────────────────────────────────

  const handlePress = async (item: NotifItem) => {
    if (!item.read) {
      // Update lokal dulu (optimistic)
      setNotifs((prev) => prev.map((n) => n.id === item.id ? { ...n, read: true } : n));
      try {
        await api.patch(`/api/notifications/${item.id}/read`);
      } catch { /* silent */ }
    }

    // Navigasi sesuai action_url
    if (item.action_url) {
      router.push(item.action_url as any);
    }
  };

  // ── Mark all as read ───────────────────────────────────────────────────────

  const handleMarkAll = async () => {
    setMarking(true);
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await api.post("/api/notifications/read-all");
    } catch { /* silent */ } finally {
      setMarking(false);
    }
  };

  // ── Grouped data ───────────────────────────────────────────────────────────

  const terbaru    = notifs.filter((n) => !n.read);
  const sebelumnya = notifs.filter((n) =>  n.read);

  // FlatList dengan section header menggunakan ListHeaderComponent & dua list
  type ListRow = { _type: "header"; label: string } | (NotifItem & { _type: "item" });

  const rows: ListRow[] = [];
  if (terbaru.length > 0) {
    rows.push({ _type: "header", label: "TERBARU" });
    terbaru.forEach((n) => rows.push({ ...n, _type: "item" }));
  }
  if (sebelumnya.length > 0) {
    rows.push({ _type: "header", label: "SEBELUMNYA" });
    sebelumnya.forEach((n) => rows.push({ ...n, _type: "item" }));
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <View style={styles.screen}>
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifikasi</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAll} disabled={marking} activeOpacity={0.7}>
            {marking
              ? <ActivityIndicator size="small" color={COLORS.primary} />
              : <Text style={styles.markAllText}>Tandai dibaca</Text>
            }
          </TouchableOpacity>
        ) : (
          <View style={{ width: 90 }} />
        )}
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item, i) => item._type === "header" ? `h_${i}` : item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Math.max(insets.bottom, SPACING.md) + SPACING.xxl },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchData(); }}
              tintColor={COLORS.primary}
            />
          }
          renderItem={({ item }) => {
            if (item._type === "header") {
              return <Text style={styles.sectionLabel}>{item.label}</Text>;
            }
            return <NotifCard item={item} onPress={handlePress} />;
          }}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="notifications-off-outline" size={52} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>Belum ada notifikasi</Text>
              <Text style={styles.emptySub}>Notifikasi terbaru akan muncul di sini.</Text>
            </View>
          }
          ListFooterComponent={
            notifs.length > 0 ? (
              <View style={styles.tipsCard}>
                <Text style={styles.tipsDecoNum}>4</Text>
                <View style={styles.tipsContent}>
                  <View style={styles.tipsBadge}>
                    <Text style={styles.tipsBadgeText}>TIPS LAYANAN</Text>
                  </View>
                  <Text style={styles.tipsTitle}>Ingin proses lebih cepat?</Text>
                  <Text style={styles.tipsSub}>
                    Lengkapi profil digital Anda untuk mempermudah pengajuan administrasi tanpa perlu verifikasi ulang.
                  </Text>
                  <TouchableOpacity
                    style={styles.tipsBtn}
                    onPress={() => router.push("/profil/edit" as any)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.tipsBtnText}>Lengkapi Profil</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Header
  header: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.divider,
  },
  backBtn:     { width: 36, height: 36, justifyContent: "center", alignItems: "center" },
  headerTitle: { flex: 1, fontSize: FONT.xl, fontWeight: "700", color: COLORS.text, marginLeft: SPACING.sm },
  markAllText: { fontSize: FONT.sm, fontWeight: "700", color: COLORS.primary },

  listContent: { paddingTop: SPACING.lg, paddingHorizontal: SPACING.lg },

  // Section label
  sectionLabel: {
    fontSize: FONT.xs, fontWeight: "700", color: COLORS.textMuted,
    letterSpacing: 0.8, marginBottom: SPACING.sm, marginTop: SPACING.xs,
  },

  // Card
  card: {
    flexDirection: "row", alignItems: "flex-start",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
    ...SHADOW.sm,
  },
  cardUnread: { backgroundColor: "#F0F4FF" },

  iconCircle: {
    width: 46, height: 46, borderRadius: 23,
    justifyContent: "center", alignItems: "center", flexShrink: 0,
  },
  cardContent:      { flex: 1 },
  cardTitleRow:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACING.xs },
  cardTitle:        { flex: 1, fontSize: FONT.md, fontWeight: "600", color: COLORS.textSecondary },
  cardTitleUnread:  { color: COLORS.text, fontWeight: "700" },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.primary, marginLeft: SPACING.sm, flexShrink: 0,
  },
  cardBody: { fontSize: FONT.sm, color: COLORS.textSecondary, lineHeight: 18, marginBottom: SPACING.xs },
  cardTime: { fontSize: FONT.xs, color: COLORS.textMuted, fontWeight: "600", letterSpacing: 0.3 },

  // Empty
  emptyWrap:  { alignItems: "center", paddingVertical: SPACING.xxxl * 2, gap: SPACING.sm },
  emptyTitle: { fontSize: FONT.xl, fontWeight: "700", color: COLORS.text },
  emptySub:   { fontSize: FONT.md, color: COLORS.textMuted, textAlign: "center" },

  // Tips card
  tipsCard: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    borderLeftWidth: 4, borderLeftColor: COLORS.primary,
    padding: SPACING.xl, marginTop: SPACING.xl, overflow: "hidden",
    ...SHADOW.sm,
  },
  tipsDecoNum: {
    position: "absolute", right: -8, bottom: -20,
    fontSize: 120, fontWeight: "900", color: COLORS.primaryLight, lineHeight: 130,
  },
  tipsContent:   { gap: SPACING.sm },
  tipsBadge: {
    alignSelf: "flex-start", backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.sm, paddingHorizontal: SPACING.sm, paddingVertical: 3,
    marginBottom: SPACING.xs,
  },
  tipsBadgeText: { fontSize: FONT.xs, fontWeight: "700", color: COLORS.primary, letterSpacing: 0.5 },
  tipsTitle:     { fontSize: FONT.xl, fontWeight: "800", color: COLORS.text },
  tipsSub:       { fontSize: FONT.sm, color: COLORS.textSecondary, lineHeight: 18 },
  tipsBtn: {
    alignSelf: "flex-start", backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm + 2,
    marginTop: SPACING.xs,
  },
  tipsBtnText: { color: COLORS.white, fontWeight: "700", fontSize: FONT.md },
});
