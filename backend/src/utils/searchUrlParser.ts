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
  | "homedepot";

export interface ParsedSearchUrl {
  domain: SearchDomain;
  query: string;
  fullUrl: string;
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
    const parsed = extractQuery(host, url);
    if (parsed) {
      return { ...parsed, fullUrl: url.toString() };
    }
    return null;
  } catch {
    return null;
  }
}

export function isSearchUrl(urlString: string): boolean {
  return parseSearchUrl(urlString) !== null;
}
