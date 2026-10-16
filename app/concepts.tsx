import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import { COLORS } from "@/constants/app-data";
import { Eyebrow, PrimaryButton, Tag } from "@/components/app-ui";
import { track } from "@/lib/telemetry";

const variants = [
  { id: "terrace", label: "Двор", kicker: "Жить внутри зелёного контура", copy: "Терраса, архитектура и пространство для новых планов.", image: require("@/assets/images/reutov-terrace-view-concept.jpg") },
  { id: "day", label: "Наукоград", kicker: "Городская доминанта", copy: "Архитектура проекта в ритме Реутова и нового городского маршрута.", image: require("@/assets/images/reutov-urban-day-concept.jpg") },
  { id: "evening", label: "Вечер", kicker: "Город включается", copy: "Свет, движение и тёплый сценарий возвращения домой.", image: require("@/assets/images/reutov-urban-evening-concept.jpg") },
] as const;

export default function ConceptsScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [activeId, setActiveId] = useState<(typeof variants)[number]["id"]>("terrace");
  const active = useMemo(() => variants.find((item) => item.id === activeId) ?? variants[0], [activeId]);
  const isDesktop = width > 520;
  const phoneHeight = isDesktop ? Math.min(844, Math.max(650, height - 96)) : height;
  const phoneWidth = isDesktop ? Math.min(390, phoneHeight * (390 / 844)) : width;

  useEffect(() => { track("screen_view", { screen: "concepts" }); }, []);

  return (
    <View style={styles.stage}>
      <StatusBar style="light" />
      {isDesktop ? <Text style={styles.stageLabel}>КОНЦЕПТЫ · СМАРТФОН · SMART CITY</Text> : null}
      <View style={[styles.phone, { width: phoneWidth, height: phoneHeight, borderRadius: isDesktop ? 42 : 0 }]}>
        {isDesktop ? <View style={styles.speaker} /> : null}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.screen}>
          <View style={styles.topbar}><View><Eyebrow color={COLORS.foreground}>Наукоград / Реутов</Eyebrow><Text style={styles.wordmark}>УМНЫЙ ГОРОД</Text></View><Pressable onPress={() => router.back()} style={styles.close}><Ionicons name="close" size={20} color={COLORS.foreground} /></Pressable></View>
          <View style={styles.selector}>{variants.map((variant) => <Pressable key={variant.id} onPress={() => setActiveId(variant.id)} style={[styles.selectorItem, active.id === variant.id && styles.selectorItemActive]}><Text style={[styles.selectorText, active.id === variant.id && styles.selectorTextActive]}>{variant.label}</Text></Pressable>)}</View>
          <ImageBackground source={active.image} style={styles.hero} imageStyle={styles.heroImage}>
            <View style={styles.heroShade} />
            <View style={styles.heroTop}><Tag tone="lime">Визуализация</Tag><Text style={styles.counter}>{variants.findIndex((item) => item.id === active.id) + 1} / {variants.length}</Text></View>
            <View style={styles.heroCopy}><Text style={styles.heroTitle}>{active.kicker}</Text><Text style={styles.heroSubtitle}>{active.copy}</Text></View>
          </ImageBackground>
          <View style={styles.panel}><View style={styles.panelHeader}><View><Eyebrow color={COLORS.lime}>Вариант концепта</Eyebrow><Text style={styles.panelTitle}>{active.label}</Text></View><View style={styles.mark}><Text style={styles.markText}>УГ</Text></View></View><Text style={styles.body}>Выберите визуальный сценарий для главного экрана приложения. Изображения взяты из материалов проекта.</Text><PrimaryButton label="Подобрать планировку" onPress={() => router.push("/layouts")} /><Text style={styles.note}>Визуализация не является подтверждением фактических характеристик.</Text></View>
        </ScrollView>
        <View style={styles.tabBar}><Tab icon="home" label="Главная" /><Tab icon="images-outline" label="Концепты" active /><Tab icon="grid-outline" label="Планировки" /><Tab icon="person-outline" label="Профиль" /></View>
      </View>
    </View>
  );
}

function Tab({ icon, label, active = false }: { icon: keyof typeof Ionicons.glyphMap; label: string; active?: boolean }) {
  return <View style={styles.tab}><Ionicons name={icon} size={17} color={active ? COLORS.lime : COLORS.muted} /><Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  stage: { flex: 1, backgroundColor: COLORS.sand, alignItems: "center", justifyContent: "center", paddingVertical: 24 },
  stageLabel: { color: COLORS.background, fontSize: 11, letterSpacing: 1.7, fontWeight: "800", marginBottom: 12 },
  phone: { backgroundColor: COLORS.background, overflow: "hidden", borderWidth: 7, borderColor: "#242424", shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 30, shadowOffset: { width: 0, height: 16 }, elevation: 16 },
  speaker: { position: "absolute", zIndex: 3, top: 13, alignSelf: "center", width: 76, height: 17, borderRadius: 10, backgroundColor: "#242424" },
  screen: { padding: 18, paddingTop: 28, paddingBottom: 86, gap: 14 },
  topbar: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  wordmark: { color: COLORS.foreground, fontSize: 16, letterSpacing: 2.4, fontWeight: "800", marginTop: 5 },
  close: { width: 40, height: 40, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center" },
  selector: { flexDirection: "row", gap: 7 },
  selectorItem: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 13, paddingHorizontal: 11, paddingVertical: 8 },
  selectorItemActive: { backgroundColor: COLORS.lime, borderColor: COLORS.lime },
  selectorText: { color: COLORS.muted, fontSize: 10, fontWeight: "800" },
  selectorTextActive: { color: COLORS.background },
  hero: { height: 478, borderRadius: 24, overflow: "hidden", justifyContent: "space-between", padding: 16 },
  heroImage: { resizeMode: "cover" },
  heroShade: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(26, 26, 26, 0.34)" },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  counter: { color: COLORS.foreground, fontSize: 11, fontWeight: "800" },
  heroCopy: { maxWidth: 300 },
  heroTitle: { color: COLORS.foreground, fontSize: 30, lineHeight: 33, letterSpacing: -0.8, fontWeight: "800", marginBottom: 8 },
  heroSubtitle: { color: COLORS.foreground, fontSize: 13, lineHeight: 18 },
  panel: { backgroundColor: COLORS.background, borderRadius: 23, borderWidth: 1, borderColor: COLORS.border, padding: 17 },
  panelHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  panelTitle: { color: COLORS.foreground, fontSize: 24, lineHeight: 28, fontWeight: "800", marginTop: 4 },
  mark: { width: 42, height: 42, borderRadius: 14, backgroundColor: COLORS.lime, alignItems: "center", justifyContent: "center" },
  markText: { color: COLORS.background, fontSize: 14, fontWeight: "900" },
  body: { color: COLORS.muted, fontSize: 12, lineHeight: 18, marginBottom: 15 },
  note: { color: COLORS.mutedDark, fontSize: 9, lineHeight: 13, marginTop: 9 },
  tabBar: { position: "absolute", bottom: 0, left: 0, right: 0, minHeight: 65, paddingTop: 9, paddingBottom: 10, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.background, flexDirection: "row", justifyContent: "space-around" },
  tab: { alignItems: "center", gap: 4 },
  tabText: { color: COLORS.muted, fontSize: 9, fontWeight: "700" },
  tabTextActive: { color: COLORS.lime },
});
