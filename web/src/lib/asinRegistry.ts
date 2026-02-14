export const ASIN_TO_SNAPSHOT: Record<string, string> = {
  B0C2JYLPBW: "adidas",
  B0CH9FJY8V: "adokoo",
  B07HJLRXBT: "puma",
  B0D31VM76T: "on",
};

export function asinFromAmazonUrl(url: string): string | null {
  const match = url.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
  return match ? match[1].toUpperCase() : null;
}

export function snapshotIdFromUrl(url: string): string | null {
  const asin = asinFromAmazonUrl(url);
  return asin ? (ASIN_TO_SNAPSHOT[asin] ?? null) : null;
}
