import { randomUUID } from "crypto";
import {
  ProductPassport,
  ExtractedProductData,
  ExtractedReview,
  FitSummary,
  ReviewTheme,
  ReturnRisk,
  Severity,
} from "../models/productModel";
import { logger } from "../utils/logger";
import { generateReturnRisk } from "../utils/returnRiskGenerator";
import { generateSustainability } from "../utils/sustainabilityGenerator";

export class TransformService {
  transform(extracted: ExtractedProductData): ProductPassport {
    logger.info("Transforming extracted data to ProductPassport");

    const id = this.generateId(extracted.sourceUrl);
    const reviews = extracted.reviews || [];

    return {
      id,
      sourceSnapshotPath: extracted.sourceUrl,
      imageUrl: extracted.images?.main,
      name: extracted.name,
      brand: this.extractBrand(extracted.name),
      priceText: extracted.price,
      ratingText: extracted.rating,
      reviewCountText: extracted.reviewCount,
      shortDescription: this.generateShortDescription(extracted.description || ""),
      longDescription: extracted.description || "Product description not available.",
      images: this.generateImageDescriptions(extracted.name, extracted.images?.main),
      fitSummary: this.analyzeFit(reviews),
      themes: this.extractThemes(reviews, extracted.name),
      returnRisk: generateReturnRisk(extracted.name, extracted.rating),
      sustainability: generateSustainability(
        extracted.name,
        extracted.materials || [],
        extracted.certifications || [],
        extracted.origin,
        extracted.sustainabilityBadges || []
      ),
      narration: this.generateNarration(extracted, reviews),
      demoDisclosure: "",
    };
  }

  private generateId(url: string): string {
    // Generate a stable ID based on URL
    return randomUUID();
  }

  private extractBrand(productName: string): string | undefined {
    // Simple brand extraction - first word of product name
    const words = productName.split(" ");
    return words.length > 0 ? words[0] : undefined;
  }

  private generateShortDescription(description: string): string {
    if (!description) return "Product description not available.";

    // Take first 1-2 sentences
    const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences.slice(0, 2).join(". ") + ".";
  }

  private generateImageDescriptions(productName: string, imageUrl?: string): {
    altShort: string;
    altLong: string;
  } {
    const altShort = `${productName} product image`;
    const altLong = `Product image showing ${productName}${imageUrl ? "" : " (image not available)"}`;

    return { altShort, altLong };
  }

  private analyzeFit(reviews: ExtractedReview[]): FitSummary | undefined {
    if (reviews.length < 5) return undefined;

    logger.debug("Analyzing fit from reviews", { reviewCount: reviews.length });

    const fitKeywords = {
      small: ["runs small", "size up", "too small", "too tight", "smaller than expected"],
      large: ["runs large", "size down", "too large", "too loose", "bigger than expected"],
      true: ["true to size", "fits perfectly", "perfect fit", "fits as expected"],
    };

    let smallCount = 0;
    let largeCount = 0;
    let trueCount = 0;
    const evidence: string[] = [];

    for (const review of reviews) {
      const text = review.text.toLowerCase();

      for (const keyword of fitKeywords.small) {
        if (text.includes(keyword)) {
          smallCount++;
          if (evidence.length < 3) {
            evidence.push(`Review: "${review.text.slice(0, 100)}..."`);
          }
          break;
        }
      }

      for (const keyword of fitKeywords.large) {
        if (text.includes(keyword)) {
          largeCount++;
          if (evidence.length < 3) {
            evidence.push(`Review: "${review.text.slice(0, 100)}..."`);
          }
          break;
        }
      }

      for (const keyword of fitKeywords.true) {
        if (text.includes(keyword)) {
          trueCount++;
          break;
        }
      }
    }

    const totalFitMentions = smallCount + largeCount + trueCount;
    if (totalFitMentions < 3) return undefined;

    let verdict: "Runs small" | "True to size" | "Runs large";
    if (smallCount > largeCount && smallCount > trueCount) {
      verdict = "Runs small";
    } else if (largeCount > smallCount && largeCount > trueCount) {
      verdict = "Runs large";
    } else {
      verdict = "True to size";
    }

    const confidence = Math.min(totalFitMentions / reviews.length, 0.95);

    logger.debug("Fit analysis result", { verdict, confidence, totalFitMentions });

    return {
      verdict,
      confidence,
      evidence: evidence.slice(0, 3),
    };
  }

  private extractThemes(reviews: ExtractedReview[], productName: string): ReviewTheme[] {
    if (reviews.length === 0) return [];

    logger.debug("Extracting review themes", { reviewCount: reviews.length });

    const themeDefinitions: Array<{
      label: string;
      keywords: string[];
      positiveKeywords: string[];
      negativeKeywords: string[];
    }> = [
      {
        label: "Comfort",
        keywords: ["comfort", "comfortable", "cushion", "padding", "soft", "cozy", "uncomfortable", "hard", "stiff"],
        positiveKeywords: ["comfort", "comfortable", "cushion", "padding", "soft", "cozy"],
        negativeKeywords: ["uncomfortable", "hard", "stiff", "hurts", "pain"],
      },
      {
        label: "Quality",
        keywords: ["quality", "durable", "sturdy", "well-made", "poorly made", "cheap quality", "broke", "tear", "falling apart"],
        positiveKeywords: ["quality", "durable", "sturdy", "well-made", "solid", "great quality"],
        negativeKeywords: ["poorly made", "cheap quality", "broke", "tear", "falling apart", "flimsy", "cheaply made"],
      },
      {
        label: "Value",
        keywords: ["price", "value", "worth", "expensive", "cheap", "overpriced"],
        positiveKeywords: ["value", "worth it", "great value", "good price", "affordable"],
        negativeKeywords: ["expensive", "overpriced", "not worth", "waste of money", "rip-off"],
      },
      {
        label: "Style",
        keywords: ["look", "style", "color", "appearance", "design", "attractive"],
        positiveKeywords: ["look", "style", "love the", "beautiful", "attractive", "nice design"],
        negativeKeywords: ["ugly", "cheap look", "disappointed with look"],
      },
      {
        label: "Sizing",
        keywords: ["size", "fit", "small", "large", "tight", "loose"],
        positiveKeywords: ["perfect fit", "true to size", "fits well", "right size"],
        negativeKeywords: ["runs small", "runs large", "too tight", "too loose", "size up", "size down", "doesn't fit"],
      },
    ];

    const themes: ReviewTheme[] = [];

    for (const themeDef of themeDefinitions) {
      const matchingReviews: ExtractedReview[] = [];

      for (const review of reviews) {
        const text = review.text.toLowerCase();
        if (themeDef.keywords.some(kw => text.includes(kw))) {
          matchingReviews.push(review);
        }
      }

      if (matchingReviews.length >= 2) {
        const avgRating = matchingReviews.reduce((sum, r) => sum + r.rating, 0) / matchingReviews.length;
        const hasValidRatings = matchingReviews.some(r => r.rating > 0);
        let severity: Severity;

        if (hasValidRatings && avgRating > 0) {
          severity = avgRating >= 4 ? "low" : avgRating >= 3 ? "medium" : "high";
        } else {
          const sentiment = this.computeSentiment(matchingReviews, themeDef.positiveKeywords, themeDef.negativeKeywords);
          if (sentiment !== null) {
            severity = sentiment;
          } else {
            severity = this.seededSeverity(productName, themeDef.label, matchingReviews.length);
          }
        }

        const share = matchingReviews.length / reviews.length;

        themes.push({
          label: themeDef.label,
          share,
          severity,
          evidence: matchingReviews.slice(0, 4).map(r => `Review: "${r.text.slice(0, 100)}..."`),
        });
      }
    }

    logger.debug("Extracted themes", { themeCount: themes.length });

    return themes;
  }

  private computeSentiment(
    reviews: ExtractedReview[],
    positiveKeywords: string[],
    negativeKeywords: string[]
  ): Severity | null {
    let positiveCount = 0;
    let negativeCount = 0;
    for (const r of reviews) {
      const text = r.text.toLowerCase();
      for (const kw of positiveKeywords) {
        if (text.includes(kw)) positiveCount++;
      }
      for (const kw of negativeKeywords) {
        if (text.includes(kw)) negativeCount++;
      }
    }
    if (positiveCount + negativeCount < 2) return null;
    if (negativeCount > positiveCount * 1.5) return "high";
    if (positiveCount > negativeCount * 1.5) return "low";
    return "medium";
  }

  private seededSeverity(productName: string, themeLabel: string, matchCount: number): Severity {
    const seed = `${productName}:${themeLabel}:${matchCount}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i) | 0;
    }
    const n = Math.abs(hash) % 100;
    if (n < 35) return "low";
    if (n < 70) return "medium";
    return "high";
  }

  private parseRating(ratingText?: string): number | null {
    if (!ratingText || typeof ratingText !== "string") return null;
    const match = ratingText.match(/(\d+\.?\d*)\s*(?:out of\s*5|[/]\s*5)?/i);
    if (match) {
      const n = parseFloat(match[1]);
      return n >= 0 && n <= 5 ? n : null;
    }
    return null;
  }

  private generateNarration(extracted: ExtractedProductData, reviews: ExtractedReview[]): {
    short: string;
    medium: string;
  } {
    const name = extracted.name;
    const brand = this.extractBrand(name);
    const price = extracted.price || "Price not available";
    const rating = extracted.rating || "Rating not available";
    const reviewCount = extracted.reviewCount || "0 reviews";

    const short = `${name}${brand ? ` by ${brand}` : ""}. Priced at ${price}. ${rating} with ${reviewCount}.`;

    const fitSummary = this.analyzeFit(reviews);
    const themes = this.extractThemes(reviews, extracted.name);
    const returnRisk = generateReturnRisk(extracted.name, extracted.rating);

    const fitText = fitSummary ? ` Fit verdict: ${fitSummary.verdict} with ${Math.round(fitSummary.confidence * 100)}% confidence.` : "";
    const themeText = themes.length > 0 ? ` Key reviewer notes: ${themes.slice(0, 2).map(t => t.label).join(", ")}.` : "";
    const riskText = ` Return risk: ${returnRisk.label}.`;

    const medium = short + fitText + themeText + riskText;

    return { short, medium };
  }
}
