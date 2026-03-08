interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export function cacheGet<T>(key: string): T | undefined {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

export function cacheSet<T>(key: string, value: T, ttlMs: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function cacheHas(key: string): boolean {
  return cacheGet(key) !== undefined;
}

export const TTL = {
  CENSUS: 86400000,
  INFRASTRUCTURE: 3600000,
  PARKS: 3600000,
  PERMITS: 900000,
  OSM: 1800000,
  PARCEL_LOOKUP: 1200000,
  ENRICH: 1200000,
};
