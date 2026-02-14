import { Stagehand } from "@browserbasehq/stagehand";
import { logger } from "../utils/logger";

export interface SearchResultItem {
  name: string;
  price?: string;
  ratingText?: string;
  reviewCountText?: string;
  imageUrl?: string;
  productUrl: string;
}

export class WalmartSearchExtractor {
  async extract(stagehand: Stagehand, url: string): Promise<SearchResultItem[]> {
    const page = stagehand.page;
    const items: SearchResultItem[] = [];

    logger.info("Extracting Walmart search results");
    console.log("\n=== WALMART SEARCH EXTRACTOR ===");

    try {
      await page.waitForTimeout(3000);

      const extracted = await page.evaluate(() => {
        const results: Array<{ name: string; price?: string; rating?: string; reviewCount?: string; imageUrl?: string; productUrl: string }> = [];

        const cards = document.querySelectorAll('[data-testid="list-view"] a[href*="/ip/"], [data-item-id] a[href*="/ip/"], a[href*="/ip/"][data-product-id]');
        const seen = new Set<string>();

        document.querySelectorAll('a[href*="/ip/"]').forEach((link) => {
          const href = link.getAttribute("href");
          if (!href) return;

          const ipMatch = href.match(/\/ip\/([^/]+)\/(\d+)/);
          if (!ipMatch) return;

          const productId = ipMatch[2];
          if (seen.has(productId)) return;
          seen.add(productId);

          const productUrl = href.startsWith("http") ? href.split("?")[0] : `https://www.walmart.com${href.split("?")[0]}`;

          const card = link.closest("[data-item-id], [data-testid], article, li");
          const container = card || link;

          const nameEl = container.querySelector("span[data-automation-id='product-title'], [class*='product-title'], span[class*='title']");
          const name = nameEl?.textContent?.trim() || link.textContent?.trim() || "";
          if (name.length < 5) return;

          const priceEl = container.querySelector('[data-automation-id="product-price"], [class*="price"], [itemprop="price"]');
          let price: string | undefined;
          if (priceEl) {
            const content = priceEl.getAttribute("content") ?? priceEl.textContent;
            if (content) {
              const num = parseFloat(content.replace(/[^0-9.]/g, ""));
              if (!isNaN(num)) price = `$${num.toFixed(2)}`;
            }
          }

          const imgEl = container.querySelector("img");
          const imageUrl = imgEl?.getAttribute("src");

          if (name && productUrl && name.length > 5) {
            results.push({
              name: name.slice(0, 150),
              price,
              imageUrl: imageUrl?.startsWith("http") ? imageUrl : undefined,
              productUrl,
            });
          }
        });

        return results;
      });

      items.push(...(extracted || []));

      if (items.length === 0) {
        const fallback = await page.evaluate(() => {
          const results: Array<{ name: string; price?: string; ratingText?: string; reviewCountText?: string; imageUrl?: string; productUrl: string }> = [];
          const seen = new Set<string>();
          document.querySelectorAll('a[href*="/ip/"]').forEach((link) => {
            const href = link.getAttribute("href");
            if (!href) return;
            const ipMatch = href.match(/\/ip\/([^/]+)\/(\d+)/);
            if (!ipMatch) return;
            if (seen.has(ipMatch[2])) return;
            seen.add(ipMatch[2]);
            const productUrl = href.startsWith("http") ? href.split("?")[0] : `https://www.walmart.com${href.split("?")[0]}`;
            const name = link.textContent?.trim() || "";
            const img = link.querySelector("img");
            const imageUrl = img?.getAttribute("src");
            if (name.length > 10) {
              results.push({ name: name.slice(0, 150), productUrl, imageUrl: imageUrl?.startsWith("http") ? imageUrl : undefined });
            }
          });
          return results;
        });
        items.push(...fallback);
      }

      console.log(`  Extracted ${items.length} items`);
    } catch (error) {
      logger.warn("Walmart search extraction failed", { error });
    }

    return items.slice(0, 24);
  }
}
