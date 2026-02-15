import type { ProductPassport } from "./productModel";

const CACHE_KEY_PREFIX = "altcart-passport-";

export function getCachedPassport(id: string): ProductPassport | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY_PREFIX + id);
    if (!raw) return null;
    return JSON.parse(raw) as ProductPassport;
  } catch {
    return null;
  }
}

export function setCachedPassport(id: string, passport: ProductPassport): void {
  try {
    sessionStorage.setItem(CACHE_KEY_PREFIX + id, JSON.stringify(passport));
  } catch {
    /* ignore */
  }
}
