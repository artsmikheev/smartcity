import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/theme";
import { DEMO_NOTICE } from "@/constants/mock-data";
import { Eyebrow, IconButton, PrimaryButton, Tag } from "@/components/app-ui";
import { ScreenContainer } from "@/components/screen-container";

export default function AboutScreen() {
  const router = useRouter();
  return <ScreenContainer safeAreaClassName="bg-background" className="px-5"><Stack.Screen options={{ title: "О проекте" }} /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    <View style={styles.header}><View><Eyebrow color={COLORS.accent}>Контекст / проект</Eyebrow><Text style={styles.title}>О проекте</Text></View><IconButton icon="close-outline" label="Закрыть" onPress={() => router.back()} /></View>
    <View style={styles.hero}><Tag tone="lime">Новая доминанта Реутова</Tag><Text style={styles.heroTitle}>Дом для новых планов.</Text><Text style={styles.heroCopy}>ЖК «Умный город» — проект на стыке современной архитектуры, инженерной культуры и человеческого масштаба.</Text></View>
    <View style={styles.fact}><Ionicons name="location-outline" size={20} color={COLORS.accent} /><View style={styles.factText}><Text style={styles.factTitle}>Локация</Text><Text style={styles.factCopy}>Московская область, г. Реутов, ул. Ашхабадская, ул. Дзержинского.</Text></View></View>
    <View style={styles.fact}><Ionicons name="bus-outline" size={20} color={COLORS.accent} /><View style={styles.factText}><Text style={styles.factTitle}>Транспорт</Text><Text style={styles.factCopy}>Маркетинговые расстояния и транспортные заявления показываем только после проверки актуальности.</Text></View></View>
    <View style={styles.note}><Text style={styles.noteLabel}>ПРИНЦИП</Text><Text style={styles.noteText}>Показывать факты с датой и источником. Не подменять подтверждение обещанием.</Text></View>
    <Text style={styles.disclaimer}>{DEMO_NOTICE}</Text>
    <PrimaryButton label="Подобрать планировку" onPress={() => router.push("/layouts")} />
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 13, paddingBottom: 35, gap: 15 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  title: { color: COLORS.foreground, fontSize: 32, lineHeight: 36, fontWeight: "800", letterSpacing: -1, marginTop: 6 },
  hero: { backgroundColor: COLORS.foreground, padding: 19, borderRadius: 24, minHeight: 192, justifyContent: "flex-end" },
  heroTitle: { color: COLORS.background, fontSize: 29, lineHeight: 33, fontWeight: "800", letterSpacing: -0.8, marginTop: 28, marginBottom: 7 },
  heroCopy: { color: COLORS.background + "AA", fontSize: 13, lineHeight: 19 },
  fact: { flexDirection: "row", gap: 13, padding: 15, borderRadius: 18, backgroundColor: COLORS.cardBackground, borderWidth: 1, borderColor: COLORS.border },
  factText: { flex: 1 },
  factTitle: { color: COLORS.foreground, fontSize: 15, fontWeight: "800", marginBottom: 5 },
  factCopy: { color: COLORS.muted, fontSize: 13, lineHeight: 19 },
  note: { padding: 16, borderRadius: 18, backgroundColor: COLORS.cardBackground },
  noteLabel: { color: COLORS.accent, fontSize: 10, letterSpacing: 1.2, fontWeight: "800", marginBottom: 7 },
  noteText: { color: COLORS.foreground, fontSize: 14, lineHeight: 20, fontWeight: "700" },
  disclaimer: { color: COLORS.mutedDark, fontSize: 10, lineHeight: 14 },
});
