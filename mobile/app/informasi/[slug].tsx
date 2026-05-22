import { useState, useCallback } from "react";
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "@/lib/api";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "@/constants/theme";

// ─── Types ────────────────────────────────────────────────────────────────────

interface KontenDetail {
  id: number;
  judul: string;
  slug: string;
  tipe: string;
  konten: string;
  penulis: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const TIPE_MAP: Record<string, { bg: string; text: string; label: string }> = {
  berita:     { bg: COLORS.primaryLight, text: COLORS.primary, label: "BERITA"     },
  pengumuman: { bg: "#FEF3C7",           text: "#92400E",       label: "PENGUMUMAN" },
  agenda:     { bg: "#F0FDF4",           text: "#166534",       label: "AGENDA"     },
};

function formatTanggal(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
  } catch { return iso; }
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function DetailInformasiScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets   = useSafeAreaInsets();
  const [data, setData]             = useState<KontenDetail | null>(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get(`/api/informasi/${slug}`);
      setData(res.data.data ?? res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { setLoading(true); fetchData(); }, [slug]));

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.textMuted} />
        <Text style={styles.errorText}>Konten tidak ditemukan.</Text>
      </View>
    );
  }

  const tc = TIPE_MAP[data.tipe] ?? TIPE_MAP.berita;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, SPACING.md) + SPACING.xxl }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); fetchData(); }}
          tintColor={COLORS.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Thumbnail hero */}
      <View style={styles.hero}>
        <Ionicons name="image-outline" size={36} color="#CCCCCC" />
      </View>

      <View style={styles.body}>
        {/* Badge tipe */}
        <View style={[styles.badge, { backgroundColor: tc.bg }]}>
          <Text style={[styles.badgeText, { color: tc.text }]}>{tc.label}</Text>
        </View>

        {/* Judul */}
        <Text style={styles.judul}>{data.judul}</Text>

        {/* Meta */}
        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.meta}>{formatTanggal(data.created_at)}</Text>
          {data.penulis ? (
            <>
              <Text style={styles.metaDot}>·</Text>
              <Ionicons name="person-outline" size={13} color={COLORS.textMuted} />
              <Text style={styles.meta}>{data.penulis}</Text>
            </>
          ) : null}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Konten */}
        <Text style={styles.konten}>{data.konten}</Text>
      </View>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:    { flex: 1, backgroundColor: COLORS.white },
  center:    { flex: 1, justifyContent: "center", alignItems: "center", gap: SPACING.md, padding: SPACING.xxxl },
  errorText: { fontSize: FONT.md, color: COLORS.textMuted },

  // Hero
  hero: {
    height: 200, backgroundColor: "#F0F0F0",
    justifyContent: "center", alignItems: "center",
  },

  // paddingBottom set dynamically
  body: { padding: SPACING.lg },

  // Badge
  badge:     { alignSelf: "flex-start", paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.xs, marginBottom: SPACING.md },
  badgeText: { fontSize: FONT.xs, fontWeight: "700" },

  judul: {
    fontSize: FONT.xxxl, fontWeight: "800", color: COLORS.text,
    lineHeight: 32, marginBottom: SPACING.md,
  },

  metaRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: SPACING.xs, marginBottom: SPACING.xl },
  meta:    { fontSize: FONT.sm, color: COLORS.textMuted },
  metaDot: { fontSize: FONT.sm, color: COLORS.textMuted },

  divider: { height: 1, backgroundColor: COLORS.divider, marginBottom: SPACING.xl },

  konten: { fontSize: FONT.lg, color: COLORS.text, lineHeight: 28 },
});
