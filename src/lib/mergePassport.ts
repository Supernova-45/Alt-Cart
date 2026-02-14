import type { ProductPassport } from "./productModel";
import type { ParsedProductFields } from "./parseProductSnapshot";

export function mergePassport(
  fallback: ProductPassport,
  parsed: ParsedProductFields
): ProductPassport {
  const merged = { ...fallback };

  if (parsed.title && parsed.title.length > 0) {
    merged.name = parsed.title;
  }
  if (parsed.priceText && parsed.priceText.length > 0) {
    merged.priceText = parsed.priceText;
  }
  if (parsed.ratingText && parsed.ratingText.length > 0) {
    merged.ratingText = parsed.ratingText;
  }
  if (parsed.reviewCountText && parsed.reviewCountText.length > 0) {
    merged.reviewCountText = parsed.reviewCountText;
  }

  return merged;
}
