const COMPARE_KEY = "altcart-compare-ids";
const MAX_COMPARE = 3;

export function getCompareIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(COMPARE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string").slice(0, MAX_COMPARE);
  } catch {
    return [];
  }
}

const COMPARE_UPDATED = "altcart-compare-updated";

export function addToCompare(id: string): string[] {
  const current = getCompareIds();
  if (current.includes(id)) return current;
  const next = [...current, id].slice(0, MAX_COMPARE);
  if (typeof window !== "undefined") {
    localStorage.setItem(COMPARE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(COMPARE_UPDATED));
  }
  return next;
}

export function removeFromCompare(id: string): string[] {
  const current = getCompareIds().filter((x) => x !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(COMPARE_KEY, JSON.stringify(current));
    window.dispatchEvent(new CustomEvent(COMPARE_UPDATED));
  }
  return current;
}

export function clearCompare(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(COMPARE_KEY);
    window.dispatchEvent(new CustomEvent(COMPARE_UPDATED));
  }
}

export function onCompareUpdated(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(COMPARE_UPDATED, cb);
  return () => window.removeEventListener(COMPARE_UPDATED, cb);
}

export function getCompareUrl(): string {
  const ids = getCompareIds();
  if (ids.length === 0) return "/compare";
  return `/compare?ids=${ids.join(",")}`;
}

export { MAX_COMPARE };
