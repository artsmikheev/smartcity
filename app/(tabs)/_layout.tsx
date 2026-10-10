import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { COLORS } from "@/constants/app-data";
import { HapticTab } from "@/components/haptic-tab";

const icons = {
  index: ["home-outline", "home"] as const,
  layouts: ["grid-outline", "grid"] as const,
  construction: ["analytics-outline", "analytics"] as const,
  profile: ["person-outline", "person"] as const,
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: COLORS.lime,
        tabBarInactiveTintColor: COLORS.mutedDark,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: [styles.tabBar, { paddingBottom: bottomPadding, height: 62 + bottomPadding }],
        tabBarIcon: ({ color, focused }) => {
          const iconSet = icons[route.name as keyof typeof icons] ?? icons.index;
          return <Ionicons name={iconSet[focused ? 1 : 0]} size={21} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Главная" }} />
      <Tabs.Screen name="layouts" options={{ title: "Планировки" }} />
      <Tabs.Screen name="construction" options={{ title: "Стройка" }} />
      <Tabs.Screen name="profile" options={{ title: "Профиль" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: { backgroundColor: COLORS.background, borderTopColor: COLORS.border, borderTopWidth: 1, paddingTop: 8 },
  tabLabel: { fontSize: 10, fontWeight: "700" },
});
