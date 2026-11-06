import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import { COLORS } from "@/constants/theme";
import { DEMO_NOTICE } from "@/constants/mock-data";
import { Eyebrow, PrimaryButton, SignalDot, Tag } from "@/components/app-ui";
import { track } from "@/lib/telemetry";

export default function DevicePreviewScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isDesktop = width > 520;
  const phoneHeight = isDesktop ? Math.min(844, Math.max(650, height - 96)) : height;
  const phoneWidth = isDesktop ? Math.min(390, phoneHeight * (390 / 844)) : width;

  useEffect(() => {
    track("screen_view", { screen: "device-preview" });
  }, []);

  return (
    <View style={styles.stage}>
      <StatusBar style="light" />
      {isDesktop ? <Text style={styles.stageLabel}>МОБИЛЬНЫЙ КОНЦЕПТ · SMART CITY</Text> : null}
      <View style={[styles.phone, { width: phoneWidth, height: phoneHeight, borderRadius: isDesktop ? 42 : 0 }]}>
        {isDesktop ? <View style={styles.speaker} /> : null}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.screenContent}>
          <View style={styles.header}>
            <View><Eyebrow color={COLORS.accent}>Наукоград / Реутов</Eyebrow><Text style={styles.wordmark}>УМНЫЙ ГОРОД</Text></View>
            <View style={styles.headerButton}><Text style={styles.headerDot}>•</Text></View>
          </View>
          <View style={styles.hero}>
            <View style={styles.heroLine} />
            <Tag tone="lime">Дом для новых планов</Tag>
            <Text style={styles.heroTitle}>Город, который{`\n`}движется вместе с вами.</Text>
            <Text style={styles.heroCopy}>Современная среда, архитектура и понятный следующий шаг — в одном месте.</Text>
            <PrimaryButton label="Подобрать планировку" onPress={() => router.push("/layouts")} />
            <Text style={styles.disclaimer}>{DEMO_NOTICE}</Text>
          </View>
          <View style={styles.statusCard}>
            <View style={styles.statusTop}><View style={styles.statusTitleRow}><SignalDot /><Text style={styles.statusTitle}>Статус проекта</Text></View><Text style={styles.statusDate}>обновляется</Text></View>
            <Text style={styles.statusHeadline}>Материалы собираются в один контур</Text>
            <Text style={styles.statusCopy}>Проверенные новости, планировки и ход строительства появятся здесь без лишнего шума.</Text>
            <View style={styles.rail}><View style={styles.railDotActive} /><View style={styles.railLine} /><View style={styles.railDot} /><View style={styles.railLine} /><View style={styles.railDot} /></View>
          </View>
          <Text style={styles.sectionTitle}>Следующий шаг</Text>
          <View style={styles.actionRow}><Pressable onPress={() => router.push({ pathname: "/lead", params: { type: "consultation" } })} style={styles.action}><Ionicons name="call-outline" size={20} color={COLORS.accent} /><Text style={styles.actionText}>Получить консультацию</Text></Pressable><Pressable onPress={() => router.push("/layouts")} style={styles.action}><Ionicons name="document-text-outline" size={20} color={COLORS.accent} /><Text style={styles.actionText}>Получить планировку</Text></Pressable></View>
        </ScrollView>
        <View style={styles.tabBar}><Tab icon="home" label="Главная" active /><Tab icon="grid-outline" label="Планировки" /><Tab icon="analytics-outline" label="Стройка" /><Tab icon="person-outline" label="Профиль" /></View>
      </View>
    </View>
  );
}

function Tab({ icon, label, active = false }: { icon: keyof typeof Ionicons.glyphMap; label: string; active?: boolean }) {
  return <View style={styles.tab}><Ionicons name={icon} size={18} color={active ? COLORS.accent : COLORS.muted} /><Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  stage: { flex: 1, backgroundColor: COLORS.foreground, alignItems: "center", justifyContent: "center", paddingVertical: 24 },
  stageLabel: { color: COLORS.background, fontSize: 11, letterSpacing: 1.8, fontWeight: "800", marginBottom: 12 },
  phone: { backgroundColor: COLORS.background, overflow: "hidden", borderWidth: 7, borderColor: "#242424", shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 30, shadowOffset: { width: 0, height: 16 }, elevation: 16 },
  speaker: { position: "absolute", zIndex: 3, top: 13, alignSelf: "center", width: 76, height: 17, borderRadius: 10, backgroundColor: "#242424" },
  screenContent: { padding: 20, paddingTop: 28, paddingBottom: 92, gap: 18 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  wordmark: { color: COLORS.foreground, fontSize: 16, letterSpacing: 2.4, fontWeight: "800", marginTop: 5 },
  headerButton: { width: 40, height: 40, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center" },
  headerDot: { color: COLORS.foreground, fontSize: 22, lineHeight: 18 },
  hero: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 25, padding: 18, paddingTop: 21, minHeight: 310, justifyContent: "flex-end", overflow: "hidden" },
  heroLine: { position: "absolute", right: -36, top: 55, width: 230, height: 1, backgroundColor: COLORS.accent },
  heroTitle: { color: COLORS.foreground, fontSize: 29, lineHeight: 32, letterSpacing: -0.8, fontWeight: "800", marginTop: 17, marginBottom: 9 },
  heroCopy: { color: COLORS.muted, fontSize: 13, lineHeight: 19, marginBottom: 17 },
  disclaimer: { color: COLORS.mutedDark, fontSize: 9, lineHeight: 13, marginTop: 10 },
  statusCard: { backgroundColor: COLORS.cardBackground, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, padding: 16 },
  statusTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 13 },
  statusTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusTitle: { color: COLORS.foreground, fontSize: 12, fontWeight: "800" },
  statusDate: { color: COLORS.mutedDark, fontSize: 9, letterSpacing: 0.7, textTransform: "uppercase" },
  statusHeadline: { color: COLORS.foreground, fontSize: 18, lineHeight: 22, fontWeight: "800", marginBottom: 6 },
  statusCopy: { color: COLORS.muted, fontSize: 12, lineHeight: 17 },
  rail: { flexDirection: "row", alignItems: "center", marginTop: 19 },
  railDotActive: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.accent },
  railDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.mutedDark },
  railLine: { flex: 1, height: 1, backgroundColor: COLORS.border, marginHorizontal: 7 },
  sectionTitle: { color: COLORS.foreground, fontSize: 21, fontWeight: "800", letterSpacing: -0.4 },
  actionRow: { flexDirection: "row", gap: 9 },
  action: { flex: 1, minHeight: 96, padding: 13, borderRadius: 17, borderWidth: 1, borderColor: COLORS.border, justifyContent: "space-between" },
  actionText: { color: COLORS.foreground, fontSize: 12, lineHeight: 16, fontWeight: "700" },
  tabBar: { position: "absolute", bottom: 0, left: 0, right: 0, minHeight: 65, paddingTop: 9, paddingBottom: 10, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.background, flexDirection: "row", justifyContent: "space-around" },
  tab: { alignItems: "center", gap: 4 },
  tabLabel: { color: COLORS.muted, fontSize: 9, fontWeight: "700" },
  tabLabelActive: { color: COLORS.accent },
});
