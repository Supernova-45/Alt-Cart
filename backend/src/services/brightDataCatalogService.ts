import { config } from "../config/env";
import { logger } from "../utils/logger";
import { scrapeAmazonByKeyword, scrapeWalmartByKeyword, fetchHtml, searchViaSerp } from "./brightDataService";
import type { SearchResultItem } from "../types/search";
import { parseAmazonSearchHtml } from "../extractors/catalogHtmlParsers/amazonSearchHtmlParser";
import { parseWalmartSearchHtml } from "../extractors/catalogHtmlParsers/walmartSearchHtmlParser";

export type CatalogDomain = "amazon" | "walmart";

/**
 * Map Bright Data Web Scraper response to SearchResultItem.
 * Schema varies by dataset; handle common field names.
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
    const rating =
      (rec.rating as string) ||
      (rec.stars as string) ||
      (rec.review_rating as string);
    const rawReviewCount =
      rec.reviews ?? rec.review_count ?? rec.reviews_count ?? rec.num_reviews;
    const reviewCount = rawReviewCount != null ? String(rawReviewCount) : undefined;
    const imageUrls = rec.image_urls as string[] | undefined;
    const imageUrl =
      (rec.image as string) ||
      (rec.image_url as string) ||
      (rec.main_image as string) ||
      (Array.isArray(imageUrls) && imageUrls[0]) ||
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

/**
 * Get catalog/search results via Bright Data.
 * Tries Web Scraper API first, then Web Unlocker + Cheerio.
 */
export async function getCatalogResults(
  query: string,
  domain: CatalogDomain
): Promise<SearchResultItem[]> {
  const apiKey = config.brightData?.apiKey;
  if (!apiKey) {
    throw new Error("BRIGHTDATA_API_KEY is not configured");
  }

  const searchUrl =
    domain === "amazon"
      ? `https://www.amazon.com/s?k=${encodeURIComponent(query)}`
      : `https://www.walmart.com/search?q=${encodeURIComponent(query)}`;

  const datasetId =
    domain === "amazon"
      ? config.brightData?.amazonSearchDatasetId
      : config.brightData?.walmartSearchDatasetId;

  // 1. Try Web Scraper API if dataset is configured
  if (datasetId) {
    try {
      const result =
        domain === "walmart"
          ? await scrapeWalmartByKeyword(datasetId, query)
          : await scrapeAmazonByKeyword(datasetId, query);

      if (Array.isArray(result) && result.length > 0) {
        const items = mapScraperRecordsToItems(result, domain);
        if (items.length > 0) {
          logger.info("Bright Data Web Scraper catalog success", { domain, query, count: items.length });
          return items;
        }
      }

      // 202 async - Web Scraper returns pending; fall through to Web Unlocker
      if (typeof result === "object" && result !== null && "status" in result && (result as { status: string }).status === "pending") {
        logger.info("Bright Data Web Scraper returned async (202), using Web Unlocker fallback");
      }
    } catch (err) {
      logger.warn("Bright Data Web Scraper failed, falling back to Web Unlocker", { error: err });
    }
  }

  // 2. Fallback: Web Unlocker + Cheerio
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

/**
 * Search via SERP API (Google results filtered by site).
 */
export async function searchCatalogViaSerp(
  query: string,
  site: CatalogDomain
): Promise<SearchResultItem[]> {
  return searchViaSerp(query, site);
}
