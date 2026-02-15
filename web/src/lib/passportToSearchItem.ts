import type { SearchResultItem } from "./api";
import type { ProductPassport } from "./productModel";

/**
 * Convert a ProductPassport to SearchResultItem shape for sorting.
 * Used by SearchReader (demo search results).
 */
export function passportToSearchItem(passport: ProductPassport): SearchResultItem {
  let priceNumeric: number | undefined;
  if (passport.priceText) {
    const num = parseFloat(passport.priceText.replace(/[^0-9.]/g, ""));
    if (!isNaN(num)) priceNumeric = num;
  }

  let ratingNumeric: number | undefined;
  if (passport.ratingText) {
    const match = passport.ratingText.match(/(\d+\.?\d*)/);
    if (match) {
      const num = parseFloat(match[1]);
      if (!isNaN(num) && num >= 0 && num <= 5) ratingNumeric = num;
    }
  }

  const sustainabilityScore = passport.sustainability?.overallScore;
  const climatePledgeFriendly =
    (passport.sustainability?.sustainabilityBadges?.length ?? 0) > 0;

  return {
    name: passport.name,
    productUrl: `/p/${passport.id}`,
    price: passport.priceText,
    ratingText: passport.ratingText,
    reviewCountText: passport.reviewCountText,
    imageUrl: passport.imageUrl,
    priceNumeric,
    ratingNumeric,
    climatePledgeFriendly: climatePledgeFriendly || undefined,
    sustainabilityScore,
  };
}
