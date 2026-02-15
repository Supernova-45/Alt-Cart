import { parseSearchUrl } from "../utils/searchUrlParser";
import { StagehandService } from "./stagehandService";
import { AmazonSearchExtractor } from "../extractors/amazonSearchExtractor";
import { WalmartSearchExtractor } from "../extractors/walmartSearchExtractor";
import { GenericSearchExtractor } from "../extractors/genericSearchExtractor";
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
      throw new ExtractionError(
        "Invalid search URL. Paste a search or product page from an e-commerce site (e.g. Temu, AliExpress, Uniqlo, Amazon, Walmart)."
      );
    }

    logger.info("Starting search extraction", { url, domain: parsed.domain, query: parsed.query });

    // 1. Generic domain: use Browserbase + GenericSearchExtractor (no Bright Data for generic)
    if (parsed.domain === "generic") {
      const stagehandService = new StagehandService();
      try {
        await stagehandService.initialize();
        await stagehandService.navigateToUrl(parsed.fullUrl);
        const extractor = new GenericSearchExtractor();
        const items = await extractor.extract(stagehandService.getStagehand(), parsed.fullUrl);
        logger.info("Generic extraction complete", { count: items.length });
        return {
          query: parsed.query,
          domain: parsed.domain,
          items,
        };
      } finally {
        await stagehandService.close();
      }
    }

    // 2. Try Bright Data first if configured (known domains only)
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

    // 3. Fallback: Browserbase + Stagehand (Amazon/Walmart - domain-specific extractors)
    if (parsed.domain === "amazon" || parsed.domain === "walmart") {
      const stagehandService = new StagehandService();

      try {
        await stagehandService.initialize();
        await stagehandService.navigateToUrl(parsed.fullUrl);

        const extractor =
          parsed.domain === "amazon"
            ? new AmazonSearchExtractor()
            : new WalmartSearchExtractor();
        const items = await extractor.extract(stagehandService.getStagehand(), parsed.fullUrl);

        return {
          query: parsed.query,
          domain: parsed.domain,
          items,
        };
      } finally {
        await stagehandService.close();
      }
    }

    // eBay, Etsy, Lowes, Target, Macy's, Home Depot: Bright Data only, no Browserbase fallback
    return {
      query: parsed.query,
      domain: parsed.domain,
      items: [],
    };
  }
}
