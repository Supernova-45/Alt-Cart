import type { ProductPassport } from "./productModel";
import { SNAPSHOTS, PRODUCT_IMAGE_URLS } from "./snapshotRegistry";
import type { ProductSnapshotId } from "./snapshotRegistry";
import { generateReturnRisk } from "./returnRiskGenerator";
import { generateSustainability } from "./sustainabilityGenerator";

const DEMO_PASSPORTS: Record<ProductSnapshotId, ProductPassport> = {
  adidas: {
    id: "adidas",
    sourceSnapshotPath: SNAPSHOTS.adidas.path,
    imageUrl: PRODUCT_IMAGE_URLS.adidas,
    name: "adidas VL Court 3.0",
    brand: "adidas",
    priceText: "$65.00",
    ratingText: "4.5 out of 5 stars",
    reviewCountText: "(2,341)",
    shortDescription:
      "Classic tennis-inspired sneaker with a clean, minimal design. Lightweight and versatile for everyday wear.",
    longDescription:
      "The adidas VL Court 3.0 is a low-top sneaker with a leather and mesh upper. It features a padded collar, rubber cupsole, and the iconic adidas three stripes.",
    images: {
      altShort: "White low-top sneaker with three stripes.",
      altLong:
        "Overall: A white low-top sneaker with a classic tennis silhouette. Upper: Leather and mesh combination with perforations for breathability. Laces: White flat laces in a traditional lace-up closure. Toe: Rounded toe cap. Branding: Three adidas stripes in white on the sides. Heel: Padded collar with a subtle heel counter. Sole: White rubber cupsole with a herringbone tread pattern. Notable: Clean, minimal design suitable for casual wear.",
    },
    fitSummary: {
      verdict: "True to size",
      confidence: 0.85,
      evidence: [
        "Demo snippet: Most reviewers say these fit as expected.",
        "Demo snippet: Order your usual size for a comfortable fit.",
      ],
    },
    themes: [
      {
        label: "Comfort",
        share: 0.4,
        severity: "low",
        evidence: [
          "Demo snippet: Very comfortable for all-day wear.",
          "Demo snippet: Cushioned insole feels great.",
        ],
      },
      {
        label: "Quality",
        share: 0.31,
        severity: "medium",
        evidence: [
          "Demo snippet: Well-made for the price.",
          "Demo snippet: Sturdy construction.",
        ],
      },
    ],
    returnRisk: {
      score: 0.2,
      label: "Low",
      drivers: [
        "Demo snippet: Consistent sizing reported.",
        "Demo snippet: Matches product description.",
      ],
    },
    sustainability: {
      overallScore: 60,
      rating: "Fair",
      categories: {
        materials: { score: 60, label: "Materials", details: ["Recycled polyester in lining", "Partially recycled rubber sole"] },
        manufacturing: { score: 50, label: "Manufacturing", details: [] },
        certifications: { score: 50, label: "Certifications", details: [] },
        shipping: { score: 50, label: "Shipping", details: [] },
      },
      extractedMaterials: ["Recycled polyester in lining", "Partially recycled rubber sole"],
      extractedCertifications: [],
      sustainabilityBadges: ["adidas Primegreen materials"],
    },
    narration: {
      short: "adidas VL Court 3.0, $65. True to size, low return risk.",
      medium:
        "adidas VL Court 3.0, $65. Classic white tennis sneaker with leather and mesh. True to size with 85% confidence. Low return risk. Medium sustainability score with recycled materials.",
    },
    demoDisclosure: "This passport uses demo data. Product details are illustrative.",
  },
  adokoo: {
    id: "adokoo",
    sourceSnapshotPath: SNAPSHOTS.adokoo.path,
    imageUrl: PRODUCT_IMAGE_URLS.adokoo,
    name: "Adokoo Fashion Sneakers",
    brand: "Adokoo",
    priceText: "$29.99",
    ratingText: "4.2 out of 5 stars",
    reviewCountText: "(1,892)",
    shortDescription:
      "Affordable casual sneaker with a simple, clean look. Lightweight and easy to style.",
    longDescription:
      "The Adokoo Fashion Sneakers feature a synthetic upper with a padded insole. Simple lace-up design with a rubber outsole for traction.",
    images: {
      altShort: "White casual sneaker with minimal design.",
      altLong:
        "Overall: A white low-top casual sneaker. Upper: Synthetic material with a smooth finish. Laces: White round laces in standard lace-up closure. Toe: Slightly rounded toe. Branding: Minimal branding, small logo on tongue. Heel: Low-cut design with padded collar. Sole: White rubber outsole with simple tread. Notable: Budget-friendly everyday sneaker.",
    },
    fitSummary: {
      verdict: "Runs small",
      confidence: 0.7,
      evidence: [
        "Demo snippet: Several reviewers recommend sizing up.",
        "Demo snippet: Fits snug, consider half size up.",
      ],
    },
    themes: [
      {
        label: "Sizing",
        share: 0.35,
        severity: "medium",
        evidence: [
          "Demo snippet: Runs small, order a size up.",
          "Demo snippet: Tight in the toe area.",
        ],
      },
      {
        label: "Value",
        share: 0.3,
        severity: "low",
        evidence: [
          "Demo snippet: Great value for the price.",
          "Demo snippet: Good for the money.",
        ],
      },
    ],
    returnRisk: {
      score: 0.45,
      label: "Medium",
      drivers: [
        "Demo snippet: Sizing inconsistency mentioned.",
        "Demo snippet: Some quality variance reported.",
      ],
    },
    sustainability: {
      overallScore: 35,
      rating: "Poor",
      categories: {
        materials: { score: 35, label: "Materials", details: ["Synthetic upper", "Standard rubber sole"] },
        manufacturing: { score: 35, label: "Manufacturing", details: [] },
        certifications: { score: 35, label: "Certifications", details: [] },
        shipping: { score: 35, label: "Shipping", details: [] },
      },
      extractedMaterials: ["Synthetic upper", "Standard rubber sole"],
      extractedCertifications: [],
      sustainabilityBadges: [],
    },
    narration: {
      short: "Adokoo Fashion Sneakers, $29.99. Runs small, medium return risk.",
      medium:
        "Adokoo Fashion Sneakers, $29.99. Affordable white casual sneaker. Runs small—consider sizing up. Medium return risk. Low sustainability score.",
    },
    demoDisclosure: "This passport uses demo data. Product details are illustrative.",
  },
  puma: {
    id: "puma",
    sourceSnapshotPath: SNAPSHOTS.puma.path,
    imageUrl: PRODUCT_IMAGE_URLS.puma,
    name: "Puma Carina L",
    brand: "Puma",
    priceText: "$75.00",
    ratingText: "4.6 out of 5 stars",
    reviewCountText: "(3,102)",
    shortDescription:
      "Retro-inspired platform sneaker with a chunky sole. Bold style with comfortable cushioning.",
    longDescription:
      "The Puma Carina L features a leather and suede upper with the classic Puma Formstrip. Platform sole for added height and cushioning.",
    images: {
      altShort: "White platform sneaker with Puma stripe.",
      altLong:
        "Overall: A white platform sneaker with a retro chunky silhouette. Upper: Leather and suede combination. Laces: White flat laces. Toe: Rounded toe with overlay. Branding: Puma Formstrip in white along the sides. Heel: Chunky padded heel with pull tab. Sole: Thick white platform rubber sole with visible cushioning. Notable: 90s-inspired platform design.",
    },
    fitSummary: {
      verdict: "True to size",
      confidence: 0.9,
      evidence: [
        "Demo snippet: Fits true to size for most.",
        "Demo snippet: Accurate sizing, no need to size up or down.",
      ],
    },
    themes: [
      {
        label: "Style",
        share: 0.45,
        severity: "low",
        evidence: [
          "Demo snippet: Love the retro look.",
          "Demo snippet: Great style, gets compliments.",
        ],
      },
      {
        label: "Comfort",
        share: 0.3,
        severity: "low",
        evidence: [
          "Demo snippet: Platform is surprisingly comfortable.",
          "Demo snippet: Good cushioning for all-day wear.",
        ],
      },
    ],
    returnRisk: {
      score: 0.15,
      label: "Low",
      drivers: [
        "Demo snippet: Consistent fit and quality.",
        "Demo snippet: Matches expectations.",
      ],
    },
    sustainability: {
      overallScore: 50,
      rating: "Fair",
      categories: {
        materials: { score: 50, label: "Materials", details: ["Leather upper", "Recycled content in some components"] },
        manufacturing: { score: 50, label: "Manufacturing", details: [] },
        certifications: { score: 50, label: "Certifications", details: [] },
        shipping: { score: 50, label: "Shipping", details: [] },
      },
      extractedMaterials: ["Leather upper", "Recycled content in some components"],
      extractedCertifications: [],
      sustainabilityBadges: ["Puma sustainability initiative"],
    },
    narration: {
      short: "Puma Carina L, $75. True to size, low return risk.",
      medium:
        "Puma Carina L, $75. Retro white platform sneaker. True to size with 90% confidence. Low return risk. Medium sustainability.",
    },
    demoDisclosure: "This passport uses demo data. Product details are illustrative.",
  },
  on: {
    id: "on",
    sourceSnapshotPath: SNAPSHOTS.on.path,
    imageUrl: PRODUCT_IMAGE_URLS.on,
    name: "On Womens Cloud 6",
    brand: "On",
    priceText: "$147.99",
    ratingText: "4.5 out of 5 stars",
    reviewCountText: "(1,469)",
    shortDescription:
      "Premium running-inspired sneaker with CloudTec cushioning. Lightweight and responsive.",
    longDescription:
      "The On Cloud 6 features On's signature CloudTec sole with Helion superfoam. Engineered mesh upper with a sleek, modern design.",
    images: {
      altShort: "White running-inspired sneaker with cloud sole.",
      altLong:
        "Overall: A white low-top running-inspired sneaker with a distinctive sole. Upper: Engineered mesh with a clean, minimal look. Laces: White flat laces in a standard closure. Toe: Slightly tapered toe. Branding: On logo on the side and heel. Heel: Pull tab, padded collar. Sole: Visible CloudTec pods in white, Helion superfoam. Notable: Swiss-engineered cushioning system.",
    },
    fitSummary: {
      verdict: "True to size",
      confidence: 0.88,
      evidence: [
        "Demo snippet: True to size for most wearers.",
        "Demo snippet: Fits as expected, no sizing issues.",
      ],
    },
    themes: [
      {
        label: "Comfort",
        share: 0.5,
        severity: "low",
        evidence: [
          "Demo snippet: Incredibly comfortable CloudTec cushioning.",
          "Demo snippet: Light and responsive feel.",
        ],
      },
      {
        label: "Quality",
        share: 0.3,
        severity: "low",
        evidence: [
          "Demo snippet: Premium build quality.",
          "Demo snippet: Worth the investment.",
        ],
      },
    ],
    returnRisk: {
      score: 0.18,
      label: "Low",
      drivers: [
        "Demo snippet: Reliable fit and quality.",
        "Demo snippet: Few return-related complaints.",
      ],
    },
    sustainability: {
      overallScore: 75,
      rating: "Good",
      categories: {
        materials: { score: 75, label: "Materials", details: ["Recycled polyester in mesh", "Partially bio-based foam", "Recyclable components"] },
        manufacturing: { score: 70, label: "Manufacturing", details: [] },
        certifications: { score: 75, label: "Certifications", details: [] },
        shipping: { score: 80, label: "Shipping", details: ["Carbon-neutral shipping"] },
      },
      extractedMaterials: ["Recycled polyester in mesh", "Partially bio-based foam", "Recyclable components"],
      extractedCertifications: [],
      sustainabilityBadges: ["Carbon-neutral shipping", "On sustainability program"],
    },
    narration: {
      short: "On Womens Cloud 6, $147.99. True to size, low return risk.",
      medium:
        "On Womens Cloud 6, $147.99. Premium white sneaker with CloudTec cushioning. True to size with 88% confidence. Low return risk. High sustainability score with recycled materials and carbon-neutral shipping.",
    },
    demoDisclosure: "This passport uses demo data. Product details are illustrative.",
  },
  w_ozark: {
    id: "w_ozark",
    sourceSnapshotPath: SNAPSHOTS.w_ozark.path,
    imageUrl: PRODUCT_IMAGE_URLS.w_ozark,
    name: "Ozark Trail Hiker Backpack 25 Liter",
    brand: "Ozark Trail",
    priceText: "$24.97",
    ratingText: "4.5 out of 5 stars",
    reviewCountText: "(12,341)",
    shortDescription:
      "25-liter hiking backpack with multiple compartments. Durable polyester construction for day hikes and travel.",
    longDescription:
      "The Ozark Trail Hiker Backpack features a main compartment, front organizer pocket, and side mesh pockets. Padded back panel and adjustable shoulder straps for comfort.",
    images: {
      altShort: "Black 25-liter hiking backpack with multiple pockets.",
      altLong:
        "Overall: A black polyester hiking backpack. Main compartment with drawstring closure. Front pocket with organizer. Side mesh water bottle pockets. Padded back panel. Adjustable straps.",
    },
    fitSummary: {
      verdict: "True to size",
      confidence: 0.82,
      evidence: [
        "Demo snippet: Fits as expected for most users.",
        "Demo snippet: Good capacity for day hikes.",
      ],
    },
    themes: [
      {
        label: "Value",
        share: 0.45,
        severity: "medium",
        evidence: [
          "Demo snippet: Great value for the price.",
          "Demo snippet: Some report zipper issues over time.",
        ],
      },
      {
        label: "Comfort",
        share: 0.3,
        severity: "low",
        evidence: [
          "Demo snippet: Comfortable straps.",
          "Demo snippet: Good padding on back.",
        ],
      },
    ],
    returnRisk: {
      score: 0.18,
      label: "Low",
      drivers: [
        "Demo snippet: Reliable quality reported.",
        "Demo snippet: Matches description.",
      ],
    },
    sustainability: {
      overallScore: 40,
      rating: "Fair",
      categories: {
        materials: { score: 40, label: "Materials", details: ["Polyester", "Recycled content in some components"] },
        manufacturing: { score: 40, label: "Manufacturing", details: [] },
        certifications: { score: 40, label: "Certifications", details: [] },
        shipping: { score: 40, label: "Shipping", details: [] },
      },
      extractedMaterials: ["Polyester", "Recycled content in some components"],
      extractedCertifications: [],
      sustainabilityBadges: [],
    },
    narration: {
      short: "Ozark Trail Hiker Backpack, $24.97. True to size, low return risk.",
      medium:
        "Ozark Trail Hiker Backpack 25 Liter, $24.97. Durable day-hike backpack. True to size with 82% confidence. Low return risk. Medium sustainability.",
    },
    demoDisclosure: "This passport uses demo data. Product details are illustrative.",
  },
  w_dakimoe: {
    id: "w_dakimoe",
    sourceSnapshotPath: SNAPSHOTS.w_dakimoe.path,
    imageUrl: PRODUCT_IMAGE_URLS.w_dakimoe,
    name: "Dakimoe Laptop Backpack",
    brand: "Dakimoe",
    priceText: "$32.99",
    ratingText: "4.3 out of 5 stars",
    reviewCountText: "(2,891)",
    shortDescription:
      "Laptop backpack with dedicated sleeve and USB charging port. Suitable for school and commute.",
    longDescription:
      "The Dakimoe backpack includes a padded laptop compartment, multiple pockets, and a built-in USB port for charging devices on the go.",
    images: {
      altShort: "Laptop backpack with USB port and multiple compartments.",
      altLong:
        "Overall: A modern laptop backpack. Padded laptop sleeve. Front organizer. Side pockets. USB charging port. Adjustable straps.",
    },
    fitSummary: {
      verdict: "True to size",
      confidence: 0.78,
      evidence: [
        "Demo snippet: Fits 15-inch laptops well.",
        "Demo snippet: Adequate capacity for daily carry.",
      ],
    },
    themes: [
      {
        label: "Functionality",
        share: 0.4,
        severity: "low",
        evidence: [
          "Demo snippet: USB port is convenient.",
          "Demo snippet: Good organization.",
        ],
      },
    ],
    returnRisk: {
      score: 0.25,
      label: "Low",
      drivers: [
        "Demo snippet: Generally meets expectations.",
        "Demo snippet: Good build quality.",
      ],
    },
    sustainability: {
      overallScore: 35,
      rating: "Poor",
      categories: {
        materials: { score: 35, label: "Materials", details: ["Polyester", "Nylon"] },
        manufacturing: { score: 35, label: "Manufacturing", details: [] },
        certifications: { score: 35, label: "Certifications", details: [] },
        shipping: { score: 35, label: "Shipping", details: [] },
      },
      extractedMaterials: ["Polyester", "Nylon"],
      extractedCertifications: [],
      sustainabilityBadges: [],
    },
    narration: {
      short: "Dakimoe Laptop Backpack, $32.99. True to size, low return risk.",
      medium:
        "Dakimoe Laptop Backpack, $32.99. School and commute backpack with USB charging. True to size. Low return risk.",
    },
    demoDisclosure: "This passport uses demo data. Product details are illustrative.",
  },
  w_eastsport: {
    id: "w_eastsport",
    sourceSnapshotPath: SNAPSHOTS.w_eastsport.path,
    imageUrl: PRODUCT_IMAGE_URLS.w_eastsport,
    name: "EastSport Classic Backpack",
    brand: "EastSport",
    priceText: "$29.99",
    ratingText: "4.2 out of 5 stars",
    reviewCountText: "(5,234)",
    shortDescription:
      "Classic backpack with spacious main compartment. Ideal for school, work, or travel.",
    longDescription:
      "The EastSport Classic Backpack features a large main compartment, front pocket, and side mesh pockets. Durable construction with ergonomic design.",
    images: {
      altShort: "Classic backpack with large main compartment.",
      altLong:
        "Overall: A classic-style backpack. Large main compartment. Front organizer. Side mesh pockets. Padded back. Adjustable straps.",
    },
    fitSummary: {
      verdict: "True to size",
      confidence: 0.8,
      evidence: [
        "Demo snippet: Roomy and comfortable.",
        "Demo snippet: Fits standard laptop sizes.",
      ],
    },
    themes: [
      {
        label: "Durability",
        share: 0.35,
        severity: "medium",
        evidence: [
          "Demo snippet: Holds up well over time.",
          "Demo snippet: Some report stitching issues.",
        ],
      },
    ],
    returnRisk: {
      score: 0.22,
      label: "Low",
      drivers: [
        "Demo snippet: Reliable for daily use.",
        "Demo snippet: Good value.",
      ],
    },
    sustainability: {
      overallScore: 38,
      rating: "Poor",
      categories: {
        materials: { score: 38, label: "Materials", details: ["Polyester"] },
        manufacturing: { score: 38, label: "Manufacturing", details: [] },
        certifications: { score: 38, label: "Certifications", details: [] },
        shipping: { score: 38, label: "Shipping", details: [] },
      },
      extractedMaterials: ["Polyester"],
      extractedCertifications: [],
      sustainabilityBadges: [],
    },
    narration: {
      short: "EastSport Classic Backpack, $29.99. True to size, low return risk.",
      medium:
        "EastSport Classic Backpack, $29.99. Spacious backpack for school and travel. True to size. Low return risk.",
    },
    demoDisclosure: "This passport uses demo data. Product details are illustrative.",
  },
  w_madden: {
    id: "w_madden",
    sourceSnapshotPath: SNAPSHOTS.w_madden.path,
    imageUrl: PRODUCT_IMAGE_URLS.w_madden,
    name: "Madden NYC Backpack",
    brand: "Madden NYC",
    priceText: "$39.99",
    ratingText: "4.4 out of 5 stars",
    reviewCountText: "(1,567)",
    shortDescription:
      "Urban backpack with sleek design. Laptop compartment and multiple pockets for organized carry.",
    longDescription:
      "The Madden NYC backpack combines style with function. Padded laptop sleeve, water-resistant material, and modern aesthetic.",
    images: {
      altShort: "Urban backpack with sleek design.",
      altLong:
        "Overall: A sleek urban backpack. Padded laptop compartment. Water-resistant material. Modern design. Multiple pockets.",
    },
    fitSummary: {
      verdict: "True to size",
      confidence: 0.85,
      evidence: [
        "Demo snippet: Fits as described.",
        "Demo snippet: Comfortable for all-day wear.",
      ],
    },
    themes: [
      {
        label: "Style",
        share: 0.4,
        severity: "low",
        evidence: [
          "Demo snippet: Looks great.",
          "Demo snippet: Professional appearance.",
        ],
      },
    ],
    returnRisk: {
      score: 0.2,
      label: "Low",
      drivers: [
        "Demo snippet: Quality matches price.",
        "Demo snippet: Satisfied customers.",
      ],
    },
    sustainability: {
      overallScore: 42,
      rating: "Fair",
      categories: {
        materials: { score: 42, label: "Materials", details: ["Polyester", "Recycled materials"] },
        manufacturing: { score: 42, label: "Manufacturing", details: [] },
        certifications: { score: 42, label: "Certifications", details: [] },
        shipping: { score: 42, label: "Shipping", details: [] },
      },
      extractedMaterials: ["Polyester", "Recycled materials"],
      extractedCertifications: [],
      sustainabilityBadges: [],
    },
    narration: {
      short: "Madden NYC Backpack, $39.99. True to size, low return risk.",
      medium:
        "Madden NYC Backpack, $39.99. Urban backpack with laptop compartment. True to size. Low return risk.",
    },
    demoDisclosure: "This passport uses demo data. Product details are illustrative.",
  },
  w_honglong: {
    id: "w_honglong",
    sourceSnapshotPath: SNAPSHOTS.w_honglong.path,
    imageUrl: PRODUCT_IMAGE_URLS.w_honglong,
    name: "Honglong Travel Backpack",
    brand: "Honglong",
    priceText: "$35.99",
    ratingText: "4.1 out of 5 stars",
    reviewCountText: "(892)",
    shortDescription:
      "Travel backpack with expandable capacity. TSA-friendly design for airport use.",
    longDescription:
      "The Honglong Travel Backpack expands for extra capacity. TSA-friendly laptop compartment, multiple pockets, and durable construction.",
    images: {
      altShort: "Travel backpack with expandable design.",
      altLong:
        "Overall: A travel backpack. Expandable main compartment. TSA-friendly laptop section. Multiple pockets. Durable construction.",
    },
    fitSummary: {
      verdict: "True to size",
      confidence: 0.75,
      evidence: [
        "Demo snippet: Good for short trips.",
        "Demo snippet: Expandable feature is useful.",
      ],
    },
    themes: [
      {
        label: "Travel",
        share: 0.45,
        severity: "low",
        evidence: [
          "Demo snippet: Great for flights.",
          "Demo snippet: TSA-friendly design works well.",
        ],
      },
    ],
    returnRisk: {
      score: 0.28,
      label: "Low",
      drivers: [
        "Demo snippet: Meets travel needs.",
        "Demo snippet: Good construction.",
      ],
    },
    sustainability: {
      overallScore: 35,
      rating: "Poor",
      categories: {
        materials: { score: 35, label: "Materials", details: ["Nylon", "Polyester"] },
        manufacturing: { score: 35, label: "Manufacturing", details: [] },
        certifications: { score: 35, label: "Certifications", details: [] },
        shipping: { score: 35, label: "Shipping", details: [] },
      },
      extractedMaterials: ["Nylon", "Polyester"],
      extractedCertifications: [],
      sustainabilityBadges: [],
    },
    narration: {
      short: "Honglong Travel Backpack, $35.99. True to size, low return risk.",
      medium:
        "Honglong Travel Backpack, $35.99. Expandable travel backpack with TSA-friendly design. True to size. Low return risk.",
    },
    demoDisclosure: "This passport uses demo data. Product details are illustrative.",
  },
  w_reebok: {
    id: "w_reebok",
    sourceSnapshotPath: SNAPSHOTS.w_reebok.path,
    imageUrl: PRODUCT_IMAGE_URLS.w_reebok,
    name: "Reebok Classic Backpack",
    brand: "Reebok",
    priceText: "$44.99",
    ratingText: "4.5 out of 5 stars",
    reviewCountText: "(3,102)",
    shortDescription:
      "Sporty backpack with Reebok branding. Padded laptop sleeve and ventilated back panel.",
    longDescription:
      "The Reebok Classic Backpack features a sporty design with the iconic Reebok logo. Padded laptop compartment, ventilated back, and durable materials.",
    images: {
      altShort: "Sporty Reebok backpack with ventilated back.",
      altLong:
        "Overall: A sporty backpack with Reebok branding. Padded laptop sleeve. Ventilated back panel. Multiple pockets. Durable construction.",
    },
    fitSummary: {
      verdict: "True to size",
      confidence: 0.88,
      evidence: [
        "Demo snippet: Comfortable for active use.",
        "Demo snippet: Ventilation works well.",
      ],
    },
    themes: [
      {
        label: "Comfort",
        share: 0.4,
        severity: "low",
        evidence: [
          "Demo snippet: Ventilated back is great.",
          "Demo snippet: Comfortable for long wear.",
        ],
      },
    ],
    returnRisk: {
      score: 0.15,
      label: "Low",
      drivers: [
        "Demo snippet: Reliable Reebok quality.",
        "Demo snippet: Matches expectations.",
      ],
    },
    sustainability: {
      overallScore: 48,
      rating: "Fair",
      categories: {
        materials: { score: 48, label: "Materials", details: ["Polyester", "Recycled content"] },
        manufacturing: { score: 48, label: "Manufacturing", details: [] },
        certifications: { score: 48, label: "Certifications", details: [] },
        shipping: { score: 48, label: "Shipping", details: [] },
      },
      extractedMaterials: ["Polyester", "Recycled content"],
      extractedCertifications: [],
      sustainabilityBadges: ["Reebok sustainability initiative"],
    },
    narration: {
      short: "Reebok Classic Backpack, $44.99. True to size, low return risk.",
      medium:
        "Reebok Classic Backpack, $44.99. Sporty backpack with ventilated back. True to size with 88% confidence. Low return risk. Medium sustainability.",
    },
    demoDisclosure: "This passport uses demo data. Product details are illustrative.",
  },
};

export function getFallbackPassport(id: string): ProductPassport | undefined {
  if (id in DEMO_PASSPORTS) {
    const passport = { ...DEMO_PASSPORTS[id as ProductSnapshotId] };
    passport.returnRisk = generateReturnRisk(passport.name, passport.ratingText);
    if (passport.sustainability) {
      passport.sustainability = generateSustainability(
        passport.name,
        passport.sustainability.extractedMaterials,
        passport.sustainability.extractedCertifications,
        passport.sustainability.origin,
        passport.sustainability.sustainabilityBadges
      );
    }
    return passport;
  }
  return undefined;
}
