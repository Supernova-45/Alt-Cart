import { Stagehand } from "@browserbasehq/stagehand";
import { ExtractedProductData, ExtractedReview } from "../models/productModel";
import { logger } from "../utils/logger";

export class MacysExtractor {
  async extract(stagehand: Stagehand, url: string): Promise<ExtractedProductData> {
    const page = stagehand.page;

    logger.info("Extracting Macy's product data using DOM queries");
    console.log("\n=== MACYS EXTRACTOR STARTED ===");
    console.log("URL:", url);

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
      logger.warn("Failed to extract Macy's product name", { error });
    }

    // Extract price
    let price: string | undefined;
    try {
      const priceEl = await page.$('[data-auto="product-price"], [itemprop="price"], [class*="price"]');
      if (priceEl) {
        const content = (await priceEl.getAttribute("content")) ?? (await priceEl.textContent());
        if (content) {
          const num = parseFloat(content.replace(/[^0-9.]/g, ""));
          if (!isNaN(num)) price = `$${num.toFixed(2)}`;
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
        if (jsonLd != null) price = `$${Number(jsonLd).toFixed(2)}`;
      }
      if (!price) {
        const bodyPrice = await page.evaluate(() => {
          const text = document.body?.innerText || "";
          const match = text.match(/\$[\d,]+\.?\d*/);
          return match ? match[0] : null;
        });
        if (bodyPrice) price = bodyPrice;
      }
    } catch (error) {
      logger.warn("Failed to extract Macy's price", { error });
    }

    // Extract rating and review count
    let rating: string | undefined;
    let reviewCount: string | undefined;
    try {
      const ratingData = await page.evaluate(() => {
        const bodyText = document.body?.innerText || "";
        const starsMatch = bodyText.match(/(\d+\.?\d*)\s*out of\s*5\s*stars?/i);
        const countMatch = bodyText.match(/(\d+)\s*reviews?/i);
        return {
          rating: starsMatch ? parseFloat(starsMatch[1]) : null,
          count: countMatch ? countMatch[1] : null,
        };
      });
      if (ratingData.rating != null) rating = `${ratingData.rating} out of 5 stars`;
      if (ratingData.count) reviewCount = `(${ratingData.count})`;

      if (!rating) {
        const jsonLd = await page.evaluate(() => {
          const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
          for (const script of scripts) {
            try {
              const data = JSON.parse(script.textContent || "{}");
              const ar = data.aggregateRating ?? (Array.isArray(data["@graph"]) ? data["@graph"].find((g: { aggregateRating?: unknown }) => g.aggregateRating)?.aggregateRating : undefined);
              if (ar) return { ratingValue: ar.ratingValue, reviewCount: ar.reviewCount };
            } catch {
              /* ignore */
            }
          }
          return null;
        });
        if (jsonLd) {
          if (jsonLd.ratingValue != null) rating = `${jsonLd.ratingValue} out of 5 stars`;
          if (jsonLd.reviewCount != null) reviewCount = `(${jsonLd.reviewCount})`;
        }
      }
    } catch (error) {
      logger.warn("Failed to extract Macy's rating", { error });
    }

    // Extract description
    let description: string | undefined;
    try {
      const ogDesc = await page.$('meta[property="og:description"]');
      if (ogDesc) {
        const content = await ogDesc.getAttribute("content");
        if (content && content.length > 20) description = content.trim();
      }
      if (!description) {
        const aboutSection = await page.$('[data-auto="product-description"], [class*="product-description"], [class*="productDetails"]');
        if (aboutSection) {
          const text = (await aboutSection.textContent())?.trim();
          if (text && text.length > 50) description = text.slice(0, 500);
        }
      }
    } catch (error) {
      logger.warn("Failed to extract Macy's description", { error });
    }

    // Extract main image
    let mainImage: string | undefined;
    try {
      const ogImage = await page.$('meta[property="og:image"]');
      if (ogImage) {
        const content = await ogImage.getAttribute("content");
        if (content && content.startsWith("http")) mainImage = content;
      }
    } catch (error) {
      logger.warn("Failed to extract Macy's image", { error });
    }

    // Extract sustainability data
    let materials: string[] = [];
    let certifications: string[] = [];
    let origin: string | undefined;
    const sustainabilityBadges: string[] = [];
    try {
      const sustainabilityData = await this.extractSustainabilityData(page);
      materials = sustainabilityData.materials;
      certifications = sustainabilityData.certifications;
      origin = sustainabilityData.origin;
    } catch (error) {
      logger.warn("Failed to extract Macy's sustainability data", { error });
    }

    // Extract reviews
    let reviews: ExtractedReview[] = [];
    try {
      reviews = await this.extractReviews(page);
    } catch (error) {
      logger.warn("Failed to extract Macy's reviews", { error });
    }

    console.log("\n=== MACYS EXTRACTION SUMMARY ===");
    console.log("Name:", name);
    console.log("Price:", price || "N/A");
    console.log("Reviews:", reviews.length);

    return {
      name,
      price,
      rating,
      reviewCount,
      description,
      reviews,
      images: { main: mainImage },
      sourceUrl: url,
      materials,
      certifications,
      origin,
      sustainabilityBadges,
    };
  }

  private async extractSustainabilityData(page: any): Promise<{
    materials: string[];
    certifications: string[];
    origin?: string;
    badges: string[];
  }> {
    const materials: string[] = [];
    const certifications: string[] = [];
    let origin: string | undefined;
    const badges: string[] = [];

    try {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.5));
      await page.waitForTimeout(1500);

      const extracted = await page.evaluate(() => {
        const result: { materials: string[]; origin?: string; certifications: string[] } = {
          materials: [],
          certifications: [],
        };
        const bodyText = document.body?.innerText || "";

        const materialMatch = bodyText.match(/(?:Material|Fabric|Composition|Fill)[:\s]+([^\n]+?)(?:\n|$|Country|Care)/i);
        if (materialMatch) {
          const val = materialMatch[1].trim();
          if (val.length > 1 && val.length < 150) result.materials.push(val);
        }

        const originMatch = bodyText.match(/(?:Country of Origin|Made in|Manufactured in|Origin)[:\s]+([^\n]+?)(?:\n|$|Brand)/i);
        if (originMatch) {
          const val = originMatch[1].trim();
          if (val.length > 1 && val.length < 100) result.origin = val;
        }

        const certKeywords = ["fair trade", "gots", "oeko-tex", "bluesign", "organic", "fsc", "rainforest alliance", "hypoallergenic"];
        for (const cert of certKeywords) {
          if (bodyText.toLowerCase().includes(cert)) result.certifications.push(cert);
        }

        return result;
      });

      materials.push(...(extracted.materials || []));
      if (extracted.origin) origin = extracted.origin;
      certifications.push(...(extracted.certifications || []));
    } catch (error) {
      logger.warn("Error extracting Macy's sustainability data", { error });
    }

    return { materials, certifications, origin, badges };
  }

  private async extractReviews(page: any): Promise<ExtractedReview[]> {
    const reviews: ExtractedReview[] = [];

    try {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2500);

      const reviewSelectors = [
        '[data-auto="review-card"]',
        '[class*="ReviewCard"]',
        '[class*="review"]',
        'article[class*="review"]',
      ];

      let reviewElements: any[] = [];
      for (const selector of reviewSelectors) {
        reviewElements = await page.$$(selector);
        if (reviewElements.length > 0) break;
      }

      for (const el of reviewElements.slice(0, 20)) {
        try {
          const text = (await el.textContent())?.trim();
          if (text && text.length > 25) {
            const ratingMatch = text.match(/(\d)\s*out of\s*5/);
            const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 0;
            reviews.push({ text, rating, verified: false });
          }
        } catch {
          /* skip */
        }
      }
    } catch (error) {
      logger.warn("Failed to extract Macy's reviews", { error });
    }

    return reviews;
  }
}
