import type { SustainabilityInfo, SustainabilityCategory } from "./productModel";

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function seededInt(seed: string, min: number, max: number): number {
  const h = hash(seed);
  return min + (h % (max - min + 1));
}

function ratingFromScore(score: number): "Excellent" | "Good" | "Fair" | "Poor" | "Very Poor" {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  if (score >= 20) return "Poor";
  return "Very Poor";
}

export function generateSustainability(
  productName: string,
  extractedMaterials: string[] = [],
  extractedCertifications: string[] = [],
  origin?: string,
  sustainabilityBadges: string[] = []
): SustainabilityInfo {
  const materialsScore = seededInt(productName + ":mat", 20, 80);
  const manufacturingScore = seededInt(productName + ":mfg", 20, 80);
  const certificationsScore = seededInt(productName + ":cert", 20, 80);
  const shippingScore = seededInt(productName + ":ship", 20, 80);

  const overallScore = Math.round(
    (materialsScore + manufacturingScore + certificationsScore + shippingScore) / 4
  );
  const rating = ratingFromScore(overallScore);

  const materialsCategory: SustainabilityCategory = {
    score: materialsScore,
    label: "Materials",
    details: extractedMaterials.length > 0 ? extractedMaterials : ["Standard materials used in production"],
  };

  const manufacturingCategory: SustainabilityCategory = {
    score: manufacturingScore,
    label: "Manufacturing",
    details: origin ? [`Made in: ${origin}`] : ["Manufacturing practices vary by supplier"],
  };

  const certificationsCategory: SustainabilityCategory = {
    score: certificationsScore,
    label: "Certifications",
    details:
      extractedCertifications.length > 0
        ? extractedCertifications
        : ["Third-party certifications can verify sustainability claims"],
  };

  const shippingCategory: SustainabilityCategory = {
    score: shippingScore,
    label: "Shipping",
    details: ["Carbon footprint varies by distance and logistics"],
  };

  return {
    overallScore,
    rating,
    categories: {
      materials: materialsCategory,
      manufacturing: manufacturingCategory,
      certifications: certificationsCategory,
      shipping: shippingCategory,
    },
    extractedMaterials,
    extractedCertifications,
    origin,
    sustainabilityBadges,
  };
}
