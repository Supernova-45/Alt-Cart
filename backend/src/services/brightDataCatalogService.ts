import { config } from "../config/env";
import { logger } from "../utils/logger";
import {
  scrapeAmazonByKeyword,
  scrapeWalmartByKeyword,
  scrapeEbayByKeywords,
  scrapeEtsyByKeywords,
  scrapeLowesByKeywords,
  scrapeTargetByKeywords,
  scrapeMacysByKeyword,
  scrapeHomeDepotByKeyword,
  fetchHtml,
  searchViaSerp,
} from "./brightDataService";
import type { SearchResultItem } from "../types/search";
import { parseAmazonSearchHtml } from "../extractors/catalogHtmlParsers/amazonSearchHtmlParser";
import { parseWalmartSearchHtml } from "../extractors/catalogHtmlParsers/walmartSearchHtmlParser";
import type { SearchDomain } from "../utils/searchUrlParser";

export type CatalogDomain = SearchDomain;

/**
 * Map Bright Data Web Scraper response to SearchResultItem.
 * Schema varies by dataset; handle common field names across Amazon, Walmart, eBay, Etsy, Lowes, Target, Macy's, Home Depot.
 */
function mapScraperRecordsToItems(records: unknown[], domain: CatalogDomain): SearchResultItem[] {
  const items: SearchResultItem[] = [];

  for (const r of records) {
    const rec = r as Record<string, unknown>;
    const productUrl =
      (rec.product_url as string) ||
      (rec.url as string) ||
      (rec.link as string) ||
      (rec.productUrl as string);
    const name =
      (rec.title as string) ||
      (rec.name as string) ||
      (rec.product_name as string) ||
      (rec.product_title as string) ||
      (rec.productTitle as string);

    if (!productUrl || !name || typeof name !== "string" || name.length < 3) continue;

    const rawPrice =
      rec.price ?? rec.current_price ?? rec.final_price ?? rec.initial_price;
    const price = rawPrice != null ? String(rawPrice) : undefined;
    const rawRating =
      rec.rating ?? rec.stars ?? rec.review_rating ?? rec.average_customer_review ?? rec.product_ratings;
    const rating = rawRating != null ? String(rawRating) : undefined;
    const rawReviewCount =
      rec.reviews ??
      rec.review_count ??
      rec.reviews_count ??
      rec.num_reviews ??
      rec.reviews_count_item ??
      rec.number_of_customer_reviews;
    const reviewCount = rawReviewCount != null ? String(rawReviewCount) : undefined;
    const imageUrls = rec.images as string[] | undefined;
    const imageUrlsAlt = rec.image_urls as string[] | undefined;
    const imageUrl =
      (rec.image as string) ||
      (rec.image_url as string) ||
      (rec.main_image as string) ||
      (Array.isArray(imageUrls) && imageUrls[0]) ||
      (Array.isArray(imageUrlsAlt) && imageUrlsAlt[0]) ||
      (rec.thumbnail as string);

    let ratingText: string | undefined;
    if (rating) {
      const match = String(rating).match(/(\d+\.?\d*)\s*out of\s*5/);
      ratingText = match ? `${match[1]} out of 5 stars` : String(rating);
    }

    let reviewCountText: string | undefined;
    if (reviewCount) {
      const num = String(reviewCount).replace(/,/g, "").match(/\d+/);
      if (num) reviewCountText = `(${num[0]})`;
    }

    items.push({
      name: String(name).slice(0, 200),
      productUrl: String(productUrl),
      price: price ? String(price) : undefined,
      ratingText,
      reviewCountText,
      imageUrl: imageUrl && String(imageUrl).startsWith("http") ? String(imageUrl) : undefined,
    });
  }

  return items.slice(0, 24);
}

const SEARCH_URLS: Record<CatalogDomain, (q: string) => string> = {
  amazon: (q) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}`,
  walmart: (q) => `https://www.walmart.com/search?q=${encodeURIComponent(q)}`,
  ebay: (q) => `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}`,
  etsy: (q) => `https://www.etsy.com/search?q=${encodeURIComponent(q)}`,
  lowes: (q) => `https://www.lowes.com/search?searchTerm=${encodeURIComponent(q)}`,
  target: (q) => `https://www.target.com/s?searchTerm=${encodeURIComponent(q)}`,
  macys: (q) => `https://www.macys.com/shop/search?keyword=${encodeURIComponent(q)}`,
  homedepot: (q) => `https://www.homedepot.com/s/${encodeURIComponent(q)}`,
};

const BRIGHT_DATA_ONLY_DOMAINS: CatalogDomain[] = ["ebay", "etsy", "lowes", "target", "macys", "homedepot"];

/**
 * Get catalog/search results via Bright Data.
 * Tries Web Scraper API first, then Web Unlocker + Cheerio (Amazon/Walmart only), then SERP.
 */
export async function getCatalogResults(
  query: string,
  domain: CatalogDomain
): Promise<SearchResultItem[]> {
  const apiKey = config.brightData?.apiKey;
  if (!apiKey) {
    throw new Error("BRIGHTDATA_API_KEY is not configured");
  }

  const searchUrl = SEARCH_URLS[domain](query);
  const datasetId = getDatasetId(domain);

  // 1. Try Web Scraper API if dataset is configured
  if (datasetId) {
    try {
      const result = await scrapeByDomain(datasetId, query, domain);

      if (Array.isArray(result) && result.length > 0) {
        const items = mapScraperRecordsToItems(result, domain);
        if (items.length > 0) {
          logger.info("Bright Data Web Scraper catalog success", { domain, query, count: items.length });
          return items;
        }
      }

      if (typeof result === "object" && result !== null && "status" in result && (result as { status: string }).status === "pending") {
        logger.info("Bright Data Web Scraper returned async (202), using fallback");
      }
    } catch (err) {
      logger.warn("Bright Data Web Scraper failed", { error: err });
    }
  }

  // 2. Fallback: Web Unlocker + Cheerio (Amazon/Walmart only)
  if (!BRIGHT_DATA_ONLY_DOMAINS.includes(domain)) {
    try {
      const html = await fetchHtml(searchUrl);
      const items =
        domain === "amazon"
          ? parseAmazonSearchHtml(html)
          : parseWalmartSearchHtml(html);

      if (items.length > 0) {
        logger.info("Bright Data Web Unlocker catalog success", { domain, query, count: items.length });
        return items;
      }
    } catch (err) {
      logger.warn("Bright Data Web Unlocker catalog failed", { error: err });
    }
  }

  // 3. Fallback: SERP API (Google search filtered by site)
  if (config.brightData?.serpZone) {
    try {
      const items = await searchCatalogViaSerp(query, domain);
      if (items.length > 0) {
        logger.info("Bright Data SERP catalog success", { domain, query, count: items.length });
        return items;
      }
    } catch (err) {
      logger.warn("Bright Data SERP catalog failed", { error: err });
    }
  }

  return [];
}

function getDatasetId(domain: CatalogDomain): string {
  const ids = config.brightData;
  if (!ids) return "";
  switch (domain) {
    case "amazon": return ids.amazonSearchDatasetId;
    case "walmart": return ids.walmartSearchDatasetId;
    case "ebay": return ids.ebaySearchDatasetId;
    case "etsy": return ids.etsySearchDatasetId;
    case "lowes": return ids.lowesSearchDatasetId;
    case "target": return ids.targetSearchDatasetId;
    case "macys": return ids.macysSearchDatasetId;
    case "homedepot": return ids.homedepotSearchDatasetId;
    default: return "";
  }
}

async function scrapeByDomain(
  datasetId: string,
  query: string,
  domain: CatalogDomain
): Promise<unknown[] | { snapshotId: string; status: "pending" }> {
  switch (domain) {
    case "amazon":
      return scrapeAmazonByKeyword(datasetId, query);
    case "walmart":
      return scrapeWalmartByKeyword(datasetId, query);
    case "ebay":
      return scrapeEbayByKeywords(datasetId, query);
    case "etsy":
      return scrapeEtsyByKeywords(datasetId, query);
    case "lowes":
      return scrapeLowesByKeywords(datasetId, query);
    case "target":
      return scrapeTargetByKeywords(datasetId, query);
    case "macys":
      return scrapeMacysByKeyword(datasetId, query);
    case "homedepot":
      return scrapeHomeDepotByKeyword(datasetId, query);
    default:
      throw new Error(`Unsupported domain for Bright Data: ${domain}`);
  }
}

/**
 * Search via SERP API (Google results filtered by site).
 */
export async function searchCatalogViaSerp(
  query: string,
  site: CatalogDomain
): Promise<SearchResultItem[]> {
  return searchViaSerp(query, site as import("./brightDataService").SerpSite);
}
