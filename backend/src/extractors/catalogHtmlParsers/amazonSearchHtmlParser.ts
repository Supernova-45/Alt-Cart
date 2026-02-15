import * as cheerio from "cheerio";
import type { SearchResultItem } from "../../types/search";

export function parseAmazonSearchHtml(html: string): SearchResultItem[] {
  const $ = cheerio.load(html);
  const items: SearchResultItem[] = [];

  $('[data-component-type="s-search-result"][data-asin]').each((_, card) => {
    const $card = $(card);
    const asin = $card.attr("data-asin");
    if (!asin || asin.length !== 10) return;

    const href = $card.find('a[href*="/dp/"]').attr("href");
    if (!href) return;

    let productUrl = href.startsWith("http") ? href : `https://www.amazon.com${href.split("?")[0]}`;
    if (!productUrl.includes("/dp/")) {
      const dpMatch = href.match(/\/dp\/([A-Z0-9]{10})/i);
      if (dpMatch) productUrl = `https://www.amazon.com/dp/${dpMatch[1]}`;
    }

    const name = $card.find("h2 a span, .a-text-normal").first().text().trim();
    const price = $card.find(".a-price .a-offscreen").first().text().trim() || undefined;

    let ratingText: string | undefined;
    const ratingEl = $card.find(".a-icon-star-small .a-icon-alt, i.a-icon-star span.a-icon-alt, span[aria-label*='out of']").first();
    const ratingRaw = ratingEl.text().trim() || ratingEl.attr("aria-label");
    if (ratingRaw) {
      const match = ratingRaw.match(/(\d+\.?\d*)\s*out of\s*5/);
      ratingText = match ? `${match[1]} out of 5 stars` : ratingRaw;
    }
    if (!ratingText) {
      const cardText = $card.text();
      const starsMatch = cardText.match(/(\d+\.?\d*)\s*out of\s*5\s*stars?/);
      if (starsMatch) ratingText = `${starsMatch[1]} out of 5 stars`;
    }

    let reviewCountText: string | undefined;
    const reviewLink = $card.find('a[href*="customerReviews"]');
    if (reviewLink.length) {
      const raw = reviewLink.text().trim();
      const numMatch = raw.replace(/,/g, "").match(/\d+/);
      if (numMatch) reviewCountText = `(${numMatch[0]})`;
    } else {
      const raw = $card.find(".a-size-small .a-link-normal").first().text().trim();
      const numMatch = raw.replace(/,/g, "").match(/^\d+$/);
      if (numMatch) reviewCountText = `(${numMatch[0]})`;
      else if (/^\d[\d,]*$/.test(raw.replace(/,/g, ""))) reviewCountText = `(${raw})`;
    }

    const imgSrc = $card.find(".s-product-image-container img").attr("src");

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

    // Climate Pledge Friendly badge on Amazon search cards
    const hasCpf = $card.find(".a-badge-sustainability, [class*='climatePledge'], [class*='climate-pledge']").length > 0;

    if (name && productUrl) {
      items.push({
        name,
        price: price || undefined,
        ratingText: ratingText || undefined,
        reviewCountText: reviewCountText || undefined,
        imageUrl: imgSrc || undefined,
        productUrl,
        priceNumeric,
        ratingNumeric,
        climatePledgeFriendly: hasCpf || undefined,
        sustainabilityScore: hasCpf ? 50 : undefined,
      });
    }
  });

  return items.slice(0, 24);
}
