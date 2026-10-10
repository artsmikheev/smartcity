import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { COLORS, DEMO_NOTICE, constructionUpdates } from "@/constants/app-data";
import { Eyebrow, IconButton, PrimaryButton, SectionHeading, SignalDot, Tag } from "@/components/app-ui";
import { ScreenContainer } from "@/components/screen-container";
import { track } from "@/lib/telemetry";

export default function ConstructionScreen() {
  const router = useRouter();
  useEffect(() => { track("screen_view", { screen: "construction" }); }, []);

  return (
    <ScreenContainer safeAreaClassName="bg-background" className="px-5">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}><View><Eyebrow color={COLORS.lime}>Лента / подтверждение</Eyebrow><Text style={styles.title}>Ход стройки</Text></View><IconButton icon="share-outline" label="Поделиться" onPress={() => undefined} /></View>
        <View style={styles.hero}>
          <View style={styles.heroTop}><Tag tone="amber">На проверке</Tag><Text style={styles.heroDate}>обновление скоро</Text></View>
          <Text style={styles.heroTitle}>Прогресс без догадок</Text>
          <Text style={styles.heroCopy}>Мы покажем этап, дату съёмки и комментарий проекта только после проверки материалов.</Text>
          <View style={styles.progressTrack}><View style={styles.progressFill} /></View>
          <View style={styles.progressLabels}><Text style={styles.progressLabel}>Контур</Text><Text style={styles.progressLabel}>Материалы</Text><Text style={styles.progressLabel}>Публикация</Text></View>
        </View>
        <View style={styles.notice}><SignalDot color={COLORS.amber} /><Text style={styles.noticeText}>{DEMO_NOTICE}</Text></View>
        <SectionHeading title="Лента проекта" />
        <View style={styles.timeline}>{constructionUpdates.map((update, index) => <View key={update.id} style={styles.timelineRow}><View style={styles.timelineRail}><View style={[styles.timelineDot, { backgroundColor: update.tone }]} />{index < constructionUpdates.length - 1 ? <View style={styles.timelineLine} /> : null}</View><View style={styles.updateCard}><View style={styles.updateTop}><Eyebrow color={update.tone}>{update.label}</Eyebrow><Text style={styles.updateDate}>{update.date}</Text></View><Text style={styles.updateTitle}>{update.title}</Text><Text style={styles.updateCopy}>{update.copy}</Text></View></View>)}</View>
        <PrimaryButton label="Получить обновление первым" icon="notifications-outline" onPress={() => router.push({ pathname: "/lead", params: { type: "updates" } })} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 13, paddingBottom: 35, gap: 18 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { color: COLORS.foreground, fontSize: 32, lineHeight: 36, fontWeight: "800", letterSpacing: -1, marginTop: 6 },
  hero: { backgroundColor: COLORS.surface, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border, padding: 19 },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 21 },
  heroDate: { color: COLORS.mutedDark, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.8 },
  heroTitle: { color: COLORS.foreground, fontSize: 25, lineHeight: 30, fontWeight: "800", marginBottom: 7 },
  heroCopy: { color: COLORS.muted, fontSize: 13, lineHeight: 19 },
  progressTrack: { height: 10, backgroundColor: COLORS.background, borderRadius: 5, marginTop: 25, overflow: "hidden" },
  progressFill: { width: "35%", height: "100%", backgroundColor: COLORS.lime, borderRadius: 5 },
  progressLabels: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  progressLabel: { color: COLORS.mutedDark, fontSize: 9, textTransform: "uppercase", letterSpacing: 0.6 },
  notice: { flexDirection: "row", alignItems: "center", gap: 9, paddingHorizontal: 13, paddingVertical: 12, backgroundColor: COLORS.surfaceRaised, borderRadius: 15 },
  noticeText: { color: COLORS.muted, fontSize: 11, lineHeight: 15, flex: 1 },
  timeline: { gap: 0 },
  timelineRow: { flexDirection: "row", gap: 12 },
  timelineRail: { width: 14, alignItems: "center" },
  timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 18 },
  timelineLine: { flex: 1, width: 1, backgroundColor: COLORS.border, marginVertical: 5 },
  updateCard: { flex: 1, backgroundColor: COLORS.surface, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, padding: 15, marginBottom: 10 },
  updateTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  updateDate: { color: COLORS.mutedDark, fontSize: 10 },
  updateTitle: { color: COLORS.foreground, fontSize: 17, fontWeight: "800", marginBottom: 5 },
  updateCopy: { color: COLORS.muted, fontSize: 12, lineHeight: 18 },
});
