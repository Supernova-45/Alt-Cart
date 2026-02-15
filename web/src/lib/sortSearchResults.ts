import type { SearchResultItem } from "./api";
import type { SortOption } from "./api";

export function sortSearchResults(
  items: SearchResultItem[],
  sortBy: SortOption
): SearchResultItem[] {
  if (sortBy === "relevance") return [...items];

  const sorted = [...items].sort((a, b) => {
    switch (sortBy) {
      case "price_asc": {
        const pa = a.priceNumeric ?? Infinity;
        const pb = b.priceNumeric ?? Infinity;
        return pa - pb;
      }
      case "price_desc": {
        const pa = a.priceNumeric ?? -Infinity;
        const pb = b.priceNumeric ?? -Infinity;
        return pb - pa;
      }
      case "rating": {
        const ra = a.ratingNumeric ?? -Infinity;
        const rb = b.ratingNumeric ?? -Infinity;
        return rb - ra;
      }
      case "sustainability": {
        const sa = a.sustainabilityScore ?? (a.climatePledgeFriendly ? 50 : -Infinity);
        const sb = b.sustainabilityScore ?? (b.climatePledgeFriendly ? 50 : -Infinity);
        return sb - sa;
      }
      default:
        return 0;
    }
  });

  return sorted;
}

export function hasSustainabilityData(items: SearchResultItem[]): boolean {
  return items.some(
    (i) =>
      (i.sustainabilityScore != null && i.sustainabilityScore > 0) ||
      i.climatePledgeFriendly === true
  );
}
