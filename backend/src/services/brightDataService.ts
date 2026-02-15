import { config } from "../config/env";
import { logger } from "../utils/logger";

export interface SerpSearchResultItem {
  name: string;
  price?: string;
  ratingText?: string;
  reviewCountText?: string;
  imageUrl?: string;
  productUrl: string;
}

export interface AmazonScrapeOptions {
  sort_by?: string;
  zipcode?: string;
}

export interface WalmartScrapeOptions {
  all_variations?: boolean;
}

export type ScraperDomain = "amazon" | "walmart";

/**
 * Bright Data Amazon - Discover by keyword.
 * Input: { keyword }
 * Query: type=discover_new&discover_by=keyword
 */
export async function scrapeAmazonByKeyword(
  datasetId: string,
  keyword: string
): Promise<unknown[] | { snapshotId: string; status: "pending" }> {
  const apiKey = config.brightData?.apiKey;
  if (!apiKey) {
    throw new Error("BRIGHTDATA_API_KEY is not configured");
  }

  const inputEntry = { keyword: keyword.trim() };
  const queryParams =
    "dataset_id=" +
    encodeURIComponent(datasetId) +
    "&format=json&notify=false&include_errors=true&type=discover_new&discover_by=keyword";

  const response = await fetch(
    `https://api.brightdata.com/datasets/v3/scrape?${queryParams}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: [inputEntry] }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    logger.warn("Bright Data Amazon keyword scraper error", { status: response.status, text });
    throw new Error(`Bright Data Amazon error: ${response.status} ${text}`);
  }

  if (response.status === 202) {
    const data = (await response.json()) as { snapshot_id?: string };
    return { snapshotId: data.snapshot_id || "", status: "pending" };
  }

  const data = await response.json();
  if (Array.isArray(data)) return data;
  if (data?.records && Array.isArray(data.records)) return data.records;
  if (data?.results && Array.isArray(data.results)) return data.results;
  return [];
}

/**
 * Bright Data Walmart - Discover by keyword.
 * Input: { keyword, domain, all_variations? }
 * Query: type=discover_new&discover_by=keyword
 */
export async function scrapeWalmartByKeyword(
  datasetId: string,
  keyword: string,
  options?: WalmartScrapeOptions
): Promise<unknown[] | { snapshotId: string; status: "pending" }> {
  const apiKey = config.brightData?.apiKey;
  if (!apiKey) {
    throw new Error("BRIGHTDATA_API_KEY is not configured");
  }

  const inputEntry: Record<string, string | boolean> = {
    keyword: keyword.trim(),
    domain: "https://www.walmart.com/",
    all_variations: options?.all_variations ?? true,
  };

  const queryParams =
    "dataset_id=" +
    encodeURIComponent(datasetId) +
    "&format=json&notify=false&include_errors=true&type=discover_new&discover_by=keyword";

  const response = await fetch(
    `https://api.brightdata.com/datasets/v3/scrape?${queryParams}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: [inputEntry] }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    logger.warn("Bright Data Walmart keyword scraper error", { status: response.status, text });
    throw new Error(`Bright Data Walmart error: ${response.status} ${text}`);
  }

  if (response.status === 202) {
    const data = (await response.json()) as { snapshot_id?: string };
    return { snapshotId: data.snapshot_id || "", status: "pending" };
  }

  const data = await response.json();
  if (Array.isArray(data)) return data;
  if (data?.records && Array.isArray(data.records)) return data.records;
  if (data?.results && Array.isArray(data.results)) return data.results;
  return [];
}

export interface KeywordsScrapeOptions {
  location?: string;
  zipcode?: string;
  page?: number;
}

/**
 * Bright Data eBay - Discover by keywords.
 * Input: { keywords }
 * Query: type=discover_new&discover_by=keywords
 */
export async function scrapeEbayByKeywords(
  datasetId: string,
  keywords: string
): Promise<unknown[] | { snapshotId: string; status: "pending" }> {
  return scrapeByKeywords(datasetId, keywords, "keywords");
}

/**
 * Bright Data Etsy - Discover by keywords.
 * Input: { keywords }
 * Query: type=discover_new&discover_by=keywords
 */
export async function scrapeEtsyByKeywords(
  datasetId: string,
  keywords: string
): Promise<unknown[] | { snapshotId: string; status: "pending" }> {
  return scrapeByKeywords(datasetId, keywords, "keywords");
}

/**
 * Bright Data Lowes - Discover by keywords.
 * Input: { keywords, location? }
 * Query: type=discover_new&discover_by=keywords
 */
export async function scrapeLowesByKeywords(
  datasetId: string,
  keywords: string,
  options?: KeywordsScrapeOptions
): Promise<unknown[] | { snapshotId: string; status: "pending" }> {
  return scrapeByKeywords(datasetId, keywords, "keywords", options);
}

/**
 * Bright Data Target - Discover by keywords.
 * Input: { keywords, zipcode? }
 * Query: type=discover_new&discover_by=keywords
 */
export async function scrapeTargetByKeywords(
  datasetId: string,
  keywords: string,
  options?: KeywordsScrapeOptions
): Promise<unknown[] | { snapshotId: string; status: "pending" }> {
  return scrapeByKeywords(datasetId, keywords, "keywords", options);
}

/**
 * Bright Data Macy's - Discover by keyword.
 * Input: { keyword, page? }
 * Query: type=discover_new&discover_by=keyword
 */
export async function scrapeMacysByKeyword(
  datasetId: string,
  keyword: string,
  options?: KeywordsScrapeOptions
): Promise<unknown[] | { snapshotId: string; status: "pending" }> {
  return scrapeByKeyword(datasetId, keyword, options);
}

/**
 * Bright Data Home Depot - Discover by keyword.
 * Input: { keyword }
 * Query: type=discover_new&discover_by=keyword
 */
export async function scrapeHomeDepotByKeyword(
  datasetId: string,
  keyword: string
): Promise<unknown[] | { snapshotId: string; status: "pending" }> {
  return scrapeByKeyword(datasetId, keyword);
}

async function scrapeByKeywords(
  datasetId: string,
  keywords: string,
  discoverBy: "keywords",
  options?: KeywordsScrapeOptions
): Promise<unknown[] | { snapshotId: string; status: "pending" }> {
  const apiKey = config.brightData?.apiKey;
  if (!apiKey) throw new Error("BRIGHTDATA_API_KEY is not configured");

  const inputEntry: Record<string, string | number | boolean> = { keywords: keywords.trim() };
  if (options?.location) inputEntry.location = options.location;
  if (options?.zipcode !== undefined && options.zipcode !== null) inputEntry.zipcode = String(options.zipcode);

  const queryParams =
    "dataset_id=" +
    encodeURIComponent(datasetId) +
    "&format=json&notify=false&include_errors=true&type=discover_new&discover_by=" +
    discoverBy;

  return executeScrapeRequest(apiKey, queryParams, inputEntry);
}

async function scrapeByKeyword(
  datasetId: string,
  keyword: string,
  options?: KeywordsScrapeOptions
): Promise<unknown[] | { snapshotId: string; status: "pending" }> {
  const apiKey = config.brightData?.apiKey;
  if (!apiKey) throw new Error("BRIGHTDATA_API_KEY is not configured");

  const inputEntry: Record<string, string | number | boolean> = { keyword: keyword.trim() };
  if (options?.page != null) inputEntry.page = options.page;

  const queryParams =
    "dataset_id=" +
    encodeURIComponent(datasetId) +
    "&format=json&notify=false&include_errors=true&type=discover_new&discover_by=keyword";

  return executeScrapeRequest(apiKey, queryParams, inputEntry);
}

async function executeScrapeRequest(
  apiKey: string,
  queryParams: string,
  inputEntry: Record<string, string | number | boolean>
): Promise<unknown[] | { snapshotId: string; status: "pending" }> {
  const response = await fetch(
    `https://api.brightdata.com/datasets/v3/scrape?${queryParams}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: [inputEntry] }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    logger.warn("Bright Data scrape error", { status: response.status, text });
    throw new Error(`Bright Data scrape error: ${response.status} ${text}`);
  }

  if (response.status === 202) {
    const data = (await response.json()) as { snapshot_id?: string };
    return { snapshotId: data.snapshot_id || "", status: "pending" };
  }

  const data = await response.json();
  if (Array.isArray(data)) return data;
  if (data?.records && Array.isArray(data.records)) return data.records;
  if (data?.results && Array.isArray(data.results)) return data.results;
  return [];
}

/**
 * Bright Data Web Scraper API - fetch structured data from search/catalog pages.
 * Amazon: { input: [{ url, sort_by?, zipcode? }] }
 */
export async function scrapeSearchResults(
  datasetId: string,
  url: string,
  domain: ScraperDomain,
  options?: AmazonScrapeOptions | WalmartScrapeOptions
): Promise<unknown[] | { snapshotId: string; status: "pending" }> {
  const apiKey = config.brightData?.apiKey;
  if (!apiKey) {
    throw new Error("BRIGHTDATA_API_KEY is not configured");
  }

  const fullUrl = url.startsWith("http") ? url : `https://${url}`;

  let inputEntry: Record<string, string | boolean>;
  let queryParams = "dataset_id=" + encodeURIComponent(datasetId) + "&format=json&notify=false&include_errors=true";

  if (domain === "walmart") {
    inputEntry = {
      category_url: fullUrl,
      all_variations: (options as WalmartScrapeOptions)?.all_variations ?? true,
    };
    queryParams += "&type=discover_new&discover_by=category_url";
  } else {
    inputEntry = { url: fullUrl };
    const amazonOpts = options as AmazonScrapeOptions | undefined;
    if (amazonOpts?.sort_by) inputEntry.sort_by = amazonOpts.sort_by;
    if (amazonOpts?.zipcode) inputEntry.zipcode = amazonOpts.zipcode;
  }

  const response = await fetch(
    `https://api.brightdata.com/datasets/v3/scrape?${queryParams}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: [inputEntry] }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    logger.warn("Bright Data Web Scraper error", { status: response.status, text });
    throw new Error(`Bright Data Web Scraper error: ${response.status} ${text}`);
  }

  // 202 = async, job queued
  if (response.status === 202) {
    const data = (await response.json()) as { snapshot_id?: string };
    return {
      snapshotId: data.snapshot_id || "",
      status: "pending",
    };
  }

  const data = await response.json();

  // Response can be array of records or { records: [...] }
  if (Array.isArray(data)) {
    return data;
  }
  if (data?.records && Array.isArray(data.records)) {
    return data.records;
  }
  if (data?.results && Array.isArray(data.results)) {
    return data.results;
  }

  return [];
}

/**
 * Bright Data Web Unlocker - fetch raw HTML from any URL.
 */
export async function fetchHtml(url: string): Promise<string> {
  const apiKey = config.brightData?.apiKey;
  const zone = config.brightData?.unlockerZone;
  if (!apiKey || !zone) {
    throw new Error("BRIGHTDATA_API_KEY and BRIGHTDATA_UNLOCKER_ZONE must be configured");
  }

  const fullUrl = url.startsWith("http") ? url : `https://${url}`;

  const response = await fetch("https://api.brightdata.com/request", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      zone,
      url: fullUrl,
      format: "raw",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    logger.warn("Bright Data Web Unlocker error", { status: response.status, url: fullUrl });
    throw new Error(`Bright Data Web Unlocker error: ${response.status} ${text}`);
  }

  return response.text();
}

export type SerpSite = "amazon" | "walmart" | "ebay" | "etsy" | "lowes" | "target" | "macys" | "homedepot";

const SERP_SITE_FILTERS: Record<SerpSite, string> = {
  amazon: "site:amazon.com",
  walmart: "site:walmart.com",
  ebay: "site:ebay.com",
  etsy: "site:etsy.com",
  lowes: "site:lowes.com",
  target: "site:target.com",
  macys: "site:macys.com",
  homedepot: "site:homedepot.com",
};

/**
 * Bright Data SERP API - search Google and get parsed results.
 */
export async function searchViaSerp(
  query: string,
  site?: SerpSite
): Promise<SerpSearchResultItem[]> {
  const apiKey = config.brightData?.apiKey;
  const zone = config.brightData?.serpZone;
  if (!apiKey || !zone) {
    throw new Error("BRIGHTDATA_API_KEY and BRIGHTDATA_SERP_ZONE must be configured");
  }

  const siteFilter = site ? SERP_SITE_FILTERS[site] : "";
  const searchQuery = siteFilter ? `${query} ${siteFilter}` : query;
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&num=20`;

  const response = await fetch("https://api.brightdata.com/request", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      zone,
      url: searchUrl,
      format: "json",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    logger.warn("Bright Data SERP error", { status: response.status });
    throw new Error(`Bright Data SERP error: ${response.status} ${text}`);
  }

  const data = (await response.json()) as Record<string, unknown>;
  return mapSerpToSearchResults(data, site);
}

const SERP_PRODUCT_PATTERNS: Record<SerpSite, RegExp[]> = {
  amazon: [/\/dp\//, /\/gp\/product\//],
  walmart: [/\/ip\//],
  ebay: [/\/itm\//],
  etsy: [/\/listing\//],
  lowes: [/\/pd\//],
  target: [/\/p\//, /\/-\/A-/],
  macys: [/\/shop\/product\//],
  homedepot: [/\/p\//],
};

function mapSerpToSearchResults(data: Record<string, unknown>, site?: SerpSite): SerpSearchResultItem[] {
  const items: SerpSearchResultItem[] = [];
  const organic = data.organic_results as Array<{ title?: string; link?: string; snippet?: string }> | undefined;
  if (!organic || !Array.isArray(organic)) return items;

  const baseHost = site ? SERP_SITE_FILTERS[site].replace("site:", "") : null;
  const productPatterns = site ? SERP_PRODUCT_PATTERNS[site] : [/\/dp\//, /\/ip\//, /\/itm\//, /\/listing\//, /\/pd\//, /\/p\//];

  for (const r of organic) {
    const link = r.link;
    if (!link || typeof link !== "string") continue;
    if (baseHost && !link.toLowerCase().includes(baseHost)) continue;

    const isProduct = productPatterns.some((p) => p.test(link));
    if (!isProduct) continue;

    const name = (r.title || r.snippet || "").trim();
    if (!name || name.length < 5) continue;

    items.push({
      name: name.slice(0, 200),
      productUrl: link,
      ratingText: undefined,
      reviewCountText: undefined,
      price: undefined,
      imageUrl: undefined,
    });
  }

  return items.slice(0, 24);
}
