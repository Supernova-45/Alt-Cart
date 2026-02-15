import type { ReturnRisk } from "../models/productModel";

const RETURN_REASONS = [
  "Sizing didn't match expectations",
  "Quality issues or defects",
  "Wrong color or style in person",
  "Didn't fit as described",
  "Material felt cheaper than expected",
  "Returned for a different size",
  "Arrived damaged or defective",
  "Not as comfortable as expected",
  "Changed my mind after purchase",
  "Too small / runs small",
  "Too large / runs large",
  "Zipper or closure broke quickly",
  "Not worth the price for the quality",
  "Shipping took too long, found elsewhere",
  "Color didn't match product photos",
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededInt(seed: string, min: number, max: number): number {
  const h = hash(seed);
  return min + (h % (max - min + 1));
}

function pickFromPool<T>(seed: string, pool: T[], count: number): T[] {
  const used = new Set<number>();
  const result: T[] = [];
  for (let i = 0; result.length < count && i < pool.length * 2; i++) {
    const idx = (hash(seed + ":" + i) + i * 31) % pool.length;
    if (!used.has(idx)) {
      used.add(idx);
      result.push(pool[idx]);
    }
  }
  return result;
}

export function generateReturnRisk(productName: string, ratingText?: string): ReturnRisk {
  const pctNegative = seededInt(productName + ":pct", 5, 20);
  const rating = parseRating(ratingText);
  const reasons = pickFromPool(productName + ":reasons", RETURN_REASONS, 2);

  const drivers: string[] = [
    `${pctNegative}% of reviews are 1-2 stars`,
    rating != null ? `Overall rating: ${rating.toFixed(1)}/5` : "Based on customer feedback",
    ...reasons,
  ];

  const ratingScore = rating != null ? Math.max(0, (5 - rating) / 4) : 0.3;
  const pctScore = (pctNegative - 5) / 15;
  const score = Math.min(0.5 * pctScore + 0.5 * ratingScore, 1);
  const label: "Low" | "Medium" | "High" = score < 0.33 ? "Low" : score < 0.66 ? "Medium" : "High";

  return { score, label, drivers: drivers.slice(0, 4) };
}

function parseRating(ratingText?: string): number | null {
  if (!ratingText || typeof ratingText !== "string") return null;
  const match = ratingText.match(/(\d+\.?\d*)\s*(?:out of\s*5|[/]\s*5)?/i);
  if (match) {
    const n = parseFloat(match[1]);
    return n >= 0 && n <= 5 ? n : null;
  }
  return null;
}
