import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenContainer } from '@/components/screen-container';
import { ApartmentMedia } from '@/components/apartment-media';
import { ApartmentCard } from '@/components/apartment-card';
import { CatalogSkeleton, CatalogState } from '@/components/catalog-state';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '@/constants/theme';
import { detailDemoApartments } from '@/constants/detail-data';
import { catalogPreview, useCatalog } from '@/hooks/use-catalog';
import { useFavorites } from '@/hooks/use-favorites';
import { apartmentPrice } from '@/lib/catalog-model';
import type { AvailabilityStatus } from '@/types/db';

const statuses: Record<AvailabilityStatus, string> = { available: 'В продаже', reserved: 'Резерв', sold: 'Продано', hidden: 'Скрыто', unknown: 'Наличие уточняется' };
export default function ApartmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; preview?: string }>();
  const catalog = useCatalog(catalogPreview(params.preview));
  const favorites = useFavorites();
  const [menu, setMenu] = useState(false);
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const rows = catalog.preview ? detailDemoApartments : catalog.data;
  const apartment = rows.find((row) => row.id === params.id);
  const goCatalog = () => router.replace({ pathname: '/layouts', params: catalog.preview ? { preview: 'content' } : {} });
  const goBack = () => router.canGoBack() ? router.back() : goCatalog();
  if (catalog.loading) return <ScreenContainer><ScrollView contentContainerStyle={styles.state}><CatalogSkeleton /></ScrollView></ScreenContainer>;
  if (catalog.error) return <ScreenContainer><View style={styles.state}><CatalogState kind="error" unavailable={catalog.unavailable} onAction={catalog.retry} /><Pressable accessibilityRole="button" onPress={goCatalog} style={styles.secondary}><Text style={styles.secondaryLabel}>Вернуться в каталог</Text></Pressable></View></ScreenContainer>;
  if (!apartment) return (
    <ScreenContainer><View testID="detail-not-found" style={styles.notFound}>
      <Ionicons name="search-outline" size={48} color={COLORS.muted} accessible={false} />
      <Text accessibilityRole="header" style={styles.sectionTitle}>Квартира не найдена</Text>
      <Text style={styles.body}>Выберите другой вариант в каталоге.</Text>
      <Pressable accessibilityRole="button" onPress={goCatalog} style={styles.secondary}><Text style={styles.secondaryLabel}>Вернуться в каталог</Text></Pressable>
    </View></ScreenContainer>
  );
  const title = apartment.rooms === 0 ? 'Студия' : `${apartment.rooms}-комнатная квартира`;
  const building = apartment.building_title ?? 'Уточняется';
  const related = rows.filter((row) => row.id !== apartment.id).slice(0, 3);
  const lead = () => router.push({ pathname: '/lead', params: { type: 'apartment', apartment_id: apartment.id, ...(apartment.is_demo ? { demo: '1' } : {}) } });
  const cta = (id: string) => <Pressable testID={id} accessibilityRole="button" accessibilityLabel="Оставить заявку" onPress={lead} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}><Text style={styles.primaryLabel}>Оставить заявку</Text></Pressable>;
  return (
    <ScreenContainer edges={['left', 'right']}>
      <ScrollView testID="detail-scroll" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}>
        <View testID="detail-hero" style={{ height: Math.round(height * 0.55), backgroundColor: COLORS.cardDeep }}>
          <ApartmentMedia path={apartment.plan_path} label={`Схема квартиры ${apartment.area} м². Демонстрационная, не в масштабе.`} style={styles.heroMedia} />
          <LinearGradient pointerEvents="none" colors={['transparent', 'transparent', 'rgba(28,27,26,0.95)', COLORS.background]} locations={[0, 0.45, 0.7, 1]} style={styles.fill} />
          <View style={[styles.heroToolbar, { top: insets.top + SPACING.lg }]}>
            <Pressable testID="detail-back" accessibilityRole="button" accessibilityLabel="Назад в каталог" onPress={goBack} style={styles.iconHit}><View style={styles.iconCircle}><Ionicons name="arrow-back" size={22} color={COLORS.foreground} accessible={false} /></View></Pressable>
            <View style={styles.toolbarRight}>
              <Pressable testID="detail-heart" accessibilityRole="button" accessibilityLabel={favorites.isFavorite(apartment.id) ? 'Убрать из избранного' : 'Добавить в избранное'} aria-pressed={favorites.isFavorite(apartment.id)} accessibilityState={{ selected: favorites.isFavorite(apartment.id) }} onPress={() => favorites.toggle(apartment)} style={styles.iconHit}><View style={styles.heroHeartCircle}><Ionicons name={favorites.isFavorite(apartment.id) ? 'heart' : 'heart-outline'} size={22} color={favorites.isFavorite(apartment.id) ? COLORS.accent : COLORS.muted} accessible={false} /></View></Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Действия с квартирой" onPress={() => setMenu(true)} style={styles.iconHit}><View style={styles.iconCircle}><Ionicons name="ellipsis-horizontal" size={22} color={COLORS.foreground} accessible={false} /></View></Pressable>
            </View>
          </View>
          <View style={styles.heroText}>
            <Text style={styles.meta}>{apartment.floor} ЭТАЖ · {building.toLocaleUpperCase('ru-RU')} · {apartment.area} М²</Text>
            <Text accessibilityRole="header" style={styles.heroTitle}>{title}</Text>
          </View>
        </View>
        <View testID="detail-content" style={styles.content}>
          <Text selectable testID="detail-price" style={styles.price}>{apartmentPrice(apartment.price)}</Text>
          <Text testID="detail-status" style={styles.status}>{statuses[apartment.availability_status]}</Text>
          {apartment.is_demo && <Text style={styles.disclaimer}>Схематичная планировка и демо-данные. Цена и наличие не являются предложением.</Text>}
          <View style={{ marginTop: SPACING.lg }}>{cta('detail-primary-cta')}</View>
          <View style={styles.section}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>О квартире</Text>
            <View style={styles.facts}>{[{ label: 'ПЛОЩАДЬ', value: `${apartment.area} м²` }, { label: 'ЭТАЖ', value: String(apartment.floor) }, { label: 'КОРПУС', value: building }, { label: 'ОТДЕЛКА', value: 'По запросу' }].map((fact) => <View key={fact.label} style={styles.fact}><Text style={styles.meta}>{fact.label}</Text><Text style={styles.factValue}>{fact.value}</Text></View>)}</View>
          </View>
          <View style={styles.section}>
            <Text accessibilityRole="header" style={styles.sectionTitle}>Планировка</Text>
            <ApartmentMedia testID="detail-plan" path={apartment.plan_path} label="Схема. Демонстрационная планировка, не в масштабе." style={styles.plan} />
            <Text style={styles.disclaimer}>{apartment.media_kind === 'schematic' ? 'Схема. Не в масштабе, не утверждённая планировка.' : 'Уточните актуальную редакцию планировки у менеджера.'}</Text>
          </View>
          <View style={styles.section}><Text accessibilityRole="header" style={styles.sectionTitle}>Похожие квартиры</Text></View>
        </View>
        <ScrollView testID="detail-related" horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.related}>
          {related.map((row) => <ApartmentCard key={row.id} apartment={row} variant="compact" favorited={favorites.isFavorite(row.id)} onToggleFavorite={() => favorites.toggle(row)} onPress={() => router.push({ pathname: '/apartment/[id]', params: { id: row.id, ...(catalog.preview ? { preview: 'content' } : {}) } })} />)}
        </ScrollView>
      </ScrollView>
      <LinearGradient testID="detail-sticky" colors={['transparent', COLORS.background, COLORS.background]} locations={[0, 0.35, 1]} style={[styles.sticky, { paddingBottom: insets.bottom + SPACING.xl }]}>{cta('detail-sticky-cta')}</LinearGradient>
      <Modal visible={menu} transparent animationType="none" onRequestClose={() => setMenu(false)}><View style={styles.modal}><Pressable accessibilityRole="button" accessibilityLabel="Закрыть меню" style={styles.backdrop} onPress={() => setMenu(false)} /><View style={styles.menu} accessibilityViewIsModal>
        <Text style={styles.sectionTitle}>Квартира</Text>
        <Pressable accessibilityRole="button" onPress={() => { setMenu(false); router.push('/favorites'); }} style={styles.secondary}><Ionicons name="heart-outline" size={20} color={COLORS.muted} accessible={false} /><Text style={styles.secondaryLabel}>Открыть избранное</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => { setMenu(false); lead(); }} style={styles.secondary}><Text style={styles.secondaryLabel}>Оставить заявку</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => setMenu(false)} style={styles.secondary}><Text style={styles.secondaryLabel}>Закрыть</Text></Pressable>
      </View></View></Modal>
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  state: { padding: SPACING.xl, flexGrow: 1 },
  notFound: { flex: 1, padding: SPACING.xl, justifyContent: 'center', alignItems: 'center', gap: SPACING.xxl },
  heroMedia: { width: '100%', height: '100%' },
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  heroToolbar: { position: 'absolute', left: 18, right: 18, flexDirection: 'row', justifyContent: 'space-between' },
  toolbarRight: { flexDirection: 'row', gap: SPACING.sm },
  iconHit: { width: 48, height: 48, padding: 2 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(28,27,26,0.7)', alignItems: 'center', justifyContent: 'center' },
  heroHeartCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(28,27,26,0.85)', alignItems: 'center', justifyContent: 'center' },
  heroText: { position: 'absolute', bottom: SPACING.xl, left: SPACING.xl, right: SPACING.xl, gap: SPACING.sm },
  meta: { ...TYPOGRAPHY.meta11, color: COLORS.muted },
  heroTitle: { ...TYPOGRAPHY.display32, color: COLORS.foreground },
  content: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.xxl },
  price: { ...TYPOGRAPHY.priceDetail, color: COLORS.foreground, fontVariant: ['tabular-nums'] },
  status: { ...TYPOGRAPHY.body13, color: COLORS.accent, marginTop: SPACING.sm },
  disclaimer: { fontSize: 11, lineHeight: 16, color: COLORS.muted, marginTop: SPACING.sm },
  primary: { height: 52, width: '100%', borderRadius: RADIUS.primary, backgroundColor: COLORS.accent, alignItems: 'center', justifyContent: 'center' },
  primaryLabel: { ...TYPOGRAPHY.buttonLabel, color: COLORS.accentForeground },
  secondary: { minHeight: 52, paddingHorizontal: SPACING.xl, borderRadius: RADIUS.secondary, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: SPACING.sm },
  secondaryLabel: { ...TYPOGRAPHY.buttonLabel, color: COLORS.foreground },
  body: { ...TYPOGRAPHY.body15, color: COLORS.muted },
  section: { marginTop: SPACING.xxxl },
  sectionTitle: { ...TYPOGRAPHY.display22, color: COLORS.foreground },
  facts: { flexDirection: 'row', flexWrap: 'wrap', rowGap: SPACING.xxl, marginTop: SPACING.lg },
  fact: { width: '50%', gap: SPACING.sm },
  factValue: { ...TYPOGRAPHY.body15, color: COLORS.foreground },
  plan: { width: '100%', aspectRatio: 1, borderRadius: RADIUS.image, marginTop: SPACING.lg },
  related: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg, gap: SPACING.lg },
  sticky: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingTop: SPACING.xxxl, paddingHorizontal: SPACING.xl },
  pressed: { opacity: 0.85 },
  modal: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  menu: { backgroundColor: COLORS.cardBackground, borderTopLeftRadius: RADIUS.sheet, borderTopRightRadius: RADIUS.sheet, padding: SPACING.xxl, gap: SPACING.lg },
});
