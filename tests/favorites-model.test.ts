import { describe, expect, it, vi } from "vitest";
import { catalogDemoApartments } from "../constants/mock-data";
import {
  createFavoritesStore,
  decodeFavorites,
  encodeFavorites,
  FAVORITES_STORAGE_KEY,
  favoritesLabel,
  type FavoritesStorage,
} from "../lib/favorites-model";

const [a, b, c] = catalogDemoApartments;
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function adapter(raw: string | null = null) {
  let value = raw;
  return {
    getItem: vi.fn(async () => value),
    setItem: vi.fn(async (_key: string, next: string) => {
      value = next;
    }),
    value: () => value,
  };
}
async function settle() {
  for (let index = 0; index < 12; index += 1) await Promise.resolve();
}

describe("favorites serialization", () => {
  it("round-trips only allowlisted public apartment data, never session or lead PII", () => {
    const tainted = {
      ...a,
      phone: "+70000000000",
      email: "secret@example.com",
      access_token: "secret",
      user_id: "private-user",
      payload: { name: "private" },
    };
    const raw = encodeFavorites([tainted]);
    expect(decodeFavorites(raw)).toEqual([a]);
    for (const key of [
      "phone",
      "email",
      "access_token",
      "user_id",
      "payload",
      "private",
    ])
      expect(raw).not.toContain(key);
  });
  it("deduplicates ids and handles an absent key", () => {
    expect(decodeFavorites(null)).toEqual([]);
    expect(decodeFavorites(encodeFavorites([a, a, b]))).toEqual([a, b]);
  });
  it("rejects malformed or incompatible storage and invalid prices", () => {
    for (const raw of [
      "bad JSON",
      "{}",
      '{"version":2,"apartments":[]}',
      '{"version":1,"apartments":[{}]}',
    ])
      expect(() => decodeFavorites(raw)).toThrow();
    expect(() => encodeFavorites([{ ...a, price: -1 }])).toThrow();
    expect(() => encodeFavorites([{ ...a, price: Infinity }])).toThrow();
  });
  it.each([
    [0, "0 квартир"],
    [1, "1 квартира"],
    [3, "3 квартиры"],
    [11, "11 квартир"],
    [21, "21 квартира"],
    [22, "22 квартиры"],
  ])("pluralizes %s", (count, label) =>
    expect(favoritesLabel(Number(count))).toBe(label),
  );
});

describe("favorites external store", () => {
  it("never loads storage at construction, subscription, server snapshot, or pre-hydration toggle", () => {
    const load = vi.fn(async () => adapter());
    const store = createFavoritesStore(load);
    const server = store.getServerSnapshot();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    expect(store.getSnapshot()).toBe(store.getSnapshot());
    store.toggle(a);
    expect(load).not.toHaveBeenCalled();
    expect(store.getServerSnapshot()).toBe(server);
    expect(server).toEqual({
      apartments: [],
      hydrated: false,
      error: null,
      recovering: false,
    });
    expect(listener).toHaveBeenCalledOnce();
    unsubscribe();
    store.toggle(b);
    expect(listener).toHaveBeenCalledOnce();
  });
  it("hydrates once across concurrent mounts and never writes an initial empty value over saved data", async () => {
    const storage = adapter(encodeFavorites([a]));
    const load = vi.fn(async () => storage);
    const store = createFavoritesStore(load);
    await Promise.all([
      store.initialize(),
      store.initialize(),
      store.initialize(),
    ]);
    expect(load).toHaveBeenCalledOnce();
    expect(storage.getItem).toHaveBeenCalledWith(FAVORITES_STORAGE_KEY);
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(store.getSnapshot()).toMatchObject({
      apartments: [a],
      hydrated: true,
      error: null,
    });
  });
  it("merges delayed hydration with latest desired membership instead of blindly replaying toggles", async () => {
    const read = deferred<string | null>();
    const storage = adapter();
    storage.getItem = vi.fn(() => read.promise);
    const store = createFavoritesStore(async () => storage);
    const hydration = store.initialize();
    store.toggle(a); // save an id already present in storage
    store.toggle(b);
    store.toggle(b); // undo while hydration is still in flight
    store.toggle(c);
    read.resolve(encodeFavorites([a, b]));
    await hydration;
    expect(store.getSnapshot().apartments).toEqual([a, c]);
    expect(decodeFavorites(storage.value())).toEqual([a, c]);
  });
  it("reflects a toggle immediately to all subscribers and removes without duplicates", async () => {
    const storage = adapter();
    const store = createFavoritesStore(async () => storage);
    await store.initialize();
    const first = vi.fn();
    const second = vi.fn();
    store.subscribe(first);
    store.subscribe(second);
    store.toggle(a);
    expect(store.isFavorite(a.id)).toBe(true);
    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
    store.toggle(a);
    expect(store.isFavorite(a.id)).toBe(false);
    await settle();
    expect(decodeFavorites(storage.value())).toEqual([]);
  });
  it("serializes writes and drains the newest snapshot when rapid actions arrive mid-write", async () => {
    const firstWrite = deferred<void>();
    const writes: string[] = [];
    let active = 0;
    let maxActive = 0;
    const storage: FavoritesStorage = {
      getItem: async () => null,
      setItem: async (_key, value) => {
        active += 1;
        maxActive = Math.max(maxActive, active);
        writes.push(value);
        if (writes.length === 1) await firstWrite.promise;
        active -= 1;
      },
    };
    const store = createFavoritesStore(async () => storage);
    await store.initialize();
    store.toggle(a);
    store.toggle(b);
    store.toggle(a);
    store.toggle(c);
    expect(store.getSnapshot().apartments).toEqual([b, c]);
    expect(writes).toHaveLength(1);
    firstWrite.resolve();
    await settle();
    expect(maxActive).toBe(1);
    expect(decodeFavorites(writes[writes.length - 1])).toEqual([b, c]);
  });
  it("keeps read-failure actions in memory and merges them on explicit recovery", async () => {
    const storage = adapter(encodeFavorites([a]));
    let unavailable = true;
    const store = createFavoritesStore(async () => {
      if (unavailable) throw new Error("Storage blocked");
      return storage;
    });
    await store.initialize();
    expect(store.getSnapshot()).toMatchObject({
      hydrated: true,
      error: "read",
    });
    store.toggle(b);
    store.toggle(c);
    store.toggle(c);
    expect(store.getSnapshot().apartments).toEqual([b]);
    expect(storage.setItem).not.toHaveBeenCalled();
    unavailable = false;
    await store.retry();
    expect(store.getSnapshot()).toMatchObject({
      apartments: [a, b],
      error: null,
      recovering: false,
    });
    expect(decodeFavorites(storage.value())).toEqual([a, b]);
  });
  it("treats corrupt storage as a visible recoverable error, not fake empty success", async () => {
    const storage = adapter("{bad JSON");
    const store = createFavoritesStore(async () => storage);
    store.toggle(b);
    await store.initialize();
    expect(store.getSnapshot()).toMatchObject({
      apartments: [b],
      hydrated: true,
      error: "read",
    });
    expect(storage.setItem).not.toHaveBeenCalled();
    storage.getItem = vi.fn(async () => encodeFavorites([a]));
    await store.retry();
    expect(store.getSnapshot()).toMatchObject({
      apartments: [a, b],
      error: null,
    });
  });
  it("recovers failed writes without re-reading away newer actions", async () => {
    const storage = adapter();
    let fail = true;
    const save = storage.setItem;
    storage.setItem = vi.fn(async (key, value) => {
      if (fail) throw new Error("Quota exceeded");
      await save(key, value);
    });
    const store = createFavoritesStore(async () => storage);
    await store.initialize();
    store.toggle(a);
    await settle();
    expect(store.getSnapshot()).toMatchObject({
      apartments: [a],
      error: "write",
    });
    store.toggle(b);
    await settle();
    fail = false;
    await store.retry();
    expect(storage.getItem).toHaveBeenCalledOnce();
    expect(store.getSnapshot()).toMatchObject({
      apartments: [a, b],
      hydrated: true,
      error: null,
      recovering: false,
    });
    expect(decodeFavorites(storage.value())).toEqual([a, b]);
  });
  it("persists successful removals through a new store instance", async () => {
    const storage = adapter(encodeFavorites([a, b]));
    const first = createFavoritesStore(async () => storage);
    await first.initialize();
    first.toggle(a);
    await settle();
    const second = createFavoritesStore(async () => storage);
    await second.initialize();
    expect(second.getSnapshot().apartments).toEqual([b]);
  });
});
