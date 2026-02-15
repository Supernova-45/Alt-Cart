export class InvalidSearchUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidSearchUrlError";
  }
}

export type SearchDomain =
  | "amazon"
  | "walmart"
  | "ebay"
  | "etsy"
  | "lowes"
  | "target"
  | "macys"
  | "homedepot"
  | "generic";

export interface ParsedSearchUrl {
  domain: SearchDomain;
  query: string;
  fullUrl: string;
}

/** E-commerce host patterns for generic extraction (partial match). */
const GENERIC_ECOMMERCE_PATTERNS = [
  "temu.com",
  "aliexpress",
  "uniqlo.com",
  "shein.com",
  "wish.com",
  "overstock.com",
  "wayfair.com",
  "bestbuy.com",
  "costco.com",
  "kohls.com",
  "nordstrom.com",
  "zappos.com",
  "asos.com",
  "hm.com",
  "gap.com",
  "oldnavy.com",
  "zara.com",
];

function isGenericEcommerceHost(host: string): boolean {
  const h = host.toLowerCase();
  return GENERIC_ECOMMERCE_PATTERNS.some((d) => h.includes(d));
}

function looksLikeSearchOrProductPage(path: string, params: URLSearchParams): boolean {
  const p = path.toLowerCase();
  return (
    p.includes("/search") ||
    p.includes("/w/") ||
    p.includes("/s/") ||
    p.includes("/shop") ||
    p.includes("/browse") ||
    p.includes("/category") ||
    p.includes("/products") ||
    p.includes("/item") ||
    p.includes("/product") ||
    p.includes("/p/") ||
    params.has("q") ||
    params.has("keyword") ||
    params.has("searchTerm") ||
    params.has("search") ||
    /\/[a-z0-9-]+-g-\d+\.html/i.test(p) || // Temu product: name-g-123.html
    /\/item\/\d+\.html/i.test(p) || // AliExpress item
    /\/products\/[^/]+\/\d+/i.test(p) // Uniqlo product
  );
}

function extractGenericQuery(host: string, url: URL): string {
  const params = url.searchParams;
  const path = url.pathname;
  const q =
    params.get("q") ||
    params.get("keyword") ||
    params.get("searchTerm") ||
    params.get("search") ||
    "";
  if (q.trim()) return q.trim();
  const pathMatch = path.match(/\/w\/([^/?.]+)/);
  if (pathMatch) return decodeURIComponent(pathMatch[1].replace(/-/g, " ")).trim();
  const pathMatch2 = path.match(/\/s\/([^/?.]+)/);
  if (pathMatch2) return decodeURIComponent(pathMatch2[1].replace(/-/g, " ")).trim();
  const productMatch = path.match(/-([a-z0-9-]+)-g-\d+\.html/i);
  if (productMatch) return productMatch[1].replace(/-/g, " ").trim();
  return url.hostname;
}

function extractQuery(host: string, url: URL): { domain: SearchDomain; query: string } | null {
  const path = url.pathname.toLowerCase();
  const params = url.searchParams;

  if (host.includes("amazon.com")) {
    if (path === "/s" || path.startsWith("/s")) {
      const k = params.get("k") || "";
      if (k.trim().length > 0) return { domain: "amazon", query: k.trim() };
    }
  }

  if (host.includes("walmart.com")) {
    if (path.startsWith("/search")) {
      const q = params.get("q") || "";
      if (q.trim().length > 0) return { domain: "walmart", query: q.trim() };
    }
  }

  if (host.includes("ebay.com")) {
    if (path.includes("/sch/") || path.includes("/s/")) {
      const nkw = params.get("_nkw") || params.get("nkw") || "";
      if (nkw.trim().length > 0) return { domain: "ebay", query: nkw.trim() };
    }
  }

  if (host.includes("etsy.com")) {
    if (path.startsWith("/search")) {
      const q = params.get("q") || "";
      if (q.trim().length > 0) return { domain: "etsy", query: q.trim() };
    }
  }

  if (host.includes("lowes.com")) {
    if (path.startsWith("/search") || path.startsWith("/pl/")) {
      const q = params.get("searchTerm") || params.get("q") || "";
      if (q.trim().length > 0) return { domain: "lowes", query: q.trim() };
    }
  }

  if (host.includes("target.com")) {
    if (path === "/s" || path.startsWith("/s?")) {
      const q = params.get("searchTerm") || params.get("q") || "";
      if (q.trim().length > 0) return { domain: "target", query: q.trim() };
    }
  }

  if (host.includes("macys.com")) {
    if (path.includes("/shop/search") || path.includes("/shop/")) {
      const q = params.get("keyword") || params.get("q") || "";
      if (q.trim().length > 0) return { domain: "macys", query: q.trim() };
    }
  }

  if (host.includes("homedepot.com")) {
    if (path.startsWith("/s/")) {
      const match = path.match(/^\/s\/([^/?]+)/);
      if (match && match[1]) return { domain: "homedepot", query: decodeURIComponent(match[1].replace(/\+/g, " ")).trim() };
    }
  }

  return null;
}

export function parseSearchUrl(urlString: string): ParsedSearchUrl | null {
  try {
    const url = new URL(urlString);
    const host = url.hostname.toLowerCase();
    const path = url.pathname;
    const params = url.searchParams;

    const parsed = extractQuery(host, url);
    if (parsed) {
      return { ...parsed, fullUrl: url.toString() };
    }

    // Generic fallback: accept e-commerce URLs not in the main whitelist
    if (isGenericEcommerceHost(host) || looksLikeSearchOrProductPage(path, params)) {
      const query = extractGenericQuery(host, url);
      return {
        domain: "generic",
        query: query || host,
        fullUrl: url.toString(),
      };
    }

    return null;
  } catch {
    return null;
  }
}

export function isSearchUrl(urlString: string): boolean {
  return parseSearchUrl(urlString) !== null;
}
