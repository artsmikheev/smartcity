import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { COLORS } from "@/constants/theme";
import { Eyebrow, IconButton, PrimaryButton, SectionHeading } from "@/components/app-ui";
import { ScreenContainer } from "@/components/screen-container";
import { track } from "@/lib/telemetry";

export default function ProfileScreen() {
  const router = useRouter();
  useEffect(() => { track("screen_view", { screen: "profile" }); }, []);
  return (
    <ScreenContainer safeAreaClassName="bg-background" className="px-5">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}><View><Eyebrow color={COLORS.accent}>Ваш контур</Eyebrow><Text style={styles.title}>Профиль</Text></View><IconButton icon="settings-outline" label="Настройки" onPress={() => undefined} /></View>
        <View style={styles.profileCard}><View style={styles.avatar}><Text style={styles.avatarGlyph}>○</Text></View><View style={styles.profileText}><Text style={styles.profileTitle}>Гость проекта</Text><Text style={styles.profileCopy}>Сохраните избранное и историю обращений после авторизации.</Text></View></View>
        <PrimaryButton label="Получить консультацию" icon="call-outline" onPress={() => router.push({ pathname: "/lead", params: { type: "consultation" } })} />
        <SectionHeading title="Быстрые разделы" />
        <View style={styles.menu}>{[
          ["business-outline", "О проекте", "Концепция и локация", "/about"],
          ["call-outline", "Контакты", "Telegram, MAX и офис продаж", "/contacts"],
          ["help-circle-outline", "FAQ", "Ответы на частые вопросы", "/faq"],
        ].map(([, title, copy, path], index) => <Pressable key={title} onPress={() => router.push(path as "/about" | "/contacts" | "/faq")} style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}><View style={styles.menuIcon}><Text style={styles.menuGlyph}>{["⌂", "⌁", "?"][index]}</Text></View><View style={styles.menuText}><Text style={styles.menuTitle}>{title}</Text><Text style={styles.menuCopy}>{copy}</Text></View><Text style={styles.menuArrow}>›</Text></Pressable>)}
        </View>
        <SectionHeading title="Ваши данные" />
        <View style={styles.note}><Text style={styles.lockGlyph}>⌑</Text><Text style={styles.noteText}>В MVP мы не запрашиваем лишние персональные данные. Управление согласиями подключается вместе с кабинетом клиента.</Text></View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 13, paddingBottom: 130, gap: 18 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { color: COLORS.foreground, fontSize: 32, lineHeight: 36, fontWeight: "800", letterSpacing: -1, marginTop: 6 },
  profileCard: { backgroundColor: COLORS.cardBackground, borderRadius: 22, borderWidth: 1, borderColor: COLORS.border, padding: 17, flexDirection: "row", alignItems: "center", gap: 13 },
  avatar: { width: 50, height: 50, borderRadius: 18, backgroundColor: COLORS.accent, alignItems: "center", justifyContent: "center" },
  avatarGlyph: { color: COLORS.background, fontSize: 28, lineHeight: 30, fontWeight: "900" },
  profileText: { flex: 1 },
  profileTitle: { color: COLORS.foreground, fontSize: 17, fontWeight: "800", marginBottom: 5 },
  profileCopy: { color: COLORS.muted, fontSize: 12, lineHeight: 17 },
  menu: { gap: 9 },
  menuItem: { minHeight: 72, borderRadius: 17, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.cardBackground, padding: 12, flexDirection: "row", alignItems: "center", gap: 11 },
  menuIcon: { width: 37, height: 37, borderRadius: 13, backgroundColor: COLORS.background, alignItems: "center", justifyContent: "center" },
  menuGlyph: { color: COLORS.accent, fontSize: 19, fontWeight: "800" },
  menuText: { flex: 1 },
  menuTitle: { color: COLORS.foreground, fontSize: 14, fontWeight: "800", marginBottom: 3 },
  menuCopy: { color: COLORS.muted, fontSize: 11 },
  menuArrow: { color: COLORS.mutedDark, fontSize: 25, lineHeight: 25 },
  lockGlyph: { color: COLORS.muted, fontSize: 20, lineHeight: 20 },
  note: { flexDirection: "row", alignItems: "flex-start", gap: 9, padding: 13, backgroundColor: COLORS.cardBackground, borderRadius: 15 },
  noteText: { color: COLORS.muted, fontSize: 11, lineHeight: 16, flex: 1 },
  pressed: { opacity: 0.72 },
});
