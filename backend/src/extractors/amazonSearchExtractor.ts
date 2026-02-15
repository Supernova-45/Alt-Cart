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

          let rating: string | undefined;
          const ratingEl = card.querySelector(".a-icon-star-small .a-icon-alt, i.a-icon-star span.a-icon-alt, span[aria-label*='out of']");
          const ratingRaw = ratingEl?.textContent?.trim() || ratingEl?.getAttribute("aria-label");
          if (ratingRaw) {
            const match = ratingRaw.match(/(\d+\.?\d*)\s*out of\s*5/);
            rating = match ? `${match[1]} out of 5 stars` : ratingRaw;
          }
          if (!rating) {
            const cardText = card.textContent || "";
            const starsMatch = cardText.match(/(\d+\.?\d*)\s*out of\s*5\s*stars?/);
            if (starsMatch) rating = `${starsMatch[1]} out of 5 stars`;
          }

          // Prefer the review link (href contains customerReviews) - avoids picking variant text like "2 capacities"
          const reviewLink = card.querySelector('a[href*="customerReviews"]');
          const raw = (reviewLink
            ? reviewLink.textContent?.trim()
            : card.querySelector(".a-size-small .a-link-normal")?.textContent?.trim()) || "";
          let reviewCountText: string | undefined;
          if (raw && !/capacit|color|size|option|storage/i.test(raw)) {
            const cleaned = raw.replace(/,/g, "").trim().toUpperCase();
            const kMatch = cleaned.match(/([\d.]+)\s*K/);
            const mMatch = cleaned.match(/([\d.]+)\s*M/);
            if (kMatch) reviewCountText = `(${kMatch[1]}K)`;
            else if (mMatch) reviewCountText = `(${mMatch[1]}M)`;
            else {
              const numMatch = cleaned.match(/\d+/);
              if (numMatch) reviewCountText = `(${numMatch[0]})`;
            }
          }

          const imgEl = card.querySelector(".s-product-image-container img");
          const imgSrc = imgEl?.getAttribute("src");

          if (name && productUrl) {
            results.push({
              name,
              price: price || undefined,
              ratingText: rating || undefined,
              reviewCountText: reviewCountText || undefined,
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
