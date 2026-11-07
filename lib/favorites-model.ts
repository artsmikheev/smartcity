import type { CatalogApartment } from "../types/catalog";

export const FAVORITES_STORAGE_KEY = "smartcity:local-favorites:v1";
export type FavoritesStorage = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
};
export type FavoritesSnapshot = {
  apartments: CatalogApartment[];
  hydrated: boolean;
  error: "read" | "write" | null;
  recovering: boolean;
};

// Only public apartment fields are retained. Extra API fields, profiles, lead
// payloads, authentication tokens and user identifiers never enter this key.
function publicApartment(value: unknown): CatalogApartment {
  if (!value || typeof value !== "object") throw new Error("Invalid favorite");
  const item = value as Record<string, unknown>;
  const strings = [
    "id",
    "building_id",
    "layout_id",
    "number",
    "currency",
    "created_at",
    "updated_at",
  ];
  if (
    strings.some((key) => typeof item[key] !== "string") ||
    !item.id ||
    !Number.isInteger(item.floor) ||
    !Number.isInteger(item.rooms) ||
    typeof item.area !== "number" ||
    !Number.isFinite(item.area) ||
    item.area <= 0 ||
    !(
      item.price === null ||
      (typeof item.price === "number" &&
        Number.isFinite(item.price) &&
        item.price >= 0)
    ) ||
    !["available", "reserved", "sold", "hidden", "unknown"].includes(
      String(item.availability_status),
    ) ||
    !["plan", "concept", "schematic"].includes(String(item.media_kind)) ||
    typeof item.is_demo !== "boolean" ||
    typeof item.published !== "boolean" ||
    ![
      item.plan_path,
      item.availability_updated_at,
      item.price_updated_at,
    ].every((field) => field === null || typeof field === "string")
  ) {
    throw new Error("Invalid favorite");
  }
  return {
    id: item.id as string,
    building_id: item.building_id as string,
    layout_id: item.layout_id as string,
    number: item.number as string,
    floor: item.floor as number,
    rooms: item.rooms as number,
    area: item.area as number,
    price: item.price as number | null,
    currency: item.currency as string,
    availability_status:
      item.availability_status as CatalogApartment["availability_status"],
    availability_updated_at: item.availability_updated_at as string | null,
    price_updated_at: item.price_updated_at as string | null,
    is_demo: item.is_demo as boolean,
    published: item.published as boolean,
    created_at: item.created_at as string,
    updated_at: item.updated_at as string,
    plan_path: item.plan_path as string | null,
    media_kind: item.media_kind as CatalogApartment["media_kind"],
    ...(typeof item.building_title === "string"
      ? { building_title: item.building_title }
      : {}),
  };
}

export function encodeFavorites(apartments: CatalogApartment[]): string {
  return JSON.stringify({
    version: 1,
    apartments: apartments.map(publicApartment),
  });
}

export function decodeFavorites(raw: string | null): CatalogApartment[] {
  if (raw === null) return [];
  const data: unknown = JSON.parse(raw);
  if (
    !data ||
    typeof data !== "object" ||
    !("version" in data) ||
    data.version !== 1 ||
    !("apartments" in data) ||
    !Array.isArray(data.apartments)
  )
    throw new Error("Invalid favorites storage");
  return Array.from(
    new Map(
      data.apartments.map((item) => {
        const apartment = publicApartment(item);
        return [apartment.id, apartment] as const;
      }),
    ).values(),
  );
}

export function favoritesLabel(count: number): string {
  const rule = new Intl.PluralRules("ru").select(count);
  const word =
    rule === "one" ? "квартира" : rule === "few" ? "квартиры" : "квартир";
  return `${new Intl.NumberFormat("ru-RU").format(count)} ${word}`;
}

/** Platform-free store: the injected adapter is invoked only by initialize/retry. */
export function createFavoritesStore(
  loadStorage: () => Promise<FavoritesStorage>,
) {
  const initial: FavoritesSnapshot = {
    apartments: [],
    hydrated: false,
    error: null,
    recovering: false,
  };
  let snapshot = initial;
  const listeners = new Set<() => void>();
  // Desired membership, not a replay of blind toggles: a tap to save before the
  // read resolves must not accidentally remove an already-persisted favorite.
  const pending = new Map<
    string,
    { apartment: CatalogApartment; saved: boolean }
  >();
  let storage: FavoritesStorage | null = null;
  let baselineKnown = false;
  let initialized = false;
  let hydration: Promise<void> | null = null;
  let writing: Promise<void> | null = null;
  let revision = 0;
  let writtenRevision = 0;

  const publish = (patch: Partial<FavoritesSnapshot>) => {
    snapshot = { ...snapshot, ...patch };
    listeners.forEach((listener) => listener());
  };

  const flush = (): Promise<void> => {
    if (writing) return writing;
    if (!storage || !baselineKnown || revision === writtenRevision)
      return Promise.resolve();
    const adapter = storage;
    writing = (async () => {
      try {
        while (writtenRevision !== revision) {
          const savingRevision = revision;
          const payload = encodeFavorites(snapshot.apartments);
          await adapter.setItem(FAVORITES_STORAGE_KEY, payload);
          writtenRevision = savingRevision;
        }
        if (snapshot.error === "write") publish({ error: null });
      } catch {
        publish({ error: "write" });
      }
    })().finally(() => {
      writing = null;
    });
    return writing;
  };

  const hydrate = (): Promise<void> => {
    if (hydration) return hydration;
    initialized = true;
    hydration = (async () => {
      try {
        storage = await loadStorage();
        const apartments = new Map(
          decodeFavorites(await storage.getItem(FAVORITES_STORAGE_KEY)).map(
            (item) => [item.id, item],
          ),
        );
        const hasPending = pending.size > 0;
        for (const [id, action] of pending) {
          if (action.saved) apartments.set(id, action.apartment);
          else apartments.delete(id);
        }
        pending.clear();
        baselineKnown = true;
        publish({
          apartments: Array.from(apartments.values()),
          hydrated: true,
          error: null,
        });
        if (hasPending) {
          revision += 1;
          await flush();
        }
      } catch {
        // Keep every local action and avoid overwriting an unread baseline.
        storage = null;
        publish({ hydrated: true, error: "read" });
      }
    })().finally(() => {
      hydration = null;
    });
    return hydration;
  };

  const toggle = (value: CatalogApartment): void => {
    const apartment = publicApartment(value);
    const saved = !snapshot.apartments.some((item) => item.id === apartment.id);
    const apartments = saved
      ? [...snapshot.apartments, apartment]
      : snapshot.apartments.filter((item) => item.id !== apartment.id);
    if (!baselineKnown) pending.set(apartment.id, { apartment, saved });
    revision += 1;
    publish({ apartments });
    // Before initialize, toggles are purely in-memory (no server/window access).
    if (baselineKnown) void flush();
  };

  const retry = async (): Promise<void> => {
    if (snapshot.recovering) return;
    publish({ recovering: true });
    try {
      if (!baselineKnown) await hydrate();
      else {
        // Let any prior write finish, then retry the latest snapshot, never an
        // old queued payload or a fresh read that could erase a newer action.
        if (writing) await writing;
        try {
          storage = await loadStorage();
          await flush();
        } catch {
          publish({ error: "write" });
        }
      }
    } finally {
      publish({ recovering: false });
    }
  };

  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => initial,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    initialize: () =>
      initialized ? (hydration ?? Promise.resolve()) : hydrate(),
    toggle,
    isFavorite: (id: string) =>
      snapshot.apartments.some((item) => item.id === id),
    retry,
  };
}
