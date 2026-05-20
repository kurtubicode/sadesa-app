import { Tabs } from "expo-router";
import { TouchableOpacity, View, Text, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { COLORS, FONT, RADIUS, SHADOW, SPACING } from "@/constants/theme";

// ─── Tab config ───────────────────────────────────────────────────────────────

const TABS = [
  { name: "home",    label: "BERANDA", icon: "home",            iconOff: "home-outline"            },
  { name: "layanan", label: "LAYANAN", icon: "grid",            iconOff: "grid-outline"            },
  { name: "status",  label: "STATUS",  icon: "checkmark-circle", iconOff: "checkmark-circle-outline" },
  { name: "profile", label: "PROFIL",  icon: "person",          iconOff: "person-outline"          },
] as const;

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom || SPACING.sm }]}>
      {state.routes.map((route, index) => {
        const tab     = TABS[index];
        const focused = state.index === index;

        const onPress = () => {
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
            {focused ? (
              <View style={styles.activePill}>
                <Ionicons
                  name={tab.icon as any}
                  size={18}
                  color={COLORS.white}
                />
                <Text style={styles.activePillLabel}>{tab.label}</Text>
              </View>
            ) : (
              <>
                <Ionicons
                  name={tab.iconOff as any}
                  size={22}
                  color="#888888"
                />
                <Text style={styles.inactiveLabel}>{tab.label}</Text>
              </>
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
