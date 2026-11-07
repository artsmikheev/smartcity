import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { usePreventRemove, usePreventRemoveContext, useRoute } from 'expo-router/react-navigation';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { LeadButton, LeadChannels, LeadConsentField, LeadField } from '@/components/lead-fields';
import { ScreenContainer } from '@/components/screen-container';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '@/constants/theme';
import { supabaseConfigured } from '@/lib/api/catalog';
import { clearAcceptedLeadReference, fetchPublishedLeadConsent, submitLead } from '@/lib/api/leads';
import { firstLeadParam, formatRuPhone, isDemoConsent, leadFormSchema, leadHeading, toLeadServiceError, type LeadFormInput, type LeadFormValues } from '@/lib/lead-model';

export default function LeadScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string | string[]; apartment_id?: string | string[]; layout_id?: string | string[]; demo?: string | string[]; preview?: string | string[] }>();
  const type = firstLeadParam(params.type);
  const demo = firstLeadParam(params.demo) === '1';
  const previewSubmitting = __DEV__ && firstLeadParam(params.preview) === 'submitting';
  const heading = leadHeading(type);
  const phoneRef = useRef<TextInput>(null);
  const submitLock = useRef(false);
  const successTransitionStarted = useRef(false);
  const modalCloseRef = useRef<View>(null);
  const [sending, setSending] = useState(false);
  const [successPending, setSuccessPending] = useState(false);
  // SDK 57 exposes its installed React Navigation hooks through Expo Router.
  usePreventRemove(sending, () => {});
  const { key: routeKey } = useRoute();
  const { preventedRoutes } = usePreventRemoveContext();
  const removalPrevented = Boolean(preventedRoutes[routeKey]?.preventRemove);
  const [submitError, setSubmitError] = useState('');
  const [consentOpen, setConsentOpen] = useState(false);
  const [reviewedVersion, setReviewedVersion] = useState<string | null>(null);
  const [acceptedVersion, setAcceptedVersion] = useState<string | null>(null);
  const [consentedAt, setConsentedAt] = useState<string | null>(null);
  const consentQuery = useQuery({
    queryKey: ['lead', 'published-consent'],
    queryFn: ({ signal }) => fetchPublishedLeadConsent(signal),
    enabled: supabaseConfigured && !previewSubmitting,
    retry: false,
    staleTime: 60_000,
  });
  const consentDocument = consentQuery.data;
  const demoConsent = consentDocument ? isDemoConsent(consentDocument) : false;
  const busy = sending || previewSubmitting;
  const { control, handleSubmit, setValue, formState: { errors } } = useForm<LeadFormInput, unknown, LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: { name: '', phone: '', channel: 'call', consent: false },
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
    shouldFocusError: true,
  });

  useEffect(() => { clearAcceptedLeadReference(); }, []);

  useEffect(() => {
    // Wait for the provider update too, not just the local sending state.
    if (!successPending || sending || removalPrevented || successTransitionStarted.current) return;
    successTransitionStarted.current = true;
    router.replace('/lead/success');
  }, [successPending, sending, removalPrevented, router]);

  function close() {
    if (busy) return;
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  function toggleConsent(current: boolean) {
    if (busy) return;
    if (current) {
      setValue('consent', false, { shouldValidate: true });
      setConsentedAt(null);
      setAcceptedVersion(null);
      return;
    }
    if (!consentDocument || demoConsent || reviewedVersion !== consentDocument.version) {
      setConsentOpen(true);
      return;
    }
    setConsentedAt(new Date().toISOString());
    setAcceptedVersion(consentDocument.version);
    setValue('consent', true, { shouldValidate: true });
  }

  function closeConsent() {
    if (consentDocument) setReviewedVersion(consentDocument.version);
    setConsentOpen(false);
  }

  async function onValid(values: LeadFormValues) {
    setSubmitError('');
    if (!consentDocument || demoConsent || reviewedVersion !== consentDocument.version || acceptedVersion !== consentDocument.version || !consentedAt) {
      setValue('consent', false);
      setSubmitError(demoConsent ? 'Опубликован только демо-текст. Юридическая редакция не утверждена; отправка недоступна.' : 'Откройте актуальный текст согласия и подтвердите его перед отправкой.');
      return;
    }
    setSending(true);
    try {
      await submitLead(values, {
        type,
        apartmentId: firstLeadParam(params.apartment_id),
        layoutId: firstLeadParam(params.layout_id),
        demo,
      }, consentDocument, consentedAt);
      setSuccessPending(true);
    } catch (error) {
      const safeError = toLeadServiceError(error);
      setSubmitError(safeError.message);
      if (safeError.code === 'consent_unavailable') {
        setValue('consent', false);
        setConsentedAt(null);
        setAcceptedVersion(null);
        setReviewedVersion(null);
        void consentQuery.refetch();
      }
    } finally {
      setSending(false);
    }
  }

  // The lock is acquired before async validation, not after a render/network tick.
  function send() {
    if (submitLock.current || busy) return;
    submitLock.current = true;
    void handleSubmit(onValid, () => {
      setSubmitError(!supabaseConfigured ? 'Сервис заявок не подключён. Отправка недоступна.' : 'Проверьте отмеченные поля и подтвердите согласие.');
    })().catch((error: unknown) => setSubmitError(toLeadServiceError(error).message)).finally(() => { submitLock.current = false; });
  }

  const consentStatus = previewSubmitting ? null
    : !supabaseConfigured ? 'Текст согласия станет доступен после подключения сервиса.'
    : consentQuery.isPending ? 'Загружаем текст согласия…'
    : consentQuery.isError ? 'Не удалось загрузить согласие. Откройте ссылку и повторите загрузку.'
    : demoConsent ? 'Демо-текст согласия. Не утверждён; реальная отправка недоступна.'
    : reviewedVersion !== consentDocument?.version ? 'Перед согласием откройте и прочитайте текст.' : null;

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']} safeAreaClassName="bg-background" className="px-5" testID="lead-screen">
      <Stack.Screen options={{ title: 'Оставить заявку', headerShown: false, presentation: 'card' }} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" contentInsetAdjustmentBehavior="automatic">
          <View style={styles.headerRow}>
            <Text style={styles.kicker}>{heading.kicker}</Text>
            <Pressable testID="lead-close" accessibilityRole="button" accessibilityLabel="Закрыть заявку" accessibilityState={{ disabled: busy }} disabled={busy} onPress={close} style={({ pressed }) => [styles.closeHit, pressed && styles.pressed]}>
              <View style={styles.closeCircle}><Ionicons accessible={false} aria-hidden name="close" size={22} color={COLORS.foreground} /></View>
            </Pressable>
          </View>
          <Text accessibilityRole="header" style={styles.title}>{heading.title}</Text>
          <Text style={styles.copy}>Расскажем о проекте и подберём следующий шаг</Text>
          <View style={styles.form}>
            {submitError ? <View testID="lead-error" accessibilityRole="alert" accessibilityLiveRegion="polite">
              <View style={styles.errorBox}><Ionicons accessible={false} aria-hidden name="alert-circle-outline" size={20} color={COLORS.error} /><Text selectable style={styles.errorText}>{submitError}</Text></View>
            </View> : null}
            <Controller control={control} name="name" render={({ field }) => (
              <LeadField id="lead-name" testID="inputname" label="ИМЯ" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} ref={field.ref} placeholder="Как к вам обращаться?" autoCapitalize="words" autoComplete="name" textContentType="name" returnKeyType="next" onSubmitEditing={() => phoneRef.current?.focus()} editable={!busy} error={errors.name?.message} />
            )} />
            <Controller control={control} name="phone" render={({ field }) => (
              <LeadField id="lead-phone" testID="inputphone" label="НОМЕР ТЕЛЕФОНА" value={field.value} onChangeText={(value) => field.onChange(formatRuPhone(value))} onBlur={field.onBlur} ref={(node) => { phoneRef.current = node; field.ref(node); }} placeholder="+7 (___) ___-__-__" keyboardType="phone-pad" inputMode="tel" autoComplete="tel" textContentType="telephoneNumber" autoCorrect={false} autoCapitalize="none" returnKeyType="done" onSubmitEditing={send} editable={!busy} error={errors.phone?.message} />
            )} />
            <Controller control={control} name="channel" render={({ field }) => <LeadChannels value={field.value} onChange={field.onChange} disabled={busy} error={errors.channel?.message} />} />
            <Controller control={control} name="consent" render={({ field }) => <LeadConsentField checked={field.value && acceptedVersion === consentDocument?.version} disabled={busy} onToggle={() => toggleConsent(field.value && acceptedVersion === consentDocument?.version)} onRead={() => setConsentOpen(true)} error={errors.consent?.message} />} />
            {consentStatus ? <Text testID="lead-consent-status" accessibilityLiveRegion="polite" style={styles.status}>{consentStatus}</Text> : null}
            <View style={styles.submitWrap}>
              <LeadButton testID="lead-submit" label="Отправить" onPress={send} busy={busy} disabled={busy} />
              {previewSubmitting ? <Text testID="lead-preview-note" accessibilityLiveRegion="polite" style={styles.status}>Демо-состояние: отправка не выполняется</Text> : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal visible={consentOpen} transparent animationType="none" onRequestClose={closeConsent} onShow={() => {
        if (consentDocument) setReviewedVersion(consentDocument.version);
        modalCloseRef.current?.focus();
      }}>
        <View style={styles.modalBackdrop}>
          <View testID="lead-consent-modal" role="dialog" aria-modal accessibilityLabel="Согласие на обработку данных" accessibilityViewIsModal style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text accessibilityRole="header" style={styles.modalTitle}>Согласие на обработку данных</Text>
              <Pressable ref={modalCloseRef} accessibilityRole="button" accessibilityLabel="Закрыть текст согласия" onPress={closeConsent} style={({ pressed }) => [styles.closeHit, pressed && styles.pressed]}><Ionicons accessible={false} aria-hidden name="close" size={24} color={COLORS.foreground} /></Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.modalBody}>
              {consentDocument ? <>
                <Text style={styles.status}>Версия {consentDocument.version}</Text>
                {demoConsent ? <Text style={styles.demoNotice}>ДЕМО-ТЕКСТ. НЕ УТВЕРЖДЁН. Не используется для реальной отправки заявки.</Text> : null}
                <Text selectable style={styles.copy}>{consentDocument.body}</Text>
                <Text selectable style={styles.status}>Правовое основание: {consentDocument.legal_basis}</Text>
              </> : consentQuery.isFetching ? <><ActivityIndicator color={COLORS.accent} /><Text style={styles.copy}>Загружаем текст согласия…</Text></> : <Text selectable style={styles.copy}>{!supabaseConfigured ? 'Сервис не подключён. Опубликованный текст согласия недоступен; отправка заявки не выполняется.' : 'Не удалось получить опубликованный текст согласия. Повторите загрузку или вернитесь позже.'}</Text>}
            </ScrollView>
            <LeadButton label={consentDocument ? 'Вернуться к форме' : 'Закрыть'} onPress={closeConsent} secondary />
            {!consentDocument && supabaseConfigured && !consentQuery.isFetching ? <LeadButton testID="lead-consent-retry" label="Повторить загрузку" onPress={() => { void consentQuery.refetch(); }} secondary /> : null}
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingTop: 12, paddingBottom: 32 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  kicker: { ...TYPOGRAPHY.meta11, color: COLORS.muted, fontWeight: '500' },
  closeHit: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  closeCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.cardBackground, alignItems: 'center', justifyContent: 'center' },
  title: { ...TYPOGRAPHY.display32, color: COLORS.foreground },
  copy: { ...TYPOGRAPHY.body15, color: COLORS.muted, marginTop: 8 },
  form: { marginTop: 24, gap: 16 },
  errorBox: { padding: 12, borderRadius: RADIUS.secondary, borderWidth: 1, borderColor: COLORS.error, backgroundColor: COLORS.cardBackground, flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  errorText: { ...TYPOGRAPHY.body13, color: COLORS.error, flex: 1 },
  status: { ...TYPOGRAPHY.body13, color: COLORS.muted },
  submitWrap: { marginTop: 8, gap: 12 },
  pressed: { opacity: 0.7 },
  modalBackdrop: { flex: 1, backgroundColor: COLORS.scrim, justifyContent: 'center', padding: SPACING.xl },
  modalCard: { backgroundColor: COLORS.cardBackground, borderRadius: RADIUS.sheet, borderCurve: 'continuous', padding: 20, maxHeight: '90%', gap: 16 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modalTitle: { ...TYPOGRAPHY.display22, color: COLORS.foreground, flex: 1 },
  modalBody: { gap: 12, paddingBottom: 16 },
  demoNotice: { color: COLORS.error, fontSize: 13, lineHeight: 20 },
});
