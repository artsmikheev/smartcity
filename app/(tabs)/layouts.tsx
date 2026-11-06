import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/theme";
import { DEMO_NOTICE, layoutItems } from "@/constants/mock-data";
import { Eyebrow, IconButton, PrimaryButton, SectionHeading, Tag } from "@/components/app-ui";
import { ScreenContainer } from "@/components/screen-container";
import { track } from "@/lib/telemetry";

const filters = ["Все", "1-комн.", "2-комн.", "3-комн."];

export default function LayoutsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("Все");
  const visible = useMemo(() => activeFilter === "Все" ? layoutItems : layoutItems.filter((item) => item.rooms === activeFilter), [activeFilter]);

  useEffect(() => { track("screen_view", { screen: "layouts" }); }, []);

  return (
    <ScreenContainer safeAreaClassName="bg-background" className="px-5">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View><Eyebrow color={COLORS.accent}>Каталог / выбор</Eyebrow><Text style={styles.title}>Планировки</Text></View>
          <IconButton icon="options-outline" label="Фильтры" onPress={() => setActiveFilter("Все")} />
        </View>
        <Text style={styles.intro}>Соберите свой сценарий жизни — детали по площадям, ценам и наличию подтвердит менеджер.</Text>
        <View style={styles.filterRow}>
          {filters.map((filter) => <Pressable key={filter} onPress={() => { setActiveFilter(filter); track("layout_filter", { filter }); }} style={[styles.filter, activeFilter === filter && styles.filterActive]}><Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</Text></Pressable>)}
        </View>
        <View style={styles.notice}><View style={styles.noticeMark}><Text style={styles.noticeMarkText}>i</Text></View><Text style={styles.noticeText}>{DEMO_NOTICE}</Text></View>
        <SectionHeading title={`${visible.length} сценария`} />
        <View style={styles.list}>
          {visible.map((item, index) => (
            <Pressable key={item.id} style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={() => router.push({ pathname: "/lead", params: { type: "layout", item: item.title } })}>
              <View style={[styles.planPreview, { backgroundColor: item.tone === "lime" ? COLORS.accent : item.tone === "sand" ? COLORS.foreground : COLORS.accent }]}>
                <View style={styles.planFrame}><View style={styles.planRoomA} /><View style={styles.planRoomB} /><View style={styles.planRoomC} /></View>
                <Text style={styles.planNumber}>0{index + 1}</Text>
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardTop}><Tag tone={item.tone === "lime" ? "lime" : item.tone === "amber" ? "amber" : "neutral"}>{item.rooms}</Tag><Text style={styles.cardStatus}>{item.status}</Text></View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardMeta}>{item.area}  ·  {item.floor}</Text>
                <Text style={styles.cardFeature}>{item.feature}</Text>
                <View style={styles.cardAction}><Text style={styles.cardActionText}>Запросить детали</Text><Text style={styles.arrow}>↗</Text></View>
              </View>
            </Pressable>
          ))}
        </View>
        <PrimaryButton label="Не знаю, с чего начать" icon="chatbubble-ellipses-outline" onPress={() => router.push({ pathname: "/lead", params: { type: "selection" } })} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 13, paddingBottom: 130, gap: 18 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { color: COLORS.foreground, fontSize: 32, lineHeight: 36, fontWeight: "800", letterSpacing: -1, marginTop: 6 },
  intro: { color: COLORS.muted, fontSize: 14, lineHeight: 20, maxWidth: 320 },
  filterRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  filter: { paddingHorizontal: 13, paddingVertical: 10, borderRadius: 12, backgroundColor: COLORS.cardBackground, borderWidth: 1, borderColor: COLORS.border },
  filterActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  filterText: { color: COLORS.muted, fontSize: 12, fontWeight: "700" },
  filterTextActive: { color: COLORS.background },
  notice: { flexDirection: "row", gap: 9, alignItems: "center", padding: 11, borderRadius: 14, backgroundColor: COLORS.cardBackground, borderWidth: 1, borderColor: COLORS.border },
  noticeMark: { width: 20, height: 20, borderRadius: 10, backgroundColor: COLORS.accent, alignItems: "center", justifyContent: "center" },
  noticeMarkText: { color: COLORS.background, fontSize: 13, fontWeight: "900" },
  noticeText: { color: COLORS.muted, fontSize: 11, lineHeight: 15, flex: 1 },
  list: { gap: 12 },
  card: { backgroundColor: COLORS.cardBackground, borderRadius: 22, overflow: "hidden", borderWidth: 1, borderColor: COLORS.border },
  planPreview: { height: 142, position: "relative", overflow: "hidden", padding: 15 },
  planFrame: { position: "absolute", width: 160, height: 104, right: 24, top: 18, borderWidth: 2, borderColor: COLORS.background + "66", transform: [{ rotate: "-5deg" }] },
  planRoomA: { position: "absolute", left: 0, top: 0, width: 54, height: 50, borderRightWidth: 2, borderBottomWidth: 2, borderColor: COLORS.background + "66" },
  planRoomB: { position: "absolute", left: 54, top: 0, width: 55, height: 50, borderRightWidth: 2, borderBottomWidth: 2, borderColor: COLORS.background + "66" },
  planRoomC: { position: "absolute", left: 54, top: 50, width: 76, height: 52, borderTopWidth: 2, borderColor: COLORS.background + "66" },
  planNumber: { color: COLORS.background + "88", fontSize: 57, lineHeight: 60, fontWeight: "900", letterSpacing: -4 },
  cardBody: { padding: 16 },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  cardStatus: { color: COLORS.mutedDark, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.6 },
  cardTitle: { color: COLORS.foreground, fontSize: 20, fontWeight: "800", marginBottom: 5 },
  cardMeta: { color: COLORS.muted, fontSize: 12, marginBottom: 8 },
  cardFeature: { color: COLORS.muted, fontSize: 13, lineHeight: 18 },
  cardAction: { marginTop: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardActionText: { color: COLORS.accent, fontSize: 13, fontWeight: "800" },
  arrow: { color: COLORS.accent, fontSize: 18 },
  pressed: { opacity: 0.78 },
});
