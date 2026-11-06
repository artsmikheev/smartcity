import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/theme";
import { DEMO_NOTICE } from "@/constants/mock-data";
import { Eyebrow, IconButton, PrimaryButton, SectionHeading, SignalDot, Tag } from "@/components/app-ui";
import { ScreenContainer } from "@/components/screen-container";
import { track } from "@/lib/telemetry";

export default function HomeScreen() {
  const router = useRouter();

  useEffect(() => {
    track("screen_view", { screen: "home" });
  }, []);

  return (
    <ScreenContainer safeAreaClassName="bg-background" className="px-5">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Eyebrow color={COLORS.accent}>Наукоград / Реутов</Eyebrow>
            <Text style={styles.wordmark}>УМНЫЙ ГОРОД</Text>
          </View>
          <IconButton icon="notifications-outline" label="Уведомления" onPress={() => router.push("/profile")} />
        </View>

        <View style={styles.hero}>
          <View style={styles.heroGrid}>
            <View style={styles.heroLine} />
            <View style={styles.heroLineShort} />
          </View>
          <Tag tone="lime">Дом для новых планов</Tag>
          <Text style={styles.heroTitle}>Город, который{`\n`}движется вместе с вами.</Text>
          <Text style={styles.heroCopy}>Современная среда, архитектура и понятный следующий шаг — в одном месте.</Text>
          <PrimaryButton label="Подобрать планировку" onPress={() => { track("cta_tap", { cta: "layouts" }); router.push("/layouts"); }} />
          <Text style={styles.disclaimer}>{DEMO_NOTICE}</Text>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusTop}>
            <View style={styles.statusTitleRow}><SignalDot /><Text style={styles.statusTitle}>Статус проекта</Text></View>
            <Text style={styles.statusDate}>обновляется</Text>
          </View>
          <Text style={styles.statusHeadline}>Материалы собираются в один контур</Text>
          <Text style={styles.statusCopy}>Проверенные новости, планировки и ход строительства появятся здесь без лишнего шума.</Text>
          <View style={styles.statusRail}>
            <View style={styles.railStep}><View style={[styles.railDot, styles.railDotActive]} /><Text style={styles.railLabel}>Контур</Text></View>
            <View style={styles.railLine} />
            <View style={styles.railStep}><View style={styles.railDot} /><Text style={styles.railLabel}>Материалы</Text></View>
            <View style={styles.railLine} />
            <View style={styles.railStep}><View style={styles.railDot} /><Text style={styles.railLabel}>Обновление</Text></View>
          </View>
        </View>

        <SectionHeading title="Следующий шаг" />
        <View style={styles.actionGrid}>
          <QuickAction icon="call-outline" label="Получить консультацию" onPress={() => router.push({ pathname: "/lead", params: { type: "consultation" } })} />
          <QuickAction icon="document-text-outline" label="Получить планировку" onPress={() => router.push("/layouts")} />
        </View>

        <SectionHeading title="Коротко о проекте" action="Подробнее" onAction={() => router.push("/about")} />
        <View style={styles.aboutCard}>
          <View style={styles.aboutIcon}><Ionicons name="compass-outline" size={23} color={COLORS.accent} /></View>
          <View style={styles.aboutText}>
            <Text style={styles.aboutTitle}>Новая доминанта Реутова</Text>
            <Text style={styles.aboutCopy}>Технологичность, человеческий масштаб и продуманная городская среда.</Text>
          </View>
          <Ionicons name="arrow-up-right-box" size={19} color={COLORS.muted} />
        </View>

        <Pressable style={({ pressed }) => [styles.newsCard, pressed && styles.pressed]} onPress={() => router.push("/contacts")}>
          <View style={styles.newsTop}><Eyebrow color={COLORS.accent}>На связи</Eyebrow><Ionicons name="arrow-forward" size={17} color={COLORS.accent} /></View>
          <Text style={styles.newsTitle}>Хотите узнать первым?</Text>
          <Text style={styles.newsCopy}>Оставьте контакт — команда проекта вернётся с подтверждёнными материалами.</Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

function QuickAction({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}>
      <Ionicons name={icon} size={21} color={COLORS.accent} />
      <Text style={styles.quickLabel}>{label}</Text>
      <Ionicons name="arrow-up-right-box" size={16} color={COLORS.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 13, paddingBottom: 130, gap: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 },
  wordmark: { color: COLORS.foreground, fontSize: 17, letterSpacing: 2.5, fontWeight: "800", marginTop: 5 },
  hero: { overflow: "hidden", borderRadius: 28, backgroundColor: COLORS.cardBackground, padding: 21, paddingTop: 22, minHeight: 315, justifyContent: "flex-end", borderWidth: 1, borderColor: COLORS.border },
  heroGrid: { position: "absolute", right: -14, top: 0, width: 190, height: 200, transform: [{ rotate: "-12deg" }] },
  heroLine: { position: "absolute", top: 43, left: 0, width: 220, height: 1, backgroundColor: COLORS.accent + "55" },
  heroLineShort: { position: "absolute", top: 91, left: 32, width: 156, height: 1, backgroundColor: COLORS.accent + "33" },
  heroTitle: { color: COLORS.foreground, fontSize: 32, lineHeight: 35, letterSpacing: -1.1, fontWeight: "800", marginTop: 18, marginBottom: 10 },
  heroCopy: { color: COLORS.muted, fontSize: 14, lineHeight: 21, maxWidth: 290, marginBottom: 18 },
  disclaimer: { color: COLORS.mutedDark, fontSize: 10, lineHeight: 14, marginTop: 12 },
  statusCard: { backgroundColor: COLORS.cardBackground, borderRadius: 22, padding: 18, borderWidth: 1, borderColor: COLORS.border },
  statusTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  statusTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusTitle: { color: COLORS.foreground, fontSize: 13, fontWeight: "800" },
  statusDate: { color: COLORS.mutedDark, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.7 },
  statusHeadline: { color: COLORS.foreground, fontSize: 20, lineHeight: 24, fontWeight: "800", letterSpacing: -0.5, marginBottom: 7 },
  statusCopy: { color: COLORS.muted, fontSize: 13, lineHeight: 19 },
  statusRail: { flexDirection: "row", alignItems: "center", marginTop: 21 },
  railStep: { alignItems: "center", gap: 7 },
  railDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: COLORS.mutedDark },
  railDotActive: { backgroundColor: COLORS.accent, shadowColor: COLORS.accent, shadowOpacity: 0.7, shadowRadius: 6 },
  railLine: { flex: 1, height: 1, marginHorizontal: 8, backgroundColor: COLORS.border },
  railLabel: { color: COLORS.muted, fontSize: 9, textTransform: "uppercase", letterSpacing: 0.5 },
  actionGrid: { flexDirection: "row", gap: 10 },
  quickAction: { flex: 1, minHeight: 108, padding: 14, backgroundColor: COLORS.cardBackground, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, justifyContent: "space-between" },
  quickLabel: { color: COLORS.foreground, fontSize: 13, lineHeight: 17, fontWeight: "700", maxWidth: 110 },
  aboutCard: { minHeight: 98, backgroundColor: COLORS.cardBackground, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, padding: 15, flexDirection: "row", alignItems: "center", gap: 12 },
  aboutIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: COLORS.background, alignItems: "center", justifyContent: "center" },
  aboutText: { flex: 1 },
  aboutTitle: { color: COLORS.foreground, fontSize: 15, fontWeight: "800", marginBottom: 5 },
  aboutCopy: { color: COLORS.muted, fontSize: 12, lineHeight: 17 },
  newsCard: { backgroundColor: COLORS.foreground, borderRadius: 22, padding: 18, minHeight: 126 },
  newsTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  newsTitle: { color: COLORS.background, fontSize: 20, fontWeight: "800", letterSpacing: -0.4, marginBottom: 6 },
  newsCopy: { color: COLORS.background + "AA", fontSize: 13, lineHeight: 18, maxWidth: 280 },
  pressed: { opacity: 0.75, transform: [{ scale: 0.985 }] },
});
