import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';

export function CatalogSkeleton() {
  return (
    <View testID="catalog-loading" accessibilityLabel="Загрузка квартир" accessibilityState={{ busy: true }} aria-busy>
      {[1, 2, 3].map((id) => (
        <View testID={`catalog-skeleton-${id}`} key={id} style={[styles.skeleton, id < 3 && styles.separated]}>
          <View style={styles.skeletonText}>
            <View style={[styles.block, styles.titleBlock]} />
            <View style={[styles.block, styles.metaBlock]} />
            <View style={[styles.block, styles.priceBlock]} />
          </View>
          <View style={[styles.block, styles.imageBlock]} />
        </View>
      ))}
    </View>
  );
}

export function CatalogState({ kind, unavailable, onAction }: { kind: 'empty' | 'error'; unavailable?: boolean; onAction: () => void }) {
  const error = kind === 'error';
  return (
    <View testID={`catalog-${kind}`} style={styles.state} accessibilityLiveRegion="polite" aria-live="polite">
      <View style={!error && styles.emptyCircle}>
        <Ionicons name={error ? 'cloud-offline-outline' : 'search-outline'} size={48} color={error ? COLORS.error : COLORS.background} accessible={false} />
      </View>
      <Text accessibilityRole="header" style={styles.stateTitle}>{error ? 'Не удалось загрузить' : 'Ничего не найдено'}</Text>
      <Text style={styles.stateCopy}>{error ? (unavailable ? 'Сервис временно недоступен' : 'Проверьте соединение') : 'Измените фильтры'}</Text>
      <Pressable accessibilityRole="button" onPress={onAction} style={({ pressed }) => [styles.action, error ? styles.primary : styles.secondary, pressed && styles.pressed]}>
        <Text style={[TYPOGRAPHY.buttonLabel, { color: error ? COLORS.accentForeground : COLORS.foreground }]}>{error ? 'Попробовать снова' : 'Сбросить фильтры'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  state: { minHeight: 360, alignItems: 'center', justifyContent: 'center', gap: SPACING.lg },
  stateTitle: { ...TYPOGRAPHY.display22, color: COLORS.foreground, textAlign: 'center' },
  stateCopy: { ...TYPOGRAPHY.body15, color: COLORS.muted, textAlign: 'center' },
  emptyCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.muted, alignItems: 'center', justifyContent: 'center' },
  action: { height: 52, minWidth: 240, paddingHorizontal: SPACING.xl, alignItems: 'center', justifyContent: 'center', marginTop: SPACING.sm },
  primary: { backgroundColor: COLORS.accent, borderRadius: RADIUS.primary },
  secondary: { borderColor: COLORS.border, borderWidth: 1, borderRadius: RADIUS.secondary },
  skeleton: { height: 160, borderRadius: RADIUS.card, backgroundColor: COLORS.cardBackground, padding: SPACING.lg, flexDirection: 'row', gap: SPACING.md },
  separated: { marginBottom: SPACING.lg },
  skeletonText: { flex: 0.55, justifyContent: 'space-between' },
  block: { backgroundColor: COLORS.muted, opacity: 0.5, borderRadius: 4 },
  titleBlock: { width: '85%', height: 48 },
  metaBlock: { width: '95%', height: 14 },
  priceBlock: { width: '92%', height: 26 },
  imageBlock: { flex: 0.45, aspectRatio: 1, maxWidth: 128, alignSelf: 'center', borderRadius: RADIUS.image },
  pressed: { opacity: 0.85 },
});
