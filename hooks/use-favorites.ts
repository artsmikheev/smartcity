import { useEffect, useSyncExternalStore } from "react";
import { createFavoritesStore } from "@/lib/favorites-model";
import type { CatalogApartment } from "@/types/catalog";

// No AsyncStorage import or storage/window access at module evaluation or render.
// initialize runs from a client effect; native loads its native adapter lazily.
const store = createFavoritesStore(async () => {
  if (process.env.EXPO_OS === "web" && typeof window === "undefined") {
    throw new Error("Local favorites storage is client-only");
  }
  const { default: AsyncStorage } =
    await import("@react-native-async-storage/async-storage");
  return AsyncStorage;
});

function useFavoritesSnapshot() {
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  useEffect(() => {
    void store.initialize();
  }, []);
  return snapshot;
}

export function useFavorites(): {
  apartments: CatalogApartment[];
  toggle(apartment: CatalogApartment): void;
  isFavorite(id: string): boolean;
  hydrated: boolean;
} {
  const { apartments, hydrated } = useFavoritesSnapshot();
  return {
    apartments,
    toggle: store.toggle,
    isFavorite: store.isFavorite,
    hydrated,
  };
}

// Kept outside the shared four-field contract so catalog/detail callers do not
// need to implement storage UI. Home/Favorites show this local-only failure.
export function useFavoritesStorageState() {
  const { error, recovering } = useFavoritesSnapshot();
  return { error, recovering, retry: store.retry };
}
