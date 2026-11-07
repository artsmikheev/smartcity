import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { LeadButton } from '@/components/lead-fields';
import { ScreenContainer } from '@/components/screen-container';
import { COLORS, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import { clearAcceptedLeadReference, getAcceptedLeadReference } from '@/lib/api/leads';
import { firstLeadParam } from '@/lib/lead-model';

export default function LeadSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ preview?: string | string[] }>();
  const preview = __DEV__ && firstLeadParam(params.preview) === 'content';
  // Query-string references are deliberately ignored; they prove no mutation.
  const reference = getAcceptedLeadReference();
  const accepted = Boolean(reference) && !preview;

  function finish(destination: '/' | '/layouts') {
    clearAcceptedLeadReference();
    router.dismissTo(destination);
  }

  return (
    <ScreenContainer testID="lead-success" edges={['top', 'left', 'right', 'bottom']} safeAreaClassName="bg-background" className="px-5">
      <Stack.Screen options={{ title: accepted ? 'Заявка принята' : 'Статус заявки', headerShown: false, presentation: 'card', gestureEnabled: false }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior="automatic">
        {accepted || preview ? <>
          <View style={styles.iconCircle}><Ionicons accessible={false} aria-hidden name="checkmark" size={64} color={COLORS.accentForeground} /></View>
          {preview ? <Text testID="lead-success-preview-label" style={styles.previewLabel}>ДЕМО-ПРЕВЬЮ. ЗАЯВКА НЕ ОТПРАВЛЕНА</Text> : null}
          <Text accessibilityRole="header" style={styles.title}>{preview ? 'Заявка принята · демо' : 'Заявка принята'}</Text>
          <Text style={styles.copy}>{preview ? 'Пример экрана подтверждения. Реальная отправка не выполнялась.' : 'Спасибо. Менеджер свяжется с вами'}</Text>
          <View style={styles.referenceCard}>
            <Text style={styles.referenceLabel}>{preview ? 'ДЕМО-НОМЕР · НЕ СЕРВЕРНЫЙ' : 'НОМЕР ЗАЯВКИ'}</Text>
            <Text testID="lead-success-reference" selectable style={styles.reference}>{preview ? 'DEMO-REFERENCE' : reference}</Text>
          </View>
        </> : <>
          <View style={styles.unverifiedCircle}><Ionicons accessible={false} aria-hidden name="document-text-outline" size={40} color={COLORS.muted} /></View>
          <Text accessibilityRole="header" style={styles.title}>Нет подтверждения заявки</Text>
          <Text style={styles.copy}>На этом устройстве нет подтверждённого номера. Если вы уже отправили заявку, дождитесь связи с менеджером. Ссылка сама по себе не подтверждает отправку.</Text>
        </>}
        <View style={styles.actions}>
          <LeadButton testID="lead-success-home" label="Вернуться в приложение" onPress={() => finish('/')} />
          <LeadButton testID="lead-success-layouts" label="Посмотреть планировки" onPress={() => finish('/layouts')} secondary />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 32, paddingBottom: 40, gap: 16 },
  iconCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  unverifiedCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.cardBackground, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'PlayfairDisplay_400Regular', color: COLORS.foreground, fontSize: 28, lineHeight: 34, textAlign: 'center' },
  copy: { ...TYPOGRAPHY.body15, color: COLORS.muted, textAlign: 'center' },
  previewLabel: { color: COLORS.muted, fontSize: 11, lineHeight: 16, textAlign: 'center', fontWeight: '600' },
  referenceCard: { width: '100%', backgroundColor: COLORS.cardBackground, borderRadius: RADIUS.secondary, borderCurve: 'continuous', padding: 20, alignItems: 'center', gap: 8, marginTop: 8 },
  referenceLabel: { ...TYPOGRAPHY.meta11, color: COLORS.muted, textAlign: 'center' },
  reference: { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }), color: COLORS.foreground, fontSize: 18, lineHeight: 24, textAlign: 'center' },
  actions: { width: '100%', gap: 12, marginTop: 16 },
});
