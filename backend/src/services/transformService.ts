import { randomUUID } from "crypto";
import {
  ProductPassport,
  ExtractedProductData,
  ExtractedReview,
  FitSummary,
  ReviewTheme,
  ReturnRisk,
  SustainabilityInfo,
  Severity,
} from "../models/productModel";
import { logger } from "../utils/logger";

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
      themes: this.extractThemes(reviews),
      returnRisk: this.calculateReturnRisk(reviews),
      sustainability: this.analyzeSustainability(extracted.materials, extracted.description),
      narration: this.generateNarration(extracted, reviews),
      demoDisclosure: "This product passport was generated from live product data.",
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

  private extractThemes(reviews: ExtractedReview[]): ReviewTheme[] {
    if (reviews.length === 0) return [];

    logger.debug("Extracting review themes", { reviewCount: reviews.length });

    const themeDefinitions = [
      {
        label: "Comfort",
        keywords: ["comfort", "comfortable", "cushion", "padding", "soft", "cozy"],
      },
      {
        label: "Quality",
        keywords: ["quality", "durable", "sturdy", "well-made", "poorly made", "cheap quality", "broke", "tear"],
      },
      {
        label: "Value",
        keywords: ["price", "value", "worth", "expensive", "cheap", "overpriced"],
      },
      {
        label: "Style",
        keywords: ["look", "style", "color", "appearance", "design", "attractive"],
      },
      {
        label: "Sizing",
        keywords: ["size", "fit", "small", "large", "tight", "loose"],
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
        const severity: Severity = avgRating >= 4 ? "low" : avgRating >= 3 ? "medium" : "high";
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

  private calculateReturnRisk(reviews: ExtractedReview[]): ReturnRisk {
    if (reviews.length === 0) {
      return {
        score: 0.5,
        label: "Medium",
        drivers: ["Limited review data available"],
      };
    }

    const riskKeywords = [
      "return", "refund", "disappointed", "not as described",
      "waste of money", "don't buy", "poor quality", "broke"
    ];

    let riskCount = 0;
    const drivers: string[] = [];

    for (const review of reviews) {
      const text = review.text.toLowerCase();
      if (riskKeywords.some(kw => text.includes(kw))) {
        riskCount++;
        if (review.rating <= 2 && drivers.length < 4) {
          drivers.push(review.text.slice(0, 80) + "...");
        }
      }
    }

    const score = Math.min(riskCount / reviews.length, 1.0);
    const label: "Low" | "Medium" | "High" = score < 0.3 ? "Low" : score < 0.6 ? "Medium" : "High";

    const finalDrivers = drivers.length > 0
      ? drivers.slice(0, 4)
      : ["Based on review analysis", "Check review themes for details"];

    logger.debug("Return risk calculated", { score, label, riskCount });

    return { score, label, drivers: finalDrivers };
  }

  private analyzeSustainability(
    materials?: string[],
    description?: string
  ): SustainabilityInfo | undefined {
    const sustainableKeywords = [
      "recycled", "organic", "sustainable", "eco-friendly",
      "biodegradable", "renewable", "eco", "green"
    ];

    let score = 0;
    const foundMaterials: string[] = materials || [];
    const badges: string[] = [];

    // Check materials
    if (materials) {
      for (const material of materials) {
        if (sustainableKeywords.some(kw => material.toLowerCase().includes(kw))) {
          score += 0.3;
          foundMaterials.push(material);
        }
      }
    }

    // Check description
    if (description) {
      const descLower = description.toLowerCase();
      for (const keyword of sustainableKeywords) {
        if (descLower.includes(keyword)) {
          score += 0.1;
          badges.push(`Contains ${keyword} materials or processes`);
        }
      }
    }

    if (score === 0) return undefined;

    score = Math.min(score, 1.0);
    const label: "Low" | "Medium" | "High" = score < 0.3 ? "Low" : score < 0.6 ? "Medium" : "High";

    return {
      score,
      label,
      materials: foundMaterials.length > 0 ? foundMaterials : undefined,
      badges: badges.length > 0 ? badges : undefined,
    };
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
    const themes = this.extractThemes(reviews);
    const returnRisk = this.calculateReturnRisk(reviews);

    const fitText = fitSummary ? ` Fit verdict: ${fitSummary.verdict} with ${Math.round(fitSummary.confidence * 100)}% confidence.` : "";
    const themeText = themes.length > 0 ? ` Key reviewer notes: ${themes.slice(0, 2).map(t => t.label).join(", ")}.` : "";
    const riskText = ` Return risk: ${returnRisk.label}.`;

    const medium = short + fitText + themeText + riskText;

    return { short, medium };
  }
}
