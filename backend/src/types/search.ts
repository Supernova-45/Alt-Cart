export interface SearchResultItem {
  name: string;
  price?: string;
  ratingText?: string;
  reviewCountText?: string;
  imageUrl?: string;
  productUrl: string;
  /** Numeric price for sorting (parsed from price string or raw value). */
  priceNumeric?: number;
  /** Numeric rating (0-5) for sorting. */
  ratingNumeric?: number;
  /** Whether product has Climate Pledge Friendly or similar badge (Amazon/Walmart). */
  climatePledgeFriendly?: boolean;
  /** Sustainability score 0-100 for sorting when available. */
  sustainabilityScore?: number;
}
