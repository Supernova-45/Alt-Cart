import { Stagehand } from "@browserbasehq/stagehand";
import { ExtractedProductData, ExtractedReview } from "../models/productModel";
import { logger } from "../utils/logger";

export class AmazonExtractor {
  async extract(stagehand: Stagehand, url: string): Promise<ExtractedProductData> {
    const page = stagehand.page;

    logger.info("Extracting Amazon product data using DOM queries");
    console.log("\n=== AMAZON EXTRACTOR STARTED ===");
    console.log("URL:", url);
    console.log("Page URL:", await page.url());
    console.log("Page title:", await page.title());

    // Extract product name
    let name = "Unknown Product";
    try {
      const titleEl = await page.$("#productTitle");
      if (titleEl) {
        const text = await titleEl.textContent();
        name = text?.trim() || name;
      }
    } catch (error) {
      logger.warn("Failed to extract product name", { error });
    }

    // Extract price
    let price: string | undefined;
    try {
      console.log("\n--- Extracting Price ---");

      const priceSelectors = [
        ".a-price .a-offscreen",
        "#priceblock_ourprice",
        "#priceblock_dealprice",
        ".a-price-whole",
        "span.a-price > span.a-offscreen",
        ".a-price[data-a-color='price'] .a-offscreen",
        "#corePrice_feature_div .a-price .a-offscreen",
        "#corePrice_desktop .a-price .a-offscreen",
        "span.priceToPay span.a-offscreen",
        ".a-price span[aria-hidden='true']",
      ];

      for (const selector of priceSelectors) {
        const priceEl = await page.$(selector);
        if (priceEl) {
          const text = (await priceEl.textContent())?.trim();
          if (text && (text.includes("$") || text.match(/\d/))) {
            price = text;
            console.log(`  ✓ Got price from '${selector}': ${price}`);
            break;
          }
        }
      }

      if (!price) {
        console.log("  ✗ No price found with any selector");
      }
    } catch (error) {
      logger.warn("Failed to extract price", { error });
      console.log("  ✗ Error extracting price:", error);
    }

    // Extract rating
    let rating: string | undefined;
    try {
      const ratingEl = await page.$("#acrPopover");
      if (ratingEl) {
        rating = (await ratingEl.getAttribute("title")) || undefined;
      }
      if (!rating) {
        const starEl = await page.$("i.a-icon-star span.a-icon-alt");
        if (starEl) {
          rating = (await starEl.textContent())?.trim();
        }
      }
    } catch (error) {
      logger.warn("Failed to extract rating", { error });
    }

    // Extract review count
    let reviewCount: string | undefined;
    try {
      const reviewEl = await page.$("#acrCustomerReviewText");
      if (reviewEl) {
        reviewCount = (await reviewEl.textContent())?.trim();
      }
    } catch (error) {
      logger.warn("Failed to extract review count", { error });
    }

    // Extract description
    let description: string | undefined;
    try {
      console.log("\n--- Extracting Description ---");

      // Strategy 1: Try feature bullets
      const bulletSelectors = [
        '#feature-bullets li span.a-list-item',
        '#feature-bullets ul li',
        '.a-unordered-list.a-vertical.a-spacing-mini li',
      ];

      for (const selector of bulletSelectors) {
        const bullets = await page.$$(selector);
        console.log(`  Trying selector '${selector}': found ${bullets.length} elements`);

        if (bullets.length > 0) {
          const bulletTexts = await Promise.all(
            bullets.map(async (b) => (await b.textContent())?.trim())
          );
          const filtered = bulletTexts.filter(Boolean);
          if (filtered.length > 0) {
            description = filtered.join(' ');
            console.log(`  ✓ Got description from bullets: ${description.substring(0, 100)}...`);
            break;
          }
        }
      }

      // Strategy 2: Try product description section
      if (!description) {
        const descSelectors = [
          '#productDescription p',
          '#productDescription',
          '.a-section.a-spacing-medium.a-spacing-top-small',
          '#feature-bullets',
        ];

        for (const selector of descSelectors) {
          const descEl = await page.$(selector);
          if (descEl) {
            const text = (await descEl.textContent())?.trim();
            if (text && text.length > 20) {
              description = text;
              console.log(`  ✓ Got description from '${selector}': ${text.substring(0, 100)}...`);
              break;
            }
          }
        }
      }

      // Strategy 3: Try div with description class
      if (!description) {
        const productDesc = await page.$('div[data-feature-name="productDescription"]');
        if (productDesc) {
          const text = (await productDesc.textContent())?.trim();
          if (text && text.length > 20) {
            description = text;
            console.log(`  ✓ Got description from feature div: ${text.substring(0, 100)}...`);
          }
        }
      }

      if (!description) {
        console.log("  ✗ No description found with any selector");
      }
    } catch (error) {
      logger.warn("Failed to extract description", { error });
      console.log("  ✗ Error extracting description:", error);
    }

    // Extract main product image
    let mainImage: string | undefined;
    try {
      const imgElement = await page.$("#landingImage");
      if (imgElement) {
        mainImage = (await imgElement.getAttribute("data-old-hires")) ||
                   (await imgElement.getAttribute("src")) ||
                   undefined;
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

    // Log extraction summary
    console.log("\n=== EXTRACTION SUMMARY ===");
    console.log("Name:", name);
    console.log("Price:", price || "N/A");
    console.log("Rating:", rating || "N/A");
    console.log("Review Count:", reviewCount || "N/A");
    console.log("Description:", description ? `${description.substring(0, 100)}...` : "N/A");
    console.log("Main Image:", mainImage ? "✓" : "✗");
    console.log("Reviews:", reviews.length);
    console.log("=== AMAZON EXTRACTOR COMPLETED ===\n");

    return {
      name,
      price,
      rating,
      reviewCount,
      description,
      reviews,
      images: {
        main: mainImage,
      },
      sourceUrl: url,
    };
  }

  private async extractReviews(page: any): Promise<ExtractedReview[]> {
    const reviews: ExtractedReview[] = [];

    console.log("\n--- Extracting Reviews ---");

    try {
      // Strategy 1: Scroll down to load reviews section
      console.log("  Scrolling down to load reviews section...");
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(2000);

      // Strategy 2: Try to find reviews on the current page
      const reviewSelectors = [
        '[data-hook="review"]',
        '.review',
        '#cm-cr-dp-review-list .review',
        '.a-section.review',
        'div[data-hook="review"]',
      ];

      let reviewElements: any[] = [];
      for (const selector of reviewSelectors) {
        reviewElements = await page.$$(selector);
        console.log(`  Trying selector '${selector}': found ${reviewElements.length} reviews`);
        if (reviewElements.length > 0) break;
      }

      // Strategy 3: If no reviews, try scrolling to reviews section by ID
      if (reviewElements.length === 0) {
        console.log("  Scrolling to #customerReviews section...");
        try {
          await page.evaluate(() => {
            const reviewsSection = document.getElementById('customerReviews');
            if (reviewsSection) {
              reviewsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          });
          await page.waitForTimeout(2000);

          // Try finding reviews again after scrolling
          for (const selector of reviewSelectors) {
            reviewElements = await page.$$(selector);
            console.log(`  After scroll, trying '${selector}': found ${reviewElements.length} reviews`);
            if (reviewElements.length > 0) break;
          }
        } catch (scrollError) {
          console.log(`  ✗ Scrolling failed: ${scrollError}`);
        }
      }

      // Strategy 4: If still no reviews, navigate directly to reviews page URL
      if (reviewElements.length === 0) {
        console.log("  No reviews found, navigating directly to reviews page...");

        try {
          // Extract product ASIN from current URL
          const currentUrl = await page.url();
          const asinMatch = currentUrl.match(/\/dp\/([A-Z0-9]{10})/);

          if (asinMatch) {
            const asin = asinMatch[1];
            const reviewsUrl = `https://www.amazon.com/product-reviews/${asin}/ref=cm_cr_dp_d_show_all_btm`;
            console.log(`  Navigating to: ${reviewsUrl}`);

            await page.goto(reviewsUrl, {
              waitUntil: "domcontentloaded",
              timeout: 30000
            });
            await page.waitForTimeout(3000);

            // Try finding reviews on the dedicated reviews page
            for (const selector of reviewSelectors) {
              reviewElements = await page.$$(selector);
              console.log(`  On reviews page, trying '${selector}': found ${reviewElements.length} reviews`);
              if (reviewElements.length > 0) break;
            }
          } else {
            console.log("  ✗ Could not extract ASIN from URL");
          }
        } catch (navError) {
          console.log(`  ✗ Direct navigation failed: ${navError}`);
        }
      }

      console.log(`  Processing ${reviewElements.length} review elements (max 20)...`);

      // Extract reviews
      for (const reviewEl of reviewElements.slice(0, 20)) {
        try {
          // Try multiple selectors for review text
          const textSelectors = [
            '[data-hook="review-body"]',
            '.review-text',
            '.a-spacing-small.review-data',
            'span[data-hook="review-body"] span',
          ];

          let text = "";
          for (const selector of textSelectors) {
            const textEl = await reviewEl.$(selector);
            if (textEl) {
              const content = (await textEl.textContent())?.trim();
              if (content && content.length > 10) {
                text = content;
                break;
              }
            }
          }

          // Try multiple selectors for rating
          const ratingSelectors = [
            'i[data-hook="review-star-rating"] span',
            '.review-rating span',
            'i.a-icon-star span',
          ];

          let rating = 0;
          for (const selector of ratingSelectors) {
            const ratingEl = await reviewEl.$(selector);
            if (ratingEl) {
              const ratingText = (await ratingEl.textContent())?.trim();
              const ratingMatch = ratingText?.match(/(\d+(\.\d+)?)/);
              if (ratingMatch) {
                rating = parseFloat(ratingMatch[1]);
                break;
              }
            }
          }

          // Check for verified purchase
          const verifiedSelectors = [
            '[data-hook="avp-badge"]',
            '.a-color-state.a-text-bold',
          ];

          let verified = false;
          for (const selector of verifiedSelectors) {
            const verifiedEl = await reviewEl.$(selector);
            if (verifiedEl) {
              verified = true;
              break;
            }
          }

          if (text && rating > 0) {
            reviews.push({
              text,
              rating,
              verified,
            });
          }
        } catch (error) {
          console.log("  Error extracting individual review:", error);
        }
      }

      console.log(`  ✓ Extracted ${reviews.length} reviews`);
    } catch (error) {
      logger.warn("Failed to extract reviews", { error });
      console.log("  ✗ Review extraction error:", error);
    }

    return reviews;
  }
}
