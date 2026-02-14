export interface ParsedProductFields {
  title?: string;
  priceText?: string;
  ratingText?: string;
  reviewCountText?: string;
}

function sanitize(s: string | null | undefined): string | undefined {
  if (s == null || typeof s !== "string") return undefined;
  const t = s.trim().replace(/\s+/g, " ");
  return t.length > 0 ? t : undefined;
}

export function parseProductSnapshot(doc: Document): ParsedProductFields {
  const out: ParsedProductFields = {};

  // Title
  const titleEl = doc.querySelector("#productTitle");
  if (titleEl?.textContent) {
    out.title = sanitize(titleEl.textContent);
  }
  if (!out.title) {
    const ogTitle = doc.querySelector('meta[property="og:title"]');
    const content = ogTitle?.getAttribute("content");
    if (content) out.title = sanitize(content);
  }
  if (!out.title) {
    const h1 = doc.querySelector("h1");
    if (h1?.textContent) out.title = sanitize(h1.textContent);
  }
  if (!out.title) {
    out.title = sanitize(doc.title);
  }

  // Price
  const priceOffscreen = doc.querySelector(".a-price .a-offscreen");
  if (priceOffscreen?.textContent) {
    out.priceText = sanitize(priceOffscreen.textContent);
  }
  if (!out.priceText) {
    const corePrice = doc.querySelector(
      "#corePriceDisplay_desktop_feature_div .a-offscreen"
    );
    if (corePrice?.textContent) out.priceText = sanitize(corePrice.textContent);
  }
  if (!out.priceText) {
    const block = doc.querySelector("#priceblock_ourprice, #priceblock_dealprice");
    if (block?.textContent) out.priceText = sanitize(block.textContent);
  }

  // Rating
  const acrPopover = doc.querySelector("#acrPopover");
  if (acrPopover) {
    const title = acrPopover.getAttribute("title") ?? acrPopover.getAttribute("aria-label");
    if (title) out.ratingText = sanitize(title);
  }
  if (!out.ratingText) {
    const starAlt = doc.querySelector("i.a-icon-star span.a-icon-alt");
    if (starAlt?.textContent) out.ratingText = sanitize(starAlt.textContent);
  }

  // Review count
  const reviewText = doc.querySelector("#acrCustomerReviewText");
  if (reviewText?.textContent) {
    out.reviewCountText = sanitize(reviewText.textContent);
  }
  if (!out.reviewCountText) {
    const hook = doc.querySelector('[data-hook="total-review-count"]');
    if (hook?.textContent) out.reviewCountText = sanitize(hook.textContent);
  }

  return out;
}
