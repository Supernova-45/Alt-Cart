export type Severity = "low" | "medium" | "high";

export interface ReviewTheme {
  label: string;
  share: number; // 0..1
  severity: Severity;
  evidence: string[]; // 2..6
}

export interface FitSummary {
  verdict: "Runs small" | "True to size" | "Runs large";
  confidence: number; // 0..1
  evidence: string[]; // 1..3
}

export interface ReturnRisk {
  score: number; // 0..1
  label: "Low" | "Medium" | "High";
  drivers: string[]; // 2..4
}

export interface SustainabilityCategory {
  score: number; // 0-100
  label: string;
  details: string[];
}

export interface SustainabilityInfo {
  overallScore: number; // 0-100
  rating: "Excellent" | "Good" | "Fair" | "Poor" | "Very Poor";

  // Category scores
  categories: {
    materials: SustainabilityCategory;
    manufacturing: SustainabilityCategory;
    certifications: SustainabilityCategory;
    shipping: SustainabilityCategory;
  };

  // Extracted raw data
  extractedMaterials: string[];
  extractedCertifications: string[];
  origin?: string;
  sustainabilityBadges: string[];
}

export interface ImageDescriptions {
  altShort: string;
  altLong: string;
}

export interface ProductPassport {
  id: string;
  sourceSnapshotPath: string;

  /** Main product image URL (absolute path). Used in search results and image description section. */
  imageUrl?: string;

  name: string;
  brand?: string;
  priceText?: string;
  ratingText?: string;
  reviewCountText?: string;

  shortDescription: string;
  longDescription: string;

  images: ImageDescriptions;
  fitSummary?: FitSummary;
  themes: ReviewTheme[];
  returnRisk: ReturnRisk;
  sustainability?: SustainabilityInfo;

  narration: { short: string; medium: string };
  demoDisclosure: string;
}

// Additional interfaces for extraction
export interface ExtractedReview {
  text: string;
  rating: number;
  verified?: boolean;
}

export interface ExtractedProductData {
  name: string;
  price?: string;
  rating?: string;
  reviewCount?: string;
  description?: string;
  materials?: string[];
  specifications?: Record<string, string>;
  reviews?: ExtractedReview[];
  images?: {
    main?: string;
    additional?: string[];
  };
  sourceUrl: string;
  // Sustainability data
  certifications?: string[];
  origin?: string; // "Made in..."
  sustainabilityBadges?: string[];
}
