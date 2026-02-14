export class InvalidSearchUrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidSearchUrlError";
  }
}

export type SearchDomain = "amazon" | "walmart";

export interface ParsedSearchUrl {
  domain: SearchDomain;
  query: string;
  fullUrl: string;
}

export function parseSearchUrl(urlString: string): ParsedSearchUrl | null {
  try {
    const url = new URL(urlString);
    const host = url.hostname.toLowerCase();

    if (host.includes("amazon.com")) {
      if (url.pathname === "/s" || url.pathname.startsWith("/s?")) {
        const k = url.searchParams.get("k") || "";
        if (k.trim().length > 0) {
          return { domain: "amazon", query: k.trim(), fullUrl: url.toString() };
        }
      }
    }

    if (host.includes("walmart.com")) {
      if (url.pathname.startsWith("/search")) {
        const q = url.searchParams.get("q") || "";
        if (q.trim().length > 0) {
          return { domain: "walmart", query: q.trim(), fullUrl: url.toString() };
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function isSearchUrl(urlString: string): boolean {
  return parseSearchUrl(urlString) !== null;
}
