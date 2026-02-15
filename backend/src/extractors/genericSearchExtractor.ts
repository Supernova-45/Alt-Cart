import { Stagehand } from "@browserbasehq/stagehand";
import { logger } from "../utils/logger";
import type { SearchResultItem } from "../types/search";

/**
 * Generic search extractor using heuristic DOM parsing.
 * Works across Temu, AliExpress, Uniqlo, and other e-commerce sites.
 * Best-effort; results may vary by site structure.
 */
export class GenericSearchExtractor {
  async extract(stagehand: Stagehand, fullUrl: string): Promise<SearchResultItem[]> {
    const page = stagehand.page;
    const items: SearchResultItem[] = [];

    logger.info("Extracting generic search results", { url: fullUrl });

    try {
      await page.waitForTimeout(3000);

      const origin = new URL(fullUrl).origin;
      const extracted = await page.evaluate((baseOrigin: string) => {
        const results: Array<{
          name: string;
          price?: string;
          ratingText?: string;
          reviewCountText?: string;
          imageUrl?: string;
          productUrl: string;
          priceNumeric?: number;
        }> = [];
        const seen = new Set<string>();

        const productLinkPatterns = [
          /\/item\/\d+\.html/i,
          /\/product[s]?\/[^/]+/i,
          /\/p\/[^/?#]+/i,
          /\/dp\/[A-Z0-9]{10}/i,
          /\/ip\/[^/]+\/\d+/i,
          /-[a-z0-9-]+-g-\d+\.html/i,
          /\/[a-z0-9-]+-\d+\.html/i,
        ];

        function isProductHref(href: string): boolean {
          try {
            const path = href.startsWith("http") ? new URL(href).pathname : href;
            return productLinkPatterns.some((re) => re.test(path));
          } catch {
            return false;
          }
        }

        function extractPrice(el: Element): string | undefined {
          const text = el.textContent || "";
          const m = text.match(/\$[\d,]+\.?\d*|€[\d,]+\.?\d*|£[\d,]+\.?\d*/);
          return m ? m[0].trim() : undefined;
        }

        const links = document.querySelectorAll('a[href]');
        links.forEach((link) => {
          const href = link.getAttribute("href");
          if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;
          if (!isProductHref(href)) return;

          let productUrl = href.startsWith("http") ? href : baseOrigin + (href.startsWith("/") ? href : "/" + href);
          productUrl = productUrl.split("?")[0];
          const urlKey = productUrl.replace(/\/$/, "");
          if (seen.has(urlKey)) return;
          seen.add(urlKey);

          const container = link.closest("article, li, [data-product], [class*='product'], [class*='item'], [class*='card']") || link.parentElement || link;
          const containerEl = container as Element;

          let name =
            containerEl.querySelector("h2, h3, [class*='title'], [class*='name']")?.textContent?.trim() ||
            link.textContent?.trim() ||
            link.getAttribute("aria-label") ||
            "";
          name = name.replace(/\s+/g, " ").trim();
          if (name.length < 3) return;

          let price: string | undefined;
          const priceEl = containerEl.querySelector("[class*='price'], [itemprop='price'], [data-price]");
          if (priceEl) {
            price = priceEl.getAttribute("content") || priceEl.getAttribute("data-price") || priceEl.textContent?.trim();
            if (price && !/^\$|€|£|\d/.test(price)) price = undefined;
          }
          if (!price) {
            const containerText = containerEl.textContent || "";
            const priceMatch = containerText.match(/\$[\d,]+\.?\d*|€[\d,]+\.?\d*|£[\d,]+\.?\d*/);
            if (priceMatch) price = priceMatch[0].trim();
          }

          let imageUrl: string | undefined;
          const img = containerEl.querySelector("img[src]");
          if (img) {
            const src = img.getAttribute("src");
            if (src && src.startsWith("http")) imageUrl = src;
            else if (src && src.startsWith("//")) imageUrl = "https:" + src;
            else if (src && src.startsWith("/")) imageUrl = baseOrigin + src;
          }

          let ratingText: string | undefined;
          const ratingEl = containerEl.querySelector("[class*='rating'], [aria-label*='star'], [aria-label*='out of']");
          const ratingRaw = ratingEl?.getAttribute("aria-label") || ratingEl?.textContent?.trim();
          if (ratingRaw) {
            const m = ratingRaw.match(/(\d+\.?\d*)\s*out of\s*5/);
            ratingText = m ? `${m[1]} out of 5 stars` : ratingRaw;
          }

          let reviewCountText: string | undefined;
          const reviewEl = containerEl.querySelector("[class*='review']");
          const reviewRaw = reviewEl?.textContent?.trim() || "";
          if (reviewRaw && !/color|size|option|capacit/i.test(reviewRaw)) {
            const cleaned = reviewRaw.replace(/,/g, "").trim().toUpperCase();
            const kMatch = cleaned.match(/([\d.]+)\s*K/);
            const mMatch = cleaned.match(/([\d.]+)\s*M/);
            if (kMatch) reviewCountText = `(${kMatch[1]}K)`;
            else if (mMatch) reviewCountText = `(${mMatch[1]}M)`;
            else {
              const numMatch = cleaned.match(/\d+/);
              if (numMatch) reviewCountText = `(${numMatch[0]})`;
            }
          }

          results.push({
            name: name.slice(0, 200),
            price,
            ratingText,
            reviewCountText,
            imageUrl,
            productUrl,
            priceNumeric: price ? parseFloat(price.replace(/[^0-9.]/g, "")) : undefined,
          });
        });

        return results;
      }, origin);

      items.push(...(extracted || []));

      if (items.length === 0) {
        const fallback = await this.extractSingleProductPage(page, fullUrl, origin);
        if (fallback) items.push(fallback);
      }

      logger.info("Generic extraction complete", { count: items.length });
    } catch (error) {
      logger.warn("Generic search extraction failed", { error });
    }

    return items.slice(0, 24);
  }

  private async extractSingleProductPage(
    page: { evaluate: <T>(fn: (arg: T) => unknown, arg: T) => Promise<unknown> },
    fullUrl: string,
    origin: string
  ): Promise<SearchResultItem | null> {
    const result = await page.evaluate(({ baseUrl, baseOrigin }: { baseUrl: string; baseOrigin: string }) => {
      const h1 = document.querySelector("h1");
      const name = h1?.textContent?.trim() || document.title?.split(/[|\-–—]/)[0]?.trim() || "";
      if (name.length < 3) return null;

      let price: string | undefined;
      const priceEl = document.querySelector("[itemprop='price'], [class*='price']:not([class*='original']), [data-price]");
      if (priceEl) {
        price = priceEl.getAttribute("content") || priceEl.getAttribute("data-price") || priceEl.textContent?.trim();
      }
      if (!price) {
        const bodyText = document.body?.textContent || "";
        const m = bodyText.match(/\$[\d,]+\.?\d*/);
        if (m) price = m[0].trim();
      }

      let imageUrl: string | undefined;
      const img = document.querySelector('img[src*="product"], img[src*="item"], .product-image img, [class*="gallery"] img');
      if (img) {
        const src = img.getAttribute("src");
        if (src?.startsWith("http")) imageUrl = src;
        else if (src?.startsWith("//")) imageUrl = "https:" + src;
        else if (src?.startsWith("/")) imageUrl = baseOrigin + src;
      }

      const productUrl = baseUrl.split("?")[0];
      return {
        name: name.slice(0, 200),
        price,
        productUrl,
        imageUrl,
        priceNumeric: price ? parseFloat(price.replace(/[^0-9.]/g, "")) : undefined,
      };
    }, { baseUrl: fullUrl, baseOrigin: origin });

    return result as SearchResultItem | null;
  }
}
