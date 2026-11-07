import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { ApartmentCard } from "@/components/apartment-card";
import { CatalogSkeleton } from "@/components/catalog-state";
import { ScreenContainer } from "@/components/screen-container";
import { catalogDemoApartments } from "@/constants/mock-data";
import { COLORS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { useFavorites, useFavoritesStorageState } from "@/hooks/use-favorites";
import { favoritesLabel } from "@/lib/favorites-model";
import { track } from "@/lib/telemetry";
import type { CatalogApartment } from "@/types/catalog";

export default function FavoritesScreen() {
  const { preview } = useLocalSearchParams<{ preview?: string }>();
  return <FavoritesContent key={preview ?? "saved"} preview={preview} />;
}

function FavoritesContent({ preview }: { preview: string | undefined }) {
  const router = useRouter();
  const previewContent = __DEV__ && preview === "content";
  const previewEmpty = __DEV__ && preview === "empty";
  const favorites = useFavorites();
  const persistence = useFavoritesStorageState();
  // Screenshot/demo rows are isolated from the actual saved collection. Opening
  // a dev preview never seeds or clears someone's device favorites.
  const [removedDemoIds, setRemovedDemoIds] = useState<string[]>([]);
  useEffect(() => {
    track("screen_view", { screen: "favorites" });
  }, []);

  const apartments = previewContent
    ? catalogDemoApartments.filter((item) => !removedDemoIds.includes(item.id))
    : previewEmpty
      ? []
      : favorites.apartments;
  const loading = !previewContent && !previewEmpty && !favorites.hydrated;
  const openLayouts = () =>
    router.push(
      previewContent
        ? { pathname: "/layouts", params: { preview: "content" } }
        : "/layouts",
    );
  const openApartment = (item: CatalogApartment) =>
    router.push({
      pathname: "/apartment/[id]",
      params: {
        id: item.id,
        ...(__DEV__ && item.is_demo ? { preview: "content" } : {}),
      },
    });

  return (
    <ScreenContainer>
      <FlatList
        testID="favorites-list"
        style={styles.list}
        data={loading ? [] : apartments}
        extraData={apartments}
        keyExtractor={(item) => item.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text accessibilityRole="header" style={styles.title}>
              Избранное
            </Text>
            <Text
              testID="favorites-count"
              accessibilityLiveRegion="polite"
              style={styles.count}
            >
              {loading
                ? "Загружаем избранное…"
                : favoritesLabel(apartments.length)}
            </Text>
            {persistence.error && !previewContent && !previewEmpty && (
              <View
                testID="favorites-storage-error"
                accessibilityLiveRegion="polite"
                style={styles.storageNotice}
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color={COLORS.error}
                  accessible={false}
                />
                <View style={styles.noticeBody}>
                  <Text style={styles.noticeCopy}>
                    Не удалось{" "}
                    {persistence.error === "read" ? "загрузить" : "сохранить"}{" "}
                    избранное на устройстве. Можно продолжать в памяти
                    приложения; после закрытия изменения могут не сохраниться.
                  </Text>
                  <Pressable
                    testID="favorites-storage-retry"
                    accessibilityRole="button"
                    accessibilityLabel="Повторить сохранение избранного на устройстве"
                    accessibilityState={{ disabled: persistence.recovering }}
                    disabled={persistence.recovering}
                    onPress={() => {
                      void persistence.retry();
                    }}
                    style={styles.retryHit}
                  >
                    <Text style={styles.retryLabel}>
                      {persistence.recovering ? "Повторяем…" : "Повторить"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <ApartmentCard
            apartment={item}
            variant="horizontal"
            favorited={previewContent || favorites.isFavorite(item.id)}
            onToggleFavorite={() => {
              if (previewContent) setRemovedDemoIds((ids) => [...ids, item.id]);
              else favorites.toggle(item);
            }}
            onPress={() => openApartment(item)}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <View testID="favorites-loading">
              <CatalogSkeleton />
            </View>
          ) : (
            <View testID="favorites-empty" style={styles.empty}>
              <View style={styles.emptyCircle}>
                <Ionicons
                  name="heart-outline"
                  size={48}
                  color={COLORS.muted}
                  accessible={false}
                />
              </View>
              <Text accessibilityRole="header" style={styles.emptyTitle}>
                Пока пусто
              </Text>
              <Text style={styles.emptyCopy}>
                Сохраняйте понравившиеся варианты
              </Text>
              <Pressable
                testID="favorites-open-layouts"
                accessibilityRole="button"
                onPress={openLayouts}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.secondaryLabel}>Открыть планировки</Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={COLORS.foreground}
                  accessible={false}
                />
              </Pressable>
            </View>
          )
        }
        ListFooterComponent={
          <View style={styles.footer}>
            {(previewContent ||
              previewEmpty ||
              apartments.some((item) => item.is_demo)) && (
              <Text testID="favorites-demo-footer" style={styles.footerCopy}>
                {previewContent || previewEmpty
                  ? "Демо-предпросмотр. Это не сохранённые квартиры пользователя. "
                  : "Демо-данные. "}
                Схематичные планировки. Цены, наличие и условия уточняются
                командой проекта.
              </Text>
            )}
            {!previewContent && !previewEmpty && (
              <Text style={styles.footerCopy}>
                Избранное хранится только на этом устройстве. Данные карточек
                сохранены при добавлении; актуальность цены и наличия
                уточняется.
              </Text>
            )}
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: 130,
  },
  header: { marginBottom: SPACING.xxl },
  title: { ...TYPOGRAPHY.display36, color: COLORS.foreground },
  count: {
    ...TYPOGRAPHY.body13,
    color: COLORS.muted,
    marginTop: SPACING.sm,
    fontVariant: ["tabular-nums"],
  },
  separator: { height: SPACING.lg },
  empty: { marginTop: SPACING.xxxl, alignItems: "center", gap: SPACING.md },
  emptyCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.cardBackground,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  emptyTitle: { ...TYPOGRAPHY.display22, color: COLORS.foreground },
  emptyCopy: { ...TYPOGRAPHY.body15, color: COLORS.muted, textAlign: "center" },
  secondaryButton: {
    width: "100%",
    minHeight: 52,
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  secondaryLabel: {
    ...TYPOGRAPHY.body15,
    color: COLORS.foreground,
    fontWeight: "600",
  },
  storageNotice: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    borderCurve: "continuous",
    flexDirection: "row",
    gap: SPACING.sm,
  },
  noticeBody: { flex: 1 },
  noticeCopy: { ...TYPOGRAPHY.body13, color: COLORS.muted },
  retryHit: {
    minHeight: 48,
    alignSelf: "flex-start",
    justifyContent: "center",
  },
  retryLabel: { ...TYPOGRAPHY.body13, color: COLORS.accent },
  footer: { marginTop: SPACING.xxxl, gap: SPACING.sm },
  footerCopy: {
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.muted,
    textAlign: "center",
  },
  pressed: { opacity: 0.8 },
});
