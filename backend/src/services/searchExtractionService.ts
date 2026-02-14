import { parseSearchUrl } from "../utils/searchUrlParser";
import { StagehandService } from "./stagehandService";
import { AmazonSearchExtractor } from "../extractors/amazonSearchExtractor";
import { WalmartSearchExtractor } from "../extractors/walmartSearchExtractor";
import { logger } from "../utils/logger";
import { ExtractionError } from "../middleware/errorHandler";

export interface SearchResultItem {
  name: string;
  price?: string;
  ratingText?: string;
  reviewCountText?: string;
  imageUrl?: string;
  productUrl: string;
}

export class SearchExtractionService {
  async extractSearchResults(url: string): Promise<{ query: string; domain: string; items: SearchResultItem[] }> {
    const parsed = parseSearchUrl(url);
    if (!parsed) {
      throw new ExtractionError("Invalid search URL. Supported: Amazon /s?k=... and Walmart /search?q=...");
    }

    logger.info("Starting search extraction", { url, domain: parsed.domain, query: parsed.query });

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
