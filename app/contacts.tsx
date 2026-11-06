import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/theme";
import { DEMO_NOTICE } from "@/constants/mock-data";
import { Eyebrow, IconButton, PrimaryButton } from "@/components/app-ui";
import { ScreenContainer } from "@/components/screen-container";

const telegramUrl = "https://t.me/smartcity_reutov";
const maxUrl = "https://max.ru/join/Xacz8Hb6MpLgQ9_LrdD-AyDPFBWBy8pn5uBDnygs63M";

export default function ContactsScreen() {
  const router = useRouter();
  return <ScreenContainer safeAreaClassName="bg-background" className="px-5"><Stack.Screen options={{ title: "Контакты" }} /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
    <View style={styles.header}><View><Eyebrow color={COLORS.accent}>Связь / команда</Eyebrow><Text style={styles.title}>Контакты</Text></View><IconButton icon="close-outline" label="Закрыть" onPress={() => router.back()} /></View>
    <Text style={styles.intro}>Выберите удобный канал — актуальные телефон, график и адрес офиса продаж должны приходить из админки проекта.</Text>
    <SocialCard icon="paper-plane-outline" title="Telegram" copy="Новости и обновления проекта" onPress={() => Linking.openURL(telegramUrl)} />
    <SocialCard icon="chatbubble-ellipses-outline" title="MAX" copy="Официальный канал проекта" onPress={() => Linking.openURL(maxUrl)} />
    <View style={styles.office}><View style={styles.officeTop}><Ionicons name="business-outline" size={21} color={COLORS.accent} /><Text style={styles.officeLabel}>Офис продаж</Text></View><Text style={styles.officeTitle}>Адрес и график — уточняются</Text><Text style={styles.officeCopy}>Мы не показываем неподтверждённые контактные данные. Оставьте заявку — команда вернётся с актуальной информацией.</Text></View>
    <Text style={styles.disclaimer}>{DEMO_NOTICE}</Text>
    <PrimaryButton label="Заказать обратный звонок" icon="call-outline" onPress={() => router.push({ pathname: "/lead", params: { type: "consultation" } })} />
  </ScrollView></ScreenContainer>;
}

function SocialCard({ icon, title, copy, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; copy: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.socialCard, pressed && styles.pressed]}><View style={styles.socialIcon}><Ionicons name={icon} size={22} color={COLORS.accent} /></View><View style={styles.socialText}><Text style={styles.socialTitle}>{title}</Text><Text style={styles.socialCopy}>{copy}</Text></View><Ionicons name="arrow-up-right-box" size={18} color={COLORS.muted} /></Pressable>;
}

const styles = StyleSheet.create({
  content: { paddingTop: 13, paddingBottom: 35, gap: 15 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { color: COLORS.foreground, fontSize: 32, lineHeight: 36, fontWeight: "800", letterSpacing: -1, marginTop: 6 },
  intro: { color: COLORS.muted, fontSize: 14, lineHeight: 20 },
  socialCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.cardBackground },
  socialIcon: { width: 44, height: 44, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.background },
  socialText: { flex: 1 },
  socialTitle: { color: COLORS.foreground, fontSize: 16, fontWeight: "800", marginBottom: 4 },
  socialCopy: { color: COLORS.muted, fontSize: 12 },
  office: { borderRadius: 20, padding: 17, backgroundColor: COLORS.cardBackground, borderWidth: 1, borderColor: COLORS.border },
  officeTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 17 },
  officeLabel: { color: COLORS.accent, fontSize: 11, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase" },
  officeTitle: { color: COLORS.foreground, fontSize: 19, lineHeight: 23, fontWeight: "800", marginBottom: 7 },
  officeCopy: { color: COLORS.muted, fontSize: 13, lineHeight: 19 },
  disclaimer: { color: COLORS.mutedDark, fontSize: 10, lineHeight: 14 },
  pressed: { opacity: 0.72 },
});
