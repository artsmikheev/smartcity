import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';
import { resolveMediaUrl } from '@/lib/storage';
import { apartmentTitle, apartmentMeta, apartmentPrice } from '@/lib/catalog-model';
import type { CatalogApartment } from '@/types/catalog';

export type ApartmentCardProps = {
  apartment: CatalogApartment;
  variant: 'horizontal';
  favorited: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
};

export function ApartmentCard({ apartment, favorited, onPress, onToggleFavorite }: ApartmentCardProps) {
  const source = resolveMediaUrl(apartment.plan_path);
  const title = apartmentTitle(apartment);
  const price = apartmentPrice(apartment.price);

  return (
    <View testID={`apartment-card-${apartment.id}`} style={styles.shadow}>
      <View testID={`card-clip-${apartment.id}`} style={styles.clip}>
        <Pressable
          testID={`card-open-${apartment.id}`}
          accessibilityRole="button"
          accessibilityLabel={`${title.replace('\n', ', ')}, ${price}. Запросить планировку`}
          onPress={onPress}
          style={({ pressed }) => [styles.columns, pressed && styles.pressed]}
        >
          <View testID={`card-text-${apartment.id}`} style={styles.text}>
            <Text testID={`card-title-${apartment.id}`} numberOfLines={2} style={styles.title}>{title}</Text>
            <Text testID={`card-meta-${apartment.id}`} numberOfLines={1} style={styles.meta}>{apartmentMeta(apartment)}</Text>
            <Text testID={`card-price-${apartment.id}`} numberOfLines={1} style={styles.price}>{price}</Text>
          </View>
          <View testID={`card-media-zone-${apartment.id}`} style={styles.mediaZone}>
            <View testID={`card-media-${apartment.id}`} style={styles.media}>
              {source !== null ? (
                <Image
                  source={source}
                  style={styles.image}
                  contentFit="cover"
                  transition={0}
                  recyclingKey={apartment.id}
                  accessibilityLabel={apartment.media_kind === 'plan' ? `Планировка: ${title.replace('\n', ', ')}` : 'Концептная визуализация проекта, не планировка квартиры'}
                />
              ) : (
                <Ionicons name="image-outline" size={32} color={COLORS.muted} accessible={false} />
              )}
            </View>
          </View>
        </Pressable>
        <Pressable
          testID={`card-heart-${apartment.id}`}
          accessibilityRole="button"
          accessibilityLabel={favorited ? 'Убрать из избранного' : 'Добавить в избранное'}
          accessibilityState={{ selected: favorited }}
          aria-selected={favorited}
          aria-pressed={favorited}
          onPress={onToggleFavorite}
          style={({ pressed }) => [styles.heartHit, pressed && styles.pressed]}
        >
          <View testID={`card-heart-circle-${apartment.id}`} style={styles.heartCircle}>
            <Ionicons name={favorited ? 'heart' : 'heart-outline'} size={20} color={favorited ? COLORS.accent : COLORS.muted} accessible={false} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    height: 160,
    borderRadius: RADIUS.card,
    // RN Web combines legacy shadow props with boxShadow. Select exactly one
    // implementation so the native and web appearances share one elevation.
    ...(process.env.EXPO_OS === 'web'
      ? { boxShadow: '0 8px 16px rgba(0,0,0,0.35)' }
      : {
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 8 },
          shadowRadius: 16,
          shadowOpacity: 0.35,
          elevation: 6,
        }),
  },
  clip: { width: '100%', height: '100%', overflow: 'hidden', borderRadius: RADIUS.card, backgroundColor: COLORS.cardBackground, padding: SPACING.lg },
  columns: { flex: 1, flexDirection: 'row', gap: SPACING.md },
  text: { flex: 0.55, minWidth: 0, justifyContent: 'space-between' },
  title: { ...TYPOGRAPHY.cardTitle, color: COLORS.foreground },
  meta: { ...TYPOGRAPHY.meta11, color: COLORS.muted },
  price: { ...TYPOGRAPHY.priceCard, color: COLORS.foreground, fontVariant: ['tabular-nums'] },
  mediaZone: { flex: 0.45, minWidth: 0, justifyContent: 'center', alignItems: 'flex-end' },
  media: { width: '100%', maxWidth: 160 - SPACING.lg * 2, aspectRatio: 1, borderRadius: RADIUS.image, overflow: 'hidden', backgroundColor: COLORS.cardDeep, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  heartHit: { position: 'absolute', top: SPACING.md, right: SPACING.md, width: 48, height: 48, padding: 2 },
  heartCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(28,27,26,0.7)', alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.85 },
});
