import type { ExtractSearchResponse } from "./api";

const CACHE_KEY = "altcart-search-results";

export function getCachedSearchResults(url: string): ExtractSearchResponse | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { url: cachedUrl, data } = JSON.parse(raw);
    if (cachedUrl !== url) return null;
    return { status: "success", data };
  } catch {
    return null;
  }
}

export function setCachedSearchResults(url: string, result: ExtractSearchResponse): void {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ url, data: result.data }));
  } catch {
    /* ignore */
  }
}
