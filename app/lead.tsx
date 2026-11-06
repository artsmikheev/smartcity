import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { COLORS } from "@/constants/theme";
import { PrimaryButton, Tag } from "@/components/app-ui";
import { ScreenContainer } from "@/components/screen-container";
import { track } from "@/lib/telemetry";

const typeLabels: Record<string, string> = {
  consultation: "Консультация",
  layout: "Планировка",
  selection: "Подбор",
  updates: "Обновления проекта",
};

export default function LeadScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string; item?: string }>();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState("Телефон");
  const [comment, setComment] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [leadId, setLeadId] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const requestType = typeLabels[params.type ?? "consultation"] ?? typeLabels.consultation;

  const submit = () => {
    if (isSubmitting) return;
    if (name.trim().length < 2) { setError("Укажите имя — так менеджер сможет обратиться к вам."); return; }
    if (phone.replace(/\D/g, "").length < 10) { setError("Проверьте номер телефона."); return; }
    if (!consent) { setError("Подтвердите согласие на обратную связь."); return; }
    setError("");
    setIsSubmitting(true);
    track("lead_submitted", { type: requestType, channel });
    setTimeout(() => { setIsSubmitting(false); setLeadId(`UG-${String(Date.now()).slice(-6)}`); setSubmitted(true); }, 420);
  };

  if (submitted) {
    return (
      <ScreenContainer safeAreaClassName="bg-background" className="px-5">
        <Stack.Screen options={{ title: "Заявка", presentation: "modal" }} />
        <View style={styles.successWrap}>
          <View style={styles.successMark}><Ionicons name="checkmark" size={30} color={COLORS.background} /></View>
          <Tag tone="lime">Заявка создана</Tag>
          <Text style={styles.successTitle}>Следующий шаг — за командой проекта.</Text>
          <Text style={styles.successCopy}>Мы сохранили запрос «{requestType}». В реальном контуре здесь появятся ID лида и канал подтверждения.</Text>
          <View style={styles.idCard}><Text style={styles.idLabel}>ДЕМО-ID</Text><Text style={styles.idValue}>{leadId || "UG-000000"}</Text></View>
          <PrimaryButton label="Вернуться на главную" onPress={() => router.replace("/")} icon="home-outline" />
          <Pressable onPress={() => router.back()} style={styles.closeLink}><Text style={styles.closeLinkText}>Закрыть</Text></Pressable>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer safeAreaClassName="bg-background" className="px-5">
      <Stack.Screen options={{ title: "Заявка", presentation: "modal" }} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.topRow}><Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backGlyph}>⌄</Text></Pressable><Tag tone="lime">{requestType}</Tag><View style={{ width: 38 }} /></View>
          <Text style={styles.title}>{params.item ? `Запросить детали\n«${params.item}»` : "Выберите удобный\nследующий шаг"}</Text>
          <Text style={styles.copy}>Оставьте только необходимые данные. Это заявка на связь, а не автоматическое бронирование.</Text>
          <View style={styles.form}>
            <Field label="Имя" value={name} onChangeText={setName} placeholder="Как к вам обращаться?" autoCapitalize="words" />
            <Field label="Телефон" value={phone} onChangeText={setPhone} placeholder="+7 ___ ___-__-__" keyboardType="phone-pad" />
            <Text style={styles.fieldLabel}>Удобный канал связи</Text>
            <View style={styles.channelRow}>{["Телефон", "Telegram", "MAX"].map((item) => <Pressable key={item} onPress={() => setChannel(item)} style={[styles.channel, channel === item && styles.channelActive]}><Text style={[styles.channelText, channel === item && styles.channelTextActive]}>{item}</Text></Pressable>)}</View>
            <Field label="Комментарий · необязательно" value={comment} onChangeText={setComment} placeholder="Например, интересует 2-комнатная" multiline />
            <Pressable onPress={() => setConsent((value) => !value)} style={styles.consentRow}><View style={[styles.checkbox, consent && styles.checkboxActive]}>{consent ? <Ionicons name="checkmark" size={15} color={COLORS.background} /> : null}</View><Text style={styles.consentText}>Согласен(на) на обратную связь по заявке и обработку данных по политике проекта.</Text></Pressable>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <PrimaryButton label={isSubmitting ? "Сохраняем…" : "Отправить заявку"} onPress={submit} icon={isSubmitting ? "time-outline" : "arrow-forward"} />
            <Text style={styles.formHint}>В боевом контуре заявка получит уникальный ID, будет сохранена в CRM и передана ответственному менеджеру через серверную интеграцию.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

function Field({ label, value, onChangeText, placeholder, multiline, keyboardType, autoCapitalize = "sentences" }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; multiline?: boolean; keyboardType?: "default" | "phone-pad"; autoCapitalize?: "none" | "sentences" | "words" }) {
  return <View><Text style={styles.fieldLabel}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={COLORS.mutedDark} multiline={multiline} keyboardType={keyboardType} autoCapitalize={autoCapitalize} style={[styles.input, multiline && styles.inputMultiline]} /></View>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: 12, paddingBottom: 28, gap: 20 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  back: { width: 38, height: 38, borderRadius: 14, backgroundColor: COLORS.cardBackground, alignItems: "center", justifyContent: "center" },
  backGlyph: { color: COLORS.foreground, fontSize: 24, lineHeight: 24, fontWeight: "400", marginTop: -4 },
  title: { color: COLORS.foreground, fontSize: 31, lineHeight: 34, fontWeight: "800", letterSpacing: -1 },
  copy: { color: COLORS.muted, fontSize: 14, lineHeight: 20, maxWidth: 330 },
  form: { gap: 16 },
  fieldLabel: { color: COLORS.muted, fontSize: 11, fontWeight: "700", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.8 },
  input: { minHeight: 52, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.cardBackground, color: COLORS.foreground, paddingHorizontal: 15, fontSize: 14 },
  inputMultiline: { minHeight: 92, paddingTop: 14, textAlignVertical: "top" },
  channelRow: { flexDirection: "row", gap: 8 },
  channel: { flex: 1, minHeight: 44, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.cardBackground },
  channelActive: { borderColor: COLORS.accent, backgroundColor: COLORS.accent },
  channelText: { color: COLORS.muted, fontSize: 12, fontWeight: "700" },
  channelTextActive: { color: COLORS.background },
  consentRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 7, borderWidth: 1, borderColor: COLORS.mutedDark, alignItems: "center", justifyContent: "center" },
  checkboxActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  consentText: { color: COLORS.muted, fontSize: 11, lineHeight: 16, flex: 1 },
  error: { color: COLORS.error, fontSize: 12, lineHeight: 17 },
  formHint: { color: COLORS.mutedDark, fontSize: 10, lineHeight: 14, textAlign: "center" },
  successWrap: { flex: 1, justifyContent: "center", gap: 17 },
  successMark: { width: 68, height: 68, borderRadius: 24, backgroundColor: COLORS.accent, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  successTitle: { color: COLORS.foreground, fontSize: 30, lineHeight: 34, fontWeight: "800", letterSpacing: -0.9 },
  successCopy: { color: COLORS.muted, fontSize: 14, lineHeight: 21 },
  idCard: { backgroundColor: COLORS.cardBackground, borderRadius: 17, borderWidth: 1, borderColor: COLORS.border, padding: 15, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  idLabel: { color: COLORS.muted, fontSize: 10, letterSpacing: 1.3, fontWeight: "800" },
  idValue: { color: COLORS.accent, fontSize: 17, fontWeight: "800", letterSpacing: 1 },
  closeLink: { alignItems: "center", paddingVertical: 6 },
  closeLinkText: { color: COLORS.muted, fontSize: 13, fontWeight: "700" },
});
