import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/screen-container';
import { ApartmentCard } from '@/components/apartment-card';
import { CatalogSkeleton, CatalogState } from '@/components/catalog-state';
import { CatalogFilters } from '@/components/catalog-filters';
import { COLORS, TYPOGRAPHY, SPACING } from '@/constants/theme';
import { catalogPreview, useCatalog } from '@/hooks/use-catalog';
import { useFavorites } from '@/hooks/use-favorites';
import { variantsLabel, visibleApartments } from '@/lib/catalog-model';
import { track } from '@/lib/telemetry';
import type { CatalogMode, PriceSort } from '@/types/catalog';

export default function LayoutsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ preview?: string }>();
  const catalog = useCatalog(catalogPreview(params.preview));
  const [mode, setMode] = useState<CatalogMode>('apartments');
  const [rooms, setRooms] = useState<number | null>(null);
  const [sort, setSort] = useState<PriceSort>('price_asc');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const favorites = useFavorites();
  const visible = useMemo(() => visibleApartments(catalog.data, mode, rooms, sort), [catalog.data, mode, rooms, sort]);
  const status = catalog.error ? 'error' : catalog.loading ? 'loading' : visible.length === 0 ? 'empty' : 'content';

  useEffect(() => { track('screen_view', { screen: 'layouts' }); }, []);

  const reset = () => {
    setRooms(null);
    setMode('apartments');
    setSort('price_asc');
    if (catalog.preview && status === 'empty') router.setParams({ preview: 'content' });
  };

  const retry = () => {
    if (catalog.preview) router.setParams({ preview: 'content' });
    else catalog.retry();
  };

  const header = (
    <View>
      <Text style={styles.eyebrow}>НАУКОГРАД / РЕУТОВ</Text>
      <View style={styles.titleRow}>
        <Text accessibilityRole="header" style={styles.title}>Планировки</Text>
        <Pressable testID="catalog-filter" accessibilityRole="button" accessibilityLabel="Фильтры" onPress={() => setFiltersOpen(true)} style={styles.filterHit}>
          <View style={styles.filterCircle}><Ionicons name="filter-outline" size={20} color={COLORS.foreground} accessible={false} /></View>
        </Pressable>
      </View>
      <Text numberOfLines={1} style={styles.subtitle}>Тишина, свет, честные метры.</Text>
      <View style={styles.modes} accessibilityLabel="Вид каталога">
        {([{ value: 'apartments', label: 'Квартиры' }, { value: 'blueprints', label: 'Чертежи' }] as const).map((item) => (
          <Pressable key={item.value} accessibilityRole="button" accessibilityState={{ selected: mode === item.value }} aria-pressed={mode === item.value} onPress={() => setMode(item.value)} style={[styles.modeButton, mode === item.value && styles.activeMode]}>
            <Text style={[styles.modeLabel, mode === item.value && styles.activeModeLabel]}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.sortRow}>
        <Text testID="catalog-count" style={styles.count}>{variantsLabel(visible.length)}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={sort === 'price_asc' ? 'Сначала дешевле. Изменить сортировку' : 'Сначала дороже. Изменить сортировку'} onPress={() => setSort((current) => current === 'price_asc' ? 'price_desc' : 'price_asc')} style={styles.sortHit}>
          <Text style={styles.sortLabel}>{sort === 'price_asc' ? 'Сначала дешевле' : 'Сначала дороже'}</Text>
          <Ionicons name={sort === 'price_asc' ? 'chevron-down' : 'chevron-up'} size={14} color={COLORS.foreground} accessible={false} />
        </Pressable>
      </View>
    </View>
  );

  const footer = status === 'content' ? (
    <View testID="catalog-footer" style={styles.footer}>
      <View style={styles.divider} />
      <Text numberOfLines={2} style={styles.footerCopy}>Материалы, цены и наличие уточняются командой проекта.</Text>
      {catalog.data.some((apartment) => apartment.is_demo) && <Text style={styles.demoCopy}>Схематичные планировки, демо-данные.</Text>}
    </View>
  ) : null;

  return (
    <ScreenContainer>
      <FlatList
        testID="catalog-list"
        style={styles.list}
        data={status === 'content' ? visible : []}
        keyExtractor={(apartment) => apartment.id}
        extraData={favorites.apartments}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={header}
        ListHeaderComponentStyle={styles.header}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <ApartmentCard apartment={item} variant="horizontal" favorited={favorites.isFavorite(item.id)} onToggleFavorite={() => favorites.toggle(item)} onPress={() => router.push({ pathname: '/apartment/[id]', params: { id: item.id, ...(catalog.preview ? { preview: 'content' } : {}) } })} />
        )}
        ListEmptyComponent={status === 'loading' ? <CatalogSkeleton /> : <CatalogState kind={status === 'error' ? 'error' : 'empty'} unavailable={catalog.unavailable} onAction={status === 'error' ? retry : reset} />}
        ListFooterComponent={footer}
      />
      <CatalogFilters visible={filtersOpen} rooms={rooms} onChange={setRooms} onClose={() => setFiltersOpen(false)} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  content: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl, paddingBottom: 130 },
  header: { marginBottom: SPACING.lg },
  eyebrow: { ...TYPOGRAPHY.meta11, color: COLORS.muted, letterSpacing: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.sm },
  title: { ...TYPOGRAPHY.display36, color: COLORS.foreground },
  filterHit: { position: 'absolute', right: 0, top: -SPACING.xs, width: 48, height: 48, padding: 2 },
  filterCircle: { width: 44, height: 44, borderRadius: 22, borderColor: COLORS.border, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  subtitle: { ...TYPOGRAPHY.body15, color: COLORS.muted, marginTop: SPACING.xxl },
  modes: { flexDirection: 'row', gap: SPACING.xxl, marginTop: SPACING.xxl },
  modeButton: { minHeight: 48, paddingBottom: SPACING.sm, justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeMode: { borderBottomColor: COLORS.accent },
  modeLabel: { fontSize: 14, lineHeight: 20, fontWeight: '500', color: COLORS.muted },
  activeModeLabel: { color: COLORS.foreground },
  sortRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: SPACING.xxxl },
  count: { ...TYPOGRAPHY.body13, color: COLORS.muted },
  sortHit: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  sortLabel: { ...TYPOGRAPHY.body13, color: COLORS.foreground },
  separator: { height: SPACING.lg },
  footer: { marginTop: SPACING.xxxl },
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: SPACING.md },
  footerCopy: { ...TYPOGRAPHY.meta11, textTransform: 'none', letterSpacing: 0, color: COLORS.muted, textAlign: 'center' },
  demoCopy: { ...TYPOGRAPHY.meta11, textTransform: 'none', letterSpacing: 0, color: COLORS.muted, textAlign: 'center', marginTop: SPACING.sm },
});
