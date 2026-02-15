/**
 * Parse review count from raw text (e.g. "109K", "109.1K", "1.2M", "109,123").
 * Preserves K/M suffixes so the frontend can display "109K reviews" instead of "109 reviews".
 */
export function parseReviewCount(raw: string): string | undefined {
  if (!raw || typeof raw !== "string") return undefined;
  const cleaned = raw.replace(/,/g, "").trim().toUpperCase();
  const kMatch = cleaned.match(/([\d.]+)\s*K/);
  const mMatch = cleaned.match(/([\d.]+)\s*M/);
  if (kMatch) return `(${kMatch[1]}K)`;
  if (mMatch) return `(${mMatch[1]}M)`;
  const numMatch = cleaned.match(/\d+/);
  if (numMatch) return `(${numMatch[0]})`;
  return undefined;
}
