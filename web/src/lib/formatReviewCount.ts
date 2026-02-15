/**
 * Format review count for display. Expands K/M to full numbers (e.g. "109K" → "109,000").
 */
export function formatReviewCount(reviewCountText: string | undefined): string | undefined {
  if (!reviewCountText) return undefined;
  const trimmed = reviewCountText.trim().replace(/,/g, "").toUpperCase();
  const kMatch = trimmed.match(/([\d.]+)\s*K/);
  const mMatch = trimmed.match(/([\d.]+)\s*M/);
  if (kMatch) {
    const n = Math.round(parseFloat(kMatch[1]) * 1000);
    if (!isNaN(n)) return n.toLocaleString();
  }
  if (mMatch) {
    const n = Math.round(parseFloat(mMatch[1]) * 1000000);
    if (!isNaN(n)) return n.toLocaleString();
  }
  const numMatch = trimmed.match(/\d+/);
  if (numMatch && numMatch[0].length >= 2) {
    const num = parseInt(numMatch[0], 10);
    return num.toLocaleString();
  }
  return undefined;
}
