export interface ParsedProductFields {
  title?: string;
  priceText?: string;
  ratingText?: string;
  reviewCountText?: string;
  /** Main product image URL (resolved absolute path) */
  imageUrl?: string;
}

function sanitize(s: string | null | undefined): string | undefined {
  if (s == null || typeof s !== "string") return undefined;
  const t = s.trim().replace(/\s+/g, " ");
  return t.length > 0 ? t : undefined;
}

function resolveImageUrl(rel: string, snapshotPath?: string): string {
  if (!snapshotPath || rel.startsWith("/") || rel.startsWith("http")) return rel;
  const base = snapshotPath.replace(/\/[^/]+$/, "/");
  return rel.replace(/^\.\//, base);
}

function parseAmazon(doc: Document, snapshotPath?: string): ParsedProductFields {
  const out: ParsedProductFields = {};

  const titleEl = doc.querySelector("#productTitle");
  if (titleEl?.textContent) out.title = sanitize(titleEl.textContent);
  if (!out.title) {
    const ogTitle = doc.querySelector('meta[property="og:title"]');
    const content = ogTitle?.getAttribute("content");
    if (content) out.title = sanitize(content);
  }
  if (!out.title) {
    const h1 = doc.querySelector("h1");
    if (h1?.textContent) out.title = sanitize(h1.textContent);
  }
  if (!out.title) out.title = sanitize(doc.title);

  const priceOffscreen = doc.querySelector(".a-price .a-offscreen");
  if (priceOffscreen?.textContent) out.priceText = sanitize(priceOffscreen.textContent);
  if (!out.priceText) {
    const corePrice = doc.querySelector("#corePriceDisplay_desktop_feature_div .a-offscreen");
    if (corePrice?.textContent) out.priceText = sanitize(corePrice.textContent);
  }
  if (!out.priceText) {
    const block = doc.querySelector("#priceblock_ourprice, #priceblock_dealprice");
    if (block?.textContent) out.priceText = sanitize(block.textContent);
  }

  const acrPopover = doc.querySelector("#acrPopover");
  if (acrPopover) {
    const title = acrPopover.getAttribute("title") ?? acrPopover.getAttribute("aria-label");
    if (title) out.ratingText = sanitize(title);
  }
  if (!out.ratingText) {
    const starAlt = doc.querySelector("i.a-icon-star span.a-icon-alt");
    if (starAlt?.textContent) out.ratingText = sanitize(starAlt.textContent);
  }

  const reviewText = doc.querySelector("#acrCustomerReviewText");
  if (reviewText?.textContent) out.reviewCountText = sanitize(reviewText.textContent);
  if (!out.reviewCountText) {
    const hook = doc.querySelector('[data-hook="total-review-count"]');
    if (hook?.textContent) out.reviewCountText = sanitize(hook.textContent);
  }

  const img = doc.querySelector("#landingImage") as HTMLImageElement | null;
  const hires = img?.getAttribute("data-old-hires");
  if (hires && hires.startsWith("http")) {
    out.imageUrl = hires;
  } else if (img?.getAttribute("src")) {
    out.imageUrl = resolveImageUrl(img.getAttribute("src")!, snapshotPath);
  }

  return out;
}

function parseWalmart(doc: Document, snapshotPath?: string): ParsedProductFields {
  const out: ParsedProductFields = {};

  const ogTitle = doc.querySelector('meta[property="og:title"]');
  const content = ogTitle?.getAttribute("content");
  if (content) out.title = sanitize(content);
  if (!out.title) {
    const h1 = doc.querySelector("h1");
    if (h1?.textContent) out.title = sanitize(h1.textContent);
  }
  if (!out.title) out.title = sanitize(doc.title);

  const priceEl = doc.querySelector('[itemprop="price"]');
  if (priceEl) {
    const content = priceEl.getAttribute("content") ?? priceEl.textContent;
    if (content) {
      const num = parseFloat(content);
      if (!isNaN(num)) out.priceText = `$${num.toFixed(2)}`;
    }
  }
  if (!out.priceText) {
    const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scripts) {
      try {
        const data = JSON.parse(script.textContent || "{}");
        const offers = data.offers ?? (Array.isArray(data["@graph"]) ? data["@graph"].find((g: { offers?: unknown }) => g.offers)?.offers : undefined);
        const offer = Array.isArray(offers) ? offers[0] : offers;
        if (offer?.price != null) {
          const p = typeof offer.price === "number" ? offer.price : parseFloat(offer.price);
          if (!isNaN(p)) {
            out.priceText = `$${p.toFixed(2)}`;
            break;
          }
        }
      } catch {
        /* ignore */
      }
    }
  }

  const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
  for (const script of scripts) {
    try {
      const data = JSON.parse(script.textContent || "{}");
      const ar = data.aggregateRating ?? (Array.isArray(data["@graph"]) ? data["@graph"].find((g: { aggregateRating?: unknown }) => g.aggregateRating)?.aggregateRating : undefined);
      if (ar) {
        if (ar.ratingValue != null) out.ratingText = `${ar.ratingValue} out of 5 stars`;
        if (ar.reviewCount != null) out.reviewCountText = `(${ar.reviewCount})`;
        break;
      }
    } catch {
      /* ignore */
    }
  }

  const ogImage = doc.querySelector('meta[property="og:image"]');
  const ogContent = ogImage?.getAttribute("content");
  if (ogContent && ogContent.startsWith("http")) {
    out.imageUrl = ogContent;
  } else {
    const heroImg = doc.querySelector('[data-testid="media-thumbnail"] img, [data-seo-id="hero-carousel-image"] img') as HTMLImageElement | null;
    const src = heroImg?.getAttribute("src");
    if (src && !src.startsWith("data:")) {
      out.imageUrl = resolveImageUrl(src, snapshotPath);
    }
  }

  return out;
}

export function parseProductSnapshot(
  doc: Document,
  snapshotPath?: string
): ParsedProductFields {
  if (snapshotPath?.includes("walmart")) {
    return parseWalmart(doc, snapshotPath);
  }
  return parseAmazon(doc, snapshotPath);
}
