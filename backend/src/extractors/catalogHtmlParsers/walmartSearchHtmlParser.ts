import * as cheerio from "cheerio";
import type { SearchResultItem } from "../../types/search";
import { parseReviewCount } from "../../utils/parseReviewCount";

export function parseWalmartSearchHtml(html: string): SearchResultItem[] {
  const $ = cheerio.load(html);
  const items: SearchResultItem[] = [];
  const seen = new Set<string>();

  $('a[href*="/ip/"]').each((_, link) => {
    const href = $(link).attr("href");
    if (!href) return;

    const ipMatch = href.match(/\/ip\/([^/]+)\/(\d+)/);
    if (!ipMatch) return;

    const productId = ipMatch[2];
    if (seen.has(productId)) return;
    seen.add(productId);

    const productUrl = href.startsWith("http") ? href.split("?")[0] : `https://www.walmart.com${href.split("?")[0]}`;

    const $container = $(link).closest("[data-item-id], [data-testid], article, li").length
      ? $(link).closest("[data-item-id], [data-testid], article, li")
      : $(link);

    const name =
      $container.find("span[data-automation-id='product-title'], [class*='product-title'], span[class*='title']").first().text().trim() ||
      $(link).text().trim();
    if (name.length < 5) return;

    let price: string | undefined;
    const priceEl = $container.find('[data-automation-id="product-price"], [class*="price"], [itemprop="price"]').first();
    if (priceEl.length) {
      const content = priceEl.attr("content") ?? priceEl.text();
      if (content) {
        const num = parseFloat(content.replace(/[^0-9.]/g, ""));
        if (!isNaN(num)) price = `$${num.toFixed(2)}`;
      }
    }

    const imageUrl = $container.find("img").first().attr("src");

    let ratingText: string | undefined;
    const ratingEl = $container.find('[data-automation-id="product-rating"], [class*="rating"] span, [aria-label*="star"], [aria-label*="out of"]').first();
    const ratingRaw = ratingEl.text().trim() || ratingEl.attr("aria-label");
    if (ratingRaw) {
      const match = ratingRaw.match(/(\d+\.?\d*)\s*out of\s*5/);
      ratingText = match ? `${match[1]} out of 5 stars` : ratingRaw;
    }
    if (!ratingText) {
      const containerText = $container.text();
      const starsMatch = containerText.match(/(\d+\.?\d*)\s*out of\s*5\s*stars?/);
      if (starsMatch) ratingText = `${starsMatch[1]} out of 5 stars`;
    }

    let reviewCountText: string | undefined;
    const reviewRaw = $container.find('[data-automation-id="product-review-count"], [class*="review"]').first().text().trim();
    if (reviewRaw && !/capacit|color|size|option/i.test(reviewRaw)) {
      reviewCountText = parseReviewCount(reviewRaw);
    }

    // Numeric values for sorting
    let priceNumeric: number | undefined;
    if (price) {
      const num = parseFloat(price.replace(/[^0-9.]/g, ""));
      if (!isNaN(num)) priceNumeric = num;
    }
    let ratingNumeric: number | undefined;
    if (ratingText) {
      const match = ratingText.match(/(\d+\.?\d*)/);
      if (match) {
        const num = parseFloat(match[1]);
        if (!isNaN(num) && num >= 0 && num <= 5) ratingNumeric = num;
      }
    }

    if (name && productUrl && name.length > 5) {
      items.push({
        name: name.slice(0, 150),
        price,
        ratingText,
        reviewCountText,
        imageUrl: imageUrl?.startsWith("http") ? imageUrl : undefined,
        productUrl,
        priceNumeric,
        ratingNumeric,
      });
    }
  });

  return items.slice(0, 24);
}
