import { Tabs, router } from "expo-router";
import { TouchableOpacity, View, Text, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { getUser } from "@/lib/userStorage";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "@/constants/theme";

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  { name: "home",    label: "BERANDA", icon: "home",            iconOff: "home-outline",            restricted: false },
  { name: "layanan", label: "LAYANAN", icon: "grid",            iconOff: "grid-outline",            restricted: true  },
  { name: "status",  label: "STATUS",  icon: "checkmark-circle", iconOff: "checkmark-circle-outline", restricted: true  },
  { name: "profile", label: "PROFIL",  icon: "person",          iconOff: "person-outline",          restricted: false },
] as const;

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────

function CustomTabBar({ state, navigation }: BottomTabBarProps & { userStatus?: string }) {
  const insets = useSafeAreaInsets();
  const [userStatus, setUserStatus] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    getUser().then((u) => setUserStatus(u?.status ?? null));
  }, []));

  const isVerified = userStatus === "aktif";

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom || SPACING.sm }]}>
      {state.routes.map((route, index) => {
        const tab      = TABS[index];
        const focused  = state.index === index;
        const locked   = tab.restricted && !isVerified;

        const onPress = () => {
          if (locked) {
            Alert.alert(
              "Akun Belum Aktif",
              "Lengkapi verifikasi identitas Anda untuk mengakses fitur ini.",
              [
                { text: "Nanti", style: "cancel" },
                { text: "Verifikasi Sekarang", onPress: () => router.push("/verifikasi" as any) },
              ]
            );
            return;
          }
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.75}
          >
            {focused && !locked ? (
              <View style={styles.activePill}>
                <Ionicons name={tab.icon as any} size={18} color={COLORS.white} />
                <Text style={styles.activePillLabel}>{tab.label}</Text>
              </View>
            ) : (
              <View style={styles.tabItemInner}>
                <Ionicons
                  name={tab.iconOff as any}
                  size={22}
                  color={locked ? COLORS.border : "#888888"}
                />
                {locked && (
                  <View style={styles.lockBadge}>
                    <Ionicons name="lock-closed" size={8} color={COLORS.white} />
                  </View>
                )}
                <Text style={[styles.inactiveLabel, locked && styles.lockedLabel]}>
                  {tab.label}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="layanan" />
      <Tabs.Screen name="status" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    paddingTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: "#EBEBEB",
    ...SHADOW.md,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    gap: SPACING.xs,
  },
  tabItemInner: {
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
    position: "relative",
  },
  lockBadge: {
    position: "absolute",
    top: -2, right: -6,
    width: 14, height: 14,
    borderRadius: 99,
    backgroundColor: COLORS.textMuted,
    justifyContent: "center", alignItems: "center",
  },
  lockedLabel: { color: COLORS.border },
  activePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  activePillLabel: {
    color: COLORS.white,
    fontSize: FONT.xs,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  inactiveLabel: {
    color: "#888888",
    fontSize: FONT.xs,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
