import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || "development",
  browserbase: {
    apiKey: process.env.BROWSERBASE_API_KEY || "",
    projectId: process.env.BROWSERBASE_PROJECT_ID || "",
  },
  brightData: {
    apiKey: process.env.BRIGHTDATA_API_KEY || "",
    amazonSearchDatasetId: process.env.BRIGHTDATA_AMAZON_SEARCH_DATASET_ID || "",
    walmartSearchDatasetId: process.env.BRIGHTDATA_WALMART_SEARCH_DATASET_ID || "",
    ebaySearchDatasetId: process.env.BRIGHTDATA_EBAY_SEARCH_DATASET_ID || "",
    etsySearchDatasetId: process.env.BRIGHTDATA_ETSY_SEARCH_DATASET_ID || "",
    lowesSearchDatasetId: process.env.BRIGHTDATA_LOWES_SEARCH_DATASET_ID || "",
    targetSearchDatasetId: process.env.BRIGHTDATA_TARGET_SEARCH_DATASET_ID || "",
    macysSearchDatasetId: process.env.BRIGHTDATA_MACYS_SEARCH_DATASET_ID || "",
    homedepotSearchDatasetId: process.env.BRIGHTDATA_HOMEDEPOT_SEARCH_DATASET_ID || "",
    unlockerZone: process.env.BRIGHTDATA_UNLOCKER_ZONE || "web_unlocker1",
    serpZone: process.env.BRIGHTDATA_SERP_ZONE || "serp_api1",
  },
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
};

export function validateEnv(): void {
  const required = ["BROWSERBASE_API_KEY", "BROWSERBASE_PROJECT_ID"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}
