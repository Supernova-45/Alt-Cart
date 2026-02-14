export type OpenTarget =
  | { kind: "product"; id: string }
  | { kind: "search"; id: string }
  | { kind: "unsupported"; reason: string };

const AMAZON_ASIN_TO_ID: Record<string, string> = {
  B0C2JYLPBW: "adidas",
  B0CH9FJY8V: "adokoo",
  B07HJLRXBT: "puma",
  B0D31VM76T: "on",
};

const WALMART_ITEM_TO_ID: Record<string, string> = {
  "1471296137": "w_ozark",
  "14872503935": "w_dakimoe",
  "14404266424": "w_eastsport",
  "15069965017": "w_madden",
  "1300931587": "w_honglong",
  "509756986": "w_reebok",
};

function getHost(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function getPath(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    return "";
  }
}

function getQuery(url: string): URLSearchParams {
  try {
    return new URL(url).searchParams;
  } catch {
    return new URLSearchParams();
  }
}

function amazonAsinFromUrl(url: string): string | null {
  const match = url.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
  return match ? match[1].toUpperCase() : null;
}

function walmartItemIdFromUrl(url: string): string | null {
  const match = url.match(/\/ip\/[^/]+\/(\d+)(?:\?|$)/);
  return match ? match[1] : null;
}

function ebayItemIdFromUrl(url: string): string | null {
  const match = url.match(/\/itm\/(\d+)/);
  return match ? match[1] : null;
}

function targetProductIdFromUrl(url: string): string | null {
  const match = url.match(/\/-\/A-(\d+)/);
  return match ? match[1] : null;
}

function macysProductIdFromUrl(url: string): string | null {
  try {
    return new URL(url).searchParams.get("ID");
  } catch {
    return null;
  }
}

export function urlToDemo(url: string): OpenTarget {
  const host = getHost(url);
  const path = getPath(url);
  const query = getQuery(url);

  if (!host) {
    return { kind: "unsupported", reason: "unknown_host" };
  }

  const isAmazon = host.includes("amazon.com");
  const isWalmart = host.includes("walmart.com");

  if (isAmazon) {
    const asin = amazonAsinFromUrl(url);
    if (asin && asin in AMAZON_ASIN_TO_ID) {
      return { kind: "product", id: AMAZON_ASIN_TO_ID[asin] };
    }
    if (path === "/s" || path.startsWith("/s?")) {
      const k = query.get("k") || "";
      if (k.toLowerCase().includes("white") && k.toLowerCase().includes("sneaker")) {
        return { kind: "search", id: "a_search" };
      }
      return { kind: "unsupported", reason: "wrong_query" };
    }
    if (asin) {
      return { kind: "unsupported", reason: "unknown_item" };
    }
  }

  if (isWalmart) {
    const itemId = walmartItemIdFromUrl(url);
    if (itemId && itemId in WALMART_ITEM_TO_ID) {
      return { kind: "product", id: WALMART_ITEM_TO_ID[itemId] };
    }
    if (path.startsWith("/search")) {
      const q = query.get("q") || "";
      if (q.toLowerCase().includes("backpack")) {
        return { kind: "search", id: "w_search" };
      }
      return { kind: "unsupported", reason: "wrong_query" };
    }
    if (itemId) {
      return { kind: "unsupported", reason: "unknown_item" };
    }
  }

  const isEbay = host.includes("ebay.com");
  const isTarget = host.includes("target.com");
  const isMacys = host.includes("macys.com");

  if (isEbay && ebayItemIdFromUrl(url)) {
    return { kind: "unsupported", reason: "unknown_item" };
  }
  if (isTarget && targetProductIdFromUrl(url)) {
    return { kind: "unsupported", reason: "unknown_item" };
  }
  if (isMacys && macysProductIdFromUrl(url)) {
    return { kind: "unsupported", reason: "unknown_item" };
  }

  return { kind: "unsupported", reason: "unknown_host" };
}

/**
 * Returns true if the URL is a valid product page (Amazon, Walmart, eBay, Target, Macy's)
 * that is NOT in the demo registry (i.e. should go to extraction flow).
 */
export function isExtractableProductUrl(url: string): boolean {
  const target = urlToDemo(url);
  return target.kind === "unsupported" && target.reason === "unknown_item";
}
