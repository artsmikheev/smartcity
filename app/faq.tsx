import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { COLORS, DEMO_NOTICE, faqs } from "@/constants/app-data";
import { Eyebrow, IconButton, PrimaryButton } from "@/components/app-ui";
import { ScreenContainer } from "@/components/screen-container";

export default function FaqScreen() {
  const router = useRouter();
  const [open, setOpen] = useState(0);
  return <ScreenContainer safeAreaClassName="bg-background" className="px-5"><Stack.Screen options={{ title: "FAQ" }} /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    <View style={styles.header}><View><Eyebrow color={COLORS.lime}>Ответы / без лишнего</Eyebrow><Text style={styles.title}>FAQ</Text></View><IconButton icon="close-outline" label="Закрыть" onPress={() => router.back()} /></View>
    <Text style={styles.intro}>Ответы должны редактироваться командой проекта без релиза приложения.</Text>
    <View style={styles.list}>{faqs.map((item, index) => <Pressable key={item.question} onPress={() => setOpen(open === index ? -1 : index)} style={styles.item}><View style={styles.itemTop}><Text style={styles.question}>{item.question}</Text><Ionicons name={open === index ? "remove" : "add"} size={18} color={COLORS.lime} /></View>{open === index ? <Text style={styles.answer}>{item.answer}</Text> : null}</Pressable>)}</View>
    <View style={styles.notice}><Text style={styles.noticeLabel}>УПРАВЛЯЕМЫЕ ДАННЫЕ</Text><Text style={styles.noticeCopy}>{DEMO_NOTICE}</Text></View>
    <PrimaryButton label="Нужна консультация" icon="chatbubble-outline" onPress={() => router.push({ pathname: "/lead", params: { type: "consultation" } })} />
  </ScrollView></ScreenContainer>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 13, paddingBottom: 35, gap: 17 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { color: COLORS.foreground, fontSize: 32, lineHeight: 36, fontWeight: "800", letterSpacing: -1, marginTop: 6 },
  intro: { color: COLORS.muted, fontSize: 14, lineHeight: 20 },
  list: { gap: 9 },
  item: { padding: 16, borderRadius: 18, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  itemTop: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  question: { color: COLORS.foreground, fontSize: 14, lineHeight: 19, fontWeight: "800", flex: 1 },
  answer: { color: COLORS.muted, fontSize: 13, lineHeight: 19, marginTop: 13, paddingTop: 13, borderTopWidth: 1, borderTopColor: COLORS.border },
  notice: { padding: 16, borderRadius: 18, backgroundColor: COLORS.surfaceRaised },
  noticeLabel: { color: COLORS.lime, fontSize: 10, letterSpacing: 1.2, fontWeight: "800", marginBottom: 7 },
  noticeCopy: { color: COLORS.muted, fontSize: 12, lineHeight: 17 },
});
