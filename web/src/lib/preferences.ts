import type { SortOption } from "./api";

const SORT_PREFERENCE_KEY = "altcart-sort-preference";

const VALID_SORT_OPTIONS: SortOption[] = [
  "relevance",
  "price_asc",
  "price_desc",
  "rating",
  "sustainability",
];

export function getSortPreference(): SortOption {
  if (typeof window === "undefined") return "relevance";
  const stored = localStorage.getItem(SORT_PREFERENCE_KEY);
  if (stored && VALID_SORT_OPTIONS.includes(stored as SortOption)) {
    return stored as SortOption;
  }
  return "relevance";
}

export function setSortPreference(value: SortOption): void {
  if (typeof window === "undefined") return;
  if (VALID_SORT_OPTIONS.includes(value)) {
    localStorage.setItem(SORT_PREFERENCE_KEY, value);
  }
}
