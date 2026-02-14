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

export class AmazonSearchExtractor {
  async extract(stagehand: Stagehand, url: string): Promise<SearchResultItem[]> {
    const page = stagehand.page;
    const items: SearchResultItem[] = [];

    logger.info("Extracting Amazon search results");
    console.log("\n=== AMAZON SEARCH EXTRACTOR ===");

    try {
      await page.waitForTimeout(3000);

      const extracted = await page.evaluate(() => {
        const results: Array<{ name: string; price?: string; ratingText?: string; reviewCountText?: string; imageUrl?: string; productUrl: string }> = [];
        const cards = document.querySelectorAll('[data-component-type="s-search-result"][data-asin]');

        cards.forEach((card) => {
          const asin = card.getAttribute("data-asin");
          if (!asin || asin.length !== 10) return;

          const linkEl = card.querySelector('a[href*="/dp/"]');
          const href = linkEl?.getAttribute("href");
          if (!href) return;

          let productUrl = href.startsWith("http") ? href : `https://www.amazon.com${href.split("?")[0]}`;
          if (!productUrl.includes("/dp/")) {
            const dpMatch = href.match(/\/dp\/([A-Z0-9]{10})/i);
            if (dpMatch) productUrl = `https://www.amazon.com/dp/${dpMatch[1]}`;
          }

          const titleEl = card.querySelector("h2 a span, .a-text-normal");
          const name = titleEl?.textContent?.trim() || "";

          const priceEl = card.querySelector(".a-price .a-offscreen");
          const price = priceEl?.textContent?.trim();

          const ratingEl = card.querySelector(".a-icon-star-small .a-icon-alt, i.a-icon-star span.a-icon-alt");
          const rating = ratingEl?.textContent?.trim();

          const reviewEl = card.querySelector(".a-size-small .a-link-normal");
          const reviewCount = reviewEl?.textContent?.trim();

          const imgEl = card.querySelector(".s-product-image-container img");
          const imgSrc = imgEl?.getAttribute("src");

          if (name && productUrl) {
            results.push({
              name,
              price: price || undefined,
              ratingText: rating || undefined,
              reviewCountText: reviewCount ? `(${reviewCount})` : undefined,
              imageUrl: imgSrc || undefined,
              productUrl,
            });
          }
        });

        return results;
      });

      items.push(...(extracted || []));
      console.log(`  Extracted ${items.length} items`);
    } catch (error) {
      logger.warn("Amazon search extraction failed", { error });
    }

    return items.slice(0, 24);
  }
}
