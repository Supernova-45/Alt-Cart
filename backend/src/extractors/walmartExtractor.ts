import { Stagehand } from "@browserbasehq/stagehand";
import { ExtractedProductData, ExtractedReview } from "../models/productModel";
import { logger } from "../utils/logger";

export class WalmartExtractor {
  async extract(stagehand: Stagehand, url: string): Promise<ExtractedProductData> {
    const page = stagehand.page;

    logger.info("Extracting Walmart product data using DOM queries");
    console.log("\n=== WALMART EXTRACTOR STARTED ===");
    console.log("URL:", url);
    console.log("Page URL:", await page.url());
    console.log("Page title:", await page.title());

    // Extract product name
    let name = "Unknown Product";
    try {
      const ogTitle = await page.$('meta[property="og:title"]');
      if (ogTitle) {
        const content = await ogTitle.getAttribute("content");
        if (content) name = content.trim();
      }
      if (name === "Unknown Product") {
        const h1 = await page.$("h1");
        if (h1) {
          const text = (await h1.textContent())?.trim();
          if (text) name = text;
        }
      }
      if (name === "Unknown Product") {
        name = (await page.title()) || name;
      }
    } catch (error) {
      logger.warn("Failed to extract product name", { error });
    }

    // Extract price (itemprop or JSON-LD)
    let price: string | undefined;
    try {
      console.log("\n--- Extracting Price ---");
      const priceEl = await page.$('[itemprop="price"]');
      if (priceEl) {
        const content = (await priceEl.getAttribute("content")) ?? (await priceEl.textContent());
        if (content) {
          const num = parseFloat(content);
          if (!isNaN(num)) {
            price = `$${num.toFixed(2)}`;
            console.log(`  ✓ Got price from itemprop: ${price}`);
          }
        }
      }
      if (!price) {
        const jsonLd = await page.evaluate(() => {
          const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
          for (const script of scripts) {
            try {
              const data = JSON.parse(script.textContent || "{}");
              const offers = data.offers ?? (Array.isArray(data["@graph"]) ? data["@graph"].find((g: { offers?: unknown }) => g.offers)?.offers : undefined);
              const offer = Array.isArray(offers) ? offers[0] : offers;
              if (offer?.price != null) {
                const p = typeof offer.price === "number" ? offer.price : parseFloat(offer.price);
                if (!isNaN(p)) return p;
              }
            } catch {
              /* ignore */
            }
          }
          return null;
        });
        if (jsonLd != null) {
          price = `$${Number(jsonLd).toFixed(2)}`;
          console.log(`  ✓ Got price from JSON-LD: ${price}`);
        }
      }
      if (!price) console.log("  ✗ No price found");
    } catch (error) {
      logger.warn("Failed to extract price", { error });
    }

    // Extract rating and review count from JSON-LD
    let rating: string | undefined;
    let reviewCount: string | undefined;
    try {
      const ratingData = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
        for (const script of scripts) {
          try {
            const data = JSON.parse(script.textContent || "{}");
            const ar = data.aggregateRating ?? (Array.isArray(data["@graph"]) ? data["@graph"].find((g: { aggregateRating?: unknown }) => g.aggregateRating)?.aggregateRating : undefined);
            if (ar) {
              return { ratingValue: ar.ratingValue, reviewCount: ar.reviewCount };
            }
          } catch {
            /* ignore */
          }
        }
        return null;
      });
      if (ratingData) {
        if (ratingData.ratingValue != null) rating = `${ratingData.ratingValue} out of 5 stars`;
        if (ratingData.reviewCount != null) reviewCount = `(${ratingData.reviewCount})`;
      }
    } catch (error) {
      logger.warn("Failed to extract rating/review count", { error });
    }

    // Extract description
    let description: string | undefined;
    try {
      console.log("\n--- Extracting Description ---");
      const ogDesc = await page.$('meta[property="og:description"]');
      if (ogDesc) {
        const content = await ogDesc.getAttribute("content");
        if (content && content.length > 20) description = content.trim();
      }
      if (!description) {
        const aboutSection = await page.$('[data-testid="about-item"], [data-testid="product-description"], .product-description');
        if (aboutSection) {
          const text = (await aboutSection.textContent())?.trim();
          if (text && text.length > 20) description = text;
        }
      }
      if (!description) {
        const metaDesc = await page.$('meta[name="description"]');
        if (metaDesc) {
          const content = await metaDesc.getAttribute("content");
          if (content && content.length > 20) description = content.trim();
        }
      }
      if (!description) console.log("  ✗ No description found");
    } catch (error) {
      logger.warn("Failed to extract description", { error });
    }

    // Extract main product image
    let mainImage: string | undefined;
    try {
      const ogImage = await page.$('meta[property="og:image"]');
      if (ogImage) {
        const content = await ogImage.getAttribute("content");
        if (content && content.startsWith("http")) mainImage = content;
      }
      if (!mainImage) {
        const heroImg = await page.$('[data-testid="media-thumbnail"] img, [data-seo-id="hero-carousel-image"] img');
        if (heroImg) {
          const src = await heroImg.getAttribute("src");
          if (src && !src.startsWith("data:")) mainImage = src;
        }
      }
    } catch (error) {
      logger.warn("Failed to extract main image", { error });
    }

    logger.info("Basic product data extracted", { name, price, rating, reviewCount });

    // Extract reviews
    let reviews: ExtractedReview[] = [];
    try {
      reviews = await this.extractReviews(page);
      logger.info(`Extracted ${reviews.length} reviews`);
    } catch (error) {
      logger.warn("Failed to extract reviews", { error });
    }

    console.log("\n=== EXTRACTION SUMMARY ===");
    console.log("Name:", name);
    console.log("Price:", price || "N/A");
    console.log("Rating:", rating || "N/A");
    console.log("Review Count:", reviewCount || "N/A");
    console.log("Description:", description ? `${description.substring(0, 100)}...` : "N/A");
    console.log("Main Image:", mainImage ? "✓" : "✗");
    console.log("Reviews:", reviews.length);
    console.log("=== WALMART EXTRACTOR COMPLETED ===\n");

    return {
      name,
      price,
      rating,
      reviewCount,
      description,
      reviews,
      images: { main: mainImage },
      sourceUrl: url,
    };
  }

  private async extractReviews(page: any): Promise<ExtractedReview[]> {
    const reviews: ExtractedReview[] = [];

    console.log("\n--- Extracting Reviews ---");

    try {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(2000);

      const reviewSelectors = [
        '[data-testid="enhanced-review-section"]',
        '[data-testid="review-card"]',
        '[data-testid="review"]',
        '.review',
        '[class*="review"]',
      ];

      let reviewElements: any[] = [];
      for (const selector of reviewSelectors) {
        reviewElements = await page.$$(selector);
        console.log(`  Trying selector '${selector}': found ${reviewElements.length} reviews`);
        if (reviewElements.length > 0) break;
      }

      for (const reviewEl of reviewElements.slice(0, 20)) {
        try {
          let text = "";
          const textEl = await reviewEl.$('[data-testid="review-text"], .review-text, [class*="review-text"], p');
          if (textEl) {
            const content = (await textEl.textContent())?.trim();
            if (content && content.length > 10) text = content;
          }
          if (!text) {
            const content = (await reviewEl.textContent())?.trim();
            if (content && content.length > 20) text = content;
          }

          let rating = 0;
          const ratingEl = await reviewEl.$('[data-testid="review-rating"], .stars, [class*="rating"], [aria-label*="star"]');
          if (ratingEl) {
            const ratingText = (await ratingEl.textContent()) ?? (await ratingEl.getAttribute("aria-label")) ?? "";
            const match = ratingText.match(/(\d+(?:\.\d+)?)/);
            if (match) rating = parseFloat(match[1]);
          }

          if (text && text.length > 10) {
            reviews.push({ text, rating: rating || 0, verified: false });
          }
        } catch {
          /* skip */
        }
      }

      console.log(`  ✓ Extracted ${reviews.length} reviews`);
    } catch (error) {
      logger.warn("Failed to extract reviews", { error });
    }

    return reviews;
  }
}
