import { Stagehand } from "@browserbasehq/stagehand";
import { ExtractedProductData, ExtractedReview } from "../models/productModel";
import { logger } from "../utils/logger";

export class EbayExtractor {
  async extract(stagehand: Stagehand, url: string): Promise<ExtractedProductData> {
    const page = stagehand.page;

    logger.info("Extracting eBay product data using DOM queries");
    console.log("\n=== EBAY EXTRACTOR STARTED ===");
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
        const h1 = await page.$("h1.x-item-title__mainTitle");
        if (h1) {
          const text = (await h1.textContent())?.trim();
          if (text) name = text;
        }
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
      logger.warn("Failed to extract eBay product name", { error });
    }

    // Extract price (eBay uses "US $7.99" format)
    let price: string | undefined;
    try {
      const priceEl = await page.$('[itemprop="price"], .x-price-primary');
      if (priceEl) {
        const content = (await priceEl.getAttribute("content")) ?? (await priceEl.textContent());
        if (content) {
          const num = parseFloat(content.replace(/[^0-9.]/g, ""));
          if (!isNaN(num)) price = `$${num.toFixed(2)}`;
        }
      }
      if (!price) {
        const priceData = await page.evaluate(() => {
          const bodyText = document.body?.innerText || "";
          const match = bodyText.match(/\$[\d,]+\.?\d*/);
          return match ? match[0] : null;
        });
        if (priceData) {
          const num = parseFloat(priceData.replace(/[^0-9.]/g, ""));
          if (!isNaN(num)) price = `$${num.toFixed(2)}`;
        }
      }
    } catch (error) {
      logger.warn("Failed to extract eBay price", { error });
    }

    // eBay doesn't have product ratings; use seller feedback as proxy
    let rating: string | undefined;
    let reviewCount: string | undefined;
    try {
      const feedbackData = await page.evaluate(() => {
        const bodyText = document.body?.innerText || "";
        const pctMatch = bodyText.match(/(\d+)%\s*positive\s*feedback/i);
        const soldMatch = bodyText.match(/([\d,]+)\s*(?:items?\s*)?sold/i);
        return {
          positivePct: pctMatch ? parseInt(pctMatch[1], 10) : null,
          itemsSold: soldMatch ? soldMatch[1].replace(/,/g, "") : null,
        };
      });
      if (feedbackData.positivePct != null) {
        rating = `${(feedbackData.positivePct / 20).toFixed(1)} out of 5 stars (seller)`;
      }
      if (feedbackData.itemsSold) {
        reviewCount = `(${feedbackData.itemsSold} sold)`;
      }
    } catch (error) {
      logger.warn("Failed to extract eBay rating", { error });
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
        const descSection = await page.$('.x-item-description, [class*="item-description"], #viTabs_0_pan');
        if (descSection) {
          const text = (await descSection.textContent())?.trim();
          if (text && text.length > 50) description = text.slice(0, 500);
        }
      }
    } catch (error) {
      logger.warn("Failed to extract eBay description", { error });
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
      logger.warn("Failed to extract eBay image", { error });
    }

    // Extract sustainability data (Item specifics: Material, Country of Origin)
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
      logger.warn("Failed to extract eBay sustainability data", { error });
    }

    // Extract seller feedback as "reviews" (eBay uses feedback, not product reviews)
    let reviews: ExtractedReview[] = [];
    try {
      reviews = await this.extractSellerFeedback(page);
    } catch (error) {
      logger.warn("Failed to extract eBay feedback", { error });
    }

    console.log("\n=== EBAY EXTRACTION SUMMARY ===");
    console.log("Name:", name);
    console.log("Price:", price || "N/A");
    console.log("Reviews (feedback):", reviews.length);

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
      const extracted = await page.evaluate(() => {
        const result: { materials: string[]; origin?: string; certifications: string[] } = {
          materials: [],
          certifications: [],
        };
        const bodyText = document.body?.innerText || "";

        // Item specifics: Material, Country of Origin
        const materialMatch = bodyText.match(/(?:Material|Fabric|Composition)[:\s]+([^\n]+?)(?:\n|$|Country|Brand)/i);
        if (materialMatch) {
          const val = materialMatch[1].trim();
          if (val.length > 1 && val.length < 150) result.materials.push(val);
        }

        const originMatch = bodyText.match(/(?:Country of Origin|Made in|Manufactured in)[:\s]+([^\n]+?)(?:\n|$|Category|Brand)/i);
        if (originMatch) {
          const val = originMatch[1].trim();
          if (val.length > 1 && val.length < 100) result.origin = val;
        }

        const certKeywords = ["fair trade", "gots", "oeko-tex", "bluesign", "organic", "fsc", "rainforest alliance"];
        for (const cert of certKeywords) {
          if (bodyText.toLowerCase().includes(cert)) result.certifications.push(cert);
        }

        return result;
      });

      materials.push(...(extracted.materials || []));
      if (extracted.origin) origin = extracted.origin;
      certifications.push(...(extracted.certifications || []));
    } catch (error) {
      logger.warn("Error extracting eBay sustainability data", { error });
    }

    return { materials, certifications, origin, badges };
  }

  private async extractSellerFeedback(page: any): Promise<ExtractedReview[]> {
    const reviews: ExtractedReview[] = [];

    try {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);

      const feedbackItems = await page.$$('[class*="feedback"], [data-testid*="feedback"], .item-feedback');
      for (const el of feedbackItems.slice(0, 20)) {
        try {
          const text = (await el.textContent())?.trim();
          if (text && text.length > 30 && !text.includes("Filter:") && !text.includes("All ratings")) {
            reviews.push({ text, rating: 0, verified: false });
          }
        } catch {
          /* skip */
        }
      }

      if (reviews.length === 0) {
        const extracted = await page.evaluate(() => {
          const items: string[] = [];
          const bodyText = document.body?.innerText || "";
          const feedbackSection = bodyText.indexOf("Seller feedback");
          if (feedbackSection >= 0) {
            const section = bodyText.slice(feedbackSection, feedbackSection + 3000);
            const blocks = section.split(/(?=Past \d+ (?:months?|month|year))/i);
            for (const block of blocks.slice(1, 6)) {
              const match = block.match(/Verified purchase\s+([^.]+(?:\.[^.]+)?)/);
              if (match && match[1].trim().length > 20) {
                items.push(match[1].trim());
              }
            }
          }
          return items;
        });
        for (const t of extracted) {
          if (t.length > 20) reviews.push({ text: t, rating: 0, verified: false });
        }
      }
    } catch (error) {
      logger.warn("Failed to extract eBay seller feedback", { error });
    }

    return reviews;
  }
}
