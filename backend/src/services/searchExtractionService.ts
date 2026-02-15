import { parseSearchUrl } from "../utils/searchUrlParser";
import { StagehandService } from "./stagehandService";
import { AmazonSearchExtractor } from "../extractors/amazonSearchExtractor";
import { WalmartSearchExtractor } from "../extractors/walmartSearchExtractor";
import { getCatalogResults } from "./brightDataCatalogService";
import { config } from "../config/env";
import { logger } from "../utils/logger";
import { ExtractionError } from "../middleware/errorHandler";
import type { SearchResultItem } from "../types/search";

export type { SearchResultItem } from "../types/search";

export class SearchExtractionService {
  async extractSearchResults(url: string): Promise<{ query: string; domain: string; items: SearchResultItem[] }> {
    const parsed = parseSearchUrl(url);
    if (!parsed) {
      throw new ExtractionError("Invalid search URL. Supported: Amazon /s?k=... and Walmart /search?q=...");
    }

    logger.info("Starting search extraction", { url, domain: parsed.domain, query: parsed.query });

    // 1. Try Bright Data first if configured
    if (config.brightData?.apiKey) {
      try {
        const items = await getCatalogResults(parsed.query, parsed.domain);
        if (items.length > 0) {
          logger.info("Bright Data catalog extraction succeeded", { count: items.length });
          return {
            query: parsed.query,
            domain: parsed.domain,
            items,
          };
        }
      } catch (err) {
        logger.warn("Bright Data catalog failed, falling back to Browserbase", { error: err });
      }
    }

    // 2. Fallback: Browserbase + Stagehand
    const stagehandService = new StagehandService();

    try {
      await stagehandService.initialize();
      await stagehandService.navigateToUrl(parsed.fullUrl);

      let items: SearchResultItem[] = [];

      if (parsed.domain === "amazon") {
        const extractor = new AmazonSearchExtractor();
        items = await extractor.extract(stagehandService.getStagehand(), parsed.fullUrl);
      } else if (parsed.domain === "walmart") {
        const extractor = new WalmartSearchExtractor();
        items = await extractor.extract(stagehandService.getStagehand(), parsed.fullUrl);
      }

      return {
        query: parsed.query,
        domain: parsed.domain,
        items,
      };
    } finally {
      await stagehandService.close();
    }
  }
}
