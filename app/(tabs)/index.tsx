import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ApartmentCard } from "@/components/apartment-card";
import { ScreenContainer } from "@/components/screen-container";
import { COLORS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { useFavorites, useFavoritesStorageState } from "@/hooks/use-favorites";
import { track } from "@/lib/telemetry";
import type { CatalogApartment } from "@/types/catalog";

// Titles and metadata copied from restore-archive/supabase/seed.sql, not a
// network feed. Images are concept visualizations, never construction evidence.
const promos = [
  {
    id: "family-discount",
    title: "Семейный сценарий",
    meta: "Демо-акция — условия уточняются.",
    image: require("../../assets/images/reutov-terrace-view-concept.jpg"),
  },
  {
    id: "mortgage-0",
    title: "Ипотечная консультация",
    meta: "Демо-карточка без указания банка-партнёра.",
    image: require("../../assets/images/reutov-urban-day-concept.jpg"),
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { preview } = useLocalSearchParams<{ preview?: string }>();
  const previewContent = __DEV__ && preview === "content";
  const favorites = useFavorites();
  const persistence = useFavoritesStorageState();
  const [dialog, setDialog] = useState<"notifications" | "promos" | null>(null);

  useEffect(() => {
    track("screen_view", { screen: "home" });
  }, []);

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
      <ScrollView
        testID="home-scroll"
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>НАУКОГРАД / РЕУТОВ</Text>
            <Text accessibilityRole="header" style={styles.title}>
              Умный город
            </Text>
          </View>
          <Pressable
            testID="home-notifications"
            accessibilityRole="button"
            accessibilityLabel="Уведомления"
            onPress={() => setDialog("notifications")}
            style={({ pressed }) => [
              styles.notificationHit,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.notificationCircle}>
              <Ionicons
                name="notifications-outline"
                size={22}
                color={COLORS.foreground}
                accessible={false}
              />
            </View>
          </Pressable>
        </View>

        <View testID="home-hero" style={styles.hero}>
          <Image
            source={require("../../assets/images/reutov-urban-day-concept.jpg")}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={0}
            accessibilityLabel="Концептная визуализация проекта в Реутове"
          />
          <LinearGradient
            colors={[`${COLORS.background}00`, COLORS.background]}
            locations={[0.3, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.heroText}>
            <Text accessibilityRole="header" style={styles.heroTitle}>
              Дом для новых планов
            </Text>
            <Text style={styles.heroSubtitle}>
              Современная среда в Наукограде
            </Text>
          </View>
        </View>
        <Text testID="home-hero-disclaimer" style={styles.disclaimer}>
          Визуализация. Не является публичной офертой.
        </Text>

        <View style={styles.quickActions}>
          <QuickAction
            testID="home-quick-layouts"
            icon="grid-outline"
            label="Подобрать квартиру"
            onPress={openLayouts}
          />
          <QuickAction
            testID="home-quick-price"
            icon="document-text-outline"
            label="Узнать условия"
            onPress={() =>
              router.push({
                pathname: "/lead",
                params: { type: "price_request" },
              })
            }
          />
          <QuickAction
            testID="home-quick-call"
            icon="call-outline"
            label="Заказать звонок"
            onPress={() =>
              router.push({
                pathname: "/lead",
                params: { type: "manager_call" },
              })
            }
          />
        </View>

        {!favorites.hydrated && (
          <Text
            testID="home-favorites-loading"
            accessibilityLiveRegion="polite"
            style={styles.loading}
          >
            Загружаем избранное…
          </Text>
        )}
        {persistence.error && (
          <View
            testID="home-favorites-storage-error"
            style={styles.storageNotice}
            accessibilityLiveRegion="polite"
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
                избранное на устройстве. Изменения доступны в памяти приложения.
              </Text>
              <Pressable
                testID="home-favorites-retry"
                accessibilityRole="button"
                accessibilityLabel="Повторить сохранение избранного на устройстве"
                accessibilityState={{ disabled: persistence.recovering }}
                disabled={persistence.recovering}
                onPress={() => {
                  void persistence.retry();
                }}
                style={styles.noticeAction}
              >
                <Text style={styles.actionText}>
                  {persistence.recovering ? "Повторяем…" : "Повторить"}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {favorites.apartments.length > 0 && (
          <View testID="home-favorites-section" style={styles.section}>
            <Heading
              title="Избранное"
              action="Все"
              testID="home-favorites-all"
              onAction={() => router.push("/favorites")}
            />
            <FlatList
              testID="home-favorites-list"
              horizontal
              data={favorites.apartments}
              extraData={favorites.apartments}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.favoriteCarousel}
              ItemSeparatorComponent={() => (
                <View style={styles.favoriteSeparator} />
              )}
              renderItem={({ item }) => (
                <ApartmentCard
                  apartment={item}
                  variant="compact"
                  favorited={favorites.isFavorite(item.id)}
                  onToggleFavorite={() => favorites.toggle(item)}
                  onPress={() => openApartment(item)}
                />
              )}
            />
          </View>
        )}

        <View testID="home-construction-section" style={styles.section}>
          <Heading
            title="Ход строительства"
            action="Все отчёты"
            testID="home-construction-all"
            onAction={() => router.push("/construction")}
          />
          <Pressable
            testID="home-construction-report"
            accessibilityRole="button"
            accessibilityLabel="Октябрь 2026. Демо-отчёт. Открыть ход строительства"
            onPress={() => router.push("/construction")}
            style={({ pressed }) => [
              styles.constructionCard,
              pressed && styles.pressed,
            ]}
          >
            <Image
              source={require("../../assets/images/reutov-urban-evening-concept.jpg")}
              style={styles.constructionImage}
              contentFit="cover"
              transition={0}
              accessibilityLabel="Концептная визуализация, не фотоотчёт стройки"
            />
            <View style={styles.constructionText}>
              <Text style={styles.constructionTitle}>Октябрь 2026</Text>
              <Text style={styles.metadata}>
                Демо-отчёт. Дата обновления не подтверждена.
              </Text>
            </View>
          </Pressable>
        </View>

        <View testID="home-promos-section" style={styles.section}>
          <Heading
            title="Акции"
            action="Все"
            testID="home-promos-all"
            onAction={() => setDialog("promos")}
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carousel}
          >
            {promos.map((promo) => (
              <Pressable
                testID={`home-promo-${promo.id}`}
                key={promo.id}
                accessibilityRole="button"
                accessibilityLabel={`${promo.title}. ${promo.meta} Узнать условия`}
                onPress={() =>
                  router.push({
                    pathname: "/lead",
                    params: { type: "mortgage" },
                  })
                }
                style={({ pressed }) => [
                  styles.promoCard,
                  pressed && styles.pressed,
                ]}
              >
                <Image
                  source={promo.image}
                  style={styles.promoImage}
                  contentFit="cover"
                  transition={0}
                  accessible={false}
                />
                <View style={styles.promoText}>
                  <Text style={styles.promoTitle}>{promo.title}</Text>
                  <Text style={styles.metadata}>{promo.meta}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        <Text testID="home-demo-footer" style={styles.demoFooter}>
          Демо-материалы проекта. Концептные изображения; акции и отчёт из
          демонстрационного seed. Цены, наличие и условия уточняются командой
          проекта.
        </Text>
      </ScrollView>

      {dialog !== null && (
        <Modal
          visible
          transparent
          animationType="none"
          onRequestClose={() => setDialog(null)}
        >
          <View style={styles.modalBackdrop}>
            <Pressable
              style={StyleSheet.absoluteFill}
              accessible={false}
              focusable={false}
              onPress={() => setDialog(null)}
            />
            <View
              testID={
                dialog === "notifications"
                  ? "home-notifications-modal"
                  : "home-promos-modal"
              }
              accessibilityViewIsModal
              style={styles.modalCard}
            >
              <View style={styles.modalHeader}>
                <Text accessibilityRole="header" style={styles.sectionTitle}>
                  {dialog === "notifications" ? "Уведомления" : "Акции проекта"}
                </Text>
                <Pressable
                  testID="home-modal-close"
                  accessibilityRole="button"
                  accessibilityLabel="Закрыть"
                  onPress={() => setDialog(null)}
                  style={styles.modalClose}
                >
                  <Ionicons
                    name="close-outline"
                    size={24}
                    color={COLORS.foreground}
                    accessible={false}
                  />
                </Pressable>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalCopy}>
                  {dialog === "notifications"
                    ? "Уведомления пока не настроены. Приложение не запрашивает разрешение и не отправляет push-уведомления. Подтверждённые материалы можно уточнить у менеджера."
                    : "Здесь показаны две демо-карточки из материалов проекта. Актуальность акций, банк и условия не подтверждены. Уточните их у менеджера."}
                </Text>
              </ScrollView>
              <Pressable
                testID="home-modal-contact"
                accessibilityRole="button"
                onPress={() => {
                  setDialog(null);
                  router.push({
                    pathname: "/lead",
                    params: {
                      type: dialog === "promos" ? "mortgage" : "manager_call",
                    },
                  });
                }}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.secondaryLabel}>
                  {dialog === "promos" ? "Узнать условия" : "Заказать звонок"}
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={COLORS.foreground}
                  accessible={false}
                />
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </ScreenContainer>
  );
}

function Heading({
  title,
  action,
  testID,
  onAction,
}: {
  title: string;
  action: string;
  testID: string;
  onAction(): void;
}) {
  return (
    <View style={styles.sectionHeading}>
      <Text accessibilityRole="header" style={styles.sectionTitle}>
        {title}
      </Text>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`${action}: ${title.toLowerCase()}`}
        onPress={onAction}
        style={({ pressed }) => [
          styles.headingAction,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.actionText}>{action}</Text>
        <Ionicons
          name="arrow-forward"
          size={15}
          color={COLORS.accent}
          accessible={false}
        />
      </Pressable>
    </View>
  );
}

function QuickAction({
  icon,
  label,
  testID,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  testID: string;
  onPress(): void;
}) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}
    >
      <Ionicons
        name={icon}
        size={24}
        color={COLORS.accent}
        accessible={false}
      />
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: SPACING.xl, paddingBottom: 160 },
  header: {
    marginHorizontal: SPACING.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.sm,
  },
  headerText: { flex: 1, minWidth: 0 },
  eyebrow: { ...TYPOGRAPHY.meta11, color: COLORS.muted },
  title: {
    ...TYPOGRAPHY.display36,
    color: COLORS.foreground,
    marginTop: SPACING.xs,
  },
  notificationHit: { width: 48, height: 48, padding: 2 },
  notificationCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.cardBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  hero: {
    height: 260,
    borderRadius: 20,
    borderCurve: "continuous",
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.xxl,
    backgroundColor: COLORS.cardBackground,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  heroText: { padding: SPACING.xl, gap: SPACING.xs },
  heroTitle: {
    ...TYPOGRAPHY.display32,
    color: COLORS.foreground,
  },
  heroSubtitle: { ...TYPOGRAPHY.body15, color: COLORS.muted },
  disclaimer: {
    fontSize: 11,
    lineHeight: 16,
    fontStyle: "italic",
    color: COLORS.muted,
    marginTop: SPACING.sm,
    marginHorizontal: SPACING.xl,
  },
  quickActions: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginTop: SPACING.xxxl,
    marginHorizontal: SPACING.xl,
  },
  quickAction: {
    flex: 1,
    minWidth: 0,
    minHeight: 88,
    borderRadius: 12,
    borderCurve: "continuous",
    backgroundColor: COLORS.cardBackground,
    padding: SPACING.sm,
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
  },
  quickLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "400",
    color: COLORS.foreground,
    textAlign: "center",
  },
  loading: {
    ...TYPOGRAPHY.body13,
    color: COLORS.muted,
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.lg,
  },
  storageNotice: {
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
    flexDirection: "row",
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    borderCurve: "continuous",
  },
  noticeBody: { flex: 1 },
  noticeCopy: { ...TYPOGRAPHY.body13, color: COLORS.muted },
  noticeAction: {
    minHeight: 48,
    justifyContent: "center",
    alignSelf: "flex-start",
  },
  section: { marginTop: SPACING.xxxl },
  sectionHeading: {
    marginHorizontal: SPACING.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.display22,
    color: COLORS.foreground,
    flexShrink: 1,
  },
  headingAction: {
    minWidth: 48,
    minHeight: 48,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: SPACING.xs,
  },
  actionText: { ...TYPOGRAPHY.body13, color: COLORS.accent },
  carousel: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xs,
    gap: SPACING.md,
  },
  favoriteCarousel: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xs,
  },
  favoriteSeparator: { width: SPACING.md },
  constructionCard: {
    minHeight: 120,
    marginHorizontal: SPACING.xl,
    borderRadius: 16,
    borderCurve: "continuous",
    backgroundColor: COLORS.cardBackground,
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.md,
    gap: SPACING.md,
  },
  constructionImage: {
    width: 96,
    height: 96,
    borderRadius: 12,
    borderCurve: "continuous",
  },
  constructionText: { flex: 1, minWidth: 0, gap: SPACING.sm },
  constructionTitle: {
    ...TYPOGRAPHY.body15,
    color: COLORS.foreground,
    fontWeight: "500",
  },
  metadata: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "400",
    color: COLORS.muted,
  },
  promoCard: { width: 260, minHeight: 200 },
  promoImage: {
    width: 260,
    height: 120,
    borderRadius: 16,
    borderCurve: "continuous",
  },
  promoText: { marginTop: SPACING.md, gap: SPACING.xs },
  promoTitle: {
    ...TYPOGRAPHY.display22,
    fontSize: 18,
    lineHeight: 22,
    color: COLORS.foreground,
  },
  demoFooter: {
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.muted,
    textAlign: "center",
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.xxxl,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.scrim,
    padding: SPACING.xl,
  },
  modalCard: {
    width: "100%",
    maxWidth: 440,
    maxHeight: "80%",
    padding: SPACING.xl,
    gap: SPACING.xxl,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 24,
    borderCurve: "continuous",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: SPACING.sm,
  },
  modalClose: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCopy: { ...TYPOGRAPHY.body15, color: COLORS.muted },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 12,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: SPACING.sm,
  },
  secondaryLabel: {
    ...TYPOGRAPHY.body15,
    fontWeight: "600",
    color: COLORS.foreground,
  },
  pressed: { opacity: 0.8 },
});
