import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS, RADIUS, SPACING } from "@/constants/theme";

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

// Recovery R1.2: keep construction until the favorites screen is restored.
const tabItems = [
  { name: "index", label: "Главная", icon: "home-outline", activeIcon: "home" },
  { name: "layouts", label: "Планировки", icon: "grid-outline", activeIcon: "grid" },
  { name: "construction", label: "Стройка", icon: "analytics-outline", activeIcon: "analytics" },
  { name: "profile", label: "Профиль", icon: "person-outline", activeIcon: "person" },
] as const;

function FloatingTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      testID="floating-tab-bar"
      accessibilityRole="tablist"
      accessibilityLabel="Основная навигация"
      style={[styles.pill, { bottom: SPACING.xl + insets.bottom }]}
    >
      {tabItems.map((item) => {
        const route = state.routes.find((candidate) => candidate.name === item.name);
        if (!route) return null;
        const focused = state.routes[state.index].key === route.key;

        const onPress = () => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        };

        return (
          <Pressable
            key={route.key}
            testID={`tab-${item.name}`}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: focused }}
            aria-selected={focused}
            onPress={onPress}
            onLongPress={() => navigation.emit({ type: "tabLongPress", target: route.key })}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
          >
            <View style={[styles.iconCircle, focused && styles.activeCircle]}>
              <Ionicons
                name={focused ? item.activeIcon : item.icon}
                size={focused ? 20 : 22}
                color={focused ? COLORS.accentForeground : COLORS.muted}
                accessible={false}
              />
            </View>
            <Text style={[styles.label, focused && styles.activeLabel]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: COLORS.background } }}
    >
      <Tabs.Screen name="index" options={{ title: "Главная" }} />
      <Tabs.Screen name="layouts" options={{ title: "Планировки" }} />
      <Tabs.Screen name="construction" options={{ title: "Стройка" }} />
      <Tabs.Screen name="profile" options={{ title: "Профиль" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: "absolute",
    left: SPACING.xl,
    right: SPACING.xl,
    height: 64,
    borderRadius: RADIUS.tab,
    borderCurve: "continuous",
    backgroundColor: "rgba(28,27,26,0.95)",
    flexDirection: "row",
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  },
  tab: {
    flex: 1,
    minWidth: 48,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    borderRadius: RADIUS.tab,
  },
  iconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  activeCircle: { backgroundColor: COLORS.accent },
  label: { color: COLORS.muted, fontSize: 10, lineHeight: 12 },
  activeLabel: { color: COLORS.foreground },
  pressed: { opacity: 0.8 },
});
