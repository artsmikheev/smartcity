import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';
import { ApartmentMedia } from '@/components/apartment-media';
import { apartmentTitle, apartmentMeta, apartmentPrice } from '@/lib/catalog-model';
import type { CatalogApartment } from '@/types/catalog';

export type ApartmentCardProps = {
  apartment: CatalogApartment;
  variant: 'horizontal' | 'compact';
  favorited: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
};
export function ApartmentCard({ apartment, variant, favorited, onPress, onToggleFavorite }: ApartmentCardProps) {
  const title = apartmentTitle(apartment);
  const price = apartmentPrice(apartment.price);
  const compact = variant === 'compact';
  const media = (
    <View testID={`card-media-zone-${apartment.id}`} style={compact ? styles.compactMediaZone : styles.mediaZone}>
      <ApartmentMedia path={apartment.plan_path} label={`${apartment.media_kind === 'schematic' ? 'Схема, демонстрационная, не в масштабе' : 'Планировка'}: ${title.replace('\n', ', ')}`} testID={`card-media-${apartment.id}`} style={[styles.media, compact && styles.compactMedia]} />
    </View>
  );
  return (
    <View testID={`apartment-card-${apartment.id}`} style={[styles.shadow, compact && styles.compact]}>
      <View testID={`card-clip-${apartment.id}`} style={[styles.clip, compact && styles.compactClip]}>
        <Pressable testID={`card-open-${apartment.id}`} accessibilityRole="button" accessibilityLabel={`${title.replace('\n', ', ')}, ${price}. Открыть квартиру`} onPress={onPress} style={({ pressed }) => [styles.columns, pressed && styles.pressed]}>
          {compact && media}
          <View testID={`card-text-${apartment.id}`} style={[styles.text, compact && styles.compactText]}>
            <Text testID={`card-title-${apartment.id}`} numberOfLines={2} style={[styles.title, compact && styles.compactTitle]}>{title}</Text>
            <Text testID={`card-meta-${apartment.id}`} numberOfLines={1} style={styles.meta}>{apartmentMeta(apartment)}</Text>
            <Text testID={`card-price-${apartment.id}`} numberOfLines={1} adjustsFontSizeToFit={compact} minimumFontScale={0.9} style={[styles.price, compact && styles.compactPrice]}>{price}</Text>
          </View>
          {!compact && media}
        </Pressable>
        <Pressable testID={`card-heart-${apartment.id}`} accessibilityRole="button" accessibilityLabel={favorited ? 'Убрать из избранного' : 'Добавить в избранное'} accessibilityState={{ selected: favorited }} aria-selected={favorited} aria-pressed={favorited} onPress={onToggleFavorite} style={({ pressed }) => [styles.heartHit, compact && styles.compactHeart, pressed && styles.pressed]}>
          <View testID={`card-heart-circle-${apartment.id}`} style={styles.heartCircle}>
            <View pointerEvents="none" style={styles.heartGlyph}>
              <Ionicons name={favorited ? 'heart' : 'heart-outline'} size={20} color="rgba(0,0,0,0.3)" accessible={false} style={styles.iconUnderlay} />
              <Ionicons name={favorited ? 'heart' : 'heart-outline'} size={20} color={favorited ? COLORS.accent : COLORS.muted} accessible={false} />
            </View>
          </View>
        </Pressable>
        <View pointerEvents="none" style={styles.edge} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  shadow: {
    height: 160, borderRadius: RADIUS.card,
    ...(process.env.EXPO_OS === 'web'
      ? { boxShadow: '0 10px 24px rgba(0,0,0,0.55)' }
      : { shadowColor: '#000000', shadowOffset: { width: 0, height: 10 }, shadowRadius: 24, shadowOpacity: 0.55, elevation: 8 }),
  },
  clip: { width: '100%', height: '100%', overflow: 'hidden', borderRadius: RADIUS.card, backgroundColor: COLORS.cardBackground, padding: SPACING.lg },
  // The inset border is structural; it must not change accepted160/padding16 geometry.
  edge: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, borderRadius: RADIUS.card, borderWidth: 1, borderColor: '#2E2C2A' },
  columns: { flex: 1, flexDirection: 'row', gap: SPACING.md },
  text: { flex: 0.55, minWidth: 0, justifyContent: 'space-between' },
  title: { ...TYPOGRAPHY.cardTitle, color: COLORS.foreground },
  meta: { ...TYPOGRAPHY.meta11, color: COLORS.muted },
  price: { ...TYPOGRAPHY.priceCard, color: COLORS.foreground, fontVariant: ['tabular-nums'] },
  mediaZone: { flex: 0.45, minWidth: 0, justifyContent: 'center', alignItems: 'flex-end' },
  media: { width: '100%', maxWidth: 128, aspectRatio: 1, borderRadius: RADIUS.image },
  heartHit: { position: 'absolute', top: SPACING.md, right: SPACING.md, width: 48, height: 48, padding: 2 },
  heartCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(28,27,26,0.85)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  heartGlyph: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  iconUnderlay: { position: 'absolute', top: 1, left: 0 },
  compact: { width: 280, height: 140 },
  compactClip: { padding: 14 },
  compactMediaZone: { width: 112, justifyContent: 'center' },
  compactMedia: { width: 112, height: 112, maxWidth: 112 },
  compactText: { flex: 1 },
  compactTitle: { fontSize: 18, lineHeight: 22 },
  compactPrice: { fontSize: 20, lineHeight: 24 },
  compactHeart: { right: undefined, left: 72, top: 12 },
  pressed: { opacity: 0.85 },
});
