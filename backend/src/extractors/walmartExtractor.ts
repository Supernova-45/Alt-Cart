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

    // Extract sustainability data (materials, origin, certifications)
    let materials: string[] = [];
    let certifications: string[] = [];
    let origin: string | undefined;
    let sustainabilityBadges: string[] = [];
    try {
      const sustainabilityData = await this.extractSustainabilityData(page);
      materials = sustainabilityData.materials;
      certifications = sustainabilityData.certifications;
      origin = sustainabilityData.origin;
      sustainabilityBadges = sustainabilityData.badges;
      logger.info("Sustainability data extracted", {
        materials: materials.length,
        certifications: certifications.length,
        origin,
        badges: sustainabilityBadges.length
      });
    } catch (error) {
      logger.warn("Failed to extract sustainability data", { error });
    }

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
    console.log("Materials:", materials.length);
    console.log("Origin:", origin || "N/A");
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

    console.log("\n--- Extracting Walmart Sustainability Data ---");

    try {
      // Scroll to trigger lazy-loaded "About this item" / "Specifications" sections
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.6));
      await page.waitForTimeout(1500);

      // Extract from page using evaluate - Walmart embeds product details in various structures
      const extracted = await page.evaluate(() => {
        const result: { materials: string[]; origin?: string; certifications: string[] } = {
          materials: [],
          certifications: []
        };
        const bodyText = document.body?.innerText || "";

        // Material patterns: "Material: 89% Polyester/11% Spandex" or "**Material:** 89% Polyester"
        const materialMatch = bodyText.match(/(?:Material|Fabric|Composition)[:\s*]+([^\n]+?)(?:\n|$|Fabric Care|Country of Origin|Care Instructions)/i);
        if (materialMatch) {
          const val = materialMatch[1].trim();
          if (val.length > 2 && val.length < 200) {
            result.materials.push(val);
          }
        }

        // Also look for "89% Polyester/11% Spandex" or "89% Polyester and 11% Spandex" in text
        const compPattern = /(\d+%\s*(?:organic|recycled|sustainable)?\s*(?:cotton|polyester|nylon|wool|leather|silk|linen|rayon|spandex|elastane|viscose)(?:\s*\/\s*\d+%\s*(?:cotton|polyester|nylon|spandex|elastane)[^,.\n]*)?)/gi;
        let compMatch;
        while ((compMatch = compPattern.exec(bodyText)) !== null) {
          const val = compMatch[1].trim();
          if (val.length > 5 && val.length < 150 && !result.materials.some((m) => m.includes(val) || val.includes(m))) {
            result.materials.push(val);
          }
        }

        // Country of Origin: "Country of Origin: Imported" or "Imported"
        const originMatch = bodyText.match(/(?:Country of Origin|Made in|Manufactured in)[:\s]+([^\n]+?)(?:\n|$|Brand|Specifications)/i);
        if (originMatch) {
          const val = originMatch[1].trim();
          if (val.length > 1 && val.length < 100) {
            result.origin = val;
          }
        }
        if (!result.origin && /^Imported\s*$/m.test(bodyText)) {
          result.origin = "Imported";
        }

        // Certifications
        const certKeywords = ["fair trade", "gots", "oeko-tex", "bluesign", "organic certified", "fsc", "rainforest alliance", "carbon neutral"];
        for (const cert of certKeywords) {
          if (bodyText.toLowerCase().includes(cert)) {
            result.certifications.push(cert);
          }
        }

        return result;
      });

      materials.push(...(extracted.materials || []));
      if (extracted.origin) origin = extracted.origin;
      certifications.push(...(extracted.certifications || []));

      // Also extract materials from description (e.g. "polyester design", "black polyester")
      if (materials.length === 0 && (await page.$("meta[property='og:description']"))) {
        const ogDesc = await page.$("meta[property='og:description']");
        const descContent = await ogDesc?.getAttribute("content") || "";
        const materialKeywords = ["polyester", "cotton", "nylon", "leather", "mesh", "fleece"];
        for (const kw of materialKeywords) {
          if (descContent.toLowerCase().includes(kw)) {
            materials.push(kw.charAt(0).toUpperCase() + kw.slice(1));
            break;
          }
        }
      }

      // Extract from JSON-LD if present
      const jsonLdData = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
        for (const script of scripts) {
          try {
            const data = JSON.parse(script.textContent || "{}");
            const item = Array.isArray(data["@graph"]) ? data["@graph"].find((g: { "@type"?: string }) => g["@type"] === "Product") : data;
            if (item) {
              return {
                material: item.material || item.materialExtent,
                countryOfOrigin: item.countryOfOrigin?.name || item.countryOfOrigin
              };
            }
          } catch { /* ignore */ }
        }
        return null;
      });
      if (jsonLdData) {
        if (jsonLdData.material && !materials.includes(jsonLdData.material)) {
          materials.push(jsonLdData.material);
        }
        if (jsonLdData.countryOfOrigin && !origin) {
          origin = jsonLdData.countryOfOrigin;
        }
      }

      console.log(`  Summary: ${materials.length} materials, ${certifications.length} certifications, origin: ${origin || "N/A"}`);
    } catch (error) {
      logger.warn("Error extracting Walmart sustainability data", { error });
    }

    return { materials, certifications, origin, badges };
  }

  private async extractReviews(page: any): Promise<ExtractedReview[]> {
    const reviews: ExtractedReview[] = [];

    console.log("\n--- Extracting Walmart Reviews ---");

    try {
      // Scroll to reviews section - Walmart often lazy-loads reviews
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(2000);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(3000);

      // Try to click "View all reviews" or similar to expand reviews if present
      try {
        const viewAllLink = await page.$('a[href*="reviews"], [data-testid*="view-all-reviews"]');
        if (viewAllLink) {
          await viewAllLink.click();
          await page.waitForTimeout(2000);
        }
      } catch {
        /* optional - continue without */
      }

      // Strategy 1: enhanced-review-section is inside each review - get parent for full review block
      let reviewElements: any[] = [];
      const enhancedSections = await page.$$('[data-testid="enhanced-review-section"]');
      if (enhancedSections.length > 0) {
        const seen = new Set<string>();
        for (const section of enhancedSections) {
          const parent = await section.evaluateHandle((el: Element) => el.closest?.("div")?.parentElement || el.parentElement);
          if (parent) {
            const key = await parent.evaluate((e: Element) => e.textContent?.slice(0, 80) || "");
            if (key && !seen.has(key)) {
              seen.add(key);
              reviewElements.push(parent);
            }
          }
        }
        console.log(`  Found ${reviewElements.length} reviews via enhanced-review-section`);
      }

      // Strategy 2: Fallback to review card/container selectors
      if (reviewElements.length === 0) {
        const selectors = [
          '[data-testid="review-card"]',
          '[data-testid="review"]',
          '[data-testid="customer-review"]',
          'article[class*="review"]',
          '[class*="ReviewCard"]',
          '[class*="customer-review"]',
          '.review',
        ];
        for (const selector of selectors) {
          reviewElements = await page.$$(selector);
          console.log(`  Trying selector '${selector}': found ${reviewElements.length}`);
          if (reviewElements.length > 0) break;
        }
      }

      // Strategy 3: Find elements containing review text + thumbs-up (Walmart review structure)
      if (reviewElements.length === 0) {
        const thumbsUpButtons = await page.$$('[data-testid="thumbs-up-button"]');
        for (const btn of thumbsUpButtons) {
          const reviewBlock = await btn.evaluateHandle((el: Element) => el.closest?.("div[class]")?.parentElement?.parentElement || el.parentElement?.parentElement);
          if (reviewBlock) {
            reviewElements.push(reviewBlock);
          }
        }
      }

      for (const reviewEl of reviewElements.slice(0, 25)) {
        try {
          let text = "";
          const textEl = await reviewEl.$('[data-testid="review-text"], .review-text, [class*="review-text"], p, span');
          if (textEl) {
            const content = (await textEl.textContent())?.trim();
            if (content && content.length > 15) text = content;
          }
          if (!text) {
            const content = (await reviewEl.textContent())?.trim();
            if (content && content.length > 25) {
              // Remove "Helpful?" and button text, get main review body
              text = content.replace(/\s*Helpful\?\s*(0|1)?\s*Report\s*/gi, '').trim();
            }
          }

          let rating = 0;
          const ratingEl = await reviewEl.$('[data-testid="review-rating"], .stars, [class*="rating"], [aria-label*="star"], [aria-label*="star"]');
          if (ratingEl) {
            const ratingText = (await ratingEl.textContent()) ?? (await ratingEl.getAttribute("aria-label")) ?? "";
            const match = ratingText.match(/(\d+(?:\.\d+)?)/);
            if (match) rating = parseFloat(match[1]);
          }
          if (!rating && text) {
            const match = text.match(/(\d)\s*out of\s*5/);
            if (match) rating = parseFloat(match[1]);
          }

          if (text && text.length > 15) {
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
