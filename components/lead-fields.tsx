import { Ionicons } from '@expo/vector-icons';
import { forwardRef } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { COLORS, RADIUS, TYPOGRAPHY } from '@/constants/theme';
import type { LeadChannel } from '@/lib/lead-model';

export const LeadField = forwardRef<TextInput, TextInputProps & { label: string; error?: string; id: string }>(function LeadField({ label, error, id, style, ...props }, ref) {
  return (
    <View style={styles.field}>
      <Text nativeID={`${id}-label`} style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        ref={ref}
        nativeID={id}
        accessibilityLabel={label}
        accessibilityHint={error}
        aria-invalid={Boolean(error)}
        aria-labelledby={`${id}-label`}
        aria-describedby={error ? `${id}-error` : undefined}
        placeholderTextColor={COLORS.muted}
        style={[styles.input, error && styles.invalidBorder, style]}
      />
      {error ? <Text nativeID={`${id}-error`} style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
});

export function LeadChannels({ value, onChange, disabled, error }: { value: LeadChannel; onChange: (value: LeadChannel) => void; disabled?: boolean; error?: string }) {
  const options = [{ value: 'call', label: 'Позвонить' }, { value: 'telegram', label: 'Написать в Telegram' }] as const;
  return (
    <View style={styles.field}>
      <Text nativeID="lead-channel-label" style={styles.label}>КАНАЛ СВЯЗИ</Text>
      <View accessibilityRole="radiogroup" accessibilityLabel="Канал связи" aria-labelledby="lead-channel-label" style={styles.channelRow}>
        {options.map((option, index) => (
          <Pressable
            key={option.value}
            testID={`lead-channel-${option.value}`}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ checked: value === option.value, disabled: Boolean(disabled) }}
            aria-checked={value === option.value}
            disabled={disabled}
            onPress={() => onChange(option.value)}
            {...(Platform.OS === 'web' ? { onKeyDown: (event: { key: string; preventDefault: () => void }) => {
              if (disabled) return;
              if (event.key === ' ' || event.key === 'Spacebar') {
                event.preventDefault();
                onChange(option.value);
              } else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(event.key) >= 0) {
                event.preventDefault();
                const next = options[index === 0 ? 1 : 0];
                onChange(next.value);
                document.querySelector<HTMLElement>(`[data-testid="lead-channel-${next.value}"]`)?.focus();
              }
            } } : {})}
            style={({ pressed }) => [styles.channel, value === option.value && styles.channelActive, pressed && styles.pressed]}
          >
            <Ionicons accessible={false} aria-hidden name={value === option.value ? 'radio-button-on' : 'radio-button-off'} size={22} color={value === option.value ? COLORS.accent : COLORS.muted} />
            <Text style={styles.channelText}>{option.label}</Text>
          </Pressable>
        ))}
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

export function LeadConsentField({ checked, disabled, onToggle, onRead, error }: { checked: boolean; disabled?: boolean; onToggle: () => void; onRead: () => void; error?: string }) {
  return (
    <View>
      <View style={styles.consentRow}>
        <Pressable
          testID="lead-consent"
          accessibilityRole="checkbox"
          accessibilityLabel="Я принимаю согласие на обработку персональных данных"
          accessibilityHint={error ?? 'Сначала откройте текст согласия'}
          aria-describedby={error ? 'lead-consent-error' : undefined}
          aria-invalid={Boolean(error)}
          accessibilityState={{ checked, disabled: Boolean(disabled) }}
          aria-checked={checked}
          disabled={disabled}
          onPress={onToggle}
          {...(Platform.OS === 'web' ? { onKeyDown: (event: { key: string; preventDefault: () => void }) => {
            if (!disabled && (event.key === ' ' || event.key === 'Spacebar')) {
              event.preventDefault();
              onToggle();
            }
          } } : {})}
          style={({ pressed }) => [styles.checkboxHit, pressed && styles.pressed]}
        >
          <View style={[styles.checkbox, checked && styles.checkboxActive, error && styles.invalidBorder]}>
            {checked ? <Ionicons accessible={false} aria-hidden name="checkmark" size={16} color={COLORS.accentForeground} /> : null}
          </View>
        </Pressable>
        <View style={styles.consentCopy}>
          <Pressable accessibilityRole="button" accessibilityLabel="Я принимаю согласие на обработку персональных данных" disabled={disabled} accessibilityState={{ disabled: Boolean(disabled) }} onPress={onToggle} style={({ pressed }) => [styles.consentLabelButton, pressed && styles.pressed]}>
            <Text style={styles.consentText}>Я принимаю условия обработки данных</Text>
          </Pressable>
          <Pressable testID="lead-consent-link" accessibilityRole="button" accessibilityLabel="Открыть согласие на обработку персональных данных" disabled={disabled} accessibilityState={{ disabled: Boolean(disabled) }} onPress={onRead} style={({ pressed }) => [styles.consentLinkButton, pressed && styles.pressed]}>
            <Text style={styles.consentLink}>согласие на обработку</Text>
          </Pressable>
        </View>
      </View>
      {error ? <Text nativeID="lead-consent-error" style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

export function LeadButton({ label, onPress, testID, busy = false, disabled = false, secondary = false }: { label: string; onPress: () => void; testID?: string; busy?: boolean; disabled?: boolean; secondary?: boolean }) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, busy }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, secondary && styles.secondaryButton, disabled && styles.disabled, pressed && !disabled && styles.pressed]}
    >
      {busy ? <ActivityIndicator testID="lead-submit-spinner" size="small" color={COLORS.accentForeground} /> : null}
      <Text style={[styles.buttonLabel, secondary && styles.secondaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  label: { ...TYPOGRAPHY.meta11, color: COLORS.muted, fontWeight: '500' },
  input: { minHeight: 52, borderRadius: RADIUS.image, borderCurve: 'continuous', borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.cardBackground, color: COLORS.foreground, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, lineHeight: 22 },
  invalidBorder: { borderColor: COLORS.error },
  fieldError: { color: COLORS.error, fontSize: 11, lineHeight: 16 },
  channelRow: { flexDirection: 'row', gap: 8 },
  channel: { flex: 1, minHeight: 56, borderRadius: RADIUS.secondary, borderCurve: 'continuous', borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.cardBackground, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, gap: 8 },
  channelActive: { borderColor: COLORS.accent, backgroundColor: 'rgba(184,143,0,0.12)' },
  channelText: { color: COLORS.foreground, fontSize: 13, lineHeight: 18, flexShrink: 1 },
  consentRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 4 },
  checkboxHit: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  checkbox: { width: 22, height: 22, borderRadius: 4, borderCurve: 'continuous', borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  consentCopy: { flex: 1 },
  consentLabelButton: { minHeight: 48, justifyContent: 'center' },
  consentLinkButton: { minHeight: 48, justifyContent: 'center', alignSelf: 'flex-start' },
  consentText: { color: COLORS.muted, fontSize: 11, lineHeight: 16 },
  consentLink: { color: COLORS.accent, fontSize: 11, lineHeight: 16, textDecorationLine: 'underline' },
  button: { minHeight: 52, paddingHorizontal: 20, paddingVertical: 16, borderRadius: RADIUS.primary, backgroundColor: COLORS.accent, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  buttonLabel: { ...TYPOGRAPHY.buttonLabel, color: COLORS.accentForeground, lineHeight: 20, textAlign: 'center', flexShrink: 1 },
  secondaryButton: { borderRadius: RADIUS.secondary, borderCurve: 'continuous', backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.border, paddingVertical: 15 },
  secondaryLabel: { color: COLORS.foreground },
  disabled: { opacity: 0.65 },
  pressed: { opacity: 0.7 },
});
