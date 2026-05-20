import { useCallback, useMemo, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "@/lib/api";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "@/constants/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PengajuanItem {
  id: number;
  no_pengajuan: string;
  jenis_surat: string;
  status: string;
  tanggal: string;
  catatan: string | null;
  url_surat?: string | null;
}

interface PengaduanItem {
  id: number;
  judul: string;
  kategori?: string;
  status: string;
  tanggal: string;
}

interface FeedItem {
  key: string;
  type: "pengajuan" | "pengaduan";
  rawId: number;
  typeLabel: string;
  title: string;
  status: string;
  tanggal: string;
  canDownload: boolean;
}

// ─── Status maps ──────────────────────────────────────────────────────────────

const P_STATUS: Record<string, { bg: string; text: string; label: string }> = {
  menunggu:            { bg: "#FEF3C7", text: "#92400E", label: "Menunggu" },
  diproses:            { bg: "#DBEAFE", text: "#1E40AF", label: "Diproses" },
  diverifikasi:        { bg: "#EDE9FE", text: "#5B21B6", label: "Verifikasi" },
  ditolak_staff:       { bg: "#FEE2E2", text: "#991B1B", label: "Ditolak" },
  menunggu_pengesahan: { bg: "#F3E8FF", text: "#6B21A8", label: "Pengesahan" },
  disetujui:           { bg: "#D1FAE5", text: "#065F46", label: "Disetujui" },
  ditolak_kepala:      { bg: "#FEE2E2", text: "#991B1B", label: "Ditolak" },
  selesai:             { bg: "#D1FAE5", text: "#065F46", label: "Selesai" },
  dibatalkan:          { bg: "#F3F4F6", text: "#6B7280", label: "Dibatalkan" },
};

const A_STATUS: Record<string, { bg: string; text: string; label: string }> = {
  menunggu: { bg: "#FEF3C7", text: "#92400E", label: "Menunggu" },
  diproses: { bg: "#DBEAFE", text: "#1E40AF", label: "Diproses" },
  selesai:  { bg: "#D1FAE5", text: "#065F46", label: "Selesai"  },
  ditolak:  { bg: "#FEE2E2", text: "#991B1B", label: "Ditolak"  },
};

const P_IN_PROGRESS = ["menunggu", "diproses", "diverifikasi", "menunggu_pengesahan"];
const A_IN_PROGRESS = ["menunggu", "diproses"];

// ─── Sub-komponen ─────────────────────────────────────────────────────────────

function Badge({ status, map }: {
  status: string;
  map: Record<string, { bg: string; text: string; label: string }>;
}) {
  const cfg = map[status] ?? { bg: "#F3F4F6", text: "#6B7280", label: status };
  return (
    <View style={[s.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[s.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

function StatCard({ icon, value, label, color }: {
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <View style={s.statCard}>
      <View style={[s.statIconWrap, { backgroundColor: color + "22" }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={s.statValue}>{String(value).padStart(2, "0")}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

type TabType = "semua" | "surat" | "pengaduan";

export default function StatusScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();

  const [tab, setTab]               = useState<TabType>("semua");
  const [pengajuan, setPengajuan]   = useState<PengajuanItem[]>([]);
  const [pengaduan, setPengaduan]   = useState<PengaduanItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [ajRes, aduRes] = await Promise.all([
        api.get("/api/pengajuan?per_page=50"),
        api.get("/api/pengaduan?per_page=50"),
      ]);
      setPengajuan(ajRes.data.data  ?? []);
      setPengaduan(aduRes.data.data ?? []);
    } catch { /* silent */ } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchData(); }, []));

  // ── Stats ──
  const stats = useMemo(() => {
    const inProgress = pengajuan.filter(p => P_IN_PROGRESS.includes(p.status)).length
                     + pengaduan.filter(a => A_IN_PROGRESS.includes(a.status)).length;
    const selesai    = pengajuan.filter(p => ["selesai", "disetujui"].includes(p.status)).length
                     + pengaduan.filter(a => a.status === "selesai").length;
    return { inProgress, selesai };
  }, [pengajuan, pengaduan]);

  // ── Unified feed ──
  const feedAll = useMemo<FeedItem[]>(() => {
    const aj: FeedItem[] = pengajuan.map(p => ({
      key: `p_${p.id}`,
      type: "pengajuan",
      rawId: p.id,
      typeLabel: "LAYANAN SURAT",
      title: p.jenis_surat,
      status: p.status,
      tanggal: p.tanggal,
      canDownload: p.status === "selesai" && !!p.url_surat,
    }));
    const adu: FeedItem[] = pengaduan.map(a => ({
      key: `a_${a.id}`,
      type: "pengaduan",
      rawId: a.id,
      typeLabel: "PENGADUAN",
      title: a.judul,
      status: a.status,
      tanggal: a.tanggal,
      canDownload: a.status === "selesai",
    }));
    return [...aj, ...adu].sort((a, b) => {
      // keep order from server (by date desc approximation)
      return a.tanggal > b.tanggal ? -1 : 1;
    });
  }, [pengajuan, pengaduan]);

  const feedSurat  = useMemo(() => feedAll.filter(i => i.type === "pengajuan"), [feedAll]);
  const feedAduan  = useMemo(() => feedAll.filter(i => i.type === "pengaduan"), [feedAll]);

  const activeFeed = tab === "semua" ? feedAll : tab === "surat" ? feedSurat : feedAduan;

  const goDetail = (item: FeedItem) => {
    if (item.type === "pengajuan") router.push(`/pengajuan/${item.rawId}` as any);
    else                           router.push(`/pengaduan/${item.rawId}` as any);
  };

  // ─── Render item ─────────────────────────────────────────────────────────────

  const renderItem = ({ item }: { item: FeedItem }) => {
    const statusMap = item.type === "pengajuan" ? P_STATUS : A_STATUS;
    const isAduan   = item.type === "pengaduan";
    return (
      <TouchableOpacity style={s.card} onPress={() => goDetail(item)} activeOpacity={0.8}>
        {/* top row */}
        <View style={s.cardTop}>
          <View style={[s.typeTag, isAduan && s.typeTagAduan]}>
            <Ionicons
              name={isAduan ? "megaphone-outline" : "document-text-outline"}
              size={10}
              color={isAduan ? "#7C3AED" : COLORS.primary}
            />
            <Text style={[s.typeTagText, isAduan && s.typeTagTextAduan]}>
              {item.typeLabel}
            </Text>
          </View>
          <Badge status={item.status} map={statusMap} />
        </View>

        {/* title */}
        <Text style={s.cardTitle} numberOfLines={2}>{item.title}</Text>

        {/* footer */}
        <View style={s.cardFooter}>
          <Ionicons name="calendar-outline" size={12} color={COLORS.textMuted} />
          <Text style={s.cardDate}>{item.tanggal}</Text>
          <TouchableOpacity
            style={s.actionLink}
            onPress={() => goDetail(item)}
            activeOpacity={0.7}
          >
            {item.canDownload ? (
              <>
                <Text style={s.actionText}>Unduh Bukti</Text>
                <Ionicons name="download-outline" size={13} color={COLORS.primary} />
              </>
            ) : (
              <>
                <Text style={s.actionText}>Detail</Text>
                <Ionicons name="chevron-forward" size={13} color={COLORS.primary} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // ─── Header list component ────────────────────────────────────────────────

  const ListHeader = () => (
    <View style={s.statsRow}>
      <StatCard
        icon="time-outline"
        value={stats.inProgress}
        label="DALAM PROSES"
        color={COLORS.primary}
      />
      <StatCard
        icon="checkmark-circle-outline"
        value={stats.selesai}
        label="TELAH SELESAI"
        color={COLORS.success}
      />
    </View>
  );

  // ─── Main render ─────────────────────────────────────────────────────────────

  return (
    <View style={s.screen}>
      {/* ── App Header ── */}
      <View style={[s.header, { paddingTop: insets.top + SPACING.md }]}>
        <Text style={s.headerTitle}>Status &amp; Riwayat</Text>
        <TouchableOpacity style={s.searchBtn} activeOpacity={0.7}>
          <Ionicons name="search-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* ── Tab bar (underline style) ── */}
      <View style={s.tabBar}>
        {(["semua", "surat", "pengaduan"] as TabType[]).map((t) => {
          const labels = { semua: "SEMUA", surat: "SURAT", pengaduan: "PENGADUAN" };
          return (
            <TouchableOpacity
              key={t}
              style={[s.tabItem, tab === t && s.tabItemActive]}
              onPress={() => setTab(t)}
              activeOpacity={0.8}
            >
              <Text style={[s.tabText, tab === t && s.tabTextActive]}>
                {labels[t]}
              </Text>
              {tab === t && <View style={s.tabUnderline} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Content ── */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : activeFeed.length === 0 ? (
        <View style={s.emptyWrap}>
          <ListHeader />
          <View style={s.emptyBody}>
            <Ionicons
              name={tab === "pengaduan" ? "megaphone-outline" : "document-outline"}
              size={44}
              color="#CCCCCC"
            />
            <Text style={s.emptyTitle}>Belum ada riwayat.</Text>
            <Text style={s.emptySub}>
              {tab === "pengaduan"
                ? "Laporan pengaduan Anda akan muncul di sini."
                : "Pengajuan surat Anda akan muncul di sini."}
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={activeFeed}
          keyExtractor={(i) => i.key}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchData(); }}
              tintColor={COLORS.primary}
            />
          }
          ListHeaderComponent={<ListHeader />}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Header
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerTitle: { fontSize: FONT.xxl, fontWeight: "800", color: COLORS.text },
  searchBtn:   { width: 36, height: 36, justifyContent: "center", alignItems: "center" },

  // Tab bar
  tabBar: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.divider,
    paddingHorizontal: SPACING.lg,
  },
  tabItem: {
    paddingVertical: SPACING.md, marginRight: SPACING.xl,
    position: "relative",
  },
  tabItemActive: {},
  tabText: {
    fontSize: FONT.sm, fontWeight: "700",
    color: COLORS.textMuted, letterSpacing: 0.5,
  },
  tabTextActive: { color: COLORS.primary },
  tabUnderline: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    height: 2, backgroundColor: COLORS.primary,
    borderRadius: 1,
  },

  // Stats
  statsRow: {
    flexDirection: "row", gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  statCard: {
    flex: 1, backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    padding: SPACING.lg, alignItems: "flex-start", ...SHADOW.sm,
  },
  statIconWrap: {
    width: 40, height: 40, borderRadius: RADIUS.md,
    justifyContent: "center", alignItems: "center",
    marginBottom: SPACING.sm,
  },
  statValue: { fontSize: FONT.xxxl, fontWeight: "800", color: COLORS.text, lineHeight: 30 },
  statLabel: { fontSize: FONT.xs, fontWeight: "700", color: COLORS.textMuted, letterSpacing: 0.5, marginTop: 2 },

  // List
  listContent: { paddingBottom: SPACING.xl },

  // Card
  card: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md + 2,
    marginBottom: SPACING.sm,
    marginHorizontal: SPACING.lg,
    ...SHADOW.sm,
  },
  cardTop: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: SPACING.sm,
  },
  typeTag: {
    flexDirection: "row", alignItems: "center", gap: SPACING.xs,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm, paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  typeTagAduan:     { backgroundColor: "#EDE9FE" },
  typeTagText:      { fontSize: FONT.xs, fontWeight: "700", color: COLORS.primary, letterSpacing: 0.3 },
  typeTagTextAduan: { color: "#7C3AED" },

  badge:     { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.sm },
  badgeText: { fontSize: FONT.xs, fontWeight: "700" },

  cardTitle: {
    fontSize: FONT.xl, fontWeight: "700", color: COLORS.text,
    lineHeight: 22, marginBottom: SPACING.md,
  },
  cardFooter: {
    flexDirection: "row", alignItems: "center", gap: SPACING.xs,
    borderTopWidth: 1, borderTopColor: COLORS.divider,
    paddingTop: SPACING.sm,
  },
  cardDate:   { fontSize: FONT.sm, color: COLORS.textMuted, flex: 1 },
  actionLink: { flexDirection: "row", alignItems: "center", gap: 3 },
  actionText: { fontSize: FONT.sm, fontWeight: "700", color: COLORS.primary },

  // Empty
  emptyWrap: { flex: 1 },
  emptyBody: {
    flex: 1, justifyContent: "center", alignItems: "center",
    gap: SPACING.sm, padding: SPACING.xxxl,
  },
  emptyTitle: { fontSize: FONT.xl, fontWeight: "700", color: COLORS.text },
  emptySub:   { fontSize: FONT.base, color: COLORS.textMuted, textAlign: "center" },
});
