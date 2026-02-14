import { ProductPassport } from "../models/productModel";
import { parseProductUrl, ParsedUrl } from "../utils/urlParser";
import { StagehandService } from "./stagehandService";
import { AmazonExtractor } from "../extractors/amazonExtractor";
import { TransformService } from "./transformService";
import { logger } from "../utils/logger";
import { ExtractionError } from "../middleware/errorHandler";

export class ExtractionService {
  private transformService: TransformService;

  constructor() {
    this.transformService = new TransformService();
  }

  async extractProduct(url: string): Promise<{ id: string; passport: ProductPassport }> {
    logger.info("Starting product extraction", { url });

    // Parse and validate URL
    const parsedUrl: ParsedUrl = parseProductUrl(url);
    logger.info("URL parsed successfully", { domain: parsedUrl.domain, productId: parsedUrl.productId });

    // Initialize Stagehand
    const stagehandService = new StagehandService();

    try {
      await stagehandService.initialize();
      await stagehandService.navigateToUrl(parsedUrl.fullUrl);

      // Extract product data based on domain
      let extractedData;
      if (parsedUrl.domain === "amazon") {
        const amazonExtractor = new AmazonExtractor();
        extractedData = await amazonExtractor.extract(
          stagehandService.getStagehand(),
          parsedUrl.fullUrl
        );
      } else {
        // TODO: Implement Walmart extractor
        throw new ExtractionError("Walmart extraction not yet implemented");
      }

      logger.info("Product data extracted successfully");

      // Transform to ProductPassport
      const passport = this.transformService.transform(extractedData);

      logger.info("Product passport created", { id: passport.id });

      return {
        id: passport.id,
        passport,
      };
    } catch (error) {
      logger.error("Product extraction failed", {
        error: error instanceof Error ? error.message : String(error),
        url
      });
      throw error;
    } finally {
      // Always close Stagehand
      await stagehandService.close();
    }
  }
}
