import type { SearchResultItem } from "./api";
import type { SortOption } from "./api";

/** Parse price/rating from text when numeric fields are missing (e.g. from generic extractor). */
export function enrichSearchItems(items: SearchResultItem[]): SearchResultItem[] {
  return items.map((item) => {
    const enriched = { ...item };

    if (enriched.priceNumeric == null && enriched.price) {
      const num = parseFloat(enriched.price.replace(/[^0-9.]/g, ""));
      if (!isNaN(num)) enriched.priceNumeric = num;
    }

    if (enriched.ratingNumeric == null && enriched.ratingText) {
      const match = enriched.ratingText.match(/(\d+\.?\d*)/);
      if (match) {
        const num = parseFloat(match[1]);
        if (!isNaN(num) && num >= 0 && num <= 5) enriched.ratingNumeric = num;
      }
    }

    return enriched;
  });
}

/** Deterministic "random" 0-100 from string (for sustainability sort when no score). */
function hashToScore(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h % 101);
}

export function sortSearchResults(
  items: SearchResultItem[],
  sortBy: SortOption
): SearchResultItem[] {
  const enriched = enrichSearchItems(items);
  if (sortBy === "relevance") return enriched;

  const sorted = [...enriched].sort((a, b) => {
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
        const sa =
          a.sustainabilityScore ??
          (a.climatePledgeFriendly ? 50 : hashToScore(a.productUrl));
        const sb =
          b.sustainabilityScore ??
          (b.climatePledgeFriendly ? 50 : hashToScore(b.productUrl));
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
