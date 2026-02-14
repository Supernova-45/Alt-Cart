import type { ProductPassport } from "./productModel";
import { SNAPSHOTS } from "./snapshotRegistry";
import type { SnapshotId } from "./snapshotRegistry";

const DEMO_PASSPORTS: Record<SnapshotId, ProductPassport> = {
  adidas: {
    id: "adidas",
    sourceSnapshotPath: SNAPSHOTS.adidas.path,
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
        share: 0.25,
        severity: "low",
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
      score: 0.6,
      label: "Medium",
      materials: ["Recycled polyester in lining", "Partially recycled rubber sole"],
      badges: ["adidas Primegreen materials"],
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
      score: 0.35,
      label: "Low",
      materials: ["Synthetic upper", "Standard rubber sole"],
      badges: [],
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
      score: 0.5,
      label: "Medium",
      materials: ["Leather upper", "Recycled content in some components"],
      badges: ["Puma sustainability initiative"],
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
      score: 0.75,
      label: "High",
      materials: [
        "Recycled polyester in mesh",
        "Partially bio-based foam",
        "Recyclable components",
      ],
      badges: ["Carbon-neutral shipping", "On sustainability program"],
    },
    narration: {
      short: "On Womens Cloud 6, $147.99. True to size, low return risk.",
      medium:
        "On Womens Cloud 6, $147.99. Premium white sneaker with CloudTec cushioning. True to size with 88% confidence. Low return risk. High sustainability score with recycled materials and carbon-neutral shipping.",
    },
    demoDisclosure: "This passport uses demo data. Product details are illustrative.",
  },
  search: {
    id: "search",
    sourceSnapshotPath: SNAPSHOTS.search.path,
    name: "White sneakers search",
    brand: undefined,
    shortDescription: "Search results for white sneakers.",
    longDescription: "Search results page.",
    images: { altShort: "Search results.", altLong: "Search results for white sneakers." },
    themes: [],
    returnRisk: { score: 0, label: "Low", drivers: [] },
    narration: { short: "Search results.", medium: "Search results for white sneakers." },
    demoDisclosure: "Search results.",
  },
};

export function getFallbackPassport(id: string): ProductPassport | undefined {
  if (id in DEMO_PASSPORTS) {
    return DEMO_PASSPORTS[id as SnapshotId];
  }
  return undefined;
}
