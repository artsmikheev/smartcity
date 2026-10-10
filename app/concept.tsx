import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import { COLORS } from "@/constants/app-data";
import { Eyebrow, PrimaryButton, Tag } from "@/components/app-ui";
import { track } from "@/lib/telemetry";

const heroImage = require("@/assets/images/reutov-terrace-view-concept.jpg");

export default function ConceptScreen() {
  const router = useRouter();
  useEffect(() => { track("screen_view", { screen: "concept" }); }, []);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ImageBackground source={heroImage} style={styles.hero} imageStyle={styles.heroImage}>
          <View style={styles.heroShade} />
          <View style={styles.heroTop}><View><Eyebrow color={COLORS.foreground}>Наукоград / Реутов</Eyebrow><Text style={styles.wordmark}>УМНЫЙ ГОРОД</Text></View><Pressable onPress={() => router.back()} style={styles.close}><Ionicons name="close" size={21} color={COLORS.foreground} /></Pressable></View>
          <View style={styles.heroCopy}><Tag tone="lime">Визуализация проекта</Tag><Text style={styles.title}>Дом, который{`\n`}открывает горизонт.</Text><Text style={styles.subtitle}>Архитектура, двор и пространство для новых планов.</Text></View>
        </ImageBackground>
        <View style={styles.panel}>
          <View style={styles.panelHeading}><View><Eyebrow color={COLORS.lime}>Концепт приложения</Eyebrow><Text style={styles.panelTitle}>Смотреть проект</Text></View><View style={styles.goldMark}><Text style={styles.goldMarkText}>УГ</Text></View></View>
          <Text style={styles.body}>Визуализация помогает почувствовать масштаб будущего проекта. В следующем шаге сюда можно добавить подтверждённые планировки, цены и ход строительства.</Text>
          <View style={styles.chips}><View style={styles.chip}><Ionicons name="business-outline" size={16} color={COLORS.lime} /><Text style={styles.chipText}>Архитектура</Text></View><View style={styles.chip}><Ionicons name="leaf-outline" size={16} color={COLORS.lime} /><Text style={styles.chipText}>Двор и сад</Text></View></View>
          <PrimaryButton label="Подобрать планировку" onPress={() => router.push("/layouts")} />
          <Text style={styles.note}>Изображение — визуализация. Фактические характеристики проекта уточняются командой.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingBottom: 26 },
  hero: { minHeight: 610, padding: 20, justifyContent: "space-between", overflow: "hidden" },
  heroImage: { resizeMode: "cover" },
  heroShade: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(27, 27, 27, 0.33)" },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  wordmark: { color: COLORS.foreground, fontSize: 17, letterSpacing: 2.8, fontWeight: "800", marginTop: 5 },
  close: { width: 42, height: 42, borderRadius: 15, borderWidth: 1, borderColor: "rgba(237, 234, 228, 0.65)", backgroundColor: "rgba(72, 72, 72, 0.65)", alignItems: "center", justifyContent: "center" },
  heroCopy: { maxWidth: 340 },
  title: { color: COLORS.foreground, fontSize: 39, lineHeight: 42, letterSpacing: -1.5, fontWeight: "800", marginTop: 18, marginBottom: 10 },
  subtitle: { color: COLORS.foreground, fontSize: 15, lineHeight: 21, maxWidth: 290 },
  panel: { backgroundColor: COLORS.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -28, padding: 21, paddingBottom: 30 },
  panelHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  panelTitle: { color: COLORS.foreground, fontSize: 27, lineHeight: 31, fontWeight: "800", marginTop: 5 },
  goldMark: { width: 44, height: 44, borderRadius: 15, backgroundColor: COLORS.lime, alignItems: "center", justifyContent: "center" },
  goldMarkText: { color: COLORS.background, fontSize: 15, fontWeight: "900", letterSpacing: 1 },
  body: { color: COLORS.muted, fontSize: 14, lineHeight: 20, marginBottom: 16 },
  chips: { flexDirection: "row", gap: 9, marginBottom: 18 },
  chip: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10 },
  chipText: { color: COLORS.foreground, fontSize: 12, fontWeight: "700" },
  note: { color: COLORS.mutedDark, fontSize: 10, lineHeight: 14, marginTop: 11 },
});
