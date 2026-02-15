import { randomUUID } from "crypto";
import {
  ProductPassport,
  ExtractedProductData,
  ExtractedReview,
  FitSummary,
  ReviewTheme,
  ReturnRisk,
  SustainabilityInfo,
  SustainabilityCategory,
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
      themes: this.extractThemes(reviews, extracted.name),
      returnRisk: this.calculateReturnRisk(extracted, reviews),
      sustainability: this.analyzeSustainability(extracted),
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

  private calculateReturnRisk(extracted: ExtractedProductData, reviews: ExtractedReview[]): ReturnRisk {
    const drivers: string[] = [];

    if (reviews.length === 0) {
      return {
        score: 0.5,
        label: "Medium",
        drivers: ["Limited review data available"],
      };
    }

    // 1. Share of negative reviews (1-2 stars)
    const negativeReviews = reviews.filter((r) => r.rating >= 1 && r.rating <= 2);
    const negativeCount = negativeReviews.length;
    const negativeShare = negativeCount / reviews.length;

    // 2. Overall rating (parse from extracted.rating, e.g. "4.5 out of 5 stars")
    const avgRatingFromReviews = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const parsedProductRating = this.parseRating(extracted.rating);
    const overallRating = parsedProductRating ?? avgRatingFromReviews;
    const ratingRisk = Math.max(0, (5 - overallRating) / 4); // 5 stars -> 0, 1 star -> 1

    // 3. Verified purchase: weight verified negative reviews more (they're more credible)
    const verifiedNegative = negativeReviews.filter((r) => r.verified === true);
    const verifiedNegativeShare = negativeCount > 0 ? verifiedNegative.length / negativeCount : 0;

    // Combined score: negative share (50%), rating (30%), verified negative credibility (20%)
    const score = Math.min(
      0.5 * negativeShare + 0.3 * ratingRisk + 0.2 * verifiedNegativeShare,
      1.0
    );
    const label: "Low" | "Medium" | "High" = score < 0.3 ? "Low" : score < 0.6 ? "Medium" : "High";

    // Build drivers
    const pctNegative = Math.round(negativeShare * 100);
    drivers.push(`${pctNegative}% of reviews are 1-2 stars`);
    drivers.push(`Overall rating: ${overallRating.toFixed(1)}/5`);
    if (verifiedNegative.length > 0) {
      drivers.push(`${verifiedNegative.length} verified purchase${verifiedNegative.length > 1 ? "s" : ""} gave low ratings`);
    }
    if (negativeCount > 0 && drivers.length < 4) {
      const sample = negativeReviews[0].text.slice(0, 80).trim();
      if (sample) drivers.push(`"${sample}${negativeReviews[0].text.length > 80 ? "..." : ""}"`);
    }

    logger.debug("Return risk calculated", { score, label, negativeShare, ratingRisk, verifiedNegativeShare });

    return { score, label, drivers: drivers.slice(0, 4) };
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

  private analyzeSustainability(extracted: ExtractedProductData): SustainabilityInfo | undefined {
    logger.debug("Analyzing comprehensive sustainability data");

    const materials = extracted.materials || [];
    const certifications = extracted.certifications || [];
    const origin = extracted.origin;
    const badges = extracted.sustainabilityBadges || [];

    // Score each category (0-100)
    const materialsCategory = this.scoreMaterials(materials);
    const manufacturingCategory = this.scoreManufacturing(origin);
    const certificationsCategory = this.scoreCertifications(certifications);
    const shippingCategory = this.scoreShipping(origin, badges);

    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      materialsCategory.score * 0.35 +      // Materials: 35%
      manufacturingCategory.score * 0.25 +  // Manufacturing: 25%
      certificationsCategory.score * 0.30 + // Certifications: 30%
      shippingCategory.score * 0.10         // Shipping: 10%
    );

    // Determine rating
    let rating: "Excellent" | "Good" | "Fair" | "Poor" | "Very Poor";
    if (overallScore >= 80) rating = "Excellent";
    else if (overallScore >= 60) rating = "Good";
    else if (overallScore >= 40) rating = "Fair";
    else if (overallScore >= 20) rating = "Poor";
    else rating = "Very Poor";

    logger.info("Sustainability analysis complete", { overallScore, rating });

    return {
      overallScore,
      rating,
      categories: {
        materials: materialsCategory,
        manufacturing: manufacturingCategory,
        certifications: certificationsCategory,
        shipping: shippingCategory,
      },
      extractedMaterials: materials,
      extractedCertifications: certifications,
      origin,
      sustainabilityBadges: badges,
    };
  }

  private scoreMaterials(materials: string[]): SustainabilityCategory {
    const details: string[] = [];
    let score = 0;

    if (materials.length === 0) {
      return {
        score: 50,
        label: "Materials: Fair",
        details: [
          "Standard materials commonly used in the industry",
          "Environmental impact depends on production methods",
          "Consider checking for eco-friendly alternatives",
        ],
      };
    }

    // Highly sustainable materials
    const excellent = ["organic cotton", "recycled polyester", "recycled nylon", "tencel", "hemp", "linen", "recycled wool"];
    // Moderately sustainable
    const good = ["cotton", "wool", "silk", "bamboo"];
    // Less sustainable
    const poor = ["polyester", "nylon", "acrylic", "virgin plastic"];

    let excellentCount = 0;
    let goodCount = 0;
    let poorCount = 0;
    let unknownCount = 0;

    for (const material of materials) {
      const lower = material.toLowerCase();

      if (excellent.some(m => lower.includes(m))) {
        excellentCount++;
        details.push(`✓ ${material} (sustainable material)`);
      } else if (good.some(m => lower.includes(m))) {
        goodCount++;
        details.push(`○ ${material} (conventional material)`);
      } else if (poor.some(m => lower.includes(m))) {
        poorCount++;
        details.push(`✗ ${material} (less sustainable material)`);
      } else {
        unknownCount++;
        details.push(`${material} (standard material)`);
      }
    }

    // Calculate score
    if (excellentCount > 0) score += 60;
    if (goodCount > 0) score += 30;
    if (poorCount > 0) score -= 20;
    if (unknownCount > 0) score += 15; // Neutral contribution for unknown materials

    // Bonus for multiple sustainable materials
    if (excellentCount >= 2) score += 20;

    score = Math.max(0, Math.min(100, score));

    let label = "Materials: ";
    if (score >= 70) label += "Excellent";
    else if (score >= 50) label += "Good";
    else if (score >= 30) label += "Fair";
    else label += "Poor";

    return { score, label, details: details.slice(0, 5) };
  }

  private scoreManufacturing(origin?: string): SustainabilityCategory {
    const details: string[] = [];
    let score = 50; // Default neutral score

    if (!origin) {
      return {
        score: 50,
        label: "Manufacturing: Fair",
        details: [
          "Manufactured using industry-standard practices",
          "Production follows typical supply chain protocols",
          "Look for certifications for verified labor standards",
        ],
      };
    }

    details.push(`Made in: ${origin}`);

    const lower = origin.toLowerCase();

    // Countries with strong environmental regulations
    const excellent = ["usa", "united states", "germany", "denmark", "sweden", "norway", "finland", "switzerland", "netherlands", "uk", "united kingdom", "canada"];
    const good = ["france", "italy", "spain", "portugal", "japan", "south korea"];
    const fair = ["china", "india", "vietnam", "bangladesh", "thailand", "mexico", "turkey"];

    if (excellent.some(country => lower.includes(country))) {
      score = 85;
      details.push("✓ Strong environmental regulations");
      details.push("✓ Worker protection standards");
    } else if (good.some(country => lower.includes(country))) {
      score = 65;
      details.push("○ Moderate environmental oversight");
    } else if (fair.some(country => lower.includes(country))) {
      score = 35;
      details.push("⚠ Limited environmental regulations");
      details.push("Consider looking for certifications");
    } else {
      score = 50;
      details.push("Manufacturing follows typical industry practices");
      details.push("Standards vary by region and manufacturer");
    }

    let label = "Manufacturing: ";
    if (score >= 70) label += "Excellent";
    else if (score >= 50) label += "Good";
    else if (score >= 30) label += "Fair";
    else label += "Poor";

    return { score, label, details };
  }

  private scoreCertifications(certifications: string[]): SustainabilityCategory {
    const details: string[] = [];
    let score = 0;

    if (certifications.length === 0) {
      return {
        score: 50,
        label: "Certifications: Fair",
        details: [
          "May meet basic industry compliance standards",
          "Third-party certifications can verify sustainability claims",
          "Look for GOTS, Fair Trade, or similar eco-labels",
        ],
      };
    }

    // High-value certifications
    const tier1 = ["gots", "fair trade", "cradle to cradle", "bluesign", "oeko-tex"];
    const tier2 = ["organic", "fsc", "rainforest alliance", "certified b corp"];
    const tier3 = ["climate pledge friendly", "compact by design"];

    let tier1Count = 0;
    let tier2Count = 0;
    let tier3Count = 0;

    for (const cert of certifications) {
      const lower = cert.toLowerCase();

      if (tier1.some(t => lower.includes(t))) {
        tier1Count++;
        details.push(`✓✓ ${cert} (premium certification)`);
      } else if (tier2.some(t => lower.includes(t))) {
        tier2Count++;
        details.push(`✓ ${cert} (verified certification)`);
      } else if (tier3.some(t => lower.includes(t))) {
        tier3Count++;
        details.push(`○ ${cert} (basic certification)`);
      } else {
        details.push(`? ${cert}`);
      }
    }

    // Calculate score
    score = (tier1Count * 40) + (tier2Count * 25) + (tier3Count * 15);
    score = Math.min(100, score);

    let label = "Certifications: ";
    if (score >= 70) label += "Excellent";
    else if (score >= 40) label += "Good";
    else if (score >= 20) label += "Fair";
    else label += "Limited";

    return { score, label, details: details.slice(0, 5) };
  }

  private scoreShipping(origin?: string, badges?: string[]): SustainabilityCategory {
    const details: string[] = [];
    let score = 50; // Default neutral

    // Check for local/regional manufacturing (reduces shipping)
    if (origin) {
      const lower = origin.toLowerCase();
      if (["usa", "united states", "canada", "mexico"].some(c => lower.includes(c))) {
        score += 20;
        details.push("✓ Regional manufacturing reduces shipping impact");
      } else {
        score -= 10;
        details.push("○ Overseas shipping increases carbon footprint");
      }
    }

    // Check for compact packaging badges
    if (badges) {
      const compactKeywords = ["compact", "frustration-free", "minimal packaging"];
      if (badges.some(b => compactKeywords.some(k => b.toLowerCase().includes(k)))) {
        score += 20;
        details.push("✓ Compact/minimal packaging");
      }
    }

    score = Math.max(0, Math.min(100, score));

    let label = "Shipping: ";
    if (score >= 70) label += "Low Impact";
    else if (score >= 50) label += "Moderate Impact";
    else label += "High Impact";

    if (details.length === 0) {
      details.push("Standard shipping methods typically used");
      details.push("Carbon footprint varies by distance and logistics");
      details.push("Choose local retailers when possible to reduce impact");
    }

    return { score, label, details };
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
    const returnRisk = this.calculateReturnRisk(extracted, reviews);

    const fitText = fitSummary ? ` Fit verdict: ${fitSummary.verdict} with ${Math.round(fitSummary.confidence * 100)}% confidence.` : "";
    const themeText = themes.length > 0 ? ` Key reviewer notes: ${themes.slice(0, 2).map(t => t.label).join(", ")}.` : "";
    const riskText = ` Return risk: ${returnRisk.label}.`;

    const medium = short + fitText + themeText + riskText;

    return { short, medium };
  }
}
